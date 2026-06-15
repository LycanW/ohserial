import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { DataLine, TerminalUpdate } from '@/types'

interface TerminalViewProps {
  lines: DataLine[]
  terminal: TerminalUpdate | null
  disabled: boolean
  onInput: (data: string) => void
}

export function TerminalView({ lines, terminal, disabled, onInput }: TerminalViewProps) {
  const [mode, setMode] = useState<'raw' | 'terminal'>('terminal')
  const rawRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rawRef.current) {
      rawRef.current.scrollTop = rawRef.current.scrollHeight
    }
  }, [lines])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    // Only handle terminal mode interactive input
    if (mode !== 'terminal') return

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault()
      onInput(e.key)
      return
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        onInput('\r')
        break
      case 'Backspace':
        e.preventDefault()
        onInput('\x7f')
        break
      case 'Tab':
        e.preventDefault()
        onInput('\t')
        break
      case 'Escape':
        e.preventDefault()
        onInput('\x1b')
        break
      case 'ArrowUp':
        e.preventDefault()
        onInput('\x1b[A')
        break
      case 'ArrowDown':
        e.preventDefault()
        onInput('\x1b[B')
        break
      case 'ArrowRight':
        e.preventDefault()
        onInput('\x1b[C')
        break
      case 'ArrowLeft':
        e.preventDefault()
        onInput('\x1b[D')
        break
      case 'Home':
        e.preventDefault()
        onInput('\x1b[H')
        break
      case 'End':
        e.preventDefault()
        onInput('\x1b[F')
        break
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button variant={mode === 'raw' ? 'default' : 'outline'} size="sm" onClick={() => setMode('raw')}>
          Raw Log
        </Button>
        <Button variant={mode === 'terminal' ? 'default' : 'outline'} size="sm" onClick={() => setMode('terminal')}>
          Terminal
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {mode === 'terminal' && (disabled ? 'Connect to type' : 'Click here and type')}
        </span>
      </div>

      <div
        ref={terminalRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex-1 min-h-0 p-3 overflow-auto font-mono text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-ring/50"
      >
        {mode === 'raw' ? (
          <div ref={rawRef} className="flex flex-col gap-0.5">
            {lines.map((line, i) => (
              <div key={i} className="break-all">
                <span className="text-muted-foreground mr-2">[{line.timestamp}]</span>
                <span className="whitespace-pre-wrap">{line.text}</span>
              </div>
            ))}
          </div>
        ) : terminal ? (
          <div
            className="grid gap-0 leading-none"
            style={{
              gridTemplateColumns: `repeat(${terminal.cols}, minmax(0, 1fr))`,
            }}
          >
            {terminal.cells.flatMap((row, r) =>
              row.map((cell, c) => (
                <span
                  key={`${r}-${c}`}
                  className="inline-block text-center"
                  style={{
                    color: cell.fg,
                    backgroundColor: cell.bg,
                    fontWeight: cell.bold ? 'bold' : 'normal',
                  }}
                >
                  {cell.char}
                </span>
              ))
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">No terminal data yet.</div>
        )}
      </div>
    </div>
  )
}
