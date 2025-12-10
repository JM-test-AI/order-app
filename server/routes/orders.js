const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/orders - 주문 목록 조회
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        o.id,
        o.order_date,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at
      FROM orders o
    `;
    
    const params = [];
    
    if (status) {
      const statusList = status.split(',').map(s => s.trim());
      query += ` WHERE o.status = ANY($1)`;
      params.push(statusList);
    }
    
    query += ' ORDER BY o.order_date DESC';
    
    const ordersResult = await pool.query(query, params);
    
    // 각 주문의 항목 조회
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT 
            menu_name,
            quantity,
            options,
            total_price
          FROM order_items
          WHERE order_id = $1`,
          [order.id]
        );
        
        const items = itemsResult.rows.map(item => ({
          menuName: item.menu_name,
          quantity: item.quantity,
          optionText: formatOptions(item.options),
          totalPrice: item.total_price
        }));
        
        return {
          id: order.id,
          orderDate: order.order_date,
          status: order.status,
          totalAmount: order.total_amount,
          items
        };
      })
    );
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/orders/:orderId - 주문 정보 조회
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orderResult = await pool.query(
      'SELECT id, order_date, status, total_amount FROM orders WHERE id = $1',
      [orderId]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      });
    }
    
    const order = orderResult.rows[0];
    
    const itemsResult = await pool.query(
      `SELECT 
        id,
        menu_id as "menuId",
        menu_name as "menuName",
        quantity,
        options,
        unit_price as "unitPrice",
        total_price as "totalPrice"
      FROM order_items
      WHERE order_id = $1`,
      [orderId]
    );
    
    res.json({
      success: true,
      data: {
        id: order.id,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.total_amount,
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('주문 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 정보를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// POST /api/orders - 주문 생성
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { items, totalAmount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: '주문 항목이 필요합니다.'
      });
    }
    
    // 재고 검증
    const stockIssues = [];
    for (const item of items) {
      const menuResult = await client.query(
        'SELECT id, name, stock FROM menus WHERE id = $1',
        [item.menuId]
      );
      
      if (menuResult.rows.length === 0) {
        stockIssues.push({
          menuId: item.menuId,
          menuName: item.menuName,
          requested: item.quantity,
          available: 0,
          error: '메뉴를 찾을 수 없습니다.'
        });
      } else {
        const menu = menuResult.rows[0];
        if (menu.stock < item.quantity) {
          stockIssues.push({
            menuId: item.menuId,
            menuName: item.menuName,
            requested: item.quantity,
            available: menu.stock
          });
        }
      }
    }
    
    if (stockIssues.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: '재고 부족',
        details: stockIssues
      });
    }
    
    // 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (order_date, status, total_amount)
       VALUES (CURRENT_TIMESTAMP, 'received', $1)
       RETURNING id, order_date, status, total_amount`,
      [totalAmount]
    );
    
    const order = orderResult.rows[0];
    
    // 주문 항목 저장 및 재고 차감
    for (const item of items) {
      // 주문 항목 저장
      await client.query(
        `INSERT INTO order_items 
         (order_id, menu_id, menu_name, quantity, options, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          item.menuId,
          item.menuName,
          item.quantity,
          JSON.stringify(item.options || {}),
          item.unitPrice,
          item.totalPrice
        ]
      );
      
      // 재고 차감
      await client.query(
        'UPDATE menus SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.menuId]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.total_amount
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('주문 생성 오류:', error);
    console.error('오류 상세:', error.message);
    console.error('오류 스택:', error.stack);
    res.status(500).json({
      success: false,
      error: '주문 생성 중 오류가 발생했습니다.',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// PATCH /api/orders/:orderId/status - 주문 상태 업데이트
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['received', 'preparing', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 주문 상태입니다.'
      });
    }
    
    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, status, updated_at`,
      [status, orderId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 상태 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 옵션 포맷팅 헬퍼 함수
function formatOptions(options) {
  if (!options || typeof options !== 'object') return '';
  
  const optionText = [];
  if (options.addShot) optionText.push('샷 추가');
  if (options.addSyrup) optionText.push('시럽 추가');
  
  return optionText.length > 0 ? ` (${optionText.join(', ')})` : '';
}

module.exports = router;

