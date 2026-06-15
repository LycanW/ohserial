use serde::Serialize;
use tauri::{AppHandle, Emitter, Runtime};

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "event", content = "payload")]
pub enum AppEvent {
    ConnectionStateChanged(ConnectionState),
    DataLine { timestamp: String, text: String },
    TerminalUpdate(crate::terminal::buffer::TerminalUpdate),
    TerminalRaw { bytes: Vec<u8> },
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "status", rename_all = "lowercase", rename_all_fields = "camelCase")]
pub enum ConnectionState {
    Disconnected,
    Connecting,
    Connected { port: String, baud_rate: u32 },
    Error { message: String },
}

pub fn emit_event<R: Runtime>(
    manager: &AppHandle<R>,
    event: AppEvent,
) -> Result<(), String> {
    manager
        .emit("ohserial-event", event)
        .map_err(|e| e.to_string())
}
