import { useEffect, useRef, useCallback, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { stripScreenClearingSequences } from '@/lib/terminalFilter'
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
  const lastSizeRef = useRef<{ cols: number; rows: number } | null>(null)
  const disabledRef = useRef(disabled)
  const onInputRef = useRef(onInput)
  const [preserveLog, setPreserveLog] = useState(false)

  // Keep refs in sync so the terminal setup effect does not re-run on prop changes
  disabledRef.current = disabled
  onInputRef.current = onInput

  const fitTerminal = useCallback(() => {
    const fitAddon = fitAddonRef.current
    const container = containerRef.current
    if (!fitAddon || !container) return

    const dims = fitAddon.proposeDimensions()
    if (!dims || dims.cols <= 0 || dims.rows <= 0) return

    const last = lastSizeRef.current
    if (last && last.cols === dims.cols && last.rows === dims.rows) return

    try {
      fitAddon.fit()
      lastSizeRef.current = { cols: dims.cols, rows: dims.rows }
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
      if (!disabledRef.current) {
        onInputRef.current(data)
      }
    })

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    const handleResize = () => {
      fitTerminal()
    }

    window.addEventListener('resize', handleResize)

    // Fit once the DOM has had a chance to measure the container, then watch
    // for container-only size changes to avoid unnecessary reflows.
    const rafId = requestAnimationFrame(() => fitTerminal())
    const fallbackId = window.setTimeout(() => fitTerminal(), 100)

    resizeObserverRef.current = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        fitTerminal()
      }
    })
    resizeObserverRef.current.observe(containerRef.current)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(fallbackId)
      window.removeEventListener('resize', handleResize)
      resizeObserverRef.current?.disconnect()
      terminal.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
      lastSizeRef.current = null
    }
  }, [fitTerminal])

  useEffect(() => {
    const terminal = terminalRef.current
    if (!terminal) return

    const chunks = flushTerminalData()
    for (const chunk of chunks) {
      const data = preserveLog ? stripScreenClearingSequences(chunk) : chunk
      if (data.length > 0) {
        terminal.write(data)
      }
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
          <Toggle
            pressed={preserveLog}
            onPressedChange={setPreserveLog}
            aria-label="Preserve log history"
            className="text-xs px-2"
          >
            Preserve Log
          </Toggle>
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
        className="flex-1 min-h-0 w-full relative"
      />
    </div>
  )
}
