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
import type { SerialConfig } from '@/types'

interface ConnectionPanelProps {
  ports: string[]
  connected: boolean
  onOpen: (config: SerialConfig) => void
  onClose: () => void
}

export function ConnectionPanel({ ports, connected, onOpen, onClose }: ConnectionPanelProps) {
  const [port, setPort] = useState('')
  const [baudRate, setBaudRate] = useState('115200')
  const [dataBits, setDataBits] = useState<5 | 6 | 7 | 8>(8)
  const [parity, setParity] = useState<'none' | 'odd' | 'even'>('none')
  const [stopBits, setStopBits] = useState<1 | 2>(1)

  const baudPresets = ['9600', '19200', '38400', '57600', '115200', '230400', '460800', '921600']

  const handleOpen = () => {
    const rate = parseInt(baudRate, 10)
    if (!port || Number.isNaN(rate) || rate <= 0) return
    onOpen({ port, baudRate: rate, dataBits, parity, stopBits })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 border-b border-border bg-card">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Port</label>
        <Select value={port} onValueChange={setPort}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select port" />
          </SelectTrigger>
          <SelectContent>
            {ports.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Baud Rate</label>
        <Input
          list="baud-presets"
          value={baudRate}
          onChange={(e) => setBaudRate(e.target.value)}
          className="w-32"
        />
        <datalist id="baud-presets">
          {baudPresets.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Data Bits</label>
        <Select
          value={String(dataBits)}
          onValueChange={(v) => setDataBits(Number(v) as 5 | 6 | 7 | 8)}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="7">7</SelectItem>
            <SelectItem value="8">8</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Parity</label>
        <Select value={parity} onValueChange={(v) => setParity(v as 'none' | 'odd' | 'even')}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="odd">Odd</SelectItem>
            <SelectItem value="even">Even</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Stop Bits</label>
        <Select
          value={String(stopBits)}
          onValueChange={(v) => setStopBits(Number(v) as 1 | 2)}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {connected ? (
        <Button variant="destructive" onClick={onClose}>
          Close
        </Button>
      ) : (
        <Button onClick={handleOpen}>Open</Button>
      )}
    </div>
  )
}
