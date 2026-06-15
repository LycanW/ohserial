import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { Button } from '@/components/ui/button'
import '@xterm/xterm/css/xterm.css'

interface TerminalViewProps {
  terminalTick: number
  disabled: boolean
  onInput: (data: string) => void
  flushTerminalData: () => Uint8Array[]
}

export function TerminalView({ terminalTick, disabled, onInput, flushTerminalData }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const timersRef = useRef<number[]>([])

  const fitTerminal = useCallback(() => {
    const fitAddon = fitAddonRef.current
    if (!fitAddon) return
    try {
      fitAddon.fit()
    } catch {
      // Ignore fit failures when container is not ready
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'monospace',
      theme: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        cursor: '#e2e8f0',
        selectionBackground: '#334155',
      },
      convertEol: true,
      scrollback: 10000,
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(containerRef.current)

    terminal.onData((data) => {
      if (!disabled) {
        onInput(data)
      }
    })

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    const scheduleFit = () => {
      fitTerminal()
    }

    // Try to fit immediately and then several times as fonts/layout settle
    const ids = [
      window.setTimeout(scheduleFit, 0),
      window.setTimeout(scheduleFit, 50),
      window.setTimeout(scheduleFit, 150),
      window.setTimeout(scheduleFit, 300),
      window.setTimeout(scheduleFit, 600),
      window.setTimeout(scheduleFit, 1000),
    ]
    timersRef.current = ids

    const handleResize = () => {
      scheduleFit()
    }

    window.addEventListener('resize', handleResize)

    resizeObserverRef.current = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        scheduleFit()
      }
    })
    resizeObserverRef.current.observe(containerRef.current)

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
      window.removeEventListener('resize', handleResize)
      resizeObserverRef.current?.disconnect()
      terminal.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [disabled, onInput, fitTerminal])

  useEffect(() => {
    const terminal = terminalRef.current
    if (!terminal) return

    const chunks = flushTerminalData()
    for (const chunk of chunks) {
      terminal.write(chunk)
    }
  }, [terminalTick, flushTerminalData])

  const handleClear = () => {
    terminalRef.current?.clear()
  }

  const handleReset = () => {
    terminalRef.current?.reset()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">
          {disabled ? 'Connect to type' : 'Virtual Terminal'}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full relative overflow-hidden"
      />
    </div>
  )
}
