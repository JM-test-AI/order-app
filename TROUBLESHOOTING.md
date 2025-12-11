# 메뉴 목록 로딩 실패 문제 해결 가이드

## "Load failed" 오류 해결 방법

### 1단계: 브라우저 콘솔 확인

1. **브라우저 개발자 도구 열기**
   - Windows/Linux: `F12` 또는 `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`

2. **Console 탭 확인**
   - `API Base URL:` 메시지 확인
   - `API 호출:` 메시지 확인
   - 빨간색 오류 메시지 확인

3. **Network 탭 확인**
   - `/api/menus` 요청 찾기
   - Status Code 확인:
     - `200`: 성공
     - `404`: API URL 오류
     - `500`: 서버 오류
     - `CORS error`: CORS 설정 오류
     - `Failed`: 네트워크 오류

### 2단계: 일반적인 원인별 해결

#### 원인 1: API URL이 잘못 설정됨

**증상**: 콘솔에 `API Base URL: http://localhost:3000/api` 표시

**해결 방법**:
1. Render Static Site 설정 확인
2. Environment 변수에서 `VITE_API_URL` 확인
3. 값이 `https://order-app-server.onrender.com/api` 형식인지 확인
4. 환경 변수 수정 후 재배포

#### 원인 2: CORS 오류

**증상**: 콘솔에 "CORS policy" 오류 메시지

**해결 방법**:
1. 백엔드 서버의 환경 변수 확인
2. `FRONTEND_URL` 환경 변수 추가:
   ```
   FRONTEND_URL=https://order-app-frontend.onrender.com
   ```
3. 백엔드 서버 재배포

#### 원인 3: 백엔드 서버가 응답하지 않음

**증상**: Network 탭에서 요청이 "pending" 상태 또는 타임아웃

**해결 방법**:
1. Render 대시보드에서 백엔드 서버 상태 확인
2. 서버가 "Live" 상태인지 확인
3. 서버 로그에서 오류 확인
4. 무료 플랜인 경우 첫 요청 시 약 30초 대기 필요

#### 원인 4: 네트워크 연결 실패

**증상**: "Failed to fetch" 또는 "Network error"

**해결 방법**:
1. 인터넷 연결 확인
2. 백엔드 서버 URL 직접 접속 테스트:
   ```
   https://order-app-server.onrender.com/api/health
   ```
3. 정상 응답이 오는지 확인

### 3단계: 수동 테스트

#### 백엔드 서버 테스트

브라우저에서 직접 접속:
```
https://order-app-server.onrender.com/api/health
```

예상 응답:
```json
{
  "success": true,
  "message": "서버가 정상적으로 동작 중입니다.",
  "timestamp": "..."
}
```

#### 메뉴 API 테스트

```
https://order-app-server.onrender.com/api/menus
```

예상 응답:
```json
{
  "success": true,
  "data": [...]
}
```

### 4단계: 환경 변수 확인

#### 프런트엔드 (Render Static Site)

1. Render 대시보드 → Static Site 선택
2. **Environment** 탭
3. 다음 환경 변수 확인:
   ```
   VITE_API_URL=https://order-app-server.onrender.com/api
   ```
4. 실제 백엔드 서버 URL로 변경

#### 백엔드 (Render Web Service)

1. Render 대시보드 → Web Service 선택
2. **Environment** 탭
3. 다음 환경 변수 확인:
   ```
   DATABASE_URL=postgresql://...
   FRONTEND_URL=https://order-app-frontend.onrender.com
   NODE_ENV=production
   PORT=10000
   ```

### 5단계: 재배포

환경 변수를 수정한 경우:

1. **프런트엔드**: 환경 변수 저장 시 자동 재배포
2. **백엔드**: 환경 변수 저장 시 자동 재배포
3. 배포 완료까지 대기 (약 2-5분)

### 추가 디버깅 정보

코드에 추가된 디버깅 로그:
- `API Base URL:` - 현재 사용 중인 API URL
- `API 호출:` - 실제 호출되는 URL
- `메뉴 목록 로딩 시작...` - 로딩 시작
- `메뉴 목록 로딩 성공:` - 성공 시 메뉴 개수
- `메뉴 목록 로딩 실패:` - 실패 시 상세 오류

이 정보들을 브라우저 콘솔에서 확인하여 문제를 진단할 수 있습니다.

