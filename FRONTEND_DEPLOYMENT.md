# 프런트엔드 Render.com 배포 가이드

## 📋 배포 전 확인 사항

### ✅ 코드 상태
프런트엔드 코드는 이미 배포 준비가 되어 있습니다:
- ✅ `src/api.js`에서 환경 변수 `VITE_API_URL` 사용 중
- ✅ `package.json`에 `build` 스크립트 존재
- ✅ 이미지 파일이 `public/images/` 폴더에 있음

### ⚠️ 필수 확인
1. **백엔드 서버가 먼저 배포되어 있어야 합니다**
2. 백엔드 서버 URL 확인 (예: `https://order-app-server.onrender.com`)

---

## 🚀 Render.com 배포 과정

### 1단계: Static Site 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속 및 로그인

2. **새 Static Site 생성**
   - 우측 상단 **New +** 버튼 클릭
   - **Static Site** 선택

3. **GitHub 저장소 연결**
   - **Connect account** 클릭 (처음인 경우)
   - 또는 기존 GitHub 계정 선택
   - 저장소: `JM-test-AI/order-app` 선택
   - **Connect** 클릭

4. **배포 설정 입력**
   ```
   Name: order-app-frontend
   Branch: main
   Root Directory: ui          ⚠️ 중요!
   Build Command: npm run build
   Publish Directory: dist    ⚠️ 중요!
   ```

5. **환경 변수 설정**
   - **Environment** 섹션으로 스크롤
   - **Add Environment Variable** 클릭
   - 다음 환경 변수 추가:
     ```
     Key: VITE_API_URL
     Value: https://order-app-server.onrender.com/api
     ```
     ⚠️ **주의**: 실제 배포된 백엔드 서버 URL로 변경하세요!

6. **생성 및 배포**
   - **Create Static Site** 버튼 클릭
   - 배포가 자동으로 시작됩니다 (약 2-5분 소요)

---

## 🔧 환경 변수 설정

### 필수 환경 변수

```
VITE_API_URL=https://order-app-server.onrender.com/api
```

**중요 사항:**
- ✅ `VITE_` 접두사가 반드시 있어야 합니다 (Vite 요구사항)
- ✅ 백엔드 서버 URL은 실제 배포된 URL로 변경
- ✅ 환경 변수 변경 후 자동 재배포됨

### 환경 변수 수정 방법

1. Render 대시보드에서 Static Site 선택
2. 좌측 메뉴에서 **Environment** 클릭
3. 환경 변수 수정 또는 추가
4. **Save Changes** 클릭
5. 자동으로 재배포 시작

---

## ✅ 배포 후 확인

### 1. 배포 상태 확인
- 배포 로그에서 "Build successful" 메시지 확인
- 상태가 "Live"가 되면 완료

### 2. 기능 테스트
- [ ] 배포된 사이트 접속 가능
- [ ] 메뉴 목록 표시 확인
- [ ] 이미지 표시 확인
- [ ] 장바구니 기능 작동
- [ ] 주문하기 기능 작동
- [ ] 관리자 화면 접속
- [ ] 주문 현황 확인
- [ ] 재고 수정 기능

### 3. 브라우저 콘솔 확인
- 개발자 도구(F12) 열기
- Console 탭에서 오류 메시지 확인
- Network 탭에서 API 호출 확인

---

## 🐛 트러블슈팅

### 문제 1: API 호출 실패 (CORS 오류)

**증상**: 브라우저 콘솔에 "CORS policy" 오류

**원인**: 백엔드 서버가 프런트엔드 도메인을 허용하지 않음

**해결 방법**:
1. 백엔드 서버의 환경 변수에 `FRONTEND_URL` 추가:
   ```
   FRONTEND_URL=https://order-app-frontend.onrender.com
   ```
2. 또는 백엔드 `server/index.js`에서 CORS 설정 확인
3. 백엔드 서버 재배포

### 문제 2: 이미지가 표시되지 않음

**증상**: 메뉴 이미지가 표시되지 않음

**해결 방법**:
1. 이미지 파일이 `ui/public/images/` 폴더에 있는지 확인
2. 데이터베이스의 이미지 경로 확인:
   ```sql
   SELECT id, name, image FROM menus WHERE id IN (1, 2, 3);
   ```
3. 이미지 경로가 `/images/파일명.jpg` 형식인지 확인
4. 브라우저 개발자 도구에서 이미지 URL 직접 접속 테스트

### 문제 3: 빌드 실패

**증상**: 배포 로그에 빌드 오류

**해결 방법**:
1. 로컬에서 빌드 테스트:
   ```bash
   cd ui
   npm run build
   ```
2. 오류 메시지 확인 및 수정
3. `package.json`의 빌드 스크립트 확인
4. Node.js 버전 확인 (Render는 자동으로 최신 버전 사용)

### 문제 4: 환경 변수가 적용되지 않음

**증상**: 여전히 로컬 API URL(`http://localhost:3000`) 사용

**해결 방법**:
1. 환경 변수 이름이 정확한지 확인: `VITE_API_URL` (대소문자 구분)
2. 환경 변수 설정 후 재배포 확인
3. 브라우저 캐시 삭제 (Ctrl+Shift+Delete 또는 Cmd+Shift+Delete)
4. 시크릿 모드에서 테스트

### 문제 5: Root Directory 오류

**증상**: "Cannot find package.json" 오류

**해결 방법**:
1. Render 설정에서 **Root Directory**가 `ui`로 설정되어 있는지 확인
2. 저장소 구조 확인:
   ```
   order-app/
   ├── server/
   └── ui/          ← 여기가 Root Directory
       ├── package.json
       └── ...
   ```

---

## 📝 배포 체크리스트

배포 전:
- [ ] 백엔드 서버가 정상적으로 배포되어 있음
- [ ] 백엔드 서버 URL 확인
- [ ] 로컬에서 `npm run build` 성공
- [ ] GitHub에 최신 코드 푸시

배포 중:
- [ ] Root Directory: `ui` 설정
- [ ] Build Command: `npm run build` 설정
- [ ] Publish Directory: `dist` 설정
- [ ] 환경 변수 `VITE_API_URL` 설정

배포 후:
- [ ] 배포 상태가 "Live"인지 확인
- [ ] 사이트 접속 테스트
- [ ] API 호출 정상 작동 확인
- [ ] 모든 기능 테스트

---

## 🔄 자동 배포 설정

Render는 기본적으로 GitHub에 푸시할 때마다 자동으로 재배포합니다.

### 자동 배포 비활성화 (선택사항)
1. Static Site 설정에서 **Auto-Deploy** 옵션 끄기
2. 수동으로 **Manual Deploy** 버튼 클릭하여 배포

### 특정 브랜치만 배포
- **Branch** 설정에서 특정 브랜치 선택 (예: `production`)

---

## 💡 추가 팁

### 성능 최적화
- 이미지 최적화: 이미지 파일 크기 최소화
- 코드 분할: Vite가 자동으로 처리

### 커스텀 도메인
- Render Pro 플랜에서 커스텀 도메인 설정 가능
- 무료 플랜: Render 제공 도메인 사용 (예: `order-app-frontend.onrender.com`)

### 무료 플랜 제한
- Static Site는 무료 플랜에서도 sleep 상태가 되지 않습니다
- 하지만 첫 접속 시 약간의 지연이 있을 수 있습니다

---

## 📞 문제 해결이 안 될 때

1. **Render 로그 확인**: 배포 로그에서 상세 오류 메시지 확인
2. **로컬 테스트**: 로컬에서 빌드 및 실행 테스트
3. **브라우저 콘솔**: 개발자 도구에서 오류 메시지 확인
4. **네트워크 탭**: API 호출이 정상적인지 확인

