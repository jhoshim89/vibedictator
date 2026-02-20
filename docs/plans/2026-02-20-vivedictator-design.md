# ViveDictator — Voice → Structured Prompt App

## 개요

Handy(오픈소스 STT 앱)를 fork하여, 음성을 **구조화된 텍스트**로 변환하는 데스크톱 앱을 만든다.
단순 받아쓰기가 아니라 Typeless처럼 필러워드 제거, 자동 포맷팅, 구조화를 수행한다.

## 핵심 파이프라인

```
🎙️ 음성 입력
    ↓
[VAD - 음성 구간 감지] (Silero, 로컬)
    ↓
[Whisper STT] (로컬, 기존 Handy)
    ↓
원시 텍스트 (raw transcript)
    ↓
[AI 구조화 엔진] ← 🆕 추가 부분
  • GitHub Models API (GPT-4o 등, Education 무료)
  • 모드별 시스템 프롬프트 적용
    ↓
구조화된 텍스트
    ↓
📋 커서 위치에 자동 붙여넣기
```

## 모드 시스템

### 모드 1: 💻 Code Prompt (코드 작성 명령)
- 목적: Claude Code / Copilot에 넣을 구조화된 프롬프트 생성
- 처리: 필러워드 제거 → 의도 파악 → 명확한 지시문으로 변환
- 출력 예시:
  ```
  입력(음성): "음... 그니까 로그인 페이지 만들어줘 이메일이랑 패스워드 
  입력 받고 그리고 뭐였지 아 구글 로그인도 넣어줘"
  
  출력: "로그인 페이지를 만들어주세요.
  - 이메일/패스워드 입력 폼
  - Google OAuth 소셜 로그인
  - 반응형 디자인 적용"
  ```

### 모드 2: 📄 Paper Writing (논문 작성)
- 목적: 학술적 문체로 구조화된 텍스트 생성
- 처리: 필러워드 제거 → 학술 문체 변환 → 논리적 구조화
- 출력 예시:
  ```
  입력(음성): "시츄가 제일 많았고 한 28프로 정도 됐는데 이게 
  그 병원 데이터랑 비슷해서..."
  
  출력: "시츄(Shih Tzu)가 전체 연구 대상의 약 28%를 차지하며 
  가장 높은 비율을 보였으며, 이는 해당 기간 동안의 병원 내원 
  품종 분포와 일치하는 결과였다."
  ```

## 수정할 Handy 컴포넌트

### 1. Rust 백엔드 (src-tauri/)
- **새 모듈: `ai_processor.rs`**
  - GitHub Models API HTTP 클라이언트
  - 모드별 시스템 프롬프트 관리
  - 텍스트 후처리 로직
- **수정: 트랜스크립션 파이프라인**
  - STT 결과 → AI 구조화 → 붙여넣기 흐름 추가
  - 기존 Handy의 `--toggle-post-process` 플래그 활용/확장

### 2. React 프론트엔드 (src/)
- **설정 UI에 추가:**
  - 모드 선택 (Code Prompt / Paper Writing)
  - GitHub Token 설정
  - 모델 선택 (GPT-4o, GPT-4o-mini 등)
  - 커스텀 시스템 프롬프트 편집 (고급)

### 3. 설정/저장
- GitHub Personal Access Token 저장 (시스템 키체인 or 로컬 암호화)
- 모드별 프롬프트 템플릿 저장
- 빠른 모드 전환 단축키

## 기술 스택

| 구성 요소 | 기술 | 비고 |
|----------|------|------|
| 데스크톱 프레임워크 | Tauri (Rust) | Handy에서 상속 |
| STT | Whisper / Parakeet | 로컬, Handy에서 상속 |
| VAD | Silero | 로컬, Handy에서 상속 |
| AI 구조화 | GitHub Models API | GPT-4o, Education 무료 |
| 프론트엔드 | React + TypeScript + Tailwind | Handy에서 상속 |
| HTTP 클라이언트 | reqwest (Rust) | API 호출용 |

## 개발 단계

### Phase 1: 기본 동작 (MVP)
1. Handy fork & 빌드 환경 구축
2. `ai_processor.rs` 모듈 추가 (GitHub Models API 호출)
3. 트랜스크립션 파이프라인에 AI 후처리 통합
4. 기본 모드 2개 (Code Prompt / Paper Writing) 하드코딩

### Phase 2: UI & 설정
5. 설정 화면에 모드 선택, API 토큰 설정 추가
6. 모드 전환 단축키 추가
7. 처리 중 시각적 피드백 (구조화 중... 인디케이터)

### Phase 3: 고급 기능
8. 커스텀 프롬프트 편집기
9. 히스토리 (최근 변환 기록)
10. 컨텍스트 인식 (활성 앱에 따라 자동 모드 전환)

## GitHub Models API 호출 예시

```rust
// Rust (reqwest)
let response = client
    .post("https://models.github.ai/inference/chat/completions")
    .bearer_auth(&github_token)
    .json(&json!({
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_transcript}
        ],
        "temperature": 0.3
    }))
    .send()
    .await?;
```

## 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| GitHub Models API Rate Limit | 텍스트 구조화는 짧은 요청이라 문제 없을 것. 초과 시 원시 텍스트 폴백 |
| API 응답 지연 (1-3초) | 처리 중 인디케이터, 원시 텍스트 먼저 복사 옵션 |
| 오프라인 시 | 원시 텍스트만 붙여넣기 (기존 Handy 동작) |
| Handy 업스트림 변경 | git remote로 upstream 추적, 주기적 merge |
