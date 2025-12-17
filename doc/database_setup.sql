-- =============================================
-- 1. Schema Creation
-- =============================================
-- Create ENUM types (only if they don't exist)
DO $$ BEGIN CREATE TYPE "enum_users_role" AS ENUM ('user', 'admin');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE "enum_users_account_type" AS ENUM ('personal', 'family');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(255),
    "intro" TEXT,
    "address" VARCHAR(255),
    "role" "enum_users_role" DEFAULT 'user',
    "account_type" "enum_users_account_type" DEFAULT 'personal',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);
-- Create restaurants table
CREATE TABLE IF NOT EXISTS "restaurants" (
    "id" SERIAL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "cuisine_type" VARCHAR(255),
    "description" TEXT,
    "image_url" VARCHAR(255),
    "rating" FLOAT DEFAULT 0,
    "phone" VARCHAR(255),
    "opening_hours" VARCHAR(255),
    "latitude" FLOAT,
    "longitude" FLOAT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);
-- Create menu_items table
CREATE TABLE IF NOT EXISTS "menu_items" (
    "id" SERIAL,
    "restaurant_id" INTEGER NOT NULL REFERENCES "restaurants" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "image_url" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);
-- Create reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" SERIAL,
    "user_id" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    "restaurant_id" INTEGER NOT NULL REFERENCES "restaurants" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "image_url" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);
-- Create review_likes table
CREATE TABLE IF NOT EXISTS "review_likes" (
    "id" SERIAL,
    "review_id" INTEGER NOT NULL REFERENCES "reviews" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    "user_id" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("review_id", "user_id")
);
-- Create favorites table
CREATE TABLE IF NOT EXISTS "favorites" (
    "user_id" INTEGER REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "restaurant_id" INTEGER REFERENCES "restaurants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("user_id", "restaurant_id")
);
-- =============================================
-- 2. Database Enhancements
-- =============================================
-- 2.1 Add Constraints
-- Ensure rating is between 1 and 5 for reviews
DO $$ BEGIN
ALTER TABLE "reviews"
ADD CONSTRAINT "check_review_rating_range" CHECK (
        "rating" >= 1
        AND "rating" <= 5
    );
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Ensure price is non-negative for menu items
DO $$ BEGIN
ALTER TABLE "menu_items"
ADD CONSTRAINT "check_menu_item_price_positive" CHECK ("price" >= 0);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Ensure restaurant rating is between 0 and 5
DO $$ BEGIN
ALTER TABLE "restaurants"
ADD CONSTRAINT "check_restaurant_rating_range" CHECK (
        "rating" >= 0
        AND "rating" <= 5
    );
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- 2.2 Functions and Triggers for Auto-Updating Timestamps
-- Function to update 'updatedAt' column
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW."updatedAt" = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger for users
DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Trigger for restaurants
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON "restaurants";
CREATE TRIGGER update_restaurants_updated_at BEFORE
UPDATE ON "restaurants" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Trigger for menu_items
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON "menu_items";
CREATE TRIGGER update_menu_items_updated_at BEFORE
UPDATE ON "menu_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Trigger for reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON "reviews";
CREATE TRIGGER update_reviews_updated_at BEFORE
UPDATE ON "reviews" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Trigger for review_likes
DROP TRIGGER IF EXISTS update_review_likes_updated_at ON "review_likes";
CREATE TRIGGER update_review_likes_updated_at BEFORE
UPDATE ON "review_likes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Trigger for favorites
DROP TRIGGER IF EXISTS update_favorites_updated_at ON "favorites";
CREATE TRIGGER update_favorites_updated_at BEFORE
UPDATE ON "favorites" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 2.3 Function and Trigger for Auto-Updating Restaurant Rating
-- Function to calculate and update restaurant rating
CREATE OR REPLACE FUNCTION update_restaurant_rating() RETURNS TRIGGER AS $$
DECLARE avg_rating FLOAT;
target_restaurant_id INTEGER;
BEGIN -- Determine the restaurant_id based on the operation
IF (TG_OP = 'DELETE') THEN target_restaurant_id := OLD.restaurant_id;
ELSE target_restaurant_id := NEW.restaurant_id;
END IF;
-- Calculate average rating
SELECT AVG(rating) INTO avg_rating
FROM reviews
WHERE restaurant_id = target_restaurant_id;
-- Update restaurant rating (default to 0 if no reviews)
UPDATE restaurants
SET rating = COALESCE(avg_rating, 0),
    "updatedAt" = NOW()
WHERE id = target_restaurant_id;
RETURN NULL;
-- Result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;
-- Trigger to update rating on INSERT, UPDATE, or DELETE of a review
DROP TRIGGER IF EXISTS update_restaurant_rating_trigger ON "reviews";
CREATE TRIGGER update_restaurant_rating_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON "reviews" FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();
-- =============================================
-- 3. Seed Data
-- =============================================
-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE "review_likes" CASCADE;
TRUNCATE TABLE "favorites" CASCADE;
TRUNCATE TABLE "reviews" CASCADE;
TRUNCATE TABLE "menu_items" CASCADE;
TRUNCATE TABLE "restaurants" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;
-- Insert Users
INSERT INTO "users" (
        "email",
        "password_hash",
        "name",
        "avatar_url",
        "intro",
        "address",
        "role",
        "account_type",
        "createdAt",
        "updatedAt"
    )
VALUES (
        'user1@example.com',
        'hashed_password_1',
        'Nguyen Van A',
        'https://i.pravatar.cc/150?u=1',
        'Food lover and blogger',
        'Hoan Kiem, Hanoi',
        'user',
        'personal',
        NOW(),
        NOW()
    ),
    (
        'user2@example.com',
        'hashed_password_2',
        'Tran Thi B',
        'https://i.pravatar.cc/150?u=2',
        'Traveler and foodie',
        'Cau Giay, Hanoi',
        'user',
        'personal',
        NOW(),
        NOW()
    ),
    (
        'user3@example.com',
        'hashed_password_3',
        'Le Van C',
        'https://i.pravatar.cc/150?u=3',
        'Restaurant critic',
        'Dong Da, Hanoi',
        'user',
        'personal',
        NOW(),
        NOW()
    ),
    (
        'user4@example.com',
        'hashed_password_4',
        'Pham Thi D',
        'https://i.pravatar.cc/150?u=4',
        'Food enthusiast',
        'Hai Ba Trung, Hanoi',
        'user',
        'personal',
        NOW(),
        NOW()
    ),
    (
        'user5@example.com',
        'hashed_password_5',
        'Hoang Van E',
        'https://i.pravatar.cc/150?u=5',
        'Local guide',
        'Ba Dinh, Hanoi',
        'user',
        'personal',
        NOW(),
        NOW()
    ),
    (
        'admin@example.com',
        'hashed_password_admin',
        'Admin User',
        'https://i.pravatar.cc/150?u=admin',
        'Administrator',
        'Hanoi',
        'admin',
        'personal',
        NOW(),
        NOW()
    );
-- Insert Restaurants (10 restaurants in Hanoi with proper coordinates)
INSERT INTO "restaurants" (
        "name",
        "address",
        "cuisine_type",
        "description",
        "image_url",
        "rating",
        "phone",
        "opening_hours",
        "latitude",
        "longitude",
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Pho Thin',
        '13 Lo Duc, Hai Ba Trung, Hanoi',
        'Vietnamese',
        '濃厚なスープと柔らかい牛肉が自慢の有名な伝統的フォーレストラン',
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
        0,
        '024-3942-8568',
        '06:00 - 22:00',
        21.0185,
        105.8551,
        NOW(),
        NOW()
    ),
    (
        'Bun Cha Huong Lien',
        '24 Le Van Huu, Hai Ba Trung, Hanoi',
        'Vietnamese',
        'オバマブンチャとしても知られる、焼き肉とビーフンの名店',
        'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=800&q=80',
        0,
        '024-3943-4106',
        '08:00 - 21:00',
        21.0194,
        105.8524,
        NOW(),
        NOW()
    ),
    (
        'Pizza 4P''s Trang Tien',
        '43 Trang Tien, Hoan Kiem, Hanoi',
        'Italian',
        '自家製チーズを使用した高級日伊フュージョンピザ',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        0,
        '024-3938-1500',
        '10:00 - 23:00',
        21.0252,
        105.8571,
        NOW(),
        NOW()
    ),
    (
        'Sushi Hokkaido Sachi',
        '31 Trang Thi, Hoan Kiem, Hanoi',
        'Japanese',
        '新鮮な食材を使用した本格的な日本の寿司と刺身',
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
        0,
        '024-3936-0638',
        '11:00 - 14:00, 17:00 - 22:00',
        21.0245,
        105.8548,
        NOW(),
        NOW()
    ),
    (
        'Gogi House',
        '242 Tay Son, Dong Da, Hanoi',
        'Korean',
        '厳選された肉の食べ放題韓国バーベキュー',
        'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80',
        0,
        '024-6656-0888',
        '10:00 - 23:00',
        21.0145,
        105.8234,
        NOW(),
        NOW()
    ),
    (
        'Banh Mi 25',
        '25 Hang Ca, Hoan Kiem, Hanoi',
        'Vietnamese',
        'サクサクのバゲットと風味豊かな具材が特徴の象徴的なバインミー店',
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
        0,
        '091-234-5678',
        '06:00 - 20:00',
        21.0323,
        105.8512,
        NOW(),
        NOW()
    ),
    (
        'La Badiane',
        '10 Nam Ngu, Hoan Kiem, Hanoi',
        'French',
        'ベトナムの影響を受けたエレガントなフレンチファインダイニング',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
        0,
        '024-3942-4509',
        '11:30 - 14:00, 18:00 - 22:30',
        21.0213,
        105.8467,
        NOW(),
        NOW()
    ),
    (
        'Quan An Ngon',
        '18 Phan Boi Chau, Hoan Kiem, Hanoi',
        'Vietnamese',
        '庭園のような雰囲気で楽しむ伝統的なベトナム屋台料理',
        'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=800&q=80',
        0,
        '024-3942-8162',
        '07:00 - 22:00',
        21.0231,
        105.8523,
        NOW(),
        NOW()
    ),
    (
        'Dim Sum House',
        '56 Nguyen Du, Hai Ba Trung, Hanoi',
        'Chinese',
        '本格的な広東風点心と香港料理',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        0,
        '024-3944-6808',
        '09:00 - 22:00',
        21.0198,
        105.8489,
        NOW(),
        NOW()
    ),
    (
        'Pad Thai Cafe',
        '88 Ma May, Hoan Kiem, Hanoi',
        'Thai',
        '本格的な味とフレンドリーなサービスが楽しめる居心地の良いタイ料理店',
        'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
        0,
        '024-3926-0568',
        '10:00 - 23:00',
        21.0345,
        105.8523,
        NOW(),
        NOW()
    );
-- Insert Menu Items for Pho Thin (Restaurant ID 1)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        1,
        'Pho Bo Tai',
        'Rare beef noodle soup with fresh herbs',
        55000,
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        1,
        'Pho Bo Chin',
        'Well-done beef noodle soup',
        55000,
        'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        1,
        'Pho Bo Tai Nam',
        'Rare and well-done beef combination',
        60000,
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        1,
        'Pho Ga',
        'Chicken noodle soup',
        50000,
        'https://images.unsplash.com/photo-1588795945-21e1f8f0bc5c?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for Bun Cha Huong Lien (Restaurant ID 2)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        2,
        'Bun Cha Ha Noi',
        'Grilled pork with vermicelli and dipping sauce',
        45000,
        'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        2,
        'Nem Cua Be',
        'Crab spring rolls - crispy and delicious',
        40000,
        'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        2,
        'Cha Ca',
        'Grilled fish patties',
        50000,
        'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        2,
        'Bun Cha Combo Obama',
        'Obama special combo with bun cha and nem',
        70000,
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for Pizza 4P's (Restaurant ID 3)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        3,
        'Pizza 4 Cheese',
        'Pizza with 4 kinds of homemade cheese',
        295000,
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        3,
        'Salmon Teriyaki Pizza',
        'Japanese-style pizza with salmon',
        325000,
        'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        3,
        'Crab Pasta',
        'Creamy pasta with fresh crab meat',
        265000,
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        3,
        'Burrata Salad',
        'Fresh burrata cheese with tomatoes',
        185000,
        'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for Sushi Hokkaido Sachi (Restaurant ID 4)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        4,
        'Sashimi Moriawase',
        'Assorted fresh sashimi platter',
        380000,
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        4,
        'Salmon Sushi Set',
        'Premium salmon nigiri and rolls',
        280000,
        'https://images.unsplash.com/photo-1564489563601-c53cfc451e93?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        4,
        'Tempura Udon',
        'Udon noodles with crispy tempura',
        165000,
        'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        4,
        'Wagyu Beef Teriyaki',
        'Grilled wagyu with teriyaki sauce',
        450000,
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for Gogi House (Restaurant ID 5)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        5,
        'Premium BBQ Buffet',
        'All-you-can-eat Korean BBQ premium meats',
        399000,
        'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        5,
        'Kimchi Jjigae',
        'Spicy kimchi stew with pork',
        120000,
        'https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        5,
        'Bibimbap',
        'Mixed rice with vegetables and beef',
        135000,
        'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        5,
        'Korean Fried Chicken',
        'Crispy fried chicken with sweet sauce',
        155000,
        'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for Banh Mi 25 (Restaurant ID 6)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        6,
        'Banh Mi Thit Nguoi',
        'Cold cuts banh mi with pate',
        25000,
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        6,
        'Banh Mi Ga Nuong',
        'Grilled chicken banh mi',
        30000,
        'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        6,
        'Banh Mi Trung Op La',
        'Fried egg banh mi',
        20000,
        'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for La Badiane (Restaurant ID 7)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        7,
        'Foie Gras Terrine',
        'Duck liver terrine with brioche',
        420000,
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        7,
        'Beef Bourguignon',
        'Slow-cooked beef in red wine sauce',
        580000,
        'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        7,
        'Duck Confit',
        'Crispy duck leg with potato gratin',
        520000,
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        7,
        'Creme Brulee',
        'Classic French vanilla custard',
        180000,
        'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for Quan An Ngon (Restaurant ID 8)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        8,
        'Goi Cuon',
        'Fresh spring rolls with shrimp',
        35000,
        'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        8,
        'Banh Xeo',
        'Vietnamese crispy pancake',
        45000,
        'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        8,
        'Com Tam Suon Nuong',
        'Broken rice with grilled pork chop',
        55000,
        'https://images.unsplash.com/photo-1596040033229-a0b3b83a6d8c?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        8,
        'Che Ba Mau',
        'Three-color dessert',
        25000,
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for Dim Sum House (Restaurant ID 9)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        9,
        'Har Gow',
        'Steamed shrimp dumplings',
        85000,
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        9,
        'Siu Mai',
        'Pork and shrimp dumplings',
        75000,
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        9,
        'Char Siu Bao',
        'BBQ pork buns',
        70000,
        'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        9,
        'Peking Duck',
        'Crispy roasted duck with pancakes',
        680000,
        'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Menu Items for Pad Thai Cafe (Restaurant ID 10)
INSERT INTO "menu_items" (
        "restaurant_id",
        "name",
        "description",
        "price",
        "image_url",
        "createdAt",
        "updatedAt"
    )
VALUES (
        10,
        'Pad Thai Goong',
        'Stir-fried noodles with shrimp',
        95000,
        'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        10,
        'Tom Yum Goong',
        'Spicy and sour shrimp soup',
        120000,
        'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        10,
        'Green Curry Chicken',
        'Thai green curry with chicken',
        110000,
        'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    ),
    (
        10,
        'Mango Sticky Rice',
        'Sweet sticky rice with fresh mango',
        65000,
        'https://images.unsplash.com/photo-1601899177522-0d71b7d4d3d1?auto=format&fit=crop&w=400&q=80',
        NOW(),
        NOW()
    );
-- Insert Reviews for all restaurants
-- Reviews for Pho Thin (Restaurant ID 1)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        1,
        1,
        5,
        'ハノイで一番美味しいフォーです！スープが濃厚で風味豊か。レア牛肉は必食です！',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        2,
        1,
        4,
        '味は最高ですが、ランチタイムはとても混雑します。早めに行くのがおすすめです！',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        3,
        1,
        5,
        '本場のハノイのフォー。牛肉はとても柔らかくて新鮮な香草も完璧です。',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );
-- Reviews for Bun Cha Huong Lien (Restaurant ID 2)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        1,
        2,
        5,
        'オバマ大統領がここで食事をした理由がわかります！甘酸っぱいタレと焼肉の相性が抜群です。',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    ),
    (
        4,
        2,
        5,
        'ハノイに来たら絶対に行くべき。カニの春巻きはサクサクで美味しいです！',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    ),
    (
        5,
        2,
        4,
        'とても美味しいブンチャですが、今は少し観光地化しています。でも行く価値はあります！',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    );
-- Reviews for Pizza 4P's (Restaurant ID 3)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        2,
        3,
        5,
        '素晴らしいサービスと、チーズは本当に最高です！ハノイで一番のピザです。',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days'
    ),
    (
        3,
        3,
        5,
        '自家製チーズが味の決め手です。4種のチーズピザを試してみてください！',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    ),
    (
        4,
        3,
        4,
        '素晴らしい雰囲気と美味しい料理。少し高めですが、特別な日に行く価値はあります。',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );
-- Reviews for Sushi Hokkaido Sachi (Restaurant ID 4)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        1,
        4,
        5,
        'ハノイで最も本格的な日本料理。刺身は信じられないほど新鮮です！',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '8 days'
    ),
    (
        2,
        4,
        4,
        '高品質の寿司と素晴らしい盛り付け。サービスも優秀です。',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        5,
        4,
        5,
        '和牛の照り焼きは絶品です！強くお勧めします。',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    );
-- Reviews for Gogi House (Restaurant ID 5)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        3,
        5,
        4,
        'コストパフォーマンスが良い！肉質も良く、スタッフが焼くのを手伝ってくれます。',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days'
    ),
    (
        4,
        5,
        5,
        '食べ放題のコンセプトが大好きです。キムチチゲは本格的で美味しい！',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        1,
        5,
        4,
        '友達と楽しく食事ができます。韓国風フライドチキンはサクサクで美味しいです。',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );
-- Reviews for Banh Mi 25 (Restaurant ID 6)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        2,
        6,
        5,
        '旧市街で一番美味しいバインミー！サクサクのバゲットと具のバランスが完璧。',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    ),
    (
        5,
        6,
        5,
        '早くて安くて、最高に美味しい。観光客は必見です！',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    );
-- Reviews for La Badiane (Restaurant ID 7)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        1,
        7,
        5,
        'ベトナム風アレンジの効いた絶品フレンチ。鴨のコンフィは完璧です！',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days'
    ),
    (
        3,
        7,
        5,
        'ロマンチックな雰囲気と申し分のないサービス。特別な日に最適です。',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        4,
        7,
        4,
        '高級な食事体験。フォアグラは素晴らしいですが、少し値段が高いです。',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    );
-- Reviews for Quan An Ngon (Restaurant ID 8)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        2,
        8,
        5,
        '一箇所で色々なベトナム料理を試すのに最適な場所。庭園のような雰囲気が気に入っています！',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    ),
    (
        3,
        8,
        4,
        '美味しい料理と素敵な雰囲気。混雑時は少し待つかもしれません。',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    ),
    (
        5,
        8,
        5,
        'バインセオはパリパリで美味しいです。初めての方にとてもおすすめです！',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );
-- Reviews for Dim Sum House (Restaurant ID 9)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        1,
        9,
        5,
        '本格的な広東風点心！エビ餃子は完璧に蒸されています。',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days'
    ),
    (
        4,
        9,
        4,
        '質の良い点心。北京ダックは注文必須です！',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        2,
        9,
        5,
        'まるで香港で食事をしているようです。点心はどれも美味しい！',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    );
-- Reviews for Pad Thai Cafe (Restaurant ID 10)
INSERT INTO "reviews" (
        "user_id",
        "restaurant_id",
        "rating",
        "comment",
        "createdAt",
        "updatedAt"
    )
VALUES (
        3,
        10,
        5,
        '本格的なタイの味！トムヤムクンは完璧な辛さと酸味です。',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        5,
        10,
        4,
        '居心地の良い雰囲気とフレンドリーなスタッフ。パッタイはとても美味しいです。',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        1,
        10,
        5,
        'ハノイで一番のタイ料理！グリーンカレーはクリーミーで風味豊か。',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        4,
        10,
        4,
        'ボリューム満点で手頃な価格。マンゴーもち米は完璧なデザートです！',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );
-- Insert Review Likes
INSERT INTO "review_likes" ("review_id", "user_id", "createdAt", "updatedAt")
VALUES (1, 2, NOW(), NOW()),
    (1, 3, NOW(), NOW()),
    (4, 2, NOW(), NOW()),
    (4, 5, NOW(), NOW()),
    (7, 1, NOW(), NOW()),
    (7, 3, NOW(), NOW()),
    (10, 4, NOW(), NOW()),
    (13, 2, NOW(), NOW()),
    (16, 3, NOW(), NOW()),
    (19, 1, NOW(), NOW()),
    (22, 5, NOW(), NOW()),
    (25, 2, NOW(), NOW());
-- Insert Favorites
INSERT INTO "favorites" (
        "user_id",
        "restaurant_id",
        "createdAt",
        "updatedAt"
    )
VALUES (1, 1, NOW(), NOW()),
    (1, 2, NOW(), NOW()),
    (1, 4, NOW(), NOW()),
    (2, 3, NOW(), NOW()),
    (2, 6, NOW(), NOW()),
    (2, 8, NOW(), NOW()),
    (3, 7, NOW(), NOW()),
    (3, 9, NOW(), NOW()),
    (4, 2, NOW(), NOW()),
    (4, 5, NOW(), NOW()),
    (5, 1, NOW(), NOW()),
    (5, 10, NOW(), NOW());