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
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fitTerminal = useCallback(() => {
    const container = containerRef.current
    const fitAddon = fitAddonRef.current
    if (!container || !fitAddon) return

    const { clientWidth, clientHeight } = container
    if (clientWidth === 0 || clientHeight === 0) return

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
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
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

    // Defer initial fit until the container has been laid out
    const initialFitId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fitTerminal()
      })
    })
    const fallbackFitId = setTimeout(() => {
      fitTerminal()
    }, 300)

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = setTimeout(() => {
        fitTerminal()
      }, 100)
    }

    window.addEventListener('resize', handleResize)

    resizeObserverRef.current = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        handleResize()
      }
    })
    resizeObserverRef.current.observe(containerRef.current)

    return () => {
      cancelAnimationFrame(initialFitId)
      clearTimeout(fallbackFitId)
      window.removeEventListener('resize', handleResize)
      resizeObserverRef.current?.disconnect()
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      terminal.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [disabled, onInput, fitTerminal])

  // Flush incoming data from the backend queue
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
    <div className="flex flex-col flex-1 min-h-0 bg-background">
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
        className="flex-1 min-h-0 w-full h-full relative overflow-hidden p-2"
      />
    </div>
  )
}
