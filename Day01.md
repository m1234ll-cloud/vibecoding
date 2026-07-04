# 바이브코딩1일차

## VibeCoding with Codex/Cursor/Claude Code/Gemini

### AI에게 제대로 코딩을 시키자!

#### 1. 핵심 개념

코딩 직접 하지말자. AI 협업 프로그램 만들자!

##### 기본 개발방식

요구사항분석 > 설계(DB/UI 포함) > 구현/디버깅 > 테스트 > 배포 > 유지보수

##### 바이브코딩 방식

요구사항정의(PRD) / 사람 > 코드생성 / AI > 디버깅,테스트 / AI > 검증 및 수정 / 사람 > 배포 / 사람

##### 핵심 포인트

- AI - 주니어 개발자? 시니어 개발자!
- 사람 - PM + 리뷰어

#### TIP

토큰 확인할 수 있는 사이트
- https://platform.openai.com/tokenizer

#### 2. 바이브코딩 개발 환경

여러방식 존재. 본인에게 맞는 방식을 찾아라

##### CLI 방식

콘솔(터미널, 파워쉘, bash)에서 바이브코딩

- Node.js 패키지 모듈 명령어(npm)로 설치
- https://nodejs.org/ko/download
- node-v24.18.0-x64.msi 설치

- 기본명령어 중 /로 명령어 확인

##### ChatGPT - OpenAI Codex CLI

-설치
powershell
> npm install -g @openai/codex
> codex

###### Gemini CLI

posershell
#설치
> npm install -g @google/gemini-cli
#실행
> gemini


##### ClaudeCode CLI

#설치
> npm install -g @anthropic-ai/claude-code

#실행
>claude

##### 웹브라우저 LLM 사용 방식

ChatGPT, 클로드, Gemini 사이트 접속 바이브코딩

##### IDE 툴 확장툴 사용 방식

VS Code(Insider)의 확장 설치 바이브코딩

##### Codex

python.org 에서 파이썬 설치
확장에서 korean 검색해서 한국어팩 설치
python 검색해서 파이썬 설치
codex 검색해서 codex 설치

위 네비게이션ㅅ바에 채팅 누르면 codex 탭에서 채팅 가넝

###### Gemini Code Assist

- 2026년 6월 18일부터 VS CODE 확장 사용 불가, Enterprise는 지원
- Antigravity Studio 사용 권장

- 확장 > Gemini Code Assist
- 설치 후 채팅 탭에서 Gemini

###### Claude Code

- Pro, Max 버전 이상 사용 가능
- 확장 > Claude 검색 후 Anthropic 버전 설치
- 위와 동일

#### 3. 바이브코딩 시작

##### 프롬프트 가이드

- LLM에 질문을 던지는 컨텍스트
- 간결한 프롬프트로 처리
    - 주의를 살펴서 조심스럽게, 자세히, 조심스럽게, 이런 단어 사용 금지
    - 수정해줘, 분석해줘, 최적화해줘 등 명령형태로 문장 완료할 것

##### 프롬프트 종류

- 제로샷 프롬프트 - 아무 예제없이 AI와 대화로 코딩을 시작하는 방식

- 원샷 프롬프트 - 예제를 하나정도 제공한 뒤 비슷한 작업을 수행하도록 요청하는 방식

- 푸샷 프롬프트 - 2~5개 예제를 제공한 뒤 작업 수행하도록 하는 방식

##### ChatGPT, Gemini 웹 브라우저 바이브코딩

- 프롬프트는 명령 아니고 설계도, 지시 잘못하면 결과 이상함
- 
bash
# 나쁜 예
> 로그인 만들어줘

#좋은 예
> 로그인 기능 만들어줘. Python으로

- 개선된 프롬프트 작성 필요

bash
#개선 1차 - 원 샷 프롬프트 작성 필요
> 
너는 백엔드 개발자야.
사용자 로그인 기능을 만들어줘. Python FastApi 사용해줘.

- 더욱 개선된 퓨삿 프롬프트

bash
> 
너는 백엔드 개발자야.
사용자 로그인 API를 만들어줘
- python FastAPI 사용
- JWT 인증, OAuth2
- 예외처리 포함

###### 웹 브라우저 사용 바이브코딩 단점

- 나온 결과를 직접 구성. 폴더. 파일 개발자가 수동으로 처리
- 디버깅이 쉽지 않음
- CLI나 IDE 툴 확장으로 좀 더 편하게 바이브코딩하자

##### Codex, API 사용 바이브코딩 

- VS Code 등의 IDE 툴 사용
- AI가 직접 폴더나 파일을 제어할 수 있음
- 디버깅도 실시간으로 가능. 배포도 AI가 해줄 수 있음.

###### 에이전틱 코딩

- HTML, JavaScript, CSS를 사용한 간단한 TODO 리스트 프로그램
- 프롬프트 영역에 작성 시 Shift + Enter로 여러줄 작성

```markdown
HTML, CSS, Javascript를 사용해서 간단한 TODO 리스트를 만들어줘.

기능은 다음과같아
- 할 일 추가
- 할 일 완료 체크
- 할 일 삭제
- 새로고침 전까지 브라우저에서 동작할 것
- 초보자가 이해하기 쉽게 작성
- 하나의 html 파일에 css,javascript 모두 추가할 것
```

```markdown
현재 VS Code 툴에 Live Server 확장을 설치해줘

```

##### TODO List 개선

- Python 웹서비스와 연계

- python 가상환경 설치 및 실행

```powershell
# python 가상환경 설치 (원래 있던 파이썬을 안 건들이기 위해 가상환경 설치함)
 > python -m venv venv
# 가상환경 활성화
 > .\venv\Scripts\Activate.ps1
 (venv) > 
```

```markdown
너는 백엔드 개발자야.

Python FastAPI로 간단한 TODO API를 만들어줘

요구사항
- 할 일 목록 조회
- 할 일 추가
- 할일 완료 상태 변경
- 할 일 삭제
- 데이터는 메모리 리스트에 저장(DB 사용 아님)
- 초보자도 이해하기 쉽게 작성
- 실행방법도 같이 설명
```

#### 추가실행
간단한 HTML 프론트엔드를 붙여서 브라우저에서 CRUD를 만들어줘

##### 다음 진행할 것
- 실제 DB와 연동해서 데이터를 DB에 저장하는 기능 구현

#### 5. PRD.md

- Product Requirments Document의 약자. 제품 요구사항 정의서
- AI에게 던져줄 설계도
- 마크다운으로 작성. 필요한 경우는 이미지도 포함.

##### 퍼즐게임 PRD 예시
- prd.md로 저장

```
markdown
## 프로젝트: 간단한 퍼즐 게임

### 목표:
- 브라우저에서 실행되는 퍼즐 게임

### 기능:
- 퍼즐 보드 표시
- 클릭 이벤트 처리
- 클리어 조건 판단

### 기술:
- HTML, CSS, JavaScript
- 하나의 index.html 파일

### 대상:
- 코딩 초보자
```


``` markdown
Day01\puzzle_game 아래에 PRD.md 파일 참조해서 만들어줘 UI는 같은 경로의 ui.png 파일을 참고해서 만들어줘
```

##### 분석

- AI가 생성한 코드를 분석

- 분석할 소스코드 드래그로 지정 > context menu > Add to Codex Thread 선택

- 바뀐 소스 되돌리기는 Ctrl+Z

- 오류(예외) 발생하는 코드 영역을 선택, Codex Thread 등 전달 뒤 분석 요청.

##### 리팩토링

- 원본 소스를 분석, 좀 더 나은 로직으로 변경하는 것

``` markdown
현재 index.html을 더 깔끔하게 리팩토링 해줘.

조건 :
    - 기능은 그대로 유지
    - 함수 최대한 분리
    - 변수명은 SnakeCasing으로
    - 초보자도 이해 가능하게
    - 변경 이유 설명
    - 자바스크립트에 주석 최대한 작성 
```

- 원본파일. 탐색기 > context menu > '비교를 위해서 선택'
- 변경 파일. 탐색기 > context menu > '선택한 항목과 비교'

##### 예외처리

- 실행 중 발생하는 오류
- 예외발생하는 구문 Codex Thread 전송 후 프롬프트 작성, 실행

```js
    function hide_card(card_element) {
      // 예외발생 처리 결과
      if (!card_element) {
        return;
      }

      card_element.classList.remove("flipped");

```

##### 구조 변경

-예시

```markdown
현재 과일 이모지가 8개야. 갯수를 2배로 늘려서 랜덤하게 과일이미지가 바뀌게 정리해줘
```

##### 코드 설명 요청

-예시

```markdown
Index.html에 자바스크립트 코드를 초보자에게 설명하듯이 블록 단위로 설명해줘.

- 외부라이브러리 확인
- 엔트리포인트 확인
- 실행 흐름
```