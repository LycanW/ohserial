import type { ConnectionState } from '@/types'

interface StatusBarProps {
  state: ConnectionState
}

export function StatusBar({ state }: StatusBarProps) {
  const statusText = () => {
    switch (state.status) {
      case 'disconnected':
        return 'Disconnected'
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        return `Connected: ${state.port} @ ${state.baudRate}`
      case 'error':
        return `Error: ${state.message}`
    }
  }

  const statusColor = () => {
    switch (state.status) {
      case 'connected':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'connecting':
        return 'text-yellow-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card text-xs">
      <span className={statusColor()}>{statusText()}</span>
      <span className="text-muted-foreground">OhSerial</span>
    </div>
  )
}
