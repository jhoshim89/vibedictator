# ViveDictator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Handy 오픈소스 STT 앱을 포크하여, GitHub Models API를 통해 음성 텍스트를 구조화된 프롬프트(코드 작성용/논문용)로 변환하는 ViveDictator 데스크톱 앱을 구축합니다.

**Architecture:** Tauri 프레임워크 기반. Rust 백엔드에 GitHub Models API 클라이언트(`ai_processor`)와 상태 관리기(`ai_settings`)를 추가하고, React 프론트엔드에 AI 설정 UI를 추가합니다. 기존 STT 파이프라인 출력부와 연결하여 클립보드에 최종 구조화된 텍스트를 전달합니다.

**Tech Stack:** Rust, React, TypeScript, Tailwind CSS, Tauri, reqwest

---

### Task 1: Repository Setup & Forking

**Files:**
- Create: `README_VIVEDICTATOR.md`

**Step 1: Write the failing test**
*Not applicable for repository cloning, but we verify the environment.*

**Step 2: Run test to verify it fails**
Run: `ls src-tauri/Cargo.toml`
Expected: FAIL (File not found)

**Step 3: Write minimal implementation**
```bash
git clone https://github.com/cjpais/Handy.git temp_handy
mv temp_handy/* .
mv temp_handy/.* .
rm -rf temp_handy
echo "# ViveDictator" > README_VIVEDICTATOR.md
```

**Step 4: Run test to verify it passes**
Run: `ls src-tauri/Cargo.toml`
Expected: PASS

**Step 5: Commit**
```bash
git add .
git commit -m "chore: initialize ViveDictator from Handy fork"
```

---

### Task 2: Rust Backend - AI Settings Manager (`tauri-ipc-state-manager`)

**Files:**
- Create: `src-tauri/src/ai_settings.rs`
- Modify: `src-tauri/src/main.rs`
- Test: `src-tauri/src/ai_settings_test.rs` (Inline tests in `ai_settings.rs`)

**Step 1: Write the failing test**
In `src-tauri/src/ai_settings.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_save_and_load_settings() {
        let settings = AiSettings { token: "test_token".to_string(), mode: "code".to_string() };
        assert_eq!(settings.token, "test_token");
    }
}
```

**Step 2: Run test to verify it fails**
Run: `cd src-tauri && cargo test ai_settings`
Expected: FAIL (Module not found or compile error)

**Step 3: Write minimal implementation**
Define `AiSettings` struct with `serde` and a `Mutex` state manager for Tauri. Apply `nodnarbnitram/claude-code-extensions@tauri-v2` IPC patterns to expose `get_ai_settings` and `set_ai_settings` commands. Include the module in `main.rs`.

**Step 4: Run test to verify it passes**
Run: `cd src-tauri && cargo test ai_settings`
Expected: PASS

**Step 5: Commit**
```bash
git add src-tauri/src/ai_settings.rs src-tauri/src/main.rs
git commit -m "feat: add ai settings state manager and IPC commands"
```

---

### Task 3: Rust Backend - AI Processor Client (`github-models-ai-client`)

**Files:**
- Create: `src-tauri/src/ai_processor.rs`

**Step 1: Write the failing test**
In `src-tauri/src/ai_processor.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn test_format_prompt() {
        let raw = "리액트 대시보드 만들어줘";
        let formatted = format_prompt(raw, "code");
        assert!(formatted.contains("대시보드"));
    }
}
```

**Step 2: Run test to verify it fails**
Run: `cd src-tauri && cargo test ai_processor`
Expected: FAIL

**Step 3: Write minimal implementation**
Write `process_text(raw_text: &str, settings: &AiSettings)` using `reqwest`. Add system prompts. If GitHub token is empty, gracefully fallback to `raw_text` (applying `graceful-fallback-handler`).

**Step 4: Run test to verify it passes**
Run: `cd src-tauri && cargo test ai_processor`
Expected: PASS

**Step 5: Commit**
```bash
git add src-tauri/src/ai_processor.rs src-tauri/Cargo.toml
git commit -m "feat: implement github models ai client for text structuring"
```

---

### Task 4: React Frontend - AI Settings UI (`vercel-react-best-practices`)

**Files:**
- Create: `src/components/AiSettingsTab.tsx`
- Modify: `src/pages/Settings.tsx` (or equivalent based on Handy's structure)

**Step 1: Write the failing test**
We will verify UI rendering by starting the Vite server or running existing tests if present.

**Step 2: Run test to verify it fails**
Run: `npm run tauri build` (Check for TS errors when we mock the import)
Expected: FAIL

**Step 3: Write minimal implementation**
Create a React component with an input for the GitHub PAT (masked `type="password"`) and a select/radio for Mode (Code Prompt / Paper Writing). Use `@tauri-apps/api/core` invoke calls to save/load settings. Apply Tailwind classes matching the repository's style.

**Step 4: Run test to verify it passes**
Run: `npm run build`
Expected: PASS

**Step 5: Commit**
```bash
git add src/
git commit -m "feat: add ai settings UI in frontend"
```

---

### Task 5: Integration - Connect STT Pipeline to AI Processor

**Files:**
- Modify: `src-tauri/src/audio/transcription.rs` (or equivalent module handling STT output in Handy)

**Step 1: Write the failing test**
Review the transcription flow to ensure the hook points are identified.

**Step 2: Run test to verify it fails**
Compile check.

**Step 3: Write minimal implementation**
Find where Handy emits or pastes the final transcript. Inject a call to `ai_processor::process_text` using the current `AiSettings` state before pasting to the clipboard. Implement `graceful-fallback-handler`: if `process_text` fails (e.g. network error, no token), fall back to the original transcript seamlessly.

**Step 4: Run test to verify it passes**
Run: `cd src-tauri && cargo build`
Expected: PASS

**Step 5: Commit**
```bash
git add src-tauri/src/
git commit -m "feat: integrate ai processor into transcription pipeline"
```
