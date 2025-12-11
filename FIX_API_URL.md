# API URL 설정 문제 해결 가이드

## 문제 상황
- 프런트엔드 URL: `https://order-app-frontend-ypcm.onrender.com`
- 현재 API URL: `http://localhost:3000/api/menus` ❌
- 오류: Mixed Content (HTTPS에서 HTTP 요청 차단)

## 해결 방법

### Render.com에서 환경 변수 설정

1. **Render 대시보드 접속**
   - https://dashboard.render.com 접속

2. **Static Site 선택**
   - `order-app-frontend` 또는 프런트엔드 서비스 선택

3. **Environment 탭 클릭**
   - 좌측 메뉴에서 **Environment** 선택

4. **환경 변수 추가/수정**
   - **Add Environment Variable** 클릭
   - 또는 기존 `VITE_API_URL` 수정
   
   **설정 값:**
   ```
   Key: VITE_API_URL
   Value: https://order-app-server.onrender.com/api
   ```
   
   ⚠️ **중요**: `order-app-server`를 실제 백엔드 서비스 이름으로 변경하세요!

5. **저장**
   - **Save Changes** 클릭
   - 자동으로 재배포가 시작됩니다

6. **배포 완료 대기**
   - 배포 완료까지 약 2-5분 소요
   - 상태가 "Live"가 되면 완료

7. **확인**
   - 브라우저에서 사이트 새로고침 (Cmd + Shift + R)
   - 개발자 도구 콘솔에서 `API Base URL:` 확인
   - `https://order-app-server.onrender.com/api`로 표시되어야 함

## 백엔드 서버 URL 확인 방법

1. Render 대시보드에서 백엔드 Web Service 선택
2. 상단에 표시된 URL 확인 (예: `https://order-app-server.onrender.com`)
3. 이 URL에 `/api`를 추가하여 `VITE_API_URL`에 설정

## 추가 확인 사항

### 백엔드 서버가 정상 작동하는지 확인

브라우저에서 직접 접속:
```
https://order-app-server.onrender.com/api/health
```

정상 응답 예시:
```json
{
  "success": true,
  "message": "서버가 정상적으로 동작 중입니다.",
  "timestamp": "..."
}
```

### CORS 설정 확인

백엔드 서버의 환경 변수에 프런트엔드 URL이 설정되어 있는지 확인:
```
FRONTEND_URL=https://order-app-frontend-ypcm.onrender.com
```

## 문제가 계속되면

1. 브라우저 캐시 삭제 (Cmd + Shift + Delete)
2. 시크릿 모드에서 테스트
3. 개발자 도구 콘솔에서 `API Base URL:` 확인
4. Network 탭에서 실제 요청 URL 확인

