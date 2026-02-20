# ViveDictator: Agent & Skill Workflow Plan

이 문서는 Handy 코드를 포크하여 ViveDictator를 개발하기 위해 필요한 **Subagents(역할)**와 **Skills(기능 모듈)**의 구성을 정의합니다. 복잡한 Tauri(Rust + React) 앱을 안전하고 효율적으로 개조하기 위해 작업을 분리합니다.

## 🤖 1. 필요한 Subagents (역할 분담)

### Agent A: 🦀 Rust Backend Architect (Core STT & API Integration)
- **책임**: 기존 Handy의 오프라인 STT 파이프라인(Whisper)이 끝나는 지점을 찾아, GitHub Models API 호출(AI 구조화)을 끼워넣는 역할.
- **주요 작업**:
  - `reqwest` 크레이트를 사용하여 `models.github.ai` 통신 모듈(`ai_processor.rs`) 구현
  - STT 결과 텍스트를 AI 모듈로 전달하고, 반환된 구조화 텍스트를 시스템 클립보드/커서에 붙여넣기(`enigo` 등 기존 방식 활용)
  - 기존 `--toggle-post-process` 로직 확장

### Agent B: ⚛️ React Frontend Developer (Settings & UI)
- **책임**: 사용자가 API 토큰과 프롬프트 모드를 설정할 수 있는 UI 추가.
- **주요 작업**:
  - `src/` 내 기존 Settings 페이지에 "AI Processing" 탭 추가
  - GitHub PAT 입력 필드 (보안 마스킹 처리)
  - Mode 선택기 (Code Prompt / Paper Writing)
  - Tauri IPC (Inter-Process Communication)를 통해 설정값을 Rust 백엔드로 전달

### Agent C: 🧪 QA & System Integrator
- **책임**: 백엔드와 프론트엔드의 결합 테스트 및 에러 핸들링 보완.
- **주요 작업**:
  - 네트워크 오프라인 상태일 때 자연스럽게 기존 STT(원시 텍스트) 모드로 폴백(Fallback) 처리
  - API Rate Limit 초과 시 에러 로깅 및 사용자 알림 토스트 UI 띄우기

---

## 🛠️ 2. Recommended Skills (from skills.sh)

이 프로젝트를 안전하고 표준적으로 구현하기 위해 **인증된 기존 기술 스택별 에이전트 스킬(skills.sh)**을 활용합니다.

### Skill 1: `vercel-labs/agent-skills@vercel-react-best-practices`
- **설치**: `npx skills add vercel-labs/agent-skills@vercel-react-best-practices`
- **목적**: React 프론트엔드 코드(설정 UI) 추가 시 모범 사례 유지
- **활용(Agent B)**: Vite, Tailwind, TypeScript를 사용하는 React 컴포넌트를 만들 때 일관된 패턴 보장.

### Skill 2: `nodnarbnitram/claude-code-extensions@tauri-v2`
- **설치**: `npx skills add nodnarbnitram/claude-code-extensions@tauri-v2`
- **목적**: Tauri 버전2 구조에 맞춘 IPC(프론트-백엔드 통신) 및 설정 구현 가이드
- **활용(Agent A, B)**: React에서 Rust로 API 토큰이나 선택된 프롬프트 모드를 안전하게 넘기고 저장할 때 Tauri 명령어를 래핑하는 최적의 방법 적용.

### Skill 3: `apollographql/skills@rust-best-practices` (또는 `jeffallan/claude-skills@rust-engineer`)
- **설치**: `npx skills add apollographql/skills@rust-best-practices`
- **목적**: Rust 백엔드 코드 작성 및 reqwest 비동기 클라이언트 구현 시 안정성 확보
- **활용(Agent A)**: `ai_processor.rs` 등 새로운 Rust 모듈 작성, 메모리 안전성 유지, 비동기(async/await) 에러 및 타임아웃 매니지먼트.
