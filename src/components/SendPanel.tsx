import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
        <Select value={mode} onValueChange={(v) => setMode(v as 'text' | 'hex')}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="hex">Hex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Line Ending</label>
        <Select
          value={lineEnding}
          onValueChange={(v) => setLineEnding(v as 'none' | 'cr' | 'lf' | 'crlf')}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="cr">CR</SelectItem>
            <SelectItem value="lf">LF</SelectItem>
            <SelectItem value="crlf">CRLF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSend} disabled={disabled || !text}>
        Send
      </Button>
    </div>
  )
}
