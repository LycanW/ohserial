import { useEffect, useState, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { SerialConfig, ConnectionState, DataLine, TerminalUpdate, WriteRequest } from '@/types'

export function useSerial() {
  const [ports, setPorts] = useState<string[]>([])
  const [state, setState] = useState<ConnectionState>({ status: 'disconnected' })
  const [lines, setLines] = useState<DataLine[]>([])
  const [terminal, setTerminal] = useState<TerminalUpdate | null>(null)

  const terminalQueue = useRef<Uint8Array[]>([])
  const [terminalTick, setTerminalTick] = useState(0)

  useEffect(() => {
    refreshPorts()

    // Poll for newly connected/disconnected serial ports
    const pollInterval = window.setInterval(() => {
      refreshPorts()
    }, 1000)

    const unlisten = listen('ohserial-event', (event) => {
      const payload = event.payload as any
      switch (payload.event) {
        case 'ConnectionStateChanged':
          setState(payload.payload)
          break
        case 'DataLine':
          setLines((prev) => [...prev, payload.payload])
          break
        case 'TerminalUpdate':
          setTerminal(payload.payload)
          break
        case 'TerminalRaw':
          terminalQueue.current.push(new Uint8Array(payload.payload.bytes))
          setTerminalTick((t) => t + 1)
          break
      }
    })

    return () => {
      window.clearInterval(pollInterval)
      unlisten.then((fn) => fn())
    }
  }, [])

  const refreshPorts = async () => {
    const list = await invoke<string[]>('list_serial_ports')
    setPorts(list)
  }

  const openPort = async (config: SerialConfig) => {
    setState({ status: 'connecting' })
    try {
      await invoke('open_port', { config })
    } catch (e) {
      setState({ status: 'error', message: String(e) })
    }
  }

  const closePort = async () => {
    await invoke('close_port')
  }

  const writeData = async (request: WriteRequest) => {
    await invoke('write_data', { request })
  }

  const writeRaw = async (data: string) => {
    await invoke('write_raw', { data })
  }

  const flushTerminalData = () => {
    const chunks = terminalQueue.current
    terminalQueue.current = []
    return chunks
  }

  const clearLines = () => setLines([])

  return {
    ports,
    state,
    lines,
    terminal,
    terminalTick,
    refreshPorts,
    openPort,
    closePort,
    writeData,
    writeRaw,
    flushTerminalData,
    clearLines,
  }
}
