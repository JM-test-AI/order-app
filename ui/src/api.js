// API 기본 URL (환경 변수 또는 기본값)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 디버깅: API URL 확인 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('API 호출:', url, options.method || 'GET');
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // 응답이 JSON이 아닐 수 있으므로 확인
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('JSON이 아닌 응답:', text);
      throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status} 오류`;
      console.error('API 오류 응답:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        data
      });
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // 네트워크 오류와 서버 오류 구분
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('네트워크 오류:', error);
      throw new Error(`서버에 연결할 수 없습니다. API URL을 확인하세요: ${API_BASE_URL}`);
    }
    
    console.error('API 호출 오류:', {
      url,
      error: error.message,
      stack: error.stack
    });
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

