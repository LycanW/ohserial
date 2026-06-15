use std::sync::{mpsc, Mutex};
use std::time::Duration;

use serialport::SerialPort;

use crate::error::{AppError, AppResult};
use crate::serial::config::SerialConfig;
use crate::serial::worker::SerialPortWorker;

pub struct SerialManager {
    config: Mutex<Option<SerialConfig>>,
    worker: Mutex<Option<SerialPortWorker>>,
    data_rx: Mutex<Option<mpsc::Receiver<Vec<u8>>>>,
}

impl SerialManager {
    pub fn new() -> Self {
        Self {
            config: Mutex::new(None),
            worker: Mutex::new(None),
            data_rx: Mutex::new(None),
        }
    }

    pub fn open(&self, config: SerialConfig) -> AppResult<()> {
        config.validate()?;
        self.close()?;

        let builder = serialport::new(&config.port, config.baud_rate)
            .data_bits(config.data_bits()?)
            .parity(config.parity()?)
            .stop_bits(config.stop_bits()?)
            .timeout(Duration::from_millis(100));

        let port = builder.open()?;

        let (data_tx, data_rx) = mpsc::channel::<Vec<u8>>();
        let worker = SerialPortWorker::spawn(port, data_tx);

        *self.config.lock().unwrap() = Some(config);
        *self.data_rx.lock().unwrap() = Some(data_rx);
        *self.worker.lock().unwrap() = Some(worker);

        Ok(())
    }

    pub fn close(&self) -> AppResult<()> {
        if let Some(mut worker) = self.worker.lock().unwrap().take() {
            worker.stop();
        }
        *self.config.lock().unwrap() = None;
        *self.data_rx.lock().unwrap() = None;
        Ok(())
    }

    pub fn write(&self, bytes: Vec<u8>) -> AppResult<()> {
        let worker = self.worker.lock().unwrap();
        if let Some(w) = worker.as_ref() {
            w.send(bytes).map_err(|e| AppError::SerialPort(e))?;
            Ok(())
        } else {
            Err(AppError::NotConnected)
        }
    }

    pub fn read_available(&self) -> AppResult<Vec<Vec<u8>>> {
        let rx = self.data_rx.lock().unwrap();
        if let Some(rx) = rx.as_ref() {
            let mut chunks = Vec::new();
            while let Ok(chunk) = rx.try_recv() {
                chunks.push(chunk);
            }
            Ok(chunks)
        } else {
            Err(AppError::NotConnected)
        }
    }

    pub fn is_connected(&self) -> bool {
        self.worker.lock().unwrap().is_some()
    }

    pub fn config(&self) -> Option<SerialConfig> {
        self.config.lock().unwrap().clone()
    }
}
