pub mod commands;
pub mod error;
pub mod events;
pub mod protocol;
pub mod serial;
pub mod state;
pub mod terminal;

use tauri::Manager;

use crate::events::{emit_event, AppEvent, ConnectionState};
use crate::protocol::engine::ProtocolEngine;
use crate::state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::list_serial_ports,
            commands::open_port,
            commands::close_port,
            commands::write_data,
            commands::write_raw,
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();
            let serial = app.state::<AppState>().serial.clone();

            std::thread::spawn(move || loop {
                std::thread::sleep(std::time::Duration::from_millis(16));

                if !serial.is_connected() {
                    continue;
                }

                match serial.read_available() {
                    Ok(chunks) => {
                        for chunk in chunks {
                            let text = ProtocolEngine::decode_to_string(&chunk);
                            let now = chrono::Local::now().format("%H:%M:%S%.3f").to_string();
                            let _ = emit_event(
                                &app_handle,
                                AppEvent::DataLine {
                                    timestamp: now,
                                    text,
                                },
                            );
                            let _ = emit_event(
                                &app_handle,
                                AppEvent::TerminalRaw {
                                    bytes: chunk.clone(),
                                },
                            );
                        }
                    }
                    Err(crate::error::AppError::NotConnected) => {}
                    Err(e) => {
                        let _ = emit_event(
                            &app_handle,
                            AppEvent::ConnectionStateChanged(ConnectionState::Error {
                                message: e.to_string(),
                            }),
                        );
                        let _ = serial.close();
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
