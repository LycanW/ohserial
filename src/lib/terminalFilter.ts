/**
 * Strip CSI sequences that would clear the screen or switch to the alternate
 * screen buffer. This keeps the scrollback/history visible in a serial-monitor
 * style virtual terminal, where the user expects to see the full boot log while
 * a spinner or progress line updates at the bottom.
 */
export function stripScreenClearingSequences(data: Uint8Array): Uint8Array {
  const out: number[] = []
  let i = 0

  while (i < data.length) {
    // Look for ESC [
    if (data[i] === 0x1b && i + 1 < data.length && data[i + 1] === 0x5b) {
      let j = i + 2

      let hasQuestion = false
      if (j < data.length && data[j] === 0x3f) {
        hasQuestion = true
        j++
      }

      const paramStart = j
      // Parameter bytes: 0x30-0x3f (digits, ;, :, <, =, >, ?)
      while (j < data.length && data[j] >= 0x30 && data[j] <= 0x3f) {
        j++
      }
      // Intermediate bytes: 0x20-0x2f (not used by the sequences we target)
      while (j < data.length && data[j] >= 0x20 && data[j] <= 0x2f) {
        j++
      }

      if (j < data.length && data[j] >= 0x40 && data[j] <= 0x7e) {
        const final = data[j]
        const params = data.slice(paramStart, j)

        if (shouldRemoveCsi(hasQuestion, params, final)) {
          i = j + 1
          continue
        }
      }

      // If we get here, copy the ESC and continue normally. The loop will also
      // copy the following bytes of the CSI sequence on subsequent iterations.
    }

    out.push(data[i])
    i++
  }

  return new Uint8Array(out)
}

function shouldRemoveCsi(hasQuestion: boolean, params: Uint8Array, final: number): boolean {
  // Alternate screen buffer set/reset: ESC[?1047h/l, ESC[?1049h/l, ESC[?47h/l
  if ((final === 0x68 || final === 0x6c) && hasQuestion) {
    const s = ascii(params)
    return s === '1047' || s === '1049' || s === '47'
  }

  // Erase display: ESC[2J, ESC[3J, ESC[J, ESC[0J, ESC[1J
  if (final === 0x4a) {
    return true
  }

  // Cursor home: ESC[H, ESC[1;1H, ESC[;H, ESC[1;H
  if (final === 0x48) {
    const s = ascii(params)
    return s === '' || s === '1;1' || s === ';1' || s === '1;' || s === ';'
  }

  return false
}

function ascii(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i])
  }
  return s
}
