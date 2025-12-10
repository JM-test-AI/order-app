const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
// CORS 설정 (프런트엔드와 통신을 위해)
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // 프로덕션에서는 프런트엔드 URL로 제한
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '커피 주문 앱 API 서버',
    version: '1.0.0'
  });
});

// 라우터 등록 (404 핸들러 전에 등록해야 함)
const menusRouter = require('./routes/menus');
const ordersRouter = require('./routes/orders');

app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);

// API 라우트
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '서버가 정상적으로 동작 중입니다.',
    timestamp: new Date().toISOString()
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('에러 발생:', err);
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
  
  // 데이터베이스 연결 테스트
  await testConnection();
});

