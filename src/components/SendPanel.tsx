import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { WriteRequest } from '@/types'

interface SendPanelProps {
  disabled: boolean
  onSend: (request: WriteRequest) => void
}

export function SendPanel({ disabled, onSend }: SendPanelProps) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'text' | 'hex'>('text')
  const [lineEnding, setLineEnding] = useState<'none' | 'cr' | 'lf' | 'crlf'>('none')

  const handleSend = () => {
    if (!text) return
    onSend({ data: text, mode, lineEnding })
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-3 p-4 border-t border-border bg-card">
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs text-muted-foreground">Send</label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type data to send..."
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Mode</label>
        <Select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-24">
          <option value="text">Text</option>
          <option value="hex">Hex</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Line Ending</label>
        <Select
          value={lineEnding}
          onChange={(e) => setLineEnding(e.target.value as any)}
          className="w-28"
        >
          <option value="none">None</option>
          <option value="cr">CR</option>
          <option value="lf">LF</option>
          <option value="crlf">CRLF</option>
        </Select>
      </div>

      <Button onClick={handleSend} disabled={disabled || !text}>
        Send
      </Button>
    </div>
  )
}
