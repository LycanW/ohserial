use serde::Serialize;

#[derive(Debug, Clone, Serialize, Default, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TerminalCell {
    #[serde(rename = "char")]
    pub ch: char,
    pub fg: String,
    pub bg: String,
    pub bold: bool,
}

impl TerminalCell {
    pub fn blank() -> Self {
        Self {
            ch: ' ',
            fg: "#e2e8f0".into(),
            bg: "transparent".into(),
            bold: false,
        }
    }
}
