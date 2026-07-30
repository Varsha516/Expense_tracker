# AI-Powered Expense Tracker - Project Documentation

## Project Overview
A production-quality modern fintech web application for expense tracking with AI-powered insights, image upload capabilities, and beautiful dashboard analytics.

**Project Start Date:** May 8, 2026
**Tech Stack:** React + Vite, Tailwind CSS, Node.js + Express, Prisma ORM
**Status:** Active Development
**Last Updated:** May 30, 2026

---

## Project Directory Structure

```
Expense_Tracker/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── transactionApi.js
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Dialog.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   └── Skeleton.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── charts/
│   │   │   │   ├── ChartComponents.jsx
│   │   │   │   └── StatCard.jsx
│   │   │   └── transactions/
│   │   │       └── AddTransactionModal.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── transactionApi.js
│   │   │   └── axios.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── transactionController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── transactionRoutes.js
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   └── package.json
└── docs/
    └── PROJECT_STRUCTURE_AND_FILES.md
```

---

## BACKEND FILES

### 1. Server Setup & Configuration

#### **File: `backend/src/server.js`**
- **Path:** [backend/src/server.js](backend/src/server.js)
- **Description:** Main server entry point
- **Functionality:**
  - Loads environment variables from `.env` file using `dotenv`
  - Imports the Express app configuration
  - Starts the HTTP server on PORT (default: 5000)
  - Logs server startup message to console
- **Dependencies:** dotenv, Express app
- **Key Code:**
  ```javascript
  require('dotenv').config();
  const app = require('./app');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  ```

---

#### **File: `backend/src/app.js`**
- **Path:** [backend/src/app.js](backend/src/app.js)
- **Description:** Express application configuration and middleware setup
- **Functionality:**
  - Creates Express app instance
  - Configures CORS middleware for cross-origin requests
  - Sets up JSON body parser middleware
  - Sets up URL-encoded body parser middleware
  - Registers authentication routes at `/api/auth`
  - Registers transaction routes at `/api/transactions`
  - Implements `/health` endpoint for server health check
  - Implements global error handling middleware
- **Middleware Stack:**
  - CORS (cross-origin resource sharing)
  - express.json() (JSON body parsing)
  - express.urlencoded() (form data parsing)
  - Global error handler
- **Key Code:**
  ```javascript
  const express = require('express');
  const cors = require('cors');
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  
  app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
  });
  ```

---

### 2. Database Configuration

#### **File: `backend/prisma/schema.prisma`**
- **Path:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- **Description:** Prisma ORM schema defining database models and relationships
- **Models:**
  - **User Model:**
    - `id` (Int) - Primary key, auto-increment
    - `email` (String) - Unique user email address
    - `name` (String) - User's full name
    - `mobile` (String) - User's mobile number
    - `password` (String) - Bcrypt-hashed password
    - `budget` (Float) - User's budget limit
    - `avatar` (String) - User's profile avatar URL
    - `transactions` (Relation) - One-to-many relationship with Transaction model
    - `createdAt` (DateTime) - Account creation timestamp
    - `updatedAt` (DateTime) - Last update timestamp

  - **Transaction Model:**
    - `id` (Int) - Primary key, auto-increment
    - `description` (String) - Transaction description/note
    - `amount` (Float) - Transaction amount
    - `type` (String) - Transaction type: "income" or "expense"
    - `category` (String) - Transaction category (Food, Travel, etc.)
    - `date` (DateTime) - Transaction date
    - `userId` (Int) - Foreign key to User model
    - `user` (Relation) - Many-to-one relationship with User model
    - `createdAt` (DateTime) - Creation timestamp
    - `updatedAt` (DateTime) - Last update timestamp

---

#### **File: `backend/src/config/db.js`**
- **Path:** [backend/src/config/db.js](backend/src/config/db.js)
- **Description:** Database connection configuration using Prisma client
- **Functionality:**
  - Imports Prisma Client
  - Creates and exports a Prisma client instance for database operations
  - Singleton pattern ensures single database connection
- **Usage:** Imported by controllers to perform database queries
- **Key Code:**
  ```javascript
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  module.exports = prisma;
  ```

---

### 3. Controllers (Business Logic)

#### **File: `backend/src/controllers/authController.js`**
- **Path:** [backend/src/controllers/authController.js](backend/src/controllers/authController.js)
- **Description:** Authentication controller handling user registration and login logic
- **Exported Functions:**
  
  **`register(req, res)` - User Registration**
  - **HTTP Method:** POST
  - **Endpoint:** `/api/auth/register`
  - **Request Body:** `{ name, email, mobile, password }`
  - **Functionality:**
    - Validates input fields (email/mobile and password required)
    - Checks if user already exists (by email or mobile)
    - Hashes password using bcryptjs with 10 salt rounds
    - Creates new user in database with hashed password
    - Generates JWT token with 7-day expiration
    - Returns user data and token on success
  - **Response:** 
    - Success (201): `{ message, token, user: { id, name, email, mobile, budget, avatar } }`
    - Error (400/500): Error message
  
  **`login(req, res)` - User Login**
  - **HTTP Method:** POST
  - **Endpoint:** `/api/auth/login`
  - **Request Body:** `{ emailOrMobile, password }`
  - **Functionality:**
    - Finds user by email or mobile number
    - Verifies password hash against stored password
    - Generates JWT token with 7-day expiration
    - Returns user data and token on successful authentication
  - **Response:**
    - Success (200): `{ message, token, user: {...} }`
    - Error (401/500): Error message

---

#### **File: `backend/src/controllers/transactionController.js`**
- **Path:** [backend/src/controllers/transactionController.js](backend/src/controllers/transactionController.js)
- **Description:** Transaction controller handling CRUD operations for expense/income transactions
- **Exported Functions:**
  
  **`createTransaction(req, res)` - Create Transaction**
  - **HTTP Method:** POST
  - **Endpoint:** `/api/transactions`
  - **Request Body:** `{ description, amount, type, category, date }`
  - **Authentication:** Required (via authMiddleware)
  - **Functionality:**
    - Parses amount to float
    - Creates new transaction record in database
    - Associates transaction with authenticated user
    - Validates all required fields
  - **Response:** Success (201): `{ message, transaction }`
  
  **`getTransactions(req, res)` - Get All Transactions**
  - **HTTP Method:** GET
  - **Endpoint:** `/api/transactions`
  - **Authentication:** Required (via authMiddleware)
  - **Functionality:**
    - Retrieves all transactions for authenticated user
    - Sorts transactions by date in descending order (newest first)
    - Fetches complete transaction records with all fields
  - **Response:** Success (200): `{ transactions: [...] }`
  
  **`updateTransaction(req, res)` - Update Transaction**
  - **HTTP Method:** PUT
  - **Endpoint:** `/api/transactions/:id`
  - **Request Body:** Updated transaction fields
  - **Authentication:** Required (via authMiddleware)
  - **Functionality:**
    - Finds transaction by ID
    - Updates specified fields in database
    - Validates user authorization (user can only update their own transactions)
  - **Response:** Success (200): `{ message, transaction }`
  
  **`deleteTransaction(req, res)` - Delete Transaction**
  - **HTTP Method:** DELETE
  - **Endpoint:** `/api/transactions/:id`
  - **Authentication:** Required (via authMiddleware)
  - **Functionality:**
    - Finds and deletes transaction by ID
    - Validates user authorization
    - Removes transaction permanently from database
  - **Response:** Success (200): `{ message }`

---

### 4. Middleware (Request Processing)

#### **File: `backend/src/middleware/authMiddleware.js`**
- **Path:** [backend/src/middleware/authMiddleware.js](backend/src/middleware/authMiddleware.js)
- **Description:** Authentication middleware for protecting routes with JWT verification
- **Functionality:**
  - Extracts JWT token from `Authorization` header (Bearer token format)
  - Verifies token validity using JWT_SECRET
  - Fetches user data from database using decoded user ID
  - Attaches user object to request object (`req.user`)
  - Allows authenticated requests to proceed to next middleware/route
  - Rejects requests without valid tokens
- **Returns:**
  - 401 status if token is missing or invalid
  - Calls `next()` if token is valid and user exists
- **Usage:** Protects transaction routes requiring authentication
- **Key Code:**
  ```javascript
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });
  req.user = user;
  next();
  ```

---

### 5. Routes (Endpoint Definitions)

#### **File: `backend/src/routes/authRoutes.js`**
- **Path:** [backend/src/routes/authRoutes.js](backend/src/routes/authRoutes.js)
- **Description:** Express routes for authentication endpoints
- **Endpoints:**
  - `POST /api/auth/register` - User registration (calls `authController.register`)
  - `POST /api/auth/login` - User login (calls `authController.login`)
- **Public Routes:** Both routes are public (no authentication required)
- **Controllers Used:** `authController.js`

---

#### **File: `backend/src/routes/transactionRoutes.js`**
- **Path:** [backend/src/routes/transactionRoutes.js](backend/src/routes/transactionRoutes.js)
- **Description:** Express routes for transaction management endpoints (all protected by auth middleware)
- **Endpoints (All Protected):**
  - `POST /api/transactions` - Create new transaction (calls `createTransaction`)
  - `GET /api/transactions` - Get all user transactions (calls `getTransactions`)
  - `PUT /api/transactions/:id` - Update existing transaction (calls `updateTransaction`)
  - `DELETE /api/transactions/:id` - Delete transaction (calls `deleteTransaction`)
- **Security:** All routes require valid JWT authentication (authMiddleware applied globally to this router)
- **Controllers Used:** `transactionController.js`

---

### 6. Utilities

#### **File: `backend/src/utils/generateToken.js`**
- **Path:** [backend/src/utils/generateToken.js](backend/src/utils/generateToken.js)
- **Description:** JWT token generation utility
- **Exported Function:**
  - `generateToken(userId)` - Generates JWT token
    - **Parameters:** `userId` (user ID to encode in token)
    - **Functionality:**
      - Creates JWT token with user ID as payload
      - Uses JWT_SECRET from environment variables
      - Sets token expiration to 7 days
      - Returns signed token string
    - **Usage:** Called in authentication controller after successful login/registration
- **Key Code:**
  ```javascript
  const generateToken = (userId) => {
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return token;
  };
  ```

---

### 7. Configuration Files

#### **File: `backend/package.json`**
- **Path:** [backend/package.json](backend/package.json)
- **Description:** NPM package configuration for backend
- **Key Dependencies:**
  - `express` (4.22.2) - Web framework
  - `@prisma/client` (5.22.0) - ORM for database operations
  - `bcryptjs` (3.0.3) - Password hashing
  - `jsonwebtoken` (9.0.3) - JWT token creation and verification
  - `cors` (2.8.6) - Cross-origin resource sharing
  - `dotenv` (16.6.1) - Environment variable loading
  - `multer` (2.1.1) - File upload handling
  - `mongodb` (7.2.0) - MongoDB driver
- **Dev Dependencies:**
  - `nodemon` (3.1.14) - Auto-restart during development
  - `prisma` (5.22.0) - Prisma CLI tools
- **Scripts:**
  - `npm start` - Start production server
  - `npm run dev` - Start development server with auto-reload
  - `npm run prisma:generate` - Generate Prisma client
  - `npm run prisma:migrate` - Run database migrations
  - `npm run prisma:seed` - Seed database with initial data

---

#### **File: `backend/.env`**
- **Path:** [backend/.env](backend/.env)
- **Description:** Environment variables configuration (not version controlled)
- **Variables:**
  - `DATABASE_URL` - PostgreSQL connection string for Prisma ORM
  - `JWT_SECRET` - Secret key for signing and verifying JWT tokens
  - `PORT` - HTTP server port (default: 5000)
  - `NODE_ENV` - Environment mode ("development" or "production")
- **Description:** JWT token generation utility for authentication
- **Functionality:**
  - Creates signed JWT tokens with user ID payload
  - Sets token expiration to 7 days
  - Uses JWT_SECRET from environment variables
- **Returns:** Signed token string

```javascript
// Generate JWT token
// Create and sign JWT tokens for authentication

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  return token;
};

module.exports = { generateToken };
```

---

### 7. Main Application Files

#### **File: `backend/src/app.js`**
- **Path:** `e:\Expense_Tracker\backend\src\app.js`
- **Description:** Express application setup and middleware configuration
- **Features:**
  - CORS enabled for cross-origin requests
  - Body parser middleware for JSON and URL-encoded data
  - Route mounting for auth and transaction endpoints
  - Health check endpoint: `GET /health`
  - Global error handling middleware
- **Middleware Stack:**
  - `cors()` - Enable CORS
  - `express.json()` - Parse JSON bodies
  - `express.urlencoded()` - Parse URL-encoded bodies
- **Routes Registered:**
  - `/api/auth` - Authentication routes
  - `/api/transactions` - Transaction routes
  - `/health` - Health status check

```javascript
// Express app setup
// Configure middleware and routes

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
```

---

#### **File: `backend/src/server.js`**
- **Path:** `e:\Expense_Tracker\backend\src\server.js`
- **Description:** Server startup file that initializes Express server
- **Functionality:**
  - Imports Express app configuration
  - Gets PORT from environment variables (default: 5000)
  - Starts server on specified port
  - Logs server startup message
- **Environment Variables Used:**
  - `PORT` - Server listening port

```javascript
// Server startup
// Initialize and start the Express server

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

---

## API Endpoints Reference

### Authentication Endpoints
| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/api/auth/register` | ❌ | User registration |
| POST | `/api/auth/login` | ❌ | User login |

### Transaction Endpoints
| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/api/transactions` | ✅ | Create transaction |
| GET | `/api/transactions` | ✅ | Get all transactions |
| PUT | `/api/transactions/:id` | ✅ | Update transaction |
| DELETE | `/api/transactions/:id` | ✅ | Delete transaction |

---

## Backend Technology Stack

**Runtime & Framework:**
- Node.js
- Express.js 4.22.2

**Database & ORM:**
- PostgreSQL (configured via DATABASE_URL)
- Prisma ORM 5.22.0

**Authentication & Security:**
- jsonwebtoken (JWT) 9.0.3
- bcryptjs (Password hashing) 3.0.3

**Utilities & Middleware:**
- cors 2.8.6 (Cross-Origin Resource Sharing)
- multer 2.1.1 (File upload handling)
- dotenv 16.6.1 (Environment variable management)
- MongoDB driver 7.2.0 (Available for future use)

**Development Tools:**
- Nodemon 3.1.14 (Auto-restart on file changes)
- Prisma CLI 5.22.0 (Database migrations)

---



### 1. Root Configuration Files

#### **File: `frontend/package.json`**
- **Path:** `e:\Expense_Tracker\frontend\package.json`
- **Description:** NPM package configuration with all dependencies and scripts
- **Key Dependencies:**
  - React 18.2.0
  - React Router DOM 6.20.0
  - Axios 1.6.0
  - Framer Motion 10.16.0
  - Recharts 2.10.0
  - Lucide React 0.294.0
  - Radix UI components
  - Tailwind CSS 3.3.0

```json
{
  "name": "expense-tracker-frontend",
  "version": "1.0.0",
  "description": "AI-Powered Expense Tracker Frontend",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.294.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-slot": "^2.0.2",
    "@radix-ui/react-separator": "^1.0.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.54.0",
    "eslint-plugin-react": "^7.33.0",
    "prettier": "^3.1.0"
  }
}
```

---

#### **File: `frontend/vite.config.js`**
- **Path:** `e:\Expense_Tracker\frontend\vite.config.js`
- **Description:** Vite build configuration with proxy setup for API calls

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

---

#### **File: `frontend/tailwind.config.js`**
- **Path:** `e:\Expense_Tracker\frontend\tailwind.config.js`
- **Description:** Tailwind CSS theme configuration with custom colors and shadows

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    }
  },
  plugins: []
}
```

---

#### **File: `frontend/postcss.config.js`**
- **Path:** `e:\Expense_Tracker\frontend\postcss.config.js`
- **Description:** PostCSS configuration for Tailwind processing

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

---

#### **File: `frontend/index.html`**
- **Path:** `e:\Expense_Tracker\frontend\index.html`
- **Description:** Main HTML entry point

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI-Powered Expense Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### 2. Source Files - Entry Points

#### **File: `frontend/src/main.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\main.jsx`
- **Description:** React application entry point

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

#### **File: `frontend/src/index.css`**
- **Path:** `e:\Expense_Tracker\frontend\src\index.css`
- **Description:** Global styles with Tailwind CSS directives and custom utilities

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.6%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.6%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.6%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 217 91.2% 59.8%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --primary: 217 91.2% 59.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217 91.2% 59.8%;
    --secondary-foreground: 210 40% 98%;
    --ring: 217 91.2% 59.8%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.3% 65.1%;
    --accent: 217 91.2% 59.8%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --primary: 217 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217 91.2% 59.8%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --ring: 217 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans;
    font-family: 'Inter', sans-serif;
  }

  html {
    scroll-behavior: smooth;
  }
}

@layer components {
  .glass-effect {
    @apply bg-white/80 backdrop-blur-md border border-white/20;
  }

  .dark .glass-effect {
    @apply bg-slate-900/80 border-slate-700/20;
  }

  .gradient-primary {
    @apply bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600;
  }

  .gradient-income {
    @apply bg-gradient-to-r from-emerald-400 to-teal-600;
  }

  .gradient-expense {
    @apply bg-gradient-to-r from-red-400 to-rose-600;
  }

  .card-hover {
    @apply transition-all duration-300 hover:shadow-lg hover:scale-105;
  }
}
```

---

### 3. Context Files

#### **File: `frontend/src/context/AuthContext.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\context\AuthContext.jsx`
- **Description:** Authentication context provider and hook for user auth state management

```javascript
import { useState, useContext, createContext } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await response.json()
      if (data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

### 4. Services

#### **File: `frontend/src/services/api.js`**
- **Path:** `e:\Expense_Tracker\frontend\src\services\api.js`
- **Description:** Axios API client with interceptors and service methods for all backend endpoints

```javascript
import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }),
  logout: () => api.post('/auth/logout')
}

export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getStats: () => api.get('/transactions/stats/overview')
}

export const budgetService = {
  set: (amount) => api.post('/budget', { amount }),
  get: () => api.get('/budget'),
  getUsage: () => api.get('/budget/usage')
}

export const insightsService = {
  get: () => api.get('/insights'),
  getSpendingTrends: () => api.get('/insights/trends'),
  getHealthScore: () => api.get('/insights/health-score')
}

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
```

---

### 5. Utilities

#### **File: `frontend/src/utils/helpers.js`**
- **Path:** `e:\Expense_Tracker\frontend\src\utils\helpers.js`
- **Description:** Helper functions for formatting, calculations, and utilities

```javascript
export const formatCurrency = (amount, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
  return formatter.format(amount)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTimeShort = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric'
  })
}

export const getCategoryIcon = (category) => {
  const icons = {
    food: '🍔',
    transport: '🚗',
    shopping: '🛍️',
    entertainment: '🎬',
    utilities: '💡',
    health: '🏥',
    salary: '💰',
    freelance: '💻',
    investment: '📈',
    other: '📌'
  }
  return icons[category?.toLowerCase()] || '📌'
}

export const getCategoryColor = (category) => {
  const colors = {
    food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    salary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    freelance: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    investment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return colors[category?.toLowerCase()] || colors.other
}

export const getTransactionTypeColor = (type) => {
  return type === 'income'
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400'
}

export const calculatePercentage = (value, total) => {
  return total === 0 ? 0 : ((value / total) * 100).toFixed(1)
}

export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const formatNumberCompact = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
```

---

### 6. Custom Hooks

#### **File: `frontend/src/hooks/index.js`**
- **Path:** `e:\Expense_Tracker\frontend\src\hooks\index.js`
- **Description:** Custom React hooks for localStorage, theme, debounce, and pagination

```javascript
import { useState, useEffect } from 'react'

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme }
}

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export const usePagination = (items, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages
  }
}
```

---

### 7. UI Components

#### **File: `frontend/src/components/ui/Button.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Button.jsx`
- **Description:** Reusable Button component with multiple variants and sizes

```javascript
import React from 'react'

const Button = React.forwardRef(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
      ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-lg'
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
```

---

#### **File: `frontend/src/components/ui/Card.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Card.jsx`
- **Description:** Card component with header, title, description, content, and footer sub-components

```javascript
import React from 'react'

const Card = React.forwardRef(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-soft dark:shadow-lg transition-all duration-300 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-5 border-b border-gray-200 dark:border-slate-800 ${className}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ className = '', children, ...props }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
)

const CardContent = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
)

const CardFooter = ({ className = '', children, ...props }) => (
  <div
    className={`px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex items-center gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
```

---

#### **File: `frontend/src/components/ui/Input.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Input.jsx`
- **Description:** Reusable Input component with label and error support

```javascript
import React from 'react'

const Input = React.forwardRef(
  ({ className = '', type = 'text', error = '', label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
```

---

#### **File: `frontend/src/components/ui/Select.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Select.jsx`
- **Description:** Reusable Select component with label and error support

```javascript
import React from 'react'

const Select = React.forwardRef(
  ({ className = '', label, options = [], error = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
```

---

#### **File: `frontend/src/components/ui/Dialog.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Dialog.jsx`
- **Description:** Animated modal dialog component using Framer Motion

```javascript
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const Dialog = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div
              className={`${sizes[size]} w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
                {title && (
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="px-6 py-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Dialog
```

---

#### **File: `frontend/src/components/ui/Badge.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Badge.jsx`
- **Description:** Badge component with multiple variants

```javascript
import React from 'react'
import { motion } from 'framer-motion'

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </motion.span>
  )
}

export default Badge
```

---

#### **File: `frontend/src/components/ui/Skeleton.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Skeleton.jsx`
- **Description:** Animated skeleton loader component

```javascript
import React from 'react'
import { motion } from 'framer-motion'

const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`bg-gray-200 dark:bg-slate-700 rounded-lg ${className}`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </>
  )
}

export default Skeleton
```

---

#### **File: `frontend/src/components/ui/Alert.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Alert.jsx`
- **Description:** Alert/notification component with multiple types

```javascript
import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, X } from 'lucide-react'

const Alert = ({ type = 'info', title, message, onClose }) => {
  const icons = {
    error: <AlertCircle size={20} />,
    success: <CheckCircle size={20} />,
    info: <InfoIcon size={20} />,
    warning: <AlertTriangle size={20} />
  }

  const styles = {
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
    info: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${styles[type]} border rounded-lg p-4 flex items-start gap-3`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        {message && <p className="text-sm">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0">
          <X size={18} />
        </button>
      )}
    </motion.div>
  )
}

export default Alert
```

---

#### **File: `frontend/src/components/ui/LoadingSpinner.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\LoadingSpinner.jsx`
- **Description:** Animated loading spinner component

```javascript
import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-3 border-gray-200 dark:border-slate-700 border-t-blue-600 rounded-full ${className}`}
    />
  )
}

export default LoadingSpinner
```

---

#### **File: `frontend/src/components/ui/Pagination.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\ui\Pagination.jsx`
- **Description:** Pagination component with next/previous navigation

```javascript
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

const Pagination = ({ currentPage, totalPages, onPageChange, canPreviousPage, canNextPage }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPreviousPage}
      >
        <ChevronLeft size={16} />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-10"
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNextPage}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  )
}

export default Pagination
```

---

### 8. Layout Components

#### **File: `frontend/src/components/layout/Sidebar.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\layout\Sidebar.jsx`
- **Description:** Main sidebar navigation with mobile responsiveness

```javascript
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const location = useLocation()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Wallet },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Insights', path: '/insights', icon: Lightbulb },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -320
        }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 z-40 md:z-30 w-80 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-lg md:shadow-none"
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">ExpenseAI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fintech Suite</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}
    </>
  )
}

export default Sidebar
```

---

#### **File: `frontend/src/components/layout/Navbar.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\layout\Navbar.jsx`
- **Description:** Top navigation bar with theme toggle and user profile

```javascript
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, User, Bell } from 'lucide-react'
import { useTheme } from '../../hooks'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Left */}
        <div className="hidden md:flex items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Expense Tracker</h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell size={20} className="text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun size={20} className="text-gray-700 dark:text-gray-300" />
            )}
          </motion.button>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            >
              <User size={20} className="text-white" />
            </motion.button>

            {/* Profile Dropdown */}
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
                    Help & Support
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
```

---

### 9. Chart Components

#### **File: `frontend/src/components/charts/ChartComponents.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\charts\ChartComponents.jsx`
- **Description:** Recharts-based chart components (Line, Bar, Pie charts) and animated counter

```javascript
import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export const LineChartComponent = ({ data, title, dataKey }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#3b82f6"
              dot={{ fill: '#3b82f6' }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export const BarChartComponent = ({ data, title, dataKey }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export const PieChartComponent = ({ data, title }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    let animationFrame
    let currentValue = 0
    const increment = Math.ceil(value / 50)

    const animate = () => {
      if (currentValue < value) {
        currentValue += increment
        setDisplayValue(Math.min(currentValue, value))
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value])

  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {prefix}
      {displayValue.toLocaleString('en-IN')}
      {suffix}
    </motion.span>
  )
}
```

---

#### **File: `frontend/src/components/charts/StatCard.jsx`**
- **Path:** `e:\Expense_Tracker\frontend\src\components\charts\StatCard.jsx`
- **Description:** Statistic card component with animated counter and trend indicator

```javascript
import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { AnimatedCounter } from './ChartComponents'

const StatCard = ({ title, value, change, icon: Icon, gradient = 'from-blue-500 to-purple-600', prefix = '', suffix = '' }) => {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-soft hover:shadow-medium transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{title}</p>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          {Icon && <Icon size={28} className="text-white" />}
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard
```

---

## Directories Created (Empty - Ready for Pages and Other Components)

- `e:\Expense_Tracker\frontend\src\pages\` - For page components (Dashboard, Transactions, Login, etc.)
- `e:\Expense_Tracker\frontend\src\assets\` - For static assets (images, icons, etc.)
- `e:\Expense_Tracker\backend\` - Backend directory (to be populated)

---

## Summary of Implementation Status

### ✅ BACKEND - COMPLETED STRUCTURE:
1. **Project Setup & Configuration**
   - `package.json` with all necessary dependencies
   - `.env` configuration file with database and JWT settings
   - CommonJS module system setup

2. **Database Configuration**
   - Prisma ORM setup with PostgreSQL provider
   - `schema.prisma` with User and Transaction models
   - Database client initialization

3. **Authentication System**
   - Auth controller with register/login functions
   - JWT token generation utility
   - Auth middleware for route protection
   - Auth routes configuration

4. **Transaction Management**
   - Transaction controller with CRUD operations
   - Transaction routes with auth protection
   - Complete API endpoint structure

5. **Application Architecture**
   - Express app setup with middleware
   - Server initialization
   - Error handling middleware
   - CORS and JSON parsing configuration
   - Health check endpoint

### ✅ FRONTEND - COMPLETED:
1. **Project Setup & Configuration** - Vite, Tailwind CSS, PostCSS
2. **Global Styles** - CSS variables, dark mode support, custom utilities with shadows:
   - `shadow-glass` - Glass-morphism effect
   - `shadow-soft` - Subtle shadows
   - `shadow-medium` - Medium elevation
   - `shadow-lg` - Large elevation
3. **Context & State Management** - AuthContext for authentication
4. **API Services** - Axios client with interceptors and service methods
5. **Custom Hooks** (4 hooks):
   - `useLocalStorage` - Persistent state management
   - `useTheme` - Dark mode toggle
   - `useDebounce` - Debounced values
   - `usePagination` - Pagination logic
6. **UI Components** (10 components):
   - **Button** - 6 variants (primary, secondary, outline, ghost, danger, success), 4 sizes (sm, md, lg, xl)
   - **Card** - Container with Header, Title, Description, Content, Footer sub-components
   - **Input** - Text input with label and error support
   - **Select** - Dropdown with label and error support
   - **Dialog** - Animated modal with Framer Motion
   - **Badge** - 5 variants (default, success, danger, warning, info)
   - **Skeleton** - Animated loading state
   - **Alert** - 4 types (error, success, info, warning) with icons
   - **LoadingSpinner** - Rotating spinner in 3 sizes
   - **Pagination** - Navigation with page numbers

7. **Layout Components**:
   - **Sidebar** - Responsive mobile menu with logout
   - **Navbar** - Top navigation with theme toggle, notifications, profile dropdown

8. **Chart Components**:
   - **LineChart** - Line graph with Recharts
   - **BarChart** - Bar graph with Recharts
   - **PieChart** - Pie chart with color coding
   - **AnimatedCounter** - Auto-incrementing number display
   - **StatCard** - Statistics display with trend indicators

9. **Utilities** - 11+ helper functions for:
   - Currency formatting (formatCurrency)
   - Date formatting (formatDate, formatDateTimeShort)
   - Category icons and colors
   - Transaction type styling
   - Percentage calculations
   - Number compacting
   - Debouncing

10. **Context & Services**:
    - **AuthContext** - User authentication state with login, signup, logout
    - **API Service** - Service methods for auth, transactions, budget, insights, uploads

### 📋 TO BE COMPLETED:
1. **Authentication Pages**
   - Login page with form validation
   - Signup page with registration
   - Password recovery page

2. **Dashboard Page**
   - Statistics overview
   - Recent transactions list
   - Quick expense/income add
   - Chart visualizations

3. **Transactions Page**
   - Complete transaction list with filtering
   - Add/edit transaction modals
   - Bulk operations
   - Export functionality

4. **Analytics & Insights Pages**
   - Spending trends
   - Category breakdown
   - Monthly/yearly reports
   - AI-powered insights

5. **Budget Management**
   - Set budget limits
   - Budget usage tracking
   - Alerts for exceeding budgets

6. **Settings Page**
   - User profile management
   - Account settings
   - Preferences configuration

7. **Backend Implementation**
   - Complete controller logic (currently skeleton)
   - Database integration
   - Password hashing
   - Error handling and validation
   - File upload handling with multer

---

## Global CSS Utilities & Design System

### Color Palette
- **Primary:** Blue (#3b82f6) - Main actions and highlights
- **Success:** Emerald (#10b981) - Income and positive indicators
- **Danger:** Red (#ef4444) - Expenses and alerts
- **Warning:** Amber (#f59e0b) - Warnings and caution
- **Info:** Cyan (#06b6d4) - Information display
- **Secondary:** Purple (#8b5cf6) - Secondary actions

### Box Shadows (Custom)
```css
.shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.37)
.shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)
.shadow-medium: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
.shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

### Typography
- **Font Family:** Inter (from Google Fonts)
- **Font Weights:** 300, 400, 500, 600, 700
- **Heading Sizes:** sm, md, lg, xl
- **Line Heights:** Optimized for readability

### Responsive Breakpoints (Tailwind)
- `sm` - 640px
- `md` - 768px
- `lg` - 1024px
- `xl` - 1280px
- `2xl` - 1536px

### Dark Mode
- Automatic detection via `prefers-color-scheme`
- Manual toggle via `useTheme` hook
- Persistent storage with localStorage
- CSS variable-based theming

### Animation & Transitions
- **Framer Motion** - Complex animations
- **Tailwind Duration** - transition-all duration-200/300
- **Easing Functions** - ease-in, ease-out, ease-in-out
- **Custom Animations:**
  - Fade in/out
  - Scale up/down
  - Slide in/out
  - Spin (LoadingSpinner)
  - Color transitions

---

## Key Features Summary

### Frontend Features
✅ Authentication context with state management
✅ Dark/Light mode toggle with persistence
✅ Responsive mobile-first design
✅ 10 reusable UI components with variants
✅ Form validation and error handling
✅ API integration with Axios
✅ Chart visualizations with Recharts
✅ Smooth animations with Framer Motion
✅ Protected routes for authenticated pages
✅ Loading states and skeleton loaders

### Backend Features
✅ Express.js REST API
✅ Prisma ORM for database operations
✅ JWT authentication system
✅ Protected route middleware
✅ CRUD operations for transactions
✅ User registration and login
✅ Error handling and validation (ready for implementation)
✅ CORS enabled for frontend integration
✅ Environment variable configuration
✅ Nodemon for development (hot-reload)

---

**Project Start Date:** May 8, 2026
**Last Updated:** May 13, 2026
**Status:** Backend structure created, Frontend components completed
