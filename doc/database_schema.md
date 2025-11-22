# Database Schema Documentation

## Overview
This document outlines the database schema for the Happy Lunch application. The database is implemented using PostgreSQL.

## Tables

### 1. users
Stores user account information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto-increment | Unique identifier for the user. |
| `email` | VARCHAR(255) | NOT NULL, Unique | User's email address. |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password. |
| `name` | VARCHAR(255) | NOT NULL | User's full name. |
| `avatar_url` | VARCHAR(255) | | URL to the user's avatar image. |
| `intro` | TEXT | | User's self-introduction. |
| `address` | VARCHAR(255) | | User's address. |
| `role` | ENUM('user', 'admin') | Default: 'user' | User's role. |
| `account_type` | ENUM('personal', 'family') | Default: 'personal' | Type of account. |
| `createdAt` | TIMESTAMP | | Creation timestamp. |
| `updatedAt` | TIMESTAMP | | Last update timestamp. |

### 2. restaurants
Stores restaurant information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto-increment | Unique identifier for the restaurant. |
| `name` | VARCHAR(255) | NOT NULL | Restaurant name. |
| `address` | VARCHAR(255) | NOT NULL | Restaurant address. |
| `cuisine_type` | VARCHAR(255) | | Type of cuisine (e.g., Vietnamese, Japanese). |
| `description` | TEXT | | Description of the restaurant. |
| `image_url` | VARCHAR(255) | | URL to the restaurant's image. |
| `rating` | FLOAT | Default: 0 | Average rating of the restaurant. |
| `phone` | VARCHAR(255) | | Contact phone number. |
| `opening_hours` | VARCHAR(255) | | Opening hours string. |
| `latitude` | FLOAT | | Latitude for location-based search. |
| `longitude` | FLOAT | | Longitude for location-based search. |
| `createdAt` | TIMESTAMP | | Creation timestamp. |
| `updatedAt` | TIMESTAMP | | Last update timestamp. |

### 3. menu_items
Stores menu items for each restaurant.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto-increment | Unique identifier for the menu item. |
| `restaurant_id` | INTEGER | FK -> restaurants(id) | The restaurant this item belongs to. |
| `name` | VARCHAR(255) | NOT NULL | Name of the dish. |
| `description` | TEXT | | Description of the dish. |
| `price` | DECIMAL(10, 2) | NOT NULL | Price of the dish. |
| `image_url` | VARCHAR(255) | | URL to the dish's image. |
| `createdAt` | TIMESTAMP | | Creation timestamp. |
| `updatedAt` | TIMESTAMP | | Last update timestamp. |

### 4. reviews
Stores user reviews for restaurants.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto-increment | Unique identifier for the review. |
| `user_id` | INTEGER | FK -> users(id) | The user who wrote the review. |
| `restaurant_id` | INTEGER | FK -> restaurants(id) | The restaurant being reviewed. |
| `rating` | INTEGER | NOT NULL, Min: 1, Max: 5 | Rating given by the user. |
| `comment` | TEXT | | Text content of the review. |
| `image_url` | VARCHAR(255) | | URL to an image attached to the review. |
| `createdAt` | TIMESTAMP | | Creation timestamp. |
| `updatedAt` | TIMESTAMP | | Last update timestamp. |

### 5. review_likes
Stores likes on reviews.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto-increment | Unique identifier for the like. |
| `review_id` | INTEGER | FK -> reviews(id) | The review being liked. |
| `user_id` | INTEGER | FK -> users(id) | The user who liked the review. |
| `createdAt` | TIMESTAMP | | Creation timestamp. |
| `updatedAt` | TIMESTAMP | | Last update timestamp. |

### 6. favorites
Stores user's favorite restaurants (Many-to-Many relationship).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | INTEGER | PK, FK -> users(id) | The user. |
| `restaurant_id` | INTEGER | PK, FK -> restaurants(id) | The favorite restaurant. |
| `createdAt` | TIMESTAMP | | Creation timestamp. |
| `updatedAt` | TIMESTAMP | | Last update timestamp. |

## Relationships

- **Users** have many **Reviews**.
- **Restaurants** have many **Reviews**.
- **Restaurants** have many **MenuItems**.
- **Users** have many **ReviewLikes**.
- **Reviews** have many **ReviewLikes**.
- **Users** have many **Favorite Restaurants** (through `favorites`).
- **Restaurants** are favorited by many **Users** (through `favorites`).

## Constraints

| Table | Constraint Name | Type | Definition |
| :--- | :--- | :--- | :--- |
| `reviews` | `check_review_rating_range` | CHECK | `rating >= 1 AND rating <= 5` |
| `menu_items` | `check_menu_item_price_positive` | CHECK | `price >= 0` |
| `restaurants` | `check_restaurant_rating_range` | CHECK | `rating >= 0 AND rating <= 5` |

## Functions and Triggers

### 1. Auto-Update Timestamp
**Function:** `update_updated_at_column()`
- Updates the `updatedAt` column to the current timestamp.

**Triggers:**
- `update_users_updated_at` on `users`
- `update_restaurants_updated_at` on `restaurants`
- `update_menu_items_updated_at` on `menu_items`
- `update_reviews_updated_at` on `reviews`
- `update_review_likes_updated_at` on `review_likes`
- `update_favorites_updated_at` on `favorites`

### 2. Auto-Update Restaurant Rating
**Function:** `update_restaurant_rating()`
- Calculates the average rating of a restaurant from its reviews and updates the `rating` column in the `restaurants` table.
- Triggered after INSERT, UPDATE, or DELETE on `reviews`.

**Trigger:**
- `update_restaurant_rating_trigger` on `reviews`
