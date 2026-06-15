import { useRef, useEffect } from 'react'
import type { TerminalUpdate } from '@/types'

interface TerminalViewProps {
  terminal: TerminalUpdate | null
  disabled: boolean
  onInput: (data: string) => void
}

export function TerminalView({ terminal, disabled, onInput }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.focus()
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

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
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">
          {disabled ? 'Connect to type' : 'Click terminal and type'}
        </span>
      </div>

      <div
        ref={terminalRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex-1 min-h-0 p-3 overflow-auto font-mono text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-ring/50"
      >
        {terminal ? (
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
