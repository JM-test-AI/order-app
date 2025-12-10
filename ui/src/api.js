// API 기본 URL (환경 변수 또는 기본값)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API 호출 실패');
    }

    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
}

// 메뉴 관련 API
export const menuAPI = {
  // 메뉴 목록 조회
  getMenus: async () => {
    const response = await apiCall('/menus');
    return response.data;
  },

  // 재고 수정
  updateStock: async (menuId, change) => {
    const response = await apiCall(`/menus/${menuId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ change })
    });
    return response.data;
  }
};

// 주문 관련 API
export const orderAPI = {
  // 주문 목록 조회
  getOrders: async (status = null) => {
    const query = status ? `?status=${status}` : '';
    const response = await apiCall(`/orders${query}`);
    return response.data;
  },

  // 주문 정보 조회
  getOrder: async (orderId) => {
    const response = await apiCall(`/orders/${orderId}`);
    return response.data;
  },

  // 주문 생성
  createOrder: async (orderData) => {
    const response = await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return response.data;
  },

  // 주문 상태 업데이트
  updateOrderStatus: async (orderId, status) => {
    const response = await apiCall(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return response.data;
  }
};

