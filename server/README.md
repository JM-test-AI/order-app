# 커피 주문 앱 백엔드 서버

Express.js를 사용한 RESTful API 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```
PORT=3000
NODE_ENV=development
```

## 실행

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 헬스 체크
- `GET /api/health` - 서버 상태 확인

## 프로젝트 구조

```
server/
├── index.js          # 메인 서버 파일
├── package.json       # 프로젝트 설정
├── .env              # 환경 변수 (git에 포함되지 않음)
└── README.md         # 이 파일
```

## 다음 단계

1. 데이터베이스 연결 설정
2. API 라우트 구현
3. 미들웨어 추가

