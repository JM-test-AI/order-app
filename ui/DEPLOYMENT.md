# 프런트엔드 Render.com 배포 가이드

## 배포 전 확인 사항

### 1. 코드 확인
- ✅ `src/api.js`에서 환경 변수 `VITE_API_URL` 사용 중
- ✅ `package.json`에 `build` 스크립트 존재
- ✅ 이미지 파일이 `public/images/` 폴더에 있음

### 2. 백엔드 서버 URL 확인
배포 전에 백엔드 서버가 정상적으로 배포되어 있고 URL을 확인해야 합니다.
예: `https://order-app-server.onrender.com`

## Render.com 배포 과정

### 1단계: Static Site 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인

2. **새 Static Site 생성**
   - **New +** 버튼 클릭
   - **Static Site** 선택

3. **GitHub 저장소 연결**
   - **Connect account** 또는 기존 계정 선택
   - 저장소: `JM-test-AI/order-app` 선택
   - **Connect** 클릭

4. **배포 설정**
   - **Name**: `order-app-frontend` (또는 원하는 이름)
   - **Branch**: `main` (또는 배포할 브랜치)
   - **Root Directory**: `ui` ⚠️ **중요: 반드시 `ui`로 설정**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist` ⚠️ **중요: 반드시 `dist`로 설정**

5. **환경 변수 설정**
   - **Environment** 섹션으로 이동
   - **Add Environment Variable** 클릭
   - 다음 환경 변수 추가:
     ```
     Key: VITE_API_URL
     Value: https://order-app-server.onrender.com/api
     ```
     ⚠️ **주의**: 실제 배포된 백엔드 서버 URL로 변경하세요!

6. **생성 및 배포**
   - **Create Static Site** 클릭
   - 배포가 자동으로 시작됩니다

### 2단계: 배포 확인

1. **빌드 로그 확인**
   - 배포 중 **Logs** 탭에서 빌드 과정 확인
   - 오류가 없으면 성공

2. **배포 완료 대기**
   - 배포 완료까지 약 2-5분 소요
   - "Live" 상태가 되면 완료

3. **사이트 접속 테스트**
   - 배포된 URL로 접속 (예: `https://order-app-frontend.onrender.com`)
   - 브라우저 개발자 도구 콘솔에서 오류 확인
   - 메뉴 목록이 표시되는지 확인

## 환경 변수 설정

### 필수 환경 변수

```
VITE_API_URL=https://order-app-server.onrender.com/api
```

⚠️ **중요**: 
- `VITE_` 접두사가 있어야 Vite에서 환경 변수를 읽을 수 있습니다
- 백엔드 서버 URL은 실제 배포된 URL로 변경해야 합니다
- 환경 변수 변경 후 재배포가 필요합니다

### 환경 변수 수정 방법

1. Render 대시보드에서 Static Site 선택
2. **Environment** 탭 클릭
3. 환경 변수 수정 또는 추가
4. **Save Changes** 클릭
5. 자동으로 재배포 시작

## 트러블슈팅

### 문제 1: API 호출 실패 (CORS 오류)

**증상**: 브라우저 콘솔에 CORS 오류 메시지

**해결 방법**:
1. 백엔드 서버의 CORS 설정 확인
2. `server/index.js`에서 프런트엔드 URL 허용 확인
3. 백엔드 서버 재배포

### 문제 2: 이미지가 표시되지 않음

**증상**: 메뉴 이미지가 표시되지 않음

**해결 방법**:
1. 이미지 파일이 `ui/public/images/` 폴더에 있는지 확인
2. 데이터베이스의 이미지 경로가 `/images/파일명.jpg` 형식인지 확인
3. 브라우저 개발자 도구에서 이미지 URL 확인

### 문제 3: 빌드 실패

**증상**: 배포 로그에 빌드 오류

**해결 방법**:
1. 로컬에서 `npm run build` 실행하여 오류 확인
2. `package.json`의 빌드 스크립트 확인
3. Node.js 버전 확인 (Render는 자동으로 최신 버전 사용)

### 문제 4: 환경 변수가 적용되지 않음

**증상**: 여전히 로컬 API URL 사용

**해결 방법**:
1. 환경 변수 이름이 `VITE_API_URL`인지 확인 (대소문자 구분)
2. 환경 변수 설정 후 재배포 확인
3. 브라우저 캐시 삭제 후 다시 시도

## 배포 후 확인 체크리스트

- [ ] 배포된 사이트에 접속 가능
- [ ] 메뉴 목록이 정상적으로 표시됨
- [ ] 이미지가 정상적으로 표시됨
- [ ] 장바구니에 메뉴 추가 가능
- [ ] 주문하기 기능 작동
- [ ] 관리자 화면 접속 가능
- [ ] 주문 현황 확인 가능
- [ ] 재고 수정 기능 작동

## 추가 참고사항

### 무료 플랜 제한
- Render 무료 플랜은 Static Site도 15분 비활성 시 sleep 상태가 될 수 있습니다
- 첫 접속 시 약간의 지연이 있을 수 있습니다

### 커스텀 도메인
- Render Pro 플랜에서는 커스텀 도메인 설정 가능
- 무료 플랜에서는 Render 제공 도메인 사용

### 자동 배포
- GitHub에 푸시하면 자동으로 재배포됩니다
- 특정 브랜치만 배포하도록 설정 가능

