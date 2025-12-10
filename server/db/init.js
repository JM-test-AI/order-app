const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // SQL 스크립트 실행
    await pool.query(schema);
    
    console.log('데이터베이스 스키마가 성공적으로 생성되었습니다.');
    return true;
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    return false;
  }
}

// 직접 실행 시
if (require.main === module) {
  initDatabase()
    .then((success) => {
      if (success) {
        console.log('초기화 완료');
        process.exit(0);
      } else {
        console.log('초기화 실패');
        process.exit(1);
      }
    });
}

module.exports = { initDatabase };

