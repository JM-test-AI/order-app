# API 명세서

## 개요
커피 주문 앱의 프런트엔드와 백엔드 간 통신을 위한 API 명세서입니다.

## 기본 정보
- Base URL: `http://localhost:3000/api`
- Content-Type: `application/json`

---

## 1. 메뉴 관련 API

### 1.1 메뉴 목록 조회
**사용자 행동**: 주문하기 화면 진입 시  
**요청**: 메뉴 목록 조회  
**서버 처리**: 데이터베이스에서 메뉴 목록과 재고 정보 조회

#### 요청
```
GET /api/menus
```

#### 응답
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "price": 4000,
      "description": "시원한 아이스 아메리카노",
      "image": null,
      "stock": 10
    },
    {
      "id": 2,
      "name": "아메리카노(HOT)",
      "price": 4000,
      "description": "따뜻한 핫 아메리카노",
      "image": null,
      "stock": 10
    }
  ]
}
```

---

## 2. 주문 관련 API

### 2.1 주문 생성
**사용자 행동**: 장바구니에서 "주문하기" 버튼 클릭  
**요청**: 주문 데이터 전송  
**서버 처리**: 
1. 재고 검증
2. 주문 데이터 저장
3. 재고 차감
4. 주문 ID 반환

#### 요청
```
POST /api/orders
Content-Type: application/json
```

#### 요청 Body
```json
{
  "items": [
    {
      "menuId": 1,
      "name": "아메리카노(ICE)",
      "optionText": " (샷 추가)",
      "quantity": 2,
      "price": 4500
    },
    {
      "menuId": 2,
      "name": "아메리카노(HOT)",
      "optionText": "",
      "quantity": 1,
      "price": 4000
    }
  ],
  "totalAmount": 13000
}
```

#### 응답 (성공)
```json
{
  "success": true,
  "data": {
    "id": 1234567890,
    "date": "2024-07-31T13:00:00.000Z",
    "items": [...],
    "totalAmount": 13000,
    "status": "received"
  }
}
```

#### 응답 (실패 - 재고 부족)
```json
{
  "success": false,
  "error": "재고 부족",
  "details": [
    {
      "menuId": 1,
      "menuName": "아메리카노(ICE)",
      "requested": 2,
      "available": 1
    }
  ]
}
```

---

### 2.2 주문 목록 조회
**사용자 행동**: 관리자 화면 진입 시  
**요청**: 주문 목록 조회  
**서버 처리**: 데이터베이스에서 주문 목록 조회 (필터링 옵션 포함)

#### 요청
```
GET /api/orders?status=received,preparing
```

#### Query Parameters
- `status` (optional): 주문 상태 필터 (예: "received,preparing")

#### 응답
```json
{
  "success": true,
  "data": [
    {
      "id": 1234567890,
      "date": "2024-07-31T13:00:00.000Z",
      "items": [
        {
          "menuId": 1,
          "name": "아메리카노(ICE)",
          "optionText": " (샷 추가)",
          "quantity": 1,
          "price": 4500
        }
      ],
      "totalAmount": 4500,
      "status": "received"
    }
  ]
}
```

---

### 2.3 주문 상태 업데이트
**사용자 행동**: 관리자가 "제조 시작" 또는 "제조 완료" 버튼 클릭  
**요청**: 주문 상태 변경 요청  
**서버 처리**: 
1. 주문 존재 여부 확인
2. 상태 변경 가능 여부 검증
3. 주문 상태 업데이트

#### 요청
```
PATCH /api/orders/:orderId/status
Content-Type: application/json
```

#### 요청 Body
```json
{
  "status": "preparing"
}
```

#### 가능한 상태 값
- `received`: 주문 접수
- `preparing`: 제조 중
- `completed`: 제조 완료

#### 응답 (성공)
```json
{
  "success": true,
  "data": {
    "id": 1234567890,
    "status": "preparing",
    "updatedAt": "2024-07-31T13:05:00.000Z"
  }
}
```

#### 응답 (실패)
```json
{
  "success": false,
  "error": "주문을 찾을 수 없습니다."
}
```

---

## 3. 재고 관리 API

### 3.1 재고 조회
**사용자 행동**: 관리자 화면의 재고 현황 섹션 표시  
**요청**: 재고 정보 조회  
**서버 처리**: 데이터베이스에서 메뉴별 재고 정보 조회

#### 요청
```
GET /api/inventory
```

#### 응답
```json
{
  "success": true,
  "data": [
    {
      "menuId": 1,
      "menuName": "아메리카노(ICE)",
      "stock": 10
    },
    {
      "menuId": 2,
      "menuName": "아메리카노(HOT)",
      "stock": 5
    },
    {
      "menuId": 3,
      "menuName": "카페라떼",
      "stock": 0
    }
  ]
}
```

---

### 3.2 재고 수정
**사용자 행동**: 관리자가 재고 현황에서 +/- 버튼 클릭  
**요청**: 재고 수량 변경 요청  
**서버 처리**: 
1. 메뉴 존재 여부 확인
2. 재고 수량 업데이트 (음수 방지)
3. 업데이트된 재고 정보 반환

#### 요청
```
PATCH /api/inventory/:menuId
Content-Type: application/json
```

#### 요청 Body
```json
{
  "change": 1
}
```

#### 응답 (성공)
```json
{
  "success": true,
  "data": {
    "menuId": 1,
    "menuName": "아메리카노(ICE)",
    "stock": 11,
    "updatedAt": "2024-07-31T13:10:00.000Z"
  }
}
```

#### 응답 (실패)
```json
{
  "success": false,
  "error": "메뉴를 찾을 수 없습니다."
}
```

---

## 4. 대시보드 통계 API

### 4.1 주문 통계 조회
**사용자 행동**: 관리자 대시보드 표시  
**요청**: 주문 통계 정보 조회  
**서버 처리**: 데이터베이스에서 주문 통계 집계

#### 요청
```
GET /api/dashboard/stats
```

#### 응답
```json
{
  "success": true,
  "data": {
    "total": 10,
    "received": 3,
    "preparing": 2,
    "completed": 5
  }
}
```

---

## 에러 처리

### 공통 에러 응답 형식
```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### HTTP 상태 코드
- `200`: 성공
- `400`: 잘못된 요청
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

---

## 데이터 흐름 예시

### 예시 1: 주문 생성 흐름
```
1. 사용자: 장바구니에서 "주문하기" 클릭
   ↓
2. 프런트엔드: POST /api/orders 요청
   {
     "items": [...],
     "totalAmount": 13000
   }
   ↓
3. 백엔드: 
   - 재고 검증
   - 주문 데이터 저장
   - 재고 차감
   ↓
4. 백엔드: 응답 반환
   {
     "success": true,
     "data": { "id": 123, ... }
   }
   ↓
5. 프런트엔드: 
   - 장바구니 초기화
   - 성공 메시지 표시
```

### 예시 2: 주문 상태 업데이트 흐름
```
1. 관리자: "제조 시작" 버튼 클릭
   ↓
2. 프런트엔드: PATCH /api/orders/123/status
   {
     "status": "preparing"
   }
   ↓
3. 백엔드:
   - 주문 존재 확인
   - 상태 업데이트
   ↓
4. 백엔드: 응답 반환
   {
     "success": true,
     "data": { "status": "preparing", ... }
   }
   ↓
5. 프런트엔드:
   - 주문 목록 새로고침
   - UI 업데이트
```

### 예시 3: 재고 수정 흐름
```
1. 관리자: 재고 "+" 버튼 클릭
   ↓
2. 프런트엔드: PATCH /api/inventory/1
   {
     "change": 1
   }
   ↓
3. 백엔드:
   - 메뉴 존재 확인
   - 재고 수량 업데이트 (stock + 1)
   ↓
4. 백엔드: 응답 반환
   {
     "success": true,
     "data": { "stock": 11, ... }
   }
   ↓
5. 프런트엔드:
   - 재고 현황 UI 업데이트
   - 상태 표시 업데이트 (정상/주의/품절)
```

