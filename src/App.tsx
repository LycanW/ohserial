import { ConnectionPanel } from '@/components/ConnectionPanel'
import { SendPanel } from '@/components/SendPanel'
import { TerminalView } from '@/components/TerminalView'
import { StatusBar } from '@/components/StatusBar'
import { useSerial } from '@/hooks/useSerial'

function App() {
  const { ports, state, lines, terminal, openPort, closePort, writeData, writeRaw } = useSerial()
  const connected = state.status === 'connected'

  return (
    <div className="flex flex-col h-screen dark bg-background text-foreground">
      <ConnectionPanel
        ports={ports}
        connected={connected}
        onOpen={openPort}
        onClose={closePort}
      />

      <div className="flex-1 min-h-0">
        <TerminalView
          lines={lines}
          terminal={terminal}
          disabled={!connected}
          onInput={writeRaw}
        />
      </div>

      <SendPanel disabled={!connected} onSend={writeData} />
      <StatusBar state={state} />
    </div>
  )
}

export default App
