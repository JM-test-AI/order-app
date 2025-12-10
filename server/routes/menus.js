const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/menus - 메뉴 목록 조회
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, price, image, stock FROM menus ORDER BY id'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('메뉴 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '메뉴 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// PATCH /api/menus/:menuId/stock - 재고 수정
router.patch('/:menuId/stock', async (req, res) => {
  try {
    const { menuId } = req.params;
    const { change } = req.body;
    
    if (typeof change !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'change는 숫자여야 합니다.'
      });
    }
    
    // 현재 재고 조회
    const menuResult = await pool.query(
      'SELECT id, name, stock FROM menus WHERE id = $1',
      [menuId]
    );
    
    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.'
      });
    }
    
    const currentStock = menuResult.rows[0].stock;
    const newStock = Math.max(0, currentStock + change);
    
    // 재고 업데이트
    const updateResult = await pool.query(
      'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock, updated_at',
      [newStock, menuId]
    );
    
    res.json({
      success: true,
      data: {
        id: updateResult.rows[0].id,
        name: updateResult.rows[0].name,
        stock: updateResult.rows[0].stock,
        updatedAt: updateResult.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('재고 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '재고 수정 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;

