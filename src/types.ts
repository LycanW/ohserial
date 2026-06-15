export interface SerialConfig {
  port: string
  baudRate: number
  dataBits: 5 | 6 | 7 | 8
  parity: 'none' | 'odd' | 'even'
  stopBits: 1 | 2
}

export interface WriteRequest {
  data: string
  mode: 'text' | 'hex'
  lineEnding?: 'none' | 'cr' | 'lf' | 'crlf'
}

export type ConnectionState =
  | { status: 'disconnected' }
  | { status: 'connecting' }
  | { status: 'connected'; port: string; baudRate: number }
  | { status: 'error'; message: string }

export interface DataLine {
  timestamp: string
  text: string
}

export interface TerminalCell {
  char: string
  fg: string
  bg: string
  bold: boolean
}

export interface TerminalUpdate {
  cols: number
  rows: number
  cursorRow: number
  cursorCol: number
  cells: TerminalCell[][]
}
