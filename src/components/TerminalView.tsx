import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { DataLine, TerminalUpdate } from '@/types'

interface TerminalViewProps {
  lines: DataLine[]
  terminal: TerminalUpdate | null
}

export function TerminalView({ lines, terminal }: TerminalViewProps) {
  const [mode, setMode] = useState<'raw' | 'terminal'>('raw')
  const rawRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rawRef.current) {
      rawRef.current.scrollTop = rawRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button variant={mode === 'raw' ? 'default' : 'outline'} size="sm" onClick={() => setMode('raw')}>
          Raw Log
        </Button>
        <Button variant={mode === 'terminal' ? 'default' : 'outline'} size="sm" onClick={() => setMode('terminal')}>
          Terminal
        </Button>
      </div>

      <div className="flex-1 min-h-0 p-3 overflow-auto font-mono text-sm">
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
