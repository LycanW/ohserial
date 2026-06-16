import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { DataLine } from '@/types'

interface RawLogViewProps {
  lines: DataLine[]
  onClear: () => void
}

export function RawLogView({ lines, onClear }: RawLogViewProps) {
  const rawRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rawRef.current) {
      rawRef.current.scrollTop = rawRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">Raw Log</span>
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>
      <div ref={rawRef} className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-auto p-3 font-mono text-sm">
        {lines.map((line, i) => (
          <div key={i} className="break-all">
            <span className="text-muted-foreground mr-2">[{line.timestamp}]</span>
            <span className="whitespace-pre-wrap">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
