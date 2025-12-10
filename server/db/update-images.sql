-- 메뉴 이미지 경로 업데이트
-- 이미지 파일을 ui/public/images/ 폴더에 넣은 후 실행하세요.

-- 아메리카노(ICE) - id: 1
UPDATE menus SET image = '/images/americano-ice.jpg' WHERE id = 1;

-- 아메리카노(HOT) - id: 2
UPDATE menus SET image = '/images/americano-hot.jpg' WHERE id = 2;

-- 카페라떼 - id: 3
UPDATE menus SET image = '/images/cafe-latte.jpg' WHERE id = 3;

-- 확인
SELECT id, name, image FROM menus WHERE id IN (1, 2, 3);

