import { useState, useEffect } from 'react'
import './App.css'
import { menuAPI, orderAPI } from './api'

// API URL을 에러 메시지에서 사용하기 위해 export
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function App() {
  const [menus, setMenus] = useState([])
  const [cart, setCart] = useState([])
  const [currentPage, setCurrentPage] = useState('order')
  const [orders, setOrders] = useState([]) // 주문 목록
  const [loading, setLoading] = useState(true)

  // 메뉴 목록 불러오기
  useEffect(() => {
    loadMenus()
  }, [])

  // 주문 목록 불러오기 (관리자 화면)
  useEffect(() => {
    if (currentPage === 'admin') {
      loadMenus() // 재고 현황을 위해 메뉴도 불러오기
      loadOrders()
    }
  }, [currentPage])

  const loadMenus = async () => {
    try {
      setLoading(true)
      console.log('메뉴 목록 로딩 시작...')
      const menusData = await menuAPI.getMenus()
      console.log('메뉴 목록 로딩 성공:', menusData.length, '개')
      setMenus(menusData)
    } catch (error) {
      console.error('메뉴 목록 로딩 실패:', error)
      console.error('오류 상세:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // 더 친화적인 에러 메시지
      let errorMessage = error.message || '알 수 없는 오류가 발생했습니다.'
      
      // 타임아웃 오류인 경우
      if (errorMessage.includes('Load failed') || errorMessage.includes('Failed to fetch') || errorMessage.includes('초과')) {
        errorMessage = `서버 응답 시간이 초과되었습니다.\n\nRender 무료 플랜의 경우:\n1. 서버가 sleep 상태일 수 있습니다 (15분 비활성 시)\n2. 첫 요청 시 약 30-60초 소요될 수 있습니다\n3. 잠시 후 다시 시도해주세요\n\n또는 백엔드 서버 상태를 확인하세요:\n${API_BASE_URL.replace('/api', '/api/health')}`
      }
      
      alert(`메뉴 목록을 불러오는데 실패했습니다.\n\n${errorMessage}\n\n브라우저 개발자 도구(F12)의 Console 탭에서 상세 오류를 확인하세요.`)
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      const ordersData = await orderAPI.getOrders('received,preparing')
      setOrders(ordersData)
    } catch (error) {
      console.error('주문 목록 로딩 실패:', error)
      alert('주문 목록을 불러오는데 실패했습니다.')
    }
  }

  // 메뉴를 장바구니에 추가
  const addToCart = (menu, options) => {
    // 재고 확인
    const currentMenu = menus.find(m => m.id === menu.id)
    if (!currentMenu || currentMenu.stock === 0) {
      alert('품절된 메뉴입니다.')
      return
    }

    // 옵션에 따른 추가 가격 계산
    let additionalPrice = 0
    if (options.addShot) additionalPrice += 500
    if (options.addSyrup) additionalPrice += 0 // 시럽은 무료

    const totalPrice = menu.price + additionalPrice

    // 옵션 텍스트 생성
    const optionText = []
    if (options.addShot) optionText.push('샷 추가')
    if (options.addSyrup) optionText.push('시럽 추가')
    const optionTextStr = optionText.length > 0 ? ` (${optionText.join(', ')})` : ''

    // 같은 메뉴와 옵션 조합이 이미 장바구니에 있는지 확인
    const existingItemIndex = cart.findIndex(item => 
      item.menuId === menu.id && 
      item.options.addShot === options.addShot &&
      item.options.addSyrup === options.addSyrup
    )

    if (existingItemIndex !== -1) {
      // 같은 항목이 있으면 수량만 증가 (재고 확인)
      const existingItem = cart[existingItemIndex]
      if (existingItem.quantity >= currentMenu.stock) {
        alert(`재고가 부족합니다. (현재 재고: ${currentMenu.stock}개)`)
        return
      }
      setCart(cart.map((item, index) => 
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // 새로운 항목 추가
      const cartItem = {
        id: Date.now(), // 고유 ID
        menuId: menu.id,
        name: menu.name,
        basePrice: menu.price,
        options: options,
        totalPrice: totalPrice,
        optionText: optionTextStr,
        quantity: 1
      }
      setCart([...cart, cartItem])
    }
  }

  // 장바구니에서 항목 제거
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  // 수량 증가
  const increaseQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId)
    if (!cartItem) return

    const currentMenu = menus.find(m => m.id === cartItem.menuId)
    if (!currentMenu) return

    // 재고 확인
    if (cartItem.quantity >= currentMenu.stock) {
      alert(`재고가 부족합니다. (현재 재고: ${currentMenu.stock}개)`)
      return
    }

    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ))
  }

  // 수량 감소
  const decreaseQuantity = (itemId) => {
    setCart(cart.map(item => 
      item.id === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ))
  }

  // 총 금액 계산
  const totalAmount = cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0)

  // 주문하기
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    try {
      // 주문 데이터 준비
      const orderItems = cart.map(item => ({
        menuId: item.menuId,
        menuName: item.name,
        quantity: item.quantity,
        options: item.options,
        unitPrice: item.totalPrice,
        totalPrice: item.totalPrice * item.quantity
      }))

      const orderData = {
        items: orderItems,
        totalAmount: totalAmount
      }

      // API 호출
      await orderAPI.createOrder(orderData)

      // 성공 시 메뉴 목록 새로고침 (재고 업데이트 반영)
      await loadMenus()

      alert(`주문이 완료되었습니다!\n총 금액: ${totalAmount.toLocaleString()}원`)
      setCart([])
    } catch (error) {
      console.error('주문 생성 실패:', error)
      if (error.message.includes('재고 부족')) {
        // 재고 부족 에러는 서버에서 상세 정보를 받아서 표시
        alert(error.message)
      } else {
        alert('주문 생성에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  // 재고 업데이트
  const updateStock = async (menuId, change) => {
    try {
      await menuAPI.updateStock(menuId, change)
      // 메뉴 목록 새로고침
      await loadMenus()
    } catch (error) {
      console.error('재고 업데이트 실패:', error)
      alert('재고 수정에 실패했습니다.')
    }
  }

  // 주문 상태 업데이트
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus)
      // 주문 목록 새로고침
      await loadOrders()
    } catch (error) {
      console.error('주문 상태 업데이트 실패:', error)
      alert('주문 상태 변경에 실패했습니다.')
    }
  }

  return (
    <div className="app">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="main-content">
        {currentPage === 'order' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                메뉴를 불러오는 중...
              </div>
            ) : (
              <div className="menu-section">
                <div className="menu-grid">
                  {menus.map(menu => (
                    <MenuCard key={menu.id} menu={menu} onAddToCart={addToCart} stock={menu.stock} />
                  ))}
                </div>
              </div>
            )}
            <Cart 
              cart={cart}
              onRemove={removeFromCart}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              totalAmount={totalAmount}
              onOrder={handleOrder}
            />
          </>
        )}
        {currentPage === 'admin' && (
          <AdminDashboard 
            menus={menus}
            orders={orders}
            onUpdateStock={updateStock}
            onUpdateOrderStatus={updateOrderStatus}
          />
        )}
      </div>
    </div>
  )
}

// 헤더 컴포넌트
function Header({ currentPage, setCurrentPage }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">COZY</div>
      </div>
      <div className="header-right">
        <button 
          className={`nav-button ${currentPage === 'order' ? 'active' : ''}`}
          onClick={() => setCurrentPage('order')}
        >
          주문하기
        </button>
        <button 
          className={`nav-button ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentPage('admin')}
        >
          관리자
        </button>
      </div>
    </header>
  )
}

// 메뉴 카드 컴포넌트
function MenuCard({ menu, onAddToCart, stock }) {
  const [options, setOptions] = useState({
    addShot: false,
    addSyrup: false
  })

  const handleOptionChange = (optionName) => {
    setOptions(prev => ({
      ...prev,
      [optionName]: !prev[optionName]
    }))
  }

  const handleAddToCart = () => {
    onAddToCart(menu, options)
    // 옵션 초기화
    setOptions({
      addShot: false,
      addSyrup: false
    })
  }

  return (
    <div className="menu-card">
      <div className="menu-image">
        {menu.image ? (
          <img src={menu.image} alt={menu.name} />
        ) : (
          <div className="image-placeholder">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>이미지</span>
          </div>
        )}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        <div className="menu-options">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.addShot}
              onChange={() => handleOptionChange('addShot')}
            />
            <span>샷 추가 (+500원)</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.addSyrup}
              onChange={() => handleOptionChange('addSyrup')}
            />
            <span>시럽 추가 (+0원)</span>
          </label>
        </div>
        {stock === 0 && (
          <div className="menu-out-of-stock">품절</div>
        )}
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          disabled={stock === 0}
        >
          담기
        </button>
      </div>
    </div>
  )
}

// 장바구니 컴포넌트
function Cart({ cart, onRemove, onIncrease, onDecrease, totalAmount, onOrder }) {
  return (
    <div className="cart-section">
      <h2 className="cart-title">장바구니</h2>
      {cart.length === 0 ? (
        <p className="cart-empty">장바구니가 비어있습니다.</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items-wrapper">
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-main">
                    <span className="cart-item-name">
                      {item.name}{item.optionText}
                    </span>
                    <div className="cart-item-price-wrapper">
                      <span className="cart-item-unit-price">
                        {item.totalPrice.toLocaleString()}원
                      </span>
                      <span className="cart-item-quantity">X {item.quantity}</span>
                      <span className="cart-item-total-price">
                        = {(item.totalPrice * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => onDecrease(item.id)}
                    >
                      -
                    </button>
                    <button 
                      className="quantity-btn"
                      onClick={() => onIncrease(item.id)}
                    >
                      +
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => onRemove(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="cart-summary">
            <div className="cart-total">
              총 금액 <strong>{totalAmount.toLocaleString()}원</strong>
            </div>
            <button className="order-btn" onClick={onOrder}>
              주문하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 관리자 대시보드 컴포넌트
function AdminDashboard({ menus, orders, onUpdateStock, onUpdateOrderStatus }) {
  // 대시보드 통계 계산
  const stats = {
    total: orders.length,
    received: orders.filter(o => o.status === 'received').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    completed: orders.filter(o => o.status === 'completed').length
  }

  // 재고 현황용 메뉴 (3개만)
  const inventoryMenus = menus.slice(0, 3)

  // 주문 현황 (주문 접수, 제조 중만 표시)
  const activeOrders = orders.filter(o => o.status !== 'completed')

  return (
    <div className="admin-dashboard">
      {/* 관리자 대시보드 */}
      <div className="admin-section">
        <h2 className="section-title">관리자 대시보드</h2>
        <div className="dashboard-stats">
          <div className="stat-item">
            <span className="stat-label">총 주문</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">주문 접수</span>
            <span className="stat-value">{stats.received}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">제조 중</span>
            <span className="stat-value">{stats.preparing}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">제조 완료</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* 재고 현황 */}
      <div className="admin-section">
        <h2 className="section-title">재고 현황</h2>
        <div className="inventory-grid">
          {inventoryMenus.map(menu => {
            let status = '정상'
            let statusClass = 'status-normal'
            if (menu.stock === 0) {
              status = '품절'
              statusClass = 'status-out'
            } else if (menu.stock < 5) {
              status = '주의'
              statusClass = 'status-warning'
            }

            return (
              <div key={menu.id} className="inventory-card">
                <div className="inventory-info">
                  <h3 className="inventory-name">{menu.name}</h3>
                  <div className="inventory-stock-wrapper">
                    <span className="inventory-stock">{menu.stock}개</span>
                    <span className={`inventory-status ${statusClass}`}>{status}</span>
                  </div>
                </div>
                <div className="inventory-controls">
                  <button 
                    className="stock-btn minus"
                    onClick={() => onUpdateStock(menu.id, -1)}
                  >
                    -
                  </button>
                  <button 
                    className="stock-btn plus"
                    onClick={() => onUpdateStock(menu.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 주문 현황 */}
      <div className="admin-section">
        <h2 className="section-title">주문 현황</h2>
        {activeOrders.length === 0 ? (
          <p className="no-orders">주문이 없습니다.</p>
        ) : (
          <div className="orders-list">
            {activeOrders.map(order => {
              const orderDate = new Date(order.orderDate)
              const month = orderDate.getMonth() + 1
              const day = orderDate.getDate()
              const hours = orderDate.getHours()
              const minutes = String(orderDate.getMinutes()).padStart(2, '0')
              const dateStr = `${month}월 ${day}일 ${hours}:${minutes}`
              
              return (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-time">{dateStr}</div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="order-item-name">
                          {item.menuName}{item.optionText} x {item.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="order-amount">{order.totalAmount.toLocaleString()}원</div>
                  </div>
                  <div className="order-actions">
                    {order.status === 'received' && (
                      <button 
                        className="order-action-btn"
                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                      >
                        제조 시작
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button 
                        className="order-action-btn complete"
                        onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                      >
                        제조 완료
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
