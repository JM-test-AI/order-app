# Render.com 배포 가이드

## 배포 순서

### 1. PostgreSQL 데이터베이스 생성

1. Render.com 대시보드에 로그인
2. **New +** 버튼 클릭 → **PostgreSQL** 선택
3. 데이터베이스 설정:
   - **Name**: `order-app-db` (또는 원하는 이름)
   - **Database**: `order_app`
   - **User**: 자동 생성
   - **Region**: 가장 가까운 지역 선택
   - **PostgreSQL Version**: 최신 버전 선택
4. **Create Database** 클릭
5. 생성 완료 후 **Internal Database URL** 복사 (나중에 사용)

### 2. 백엔드 서버 배포

1. **New +** 버튼 클릭 → **Web Service** 선택
2. GitHub 저장소 연결:
   - GitHub 저장소 선택 또는 연결
   - **Root Directory**: `server` 지정
3. 서비스 설정:
   - **Name**: `order-app-server` (또는 원하는 이름)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Region**: 데이터베이스와 같은 지역 선택
4. 환경 변수 설정:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<데이터베이스 호스트>
   DB_PORT=5432
   DB_NAME=order_app
   DB_USER=<데이터베이스 사용자>
   DB_PASSWORD=<데이터베이스 비밀번호>
   ```
   또는 **Internal Database URL**을 파싱하여 설정:
   ```
   DATABASE_URL=<Internal Database URL>
   ```
5. **Create Web Service** 클릭
6. 배포 완료 후 서버 URL 확인 (예: `https://order-app-server.onrender.com`)

### 3. 데이터베이스 초기화

백엔드 서버가 배포된 후, 데이터베이스를 초기화해야 합니다.

**방법 1: Render Shell 사용**
1. Render 대시보드에서 백엔드 서비스 선택
2. **Shell** 탭 클릭
3. 다음 명령어 실행:
   ```bash
   npm run db:init
   ```

**방법 2: 로컬에서 실행**
1. `.env` 파일에 Render 데이터베이스 정보 설정
2. 다음 명령어 실행:
   ```bash
   cd server
   npm run db:init
   ```

### 4. 프런트엔드 배포

1. **New +** 버튼 클릭 → **Static Site** 선택
2. GitHub 저장소 연결:
   - 같은 GitHub 저장소 선택
   - **Root Directory**: `ui` 지정
3. 빌드 설정:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. 환경 변수 설정 (선택사항):
   ```
   VITE_API_URL=https://order-app-server.onrender.com/api
   ```
5. **Create Static Site** 클릭

### 5. 프런트엔드 API URL 수정

프런트엔드가 배포된 서버를 사용하도록 API URL을 수정해야 합니다.

**방법 1: 환경 변수 사용 (권장)**
1. `ui/src/api.js` 파일 수정:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
   ```
2. Render Static Site 환경 변수에 `VITE_API_URL` 추가

**방법 2: 빌드 시점에 설정**
- Render Static Site의 환경 변수에 `VITE_API_URL` 설정

## 환경 변수 설정 가이드

### 백엔드 환경 변수

Render Web Service의 **Environment** 섹션에서 설정:

```
NODE_ENV=production
PORT=10000
DB_HOST=<PostgreSQL 호스트>
DB_PORT=5432
DB_NAME=order_app
DB_USER=<PostgreSQL 사용자>
DB_PASSWORD=<PostgreSQL 비밀번호>
```

또는 Internal Database URL 사용:
```
DATABASE_URL=postgresql://user:password@host:5432/order_app
```

### 프런트엔드 환경 변수

Render Static Site의 **Environment** 섹션에서 설정:

```
VITE_API_URL=https://order-app-server.onrender.com/api
```

## 배포 후 확인 사항

1. **백엔드 확인**
   - `https://order-app-server.onrender.com/api/health` 접속
   - 정상 응답 확인

2. **데이터베이스 확인**
   - 백엔드 서버 로그에서 데이터베이스 연결 확인
   - `https://order-app-server.onrender.com/api/menus` 접속하여 메뉴 목록 확인

3. **프런트엔드 확인**
   - 배포된 Static Site URL 접속
   - 메뉴 목록이 표시되는지 확인
   - 주문 기능 테스트

## 주의사항

1. **무료 플랜 제한**
   - Render 무료 플랜은 15분간 비활성 시 서비스가 sleep 상태가 됩니다
   - 첫 요청 시 약 30초 정도의 시작 시간이 필요합니다

2. **데이터베이스 연결**
   - Internal Database URL을 사용하면 더 안정적으로 연결됩니다
   - 백엔드와 데이터베이스가 같은 지역에 있어야 합니다

3. **환경 변수 보안**
   - `.env` 파일은 Git에 커밋하지 마세요
   - Render 대시보드에서만 환경 변수를 설정하세요

4. **CORS 설정**
   - 백엔드 서버의 CORS 설정이 프런트엔드 도메인을 허용하는지 확인하세요

## 트러블슈팅

### 백엔드가 데이터베이스에 연결되지 않는 경우
- 환경 변수가 올바르게 설정되었는지 확인
- Internal Database URL 사용 권장
- 데이터베이스와 백엔드가 같은 지역에 있는지 확인

### 프런트엔드에서 API 호출 실패
- `VITE_API_URL` 환경 변수가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 CORS 오류 확인
- 백엔드 CORS 설정 확인

### 이미지가 표시되지 않는 경우
- 이미지 파일이 `ui/public/images/` 폴더에 있는지 확인
- 이미지 경로가 올바른지 확인 (`/images/파일명.jpg`)

