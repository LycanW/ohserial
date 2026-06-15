use std::sync::Arc;

use crate::serial::manager::SerialManager;
use crate::terminal::buffer::TerminalBuffer;

pub struct AppState {
    pub serial: Arc<SerialManager>,
    pub terminal: Arc<std::sync::Mutex<TerminalBuffer>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            serial: Arc::new(SerialManager::new()),
            terminal: Arc::new(std::sync::Mutex::new(TerminalBuffer::new(80, 24))),
        }
    }
}
