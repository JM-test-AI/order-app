import { useState } from 'react'
import './App.css'

// 임시 메뉴 데이터
const initialMenus = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원한 아이스 아메리카노',
    image: null
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻한 핫 아메리카노',
    image: null
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 카페라떼',
    image: null
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '진한 에스프레소와 우유 거품',
    image: null
  },
  {
    id: 5,
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라 시럽이 들어간 라떼',
    image: null
  },
  {
    id: 6,
    name: '카라멜마키아토',
    price: 6000,
    description: '카라멜 시럽과 에스프레소',
    image: null
  }
]

function App() {
  const [menus] = useState(initialMenus)
  const [cart, setCart] = useState([])
  const [currentPage, setCurrentPage] = useState('order')

  // 메뉴를 장바구니에 추가
  const addToCart = (menu, options) => {
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
      // 같은 항목이 있으면 수량만 증가
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
  const handleOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    alert(`주문이 완료되었습니다!\n총 금액: ${totalAmount.toLocaleString()}원`)
    setCart([])
  }

  return (
    <div className="app">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="main-content">
        {currentPage === 'order' && (
          <>
            <div className="menu-section">
              <div className="menu-grid">
                {menus.map(menu => (
                  <MenuCard key={menu.id} menu={menu} onAddToCart={addToCart} />
                ))}
              </div>
            </div>
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
          <div className="admin-placeholder">
            <h2>관리자 화면</h2>
            <p>관리자 화면은 추후 구현 예정입니다.</p>
          </div>
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
function MenuCard({ menu, onAddToCart }) {
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
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
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
                    <span className="quantity">{item.quantity}</span>
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

export default App
