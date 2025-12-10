const { pool } = require('../config/database');

async function updateMenuImages() {
  try {
    // 이미지 경로 업데이트
    await pool.query(`
      UPDATE menus SET image = '/images/americano-ice.jpg' WHERE id = 1;
      UPDATE menus SET image = '/images/americano-hot.jpg' WHERE id = 2;
      UPDATE menus SET image = '/images/cafe-latte.jpg' WHERE id = 3;
    `);
    
    // 확인
    const result = await pool.query(
      'SELECT id, name, image FROM menus WHERE id IN (1, 2, 3)'
    );
    
    console.log('이미지 경로가 업데이트되었습니다:');
    result.rows.forEach(menu => {
      console.log(`- ${menu.name}: ${menu.image || '(이미지 없음)'}`);
    });
    
    return true;
  } catch (error) {
    console.error('이미지 경로 업데이트 오류:', error);
    return false;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  updateMenuImages()
    .then((success) => {
      if (success) {
        console.log('완료');
        process.exit(0);
      } else {
        console.log('실패');
        process.exit(1);
      }
    });
}

module.exports = { updateMenuImages };

