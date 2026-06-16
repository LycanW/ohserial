import { useEffect, useState, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { SerialConfig, ConnectionState, DataLine, WriteRequest } from '@/types'

const MAX_LINES = 5000
const MAX_TERMINAL_CHUNKS = 2000

export function useSerial() {
  const [ports, setPorts] = useState<string[]>([])
  const [state, setState] = useState<ConnectionState>({ status: 'disconnected' })
  const [lines, setLines] = useState<DataLine[]>([])

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
          setLines((prev) => {
            const next = [...prev, payload.payload]
            if (next.length > MAX_LINES) {
              next.splice(0, next.length - MAX_LINES)
            }
            return next
          })
          break
        case 'TerminalRaw':
          terminalQueue.current.push(new Uint8Array(payload.payload.bytes))
          if (terminalQueue.current.length > MAX_TERMINAL_CHUNKS) {
            terminalQueue.current.splice(0, terminalQueue.current.length - MAX_TERMINAL_CHUNKS)
          }
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
    try {
      const list = await invoke<string[]>('list_serial_ports')
      list.sort(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare)
      setPorts(list)
    } catch {
      // Ignore polling errors so the auto-refresh loop keeps running
    }
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
