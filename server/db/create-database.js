require('dotenv').config();
const { Pool } = require('pg');

// postgres 데이터베이스에 연결 (기본 데이터베이스)
const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: 'postgres', // 기본 데이터베이스
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '' 
    ? process.env.DB_PASSWORD 
    : undefined,
});

async function createDatabase() {
  try {
    const dbName = process.env.DB_NAME || 'order_app';
    
    // 데이터베이스 존재 여부 확인
    const checkResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    if (checkResult.rows.length > 0) {
      console.log(`데이터베이스 '${dbName}'가 이미 존재합니다.`);
      await adminPool.end();
      return true;
    }
    
    // 데이터베이스 생성
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`데이터베이스 '${dbName}'가 성공적으로 생성되었습니다.`);
    
    await adminPool.end();
    return true;
  } catch (error) {
    console.error('데이터베이스 생성 오류:', error.message);
    await adminPool.end();
    return false;
  }
}

if (require.main === module) {
  createDatabase()
    .then((success) => {
      if (success) {
        console.log('데이터베이스 생성 완료');
        process.exit(0);
      } else {
        console.log('데이터베이스 생성 실패');
        process.exit(1);
      }
    });
}

module.exports = { createDatabase };

