# CommerceGrid — Scalable E-Commerce Product Catalog Platform

> Modernized full-stack architecture built with React + Node.js + Express.js + Sequelize ORM (MySQL / SQLite).

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite) + React Router + Axios |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL / SQLite (via Sequelize ORM) |
| **Auth** | JWT (JSON Web Tokens) |
| **Images** | Cloudinary |
| **Validation** | express-validator |
| **Security** | Helmet, CORS, Rate Limiting, bcryptjs |

## 📁 Project Structure

```
commercegrid/
├── backend/
│   ├── config/          # DB connection (MySQL/SQLite fallback) + Cloudinary config
│   ├── controllers/     # productController, categoryController, authController, cartController, orderController
│   ├── middlewares/     # auth.js, errorHandler.js
│   ├── models/          # Product, Category, User, Review, CartItem, Order, OrderItem
│   ├── routes/          # productRoutes, categoryRoutes, authRoutes, cartRoutes, orderRoutes
│   ├── services/        # cloudinaryService
│   ├── seed.js          # Seed with sample data
│   └── server.js        # Express app entry (auto-syncs and seeds DB if empty)
└── frontend/
    └── src/
        ├── components/  # Navbar, ProductCard, Pagination
        ├── context/     # AuthContext
        ├── pages/       # Home, Products, Categories, ProductDetail, Login, Admin, Profile, Cart, Orders, AdminOrders
        └── services/    # api.js (Axios)
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+

### 1. Backend Setup

CommerceGrid uses a **zero-configuration** database connection. By default, it will automatically create and seed a local SQLite database (`commercegrid.sqlite`) in the commercegrid directory.

To use **MySQL**, create a `.env` file in the `backend/` directory with your connection details (see `.env.example`).

```bash
cd commercegrid/backend
npm install
npm run dev                # Starts on http://localhost:5000 and auto-seeds if database is empty
```

### 2. Frontend Setup

```bash
cd commercegrid/frontend
npm install
npm run dev                # Starts on http://localhost:5173
```

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@commercegrid.com | Admin@123 |

## 📋 REST API Reference

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List with filters + pagination |
| GET | `/api/products/search?q=...` | Advanced search |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/products` | Create (Admin) |
| PUT | `/api/products/:id` | Update (Admin) |
| DELETE | `/api/products/:id` | Delete (Admin) |
| GET | `/api/products/:id/reviews` | Product reviews |
| POST | `/api/products/:id/reviews` | Add review (Auth) |
| GET | `/api/products/stats` | Admin stats |

### Query Parameters (GET /api/products)

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `q` | string | Search query |
| `category` | string | Category slug or ID |
| `brand` | string | Brand filter |
| `condition` | string | new/like_new/good/fair/poor |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `minRating` | number | Minimum rating (1-5) |
| `sort` | string | newest/price_asc/price_desc/rating/popular/featured |
| `featured` | boolean | Featured products only |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | All categories |
| GET | `/api/categories/:id` | Single category |
| POST | `/api/categories` | Create (Admin) |
| PUT | `/api/categories/:id` | Update (Admin) |
| DELETE | `/api/categories/:id` | Delete (Admin) |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile |

## ✅ Internship Requirements Covered

- ✅ Product listing with advanced search and filtering
- ✅ Category-based data modeling with hierarchy support
- ✅ Backend pagination (`?page=1&limit=20`)
- ✅ Database indexing (name, category, brand, price, text search)
- ✅ API-driven frontend (React consumes Express APIs only, no SSR)
- ✅ Data validation and sanitization (express-validator, mongoose validators)
- ✅ Modular backend (controllers / services / routes / models)
- ✅ RESTful API standards

## 🎨 UI Pages

- **Home** — Hero, stats, categories grid, featured + new products
- **Products** — Filter sidebar (category, price, condition, rating), sort, pagination
- **Categories** — Visual category browser with product counts
- **Product Detail** — Gallery, specs, reviews, related products
- **Admin Dashboard** — Stats, quick actions, top categories
- **Product Management** — Table with CRUD operations
- **Category Management** — Card grid with emoji + color picker
