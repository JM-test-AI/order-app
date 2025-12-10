const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL 연결 풀 생성
// Render.com에서는 DATABASE_URL 환경 변수를 사용할 수 있습니다
let dbConfig;

if (process.env.DATABASE_URL) {
  // Render.com의 Internal Database URL 사용
  // Render PostgreSQL은 SSL 연결을 요구합니다
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Render.com의 자체 서명 인증서를 허용
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Render에서는 연결 시간을 늘림
  };
} else {
  // 개별 환경 변수 사용 (로컬 개발)
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  // 비밀번호가 설정되어 있고 빈 문자열이 아닐 때만 추가
  if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
    dbConfig.password = process.env.DB_PASSWORD;
  }
  
  // 로컬 개발 환경에서도 SSL이 필요한 경우 (예: Render External Database)
  if (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
  }
}

const pool = new Pool(dbConfig);

// 연결 테스트
pool.on('connect', () => {
  console.log('데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('데이터베이스 연결 오류:', err);
});

// 데이터베이스 연결 테스트 함수
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('데이터베이스 연결 성공:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};

