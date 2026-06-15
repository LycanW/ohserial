use serde::Serialize;

use crate::terminal::cell::TerminalCell;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalUpdate {
    pub cols: usize,
    pub rows: usize,
    pub cursor_row: usize,
    pub cursor_col: usize,
    pub cells: Vec<Vec<TerminalCell>>,
}

pub struct TerminalBuffer {
    cols: usize,
    rows: usize,
    cells: Vec<Vec<TerminalCell>>,
    cursor_row: usize,
    cursor_col: usize,
    fg: String,
    bg: String,
    bold: bool,
}

impl TerminalBuffer {
    pub fn new(cols: usize, rows: usize) -> Self {
        Self {
            cols,
            rows,
            cells: vec![vec![TerminalCell::blank(); cols]; rows],
            cursor_row: 0,
            cursor_col: 0,
            fg: "#e2e8f0".into(),
            bg: "transparent".into(),
            bold: false,
        }
    }

    pub fn feed(&mut self, bytes: &[u8]) -> TerminalUpdate {
        for &b in bytes {
            self.handle_byte(b);
        }
        self.to_update()
    }

    fn handle_byte(&mut self, b: u8) {
        match b {
            b'\n' => self.new_line(),
            b'\r' => self.cursor_col = 0,
            b'\x08' => {
                if self.cursor_col > 0 {
                    self.cursor_col -= 1;
                }
            }
            0x1b => {
                // Minimal ANSI placeholder: skip next char if '['
                // Full parser will be added in later step
            }
            0x7f => {
                // DEL: erase current cell
                self.cells[self.cursor_row][self.cursor_col] = TerminalCell::blank();
            }
            printable if printable.is_ascii_graphic() || printable == b' ' => {
                let mut cell = TerminalCell::blank();
                cell.ch = printable as char;
                cell.fg = self.fg.clone();
                cell.bg = self.bg.clone();
                cell.bold = self.bold;
                self.cells[self.cursor_row][self.cursor_col] = cell;
                self.advance_cursor();
            }
            _ => {}
        }
    }

    fn advance_cursor(&mut self) {
        self.cursor_col += 1;
        if self.cursor_col >= self.cols {
            self.cursor_col = 0;
            self.new_line();
        }
    }

    fn new_line(&mut self) {
        self.cursor_col = 0;
        if self.cursor_row + 1 >= self.rows {
            self.scroll_up();
        } else {
            self.cursor_row += 1;
        }
    }

    fn scroll_up(&mut self) {
        self.cells.remove(0);
        self.cells.push(vec![TerminalCell::blank(); self.cols]);
    }

    pub fn to_update(&self) -> TerminalUpdate {
        TerminalUpdate {
            cols: self.cols,
            rows: self.rows,
            cursor_row: self.cursor_row,
            cursor_col: self.cursor_col,
            cells: self.cells.clone(),
        }
    }

    pub fn clear(&mut self) -> TerminalUpdate {
        self.cells = vec![vec![TerminalCell::blank(); self.cols]; self.rows];
        self.cursor_row = 0;
        self.cursor_col = 0;
        self.to_update()
    }
}
