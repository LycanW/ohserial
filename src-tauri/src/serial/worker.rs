use std::io::{Read, Write};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{mpsc, Arc};
use std::thread;
use std::time::Duration;

pub enum WorkerCommand {
    Write(Vec<u8>),
    Stop,
}

pub struct SerialPortWorker {
    handle: Option<thread::JoinHandle<()>>,
    command_tx: mpsc::Sender<WorkerCommand>,
    running: Arc<AtomicBool>,
}

impl SerialPortWorker {
    pub fn spawn<Port>(
        mut port: Port,
        data_tx: mpsc::Sender<Vec<u8>>,
    ) -> Self
    where
        Port: Read + Write + Send + 'static,
    {
        let (command_tx, command_rx) = mpsc::channel::<WorkerCommand>();
        let running = Arc::new(AtomicBool::new(true));
        let running_clone = running.clone();

        let handle = thread::spawn(move || {
            let mut buf = [0u8; 1024];
            loop {
                if !running_clone.load(Ordering::Relaxed) {
                    break;
                }

                while let Ok(cmd) = command_rx.try_recv() {
                    match cmd {
                        WorkerCommand::Write(bytes) => {
                            let _ = port.write_all(&bytes);
                            let _ = port.flush();
                        }
                        WorkerCommand::Stop => {
                            running_clone.store(false, Ordering::Relaxed);
                            break;
                        }
                    }
                }

                match port.read(&mut buf) {
                    Ok(n) if n > 0 => {
                        let _ = data_tx.send(buf[..n].to_vec());
                    }
                    Ok(_) => {}
                    Err(e) if e.kind() == std::io::ErrorKind::TimedOut => {}
                    Err(_) => {
                        running_clone.store(false, Ordering::Relaxed);
                    }
                }

                thread::sleep(Duration::from_millis(1));
            }
        });

        Self {
            handle: Some(handle),
            command_tx,
            running,
        }
    }

    pub fn send(&self, bytes: Vec<u8>) -> Result<(), String> {
        self.command_tx
            .send(WorkerCommand::Write(bytes))
            .map_err(|e| e.to_string())
    }

    pub fn stop(&mut self) {
        self.running.store(false, Ordering::Relaxed);
        let _ = self.command_tx.send(WorkerCommand::Stop);
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}
