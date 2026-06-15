import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { SerialConfig, ConnectionState, DataLine, TerminalUpdate, WriteRequest } from '@/types'

export function useSerial() {
  const [ports, setPorts] = useState<string[]>([])
  const [state, setState] = useState<ConnectionState>({ status: 'disconnected' })
  const [lines, setLines] = useState<DataLine[]>([])
  const [terminal, setTerminal] = useState<TerminalUpdate | null>(null)

  useEffect(() => {
    refreshPorts()

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
      }
    })

    return () => {
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

  const clearLines = () => setLines([])

  return {
    ports,
    state,
    lines,
    terminal,
    refreshPorts,
    openPort,
    closePort,
    writeData,
    writeRaw,
    clearLines,
  }
}
