import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { Button } from '@/components/ui/button'
import '@xterm/xterm/css/xterm.css'

interface TerminalViewProps {
  terminalTick: number
  disabled: boolean
  onInput: (data: string) => void
  flushTerminalData: () => Uint8Array[]
}

function measureCell(container: HTMLElement, terminal: Terminal): { width: number; height: number } | null {
  const cellEl = container.querySelector('.xterm-cell') as HTMLElement | null
  if (cellEl) {
    const rect = cellEl.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return { width: rect.width, height: rect.height }
    }
  }

  const fontFamily = (terminal.options.fontFamily as string) || 'monospace'
  const fontSize = (terminal.options.fontSize as number) || 14

  const span = document.createElement('span')
  span.textContent = 'W'
  span.style.fontFamily = fontFamily
  span.style.fontSize = `${fontSize}px`
  span.style.lineHeight = 'normal'
  span.style.position = 'absolute'
  span.style.visibility = 'hidden'
  span.style.whiteSpace = 'pre'
  document.body.appendChild(span)

  const rect = span.getBoundingClientRect()
  document.body.removeChild(span)

  if (rect.width === 0 || rect.height === 0) return null
  return { width: rect.width, height: rect.height }
}

function resizeToContainer(terminal: Terminal, container: HTMLElement) {
  const { clientWidth, clientHeight } = container
  if (clientWidth < 50 || clientHeight < 50) return

  const cell = measureCell(container, terminal)
  if (!cell) return

  const cols = Math.floor(clientWidth / cell.width)
  const rows = Math.floor(clientHeight / cell.height)

  if (cols > 0 && rows > 0 && (cols !== terminal.cols || rows !== terminal.rows)) {
    terminal.resize(cols, rows)
  }
}

export function TerminalView({ terminalTick, disabled, onInput, flushTerminalData }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const fitTerminal = useCallback(() => {
    const container = containerRef.current
    const terminal = terminalRef.current
    if (!container || !terminal) return
    resizeToContainer(terminal, container)
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

    terminal.open(containerRef.current)
    terminal.onData((data) => {
      if (!disabled) {
        onInput(data)
      }
    })

    terminalRef.current = terminal

    // Resize to a default grid first so xterm renders cells we can measure,
    // then fit to the container once fonts/layout are ready.
    const applyFit = async () => {
      const container = containerRef.current
      const term = terminalRef.current
      if (!container || !term) return

      terminal.resize(80, 24)

      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await new Promise((resolve) => requestAnimationFrame(resolve))

      resizeToContainer(term, container)
    }

    let cancelled = false
    const tryFit = async (attempt = 0) => {
      if (cancelled) return
      const container = containerRef.current
      const term = terminalRef.current
      if (!container || !term) return

      if (container.clientWidth > 0 && container.clientHeight > 0) {
        await applyFit()
      } else if (attempt < 20) {
        setTimeout(() => tryFit(attempt + 1), 50)
      }
    }
    tryFit()

    const handleResize = () => {
      fitTerminal()
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
      cancelled = true
      window.removeEventListener('resize', handleResize)
      resizeObserverRef.current?.disconnect()
      terminal.dispose()
      terminalRef.current = null
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
