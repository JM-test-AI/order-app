# 이미지 파일 위치

이 폴더에 커피 메뉴 이미지를 넣어주세요.

## 이미지 파일 이름 규칙

예시:
- `americano-ice.jpg` 또는 `americano-ice.png`
- `americano-hot.jpg` 또는 `americano-hot.png`
- `cafe-latte.jpg` 또는 `cafe-latte.png`

## 사용 방법

이미지 파일을 이 폴더에 넣으면 다음과 같이 접근할 수 있습니다:
- `/images/americano-ice.jpg`
- `/images/americano-hot.jpg`
- `/images/cafe-latte.jpg`

## 데이터베이스 업데이트

이미지 파일을 넣은 후, 데이터베이스의 menus 테이블에서 각 메뉴의 image 필드를 업데이트해야 합니다.

예시 SQL:
```sql
UPDATE menus SET image = '/images/americano-ice.jpg' WHERE id = 1;
UPDATE menus SET image = '/images/americano-hot.jpg' WHERE id = 2;
UPDATE menus SET image = '/images/cafe-latte.jpg' WHERE id = 3;
```

