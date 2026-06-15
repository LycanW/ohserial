import { useState } from 'react'
import { ConnectionPanel } from '@/components/ConnectionPanel'
import { SendPanel } from '@/components/SendPanel'
import { TerminalView } from '@/components/TerminalView'
import { RawLogView } from '@/components/RawLogView'
import { StatusBar } from '@/components/StatusBar'
import { Button } from '@/components/ui/button'
import { useSerial } from '@/hooks/useSerial'

type AppMode = 'traditional' | 'terminal'

function App() {
  const [mode, setMode] = useState<AppMode>('terminal')
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

      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Mode</span>
        <Button
          variant={mode === 'traditional' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('traditional')}
        >
          Traditional Serial
        </Button>
        <Button
          variant={mode === 'terminal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('terminal')}
        >
          Virtual Terminal
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        {mode === 'traditional' ? (
          <RawLogView lines={lines} />
        ) : (
          <TerminalView terminal={terminal} disabled={!connected} onInput={writeRaw} />
        )}
      </div>

      {mode === 'traditional' && <SendPanel disabled={!connected} onSend={writeData} />}
      <StatusBar state={state} />
    </div>
  )
}

export default App
