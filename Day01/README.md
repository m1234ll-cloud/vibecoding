# FastAPI TODO API

초보자도 따라하기 쉬운, 메모리 리스트 기반 TODO API 예제입니다.

## 기능

- 할 일 목록 조회
- 할 일 추가
- 할 일 완료 상태 변경
- 할 일 삭제
- DB 대신 메모리 리스트에 저장

## 파일 설명

- `app.py`: FastAPI 서버 코드
- `requirements.txt`: 필요한 패키지 목록

## 실행 방법

1. 가상환경을 활성화합니다.

```powershell
cd C:\vibecodings\Day01
..\venv\Scripts\Activate.ps1
```

2. 필요한 패키지를 설치합니다.

```powershell
pip install -r requirements.txt
```

3. 서버를 실행합니다.

```powershell
uvicorn app:app --reload
```

4. 브라우저에서 아래 주소를 확인합니다.

- HTML 화면: `http://127.0.0.1:8000`
- API 문서: `http://127.0.0.1:8000/docs`

## API 사용 예시

### 1. 목록 조회

```http
GET /todos
```

### 2. 할 일 추가

```http
POST /todos
Content-Type: application/json

{
  "title": "운동하기"
}
```

### 3. 완료 상태 변경

```http
PATCH /todos/1
Content-Type: application/json

{
  "completed": true
}
```

### 4. 삭제

```http
DELETE /todos/1
```

## 주의할 점

- 데이터는 메모리에만 저장됩니다.
- 서버를 다시 시작하면 TODO 목록이 초기화됩니다.
