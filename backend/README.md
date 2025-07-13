# Tech Store E-commerce Backend API

A comprehensive Node.js backend API for the Tech Store e-commerce application with MongoDB integration.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Product Management**: CRUD operations for products with advanced filtering and search
- **Order Management**: Complete order processing system with status tracking
- **User Management**: User profiles and admin functionality
- **MongoDB Integration**: Robust database connection with error handling
- **Data Validation**: Input validation using express-validator
- **Security**: Helmet, CORS, rate limiting, and other security measures
- **Error Handling**: Comprehensive error handling and logging
- **Database Seeding**: Automatic database population with sample data

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, bcryptjs, Rate Limiting
- **Development**: Nodemon for hot reloading

## 📦 Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env` if needed
   - Update the MongoDB connection string and other variables in `.env`

4. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/demo-login` - Demo login
- `GET /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products (with filtering, pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get product categories
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `DELETE /api/users/profile` - Delete account
- `GET /api/users` - Get all users (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `GET /api/orders/stats/dashboard` - Order statistics (Admin)

## 🔐 Demo Credentials

After seeding the database, you can use these credentials:

- **Demo User**: 
  - Email: `demo@techstore.com`
  - Password: `demo123456`

- **Admin User**: 
  - Email: `admin@techstore.com`
  - Password: `admin123456`

## 📊 Database Schema

### Product Model
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  category: String (enum: watches, earphones, accessories),
  image: String (required),
  inStock: Boolean,
  stock: Number,
  rating: Number (0-5),
  reviews: Number,
  featured: Boolean,
  brand: String,
  sku: String (auto-generated)
}
```

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: user, admin),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: Boolean,
  preferences: Object
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: User),
  orderNumber: String (auto-generated),
  items: Array of OrderItems,
  shippingAddress: Object,
  paymentMethod: Object,
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  status: String (enum: pending, processing, shipped, delivered, cancelled),
  trackingNumber: String
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error responses

## 🚦 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=techstore
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🛠️ Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

## 📝 Error Handling

The API uses standard HTTP status codes and returns errors in this format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## 🔄 Success Responses

Success responses follow this format:

```json
{
  "status": "success",
  "message": "Optional success message",
  "data": {
    // Response data
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
