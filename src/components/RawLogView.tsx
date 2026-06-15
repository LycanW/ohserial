import { useRef, useEffect } from 'react'
import type { DataLine } from '@/types'

interface RawLogViewProps {
  lines: DataLine[]
}

export function RawLogView({ lines }: RawLogViewProps) {
  const rawRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rawRef.current) {
      rawRef.current.scrollTop = rawRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div ref={rawRef} className="flex flex-col gap-0.5 h-full overflow-auto p-3 font-mono text-sm">
      {lines.map((line, i) => (
        <div key={i} className="break-all">
          <span className="text-muted-foreground mr-2">[{line.timestamp}]</span>
          <span className="whitespace-pre-wrap">{line.text}</span>
        </div>
      ))}
    </div>
  )
}
