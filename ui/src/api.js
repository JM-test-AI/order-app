// API 기본 URL (환경 변수 또는 기본값)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 디버깅: API URL 확인 (항상 표시)
console.log('API Base URL:', API_BASE_URL);
console.log('환경 변수 VITE_API_URL:', import.meta.env.VITE_API_URL || '설정 안됨');

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
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      console.error('네트워크 오류:', error);
      const errorMsg = `서버에 연결할 수 없습니다.\n\n가능한 원인:\n1. 백엔드 서버가 실행 중이 아닙니다\n2. API URL이 잘못 설정되었습니다\n3. CORS 오류가 발생했습니다\n\n현재 API URL: ${API_BASE_URL}`;
      throw new Error(errorMsg);
    }
    
    // AbortError (타임아웃 등)
    if (error.name === 'AbortError') {
      console.error('요청 타임아웃:', error);
      throw new Error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    
    console.error('API 호출 오류:', {
      url,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    
    // 이미 Error 객체인 경우 그대로 throw, 아니면 새로 생성
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
    }
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

