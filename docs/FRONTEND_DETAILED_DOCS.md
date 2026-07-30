# Frontend Detailed Documentation

## FRONTEND FILES

### 1. Entry Point & Application Setup

#### **File: `frontend/src/main.jsx`**
- **Path:** [frontend/src/main.jsx](frontend/src/main.jsx)
- **Description:** React application entry point
- **Functionality:**
  - Imports React and ReactDOM libraries
  - Imports root App component
  - Imports global CSS styles (index.css)
  - Renders App component into DOM root element
  - Wraps app in React.StrictMode for development warnings and best practices
  - Mounts app to `<div id="root"></div>` in index.html

---

#### **File: `frontend/src/App.jsx`**
- **Path:** [frontend/src/App.jsx](frontend/src/App.jsx)
- **Description:** Main application component with routing setup
- **Functionality:**
  - Sets up React Router with BrowserRouter for client-side routing
  - Wraps entire app with AuthProvider for global authentication state
  - Creates ProtectedLayout component that includes Sidebar and Navbar
  - Implements route-based conditional rendering:
    - Public routes: `/login`, `/signup` (redirect to dashboard if authenticated)
    - Protected routes: `/dashboard` (redirect to login if not authenticated)
  - Handles automatic redirection based on authentication status
  - Uses useAuth hook to check token availability
- **Route Structure:**
  - `/login` - Login page component
  - `/signup` - Signup page component
  - `/dashboard` - Protected dashboard (requires JWT token)
- **Protected Layout Features:**
  - Sidebar navigation component (left)
  - Navbar header component (top)
  - Main content area (right)

---

### 2. Context & State Management

#### **File: `frontend/src/context/AuthContext.jsx`**
- **Path:** [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)
- **Description:** Global authentication state management using React Context API
- **Exported Items:**
  - **AuthProvider** - Context provider wrapper component
  - **useAuth** - Custom hook to access authentication context
- **State Variables:**
  - `user` (state) - Current authenticated user object (id, name, email, mobile, avatar, budget)
  - `token` (state) - JWT authentication token
- **Methods:**
  - **login(data)** - Updates user and token state
    - Stores user data and token in state
    - Persists credentials to localStorage
    - Called after successful login or registration
  
  - **logout()** - Clears all authentication
    - Clears user and token from state
    - Removes credentials from localStorage
    - Called on user logout request
- **Features:**
  - Automatic restoration of auth state from localStorage on app load
  - Persistent authentication across browser sessions
  - Global access to user data and auth functions
- **Usage:** Import useAuth hook in components to access user, token, login, logout functions

---

### 3. Pages (Route Components)

#### **File: `frontend/src/pages/Login.jsx`**
- **Path:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)
- **Description:** User login page with animated form and authentication
- **Functionality:**
  - Displays login form with email/mobile and password fields
  - Renders Expense Tracker branding with wallet icon
  - Uses Framer Motion for smooth animations and transitions
  - Form handling:
    - Validates input fields are filled
    - Calls login API on form submission
    - Integrates with AuthContext for user authentication
    - Navigates to dashboard on successful login
  - Includes link to signup page for new users
  - Error message display on login failure
- **Form Fields:**
  - Email or Mobile input
  - Password input
  - Remember Me checkbox (optional)
- **UI Features:**
  - Glassmorphic design with gradient background glow effects
  - Animated entry animation (fade-in and slide-up)
  - Responsive layout (mobile-friendly)
  - Beautiful brand presentation

---

#### **File: `frontend/src/pages/Signup.jsx`**
- **Path:** [frontend/src/pages/Signup.jsx](frontend/src/pages/Signup.jsx)
- **Description:** User registration page with comprehensive form validation
- **Functionality:**
  - Displays registration form for new user accounts
  - Form validation:
    - All fields required (name, email, mobile, password)
    - Mobile number must be exactly 10 digits (Indian format)
    - Password minimum 6 characters
    - Passwords must match (password confirmation required)
    - Email format validation
  - Mobile input features:
    - Accepts only numeric digits
    - Limits input to 10 digits maximum
    - Formatted display as user types
  - Calls `registerUser` API function on form submission
  - Updates loading state during registration
  - Automatically logs in user after successful registration
  - Navigates to dashboard on success
  - Displays error messages on validation or API failure
  - Link to login page for existing users
- **Form Fields:**
  - Name input (full name)
  - Email input (valid email required)
  - Mobile number input (10 digits)
  - Password input (min 6 characters)
  - Confirm password input
- **Validation Rules:**
  - All fields are mandatory
  - Mobile: 10 numeric digits exactly
  - Password: Minimum 6 characters, must match confirm password
  - Email: Valid email format

---

#### **File: `frontend/src/pages/Dashboard.jsx`**
- **Path:** [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)
- **Description:** Main application dashboard for transaction management
- **Functionality:**
  - Displays main dashboard interface
  - Header section with:
    - "Dashboard" title
    - "Manage your finances beautifully" subtitle
    - "Add Transaction" button with icon
  - Manages local transaction state:
    - `transactions` state - List of all user transactions
    - `editingTransaction` state - Currently selected transaction for editing
    - `isModalOpen` state - AddTransactionModal visibility toggle
  - Transaction management methods:
    - `handleAddTransaction` - Adds new transaction or updates existing
      - Checks if in edit mode (editingTransaction exists)
      - Updates existing transaction if in edit mode
      - Adds new transaction to list if in create mode
      - Resets editingTransaction after update
    - `handleDelete` - Removes transaction from list
      - Filters transaction by ID
      - Updates transactions state
  - Features:
    - Modal-based transaction creation/editing
    - Real-time transaction list updates
    - Transaction deletion with ID-based filtering
    - Beautiful gradient UI with icons (Lucide React)
    - Responsive layout for desktop and mobile
- **UI Components:**
  - Dashboard header with title and subtitle
  - Add Transaction button (prominent CTA)
  - AddTransactionModal component (child)
  - Transaction list display area

---

### 4. Layout Components

#### **File: `frontend/src/components/layout/Navbar.jsx`**
- **Path:** [frontend/src/components/layout/Navbar.jsx](frontend/src/components/layout/Navbar.jsx)
- **Description:** Top navigation bar component with user controls
- **Functionality:**
  - Sticky positioning at top of page (sticky top-0 z-50)
  - Displays application branding:
    - "Expense Tracker" title with gradient effect
    - "Smart financial management" tagline
  - User controls (right side):
    - Notification bell icon with indicator dot
    - Dark mode toggle button
    - User profile dropdown
    - Logout button
  - Logout functionality:
    - Calls logout from AuthContext
    - Navigates user to login page
  - Glassmorphic design:
    - Backdrop blur effect
    - Semi-transparent background
    - Border with white/opacity styling
  - Lucide React icons for UI elements:
    - Bell (notifications)
    - Moon (dark mode)
    - UserCircle2 (profile)
    - LogOut (logout)
  - Uses React Router for navigation
- **Features:**
  - Responsive floating navbar
  - Sticky header behavior
  - Notification indicator
  - User profile access
  - Logout with navigation

---

#### **File: `frontend/src/components/layout/Sidebar.jsx`**
- **Path:** [frontend/src/components/layout/Sidebar.jsx](frontend/src/components/layout/Sidebar.jsx)
- **Description:** Side navigation menu with mobile responsiveness
- **Functionality:**
  - Displays navigation menu with application sections
  - Menu items with icons:
    - Dashboard (LayoutDashboard)
    - Transactions (Wallet)
    - Analytics (BarChart3)
    - Insights (Lightbulb)
    - Settings (Settings)
  - Mobile responsiveness:
    - Hamburger menu button for mobile (fixed top-left)
    - Toggle open/close state on click
    - Slide animation using Framer Motion
    - Hides on desktop (md:shadow-none, md:z-30)
  - Active route highlighting:
    - Highlights current active route
    - Uses useLocation hook from React Router
    - Different styling for active vs inactive items
  - User interaction:
    - Logout button at bottom
    - Clicks logout and redirects to login page
  - Features:
    - User avatar and branding at top
    - Navigation with Lucide React icons
    - Fixed positioning (left-0 top-0)
    - Dark mode support
    - Smooth animations with Framer Motion
- **Responsive Behavior:**
  - Desktop (md+): Fixed sidebar visible
  - Mobile: Hamburger menu, overlay sidebar
  - Smooth slide animations

---

### 5. Transaction Components

#### **File: `frontend/src/components/transactions/AddTransactionModal.jsx`**
- **Path:** [frontend/src/components/transactions/AddTransactionModal.jsx](frontend/src/components/transactions/AddTransactionModal.jsx)
- **Description:** Modal dialog for creating and editing transactions
- **Functionality:**
  - Opens/closes based on `isOpen` prop
  - Form fields:
    - Amount input with Indian Rupee icon
    - Type toggle (Expense/Income switch)
    - Category dropdown (11 predefined categories)
    - Date picker with custom formatting
    - Note/description textarea
    - Image upload input with preview
  - Category list (11 options):
    - Food, Shopping, Travel, Entertainment, Bills, Salary, Freelance, Investment, Health, Education, Other
  - Form validation:
    - Validates amount is entered
    - Validates all required fields are filled
    - Validates date format
  - Edit mode vs Create mode:
    - Automatically populates form if editing existing transaction
    - Uses `editingTransaction` prop to detect edit mode
    - Pre-fills all fields with existing transaction data
  - Features:
    - Animated modal with Framer Motion
    - Image preview capability
    - Date picker with formatted input
    - Type toggle for income/expense
    - Close button to dismiss modal
    - Submit button for save/create
  - Utilities:
    - `formatDateInput()` - Formats date as MM/DD/YYYY while typing
    - Date parsing and formatting
    - Image file handling
- **Animation:**
  - Modal entrance/exit animations
  - Smooth transitions using Framer Motion
  - AnimatePresence for conditional rendering

---

### 6. Chart Components

#### **File: `frontend/src/components/charts/ChartComponents.jsx`**
- **Path:** [frontend/src/components/charts/ChartComponents.jsx](frontend/src/components/charts/ChartComponents.jsx)
- **Description:** Reusable chart components for data visualization using Recharts
- **Exported Components:**
  - **LineChartComponent**
    - Props: data (array), title (string), dataKey (string)
    - Visualizes trends over time
    - Includes XAxis, YAxis, CartesianGrid, Tooltip, Legend
    - Responsive container (100% width, 300px height)
  
  - **BarChartComponent**
    - Props: data (array), title (string), dataKey (string)
    - Compares values across categories
    - Vertical bar chart layout
    - Category-based visualization
  
  - **PieChartComponent**
    - Props: data (array), title (string), dataKey (string)
    - Shows distribution and proportions
    - Multiple color segments (COLORS array)
    - Legend display
- **Features:**
  - Responsive charts that adapt to container width
  - Custom color palette (6 predefined colors)
  - Card-based layout with title
  - Built on Recharts library
  - Interactive tooltips on hover
  - Customizable data keys
  - Legend for data identification
- **Usage:**
  - Pass transaction data to display expense/income trends
  - Category-wise breakdown visualization
  - Time-series expense tracking

---

#### **File: `frontend/src/components/charts/StatCard.jsx`**
- **Path:** [frontend/src/components/charts/StatCard.jsx](frontend/src/components/charts/StatCard.jsx)
- **Description:** Card component for displaying financial statistics/KPIs
- **Functionality:**
  - Displays key financial metrics (total income, expenses, balance, savings, etc.)
  - Shows metric value in large text
  - Displays metric label/description
  - Optional trend indicator with icon
  - Customizable color and styling
  - Used for dashboard KPI display
- **Props:**
  - Value/amount
  - Label/description
  - Icon
  - Trend (up/down)
  - Color scheme
- **Usage:**
  - Summary statistics on dashboard
  - Month/year comparisons
  - Category-wise totals

---

### 7. UI Components (Reusable)

#### **File: `frontend/src/components/ui/Button.jsx`**
- **Path:** [frontend/src/components/ui/Button.jsx](frontend/src/components/ui/Button.jsx)
- **Description:** Reusable button component with multiple style variants
- **Props:**
  - `variant` - Button style (primary, secondary, outline, ghost, danger, success)
  - `size` - Button size (sm, md, lg, xl)
  - `disabled` - Disabled state (true/false)
  - `className` - Additional CSS classes
  - Standard HTML button props (onClick, type, etc.)
- **Variants:**
  - **primary** - Blue background, white text
  - **secondary** - Gray background
  - **outline** - Bordered style
  - **ghost** - Transparent background
  - **danger** - Red background for destructive actions
  - **success** - Green/emerald background for positive actions
- **Sizes:**
  - **sm** - Small (px-3 py-1.5 text-sm)
  - **md** - Medium (px-4 py-2 text-base) - default
  - **lg** - Large (px-6 py-3 text-lg)
  - **xl** - Extra large (px-8 py-4 text-lg)
- **Features:**
  - Focus ring states for accessibility
  - Hover effects and transitions
  - Disabled state styling
  - Smooth transitions
  - Accessible keyboard navigation
  - forwardRef for ref support

---

#### **File: `frontend/src/components/ui/Card.jsx`**
- **Path:** [frontend/src/components/ui/Card.jsx](frontend/src/components/ui/Card.jsx)
- **Description:** Reusable card component for content containers
- **Exported Sub-components:**
  - **Card** - Main card container wrapper
    - Rounded corners with border
    - Shadow effects
    - Dark mode support
    - Background: white/slate-900
  
  - **CardHeader** - Header section
    - Top border separator
    - Padding (px-6 py-5)
    - Typically for titles
  
  - **CardContent** - Main content area
    - Standard padding
    - Full-width content
  
  - **CardTitle** - Title text styling
    - Large bold text (text-xl font-bold)
    - Dark mode text color
  
  - **CardFooter** - Footer section
    - Bottom section for actions/metadata
- **Features:**
  - Flexible layout
  - Dark mode support
  - Rounded borders
  - Shadow effects
  - Transition effects
- **Usage:**
  - Transaction list cards
  - Statistics displays
  - Form containers
  - Content grouping

---

### 8. API Integration

#### **File: `frontend/src/api/axios.js`**
- **Path:** [frontend/src/api/axios.js](frontend/src/api/axios.js)
- **Description:** Axios HTTP client with automatic JWT token injection
- **Functionality:**
  - Creates Axios instance with configured base URL
  - Base URL: `http://localhost:5000/api`
  - Request interceptor automatically adds JWT token:
    - Retrieves token from localStorage
    - Adds to Authorization header as Bearer token
    - Format: `Authorization: Bearer <token>`
    - Only adds if token exists
- **Features:**
  - Centralized API configuration
  - Automatic authentication header injection
  - Consistent request/response handling
  - Error interceptors (extensible)
- **Usage:**
  - Imported by authApi and transactionApi
  - All API calls go through this configured instance

---

#### **File: `frontend/src/api/authApi.js`**
- **Path:** [frontend/src/api/authApi.js](frontend/src/api/authApi.js)
- **Description:** Authentication API functions for user registration and login
- **Exported Functions:**
  
  **`registerUser(userData)`**
  - **HTTP Method:** POST
  - **Endpoint:** `/auth/register`
  - **Parameters:** 
    - `userData` object containing: `{ name, email, mobile, password }`
  - **Returns:** Response with user data and JWT token
  - **Usage:** Called from Signup.jsx form submission
  
  **`loginUser(userData)`**
  - **HTTP Method:** POST
  - **Endpoint:** `/auth/login`
  - **Parameters:**
    - `userData` object containing: `{ emailOrMobile, password }`
  - **Returns:** Response with user data and JWT token
  - **Usage:** Called from Login.jsx form submission
- **Features:**
  - Consistent API error handling
  - Response data transformation
  - Uses configured Axios instance

---

#### **File: `frontend/src/api/transactionApi.js`**
- **Path:** [frontend/src/api/transactionApi.js](frontend/src/api/transactionApi.js)
- **Description:** Transaction management API functions for CRUD operations
- **Exported Functions:**
  
  **`fetchTransactions()`**
  - **HTTP Method:** GET
  - **Endpoint:** `/transactions`
  - **Returns:** Array of user's transactions
  - **Usage:** Load all transactions on Dashboard
  
  **`createTransaction(data)`**
  - **HTTP Method:** POST
  - **Endpoint:** `/transactions`
  - **Parameters:** Transaction object with amount, type, category, date, description, image
  - **Returns:** Created transaction with ID
  - **Usage:** Called from AddTransactionModal on create
  
  **`updateTransaction(id, data)`**
  - **HTTP Method:** PUT
  - **Endpoint:** `/transactions/:id`
  - **Parameters:** 
    - `id` - Transaction ID
    - `data` - Updated fields
  - **Returns:** Updated transaction
  - **Usage:** Called from AddTransactionModal on edit/update
  
  **`deleteTransaction(id)`**
  - **HTTP Method:** DELETE
  - **Endpoint:** `/transactions/:id`
  - **Parameters:** Transaction ID
  - **Returns:** Confirmation message
  - **Usage:** Called when user deletes transaction
- **Features:**
  - Protected endpoints (require JWT token)
  - Automatic token injection via interceptor
  - Consistent error handling

---

### 9. Custom Hooks

#### **File: `frontend/src/hooks/index.js`**
- **Path:** [frontend/src/hooks/index.js](frontend/src/hooks/index.js)
- **Description:** Custom React hooks for common functionality
- **Exported Hooks:**
  
  **`useLocalStorage(key, initialValue)`**
  - Manages state with localStorage persistence
  - **Parameters:**
    - `key` - localStorage key
    - `initialValue` - default value if not in localStorage
  - **Returns:** [storedValue, setValue] similar to useState
  - **Functionality:**
    - Retrieves from localStorage on initialization
    - JSON.parse for deserialization
    - JSON.stringify for serialization
    - Automatic localStorage updates on state change
    - Error handling for localStorage access
  - **Usage:** useLocalStorage('theme', 'light')
  
  **`useTheme()`**
  - Manages application theme (dark/light mode)
  - **Returns:** { theme, toggleTheme }
  - **Functionality:**
    - Uses useLocalStorage internally
    - Persists theme preference
    - Provides theme getter and setter
    - Updates document class for CSS theme switching
  - **Usage:** const { theme, toggleTheme } = useTheme()
- **Features:**
  - Error handling for localStorage operations
  - JSON serialization support
  - TypeScript-friendly patterns
  - Reusable across components

---

### 10. Utilities

#### **File: `frontend/src/utils/helpers.js`**
- **Path:** [frontend/src/utils/helpers.js](frontend/src/utils/helpers.js)
- **Description:** Utility functions for common operations
- **Typical Functions:**
  - **Date formatting utilities:**
    - Format date to readable string
    - Parse date from input
    - Get date range functions
  - **Currency formatting:**
    - Format amount to currency display
    - Parse currency input
    - Currency symbols and localization
  - **Input validation:**
    - Email validation
    - Phone number validation
    - Password strength checking
  - **Number utilities:**
    - Rounding and precision
    - Formatting large numbers (1K, 1M, etc.)
  - **String manipulation:**
    - Capitalize first letter
    - Slug generation
    - Text truncation
  - **Array/object helpers:**
    - Sorting utilities
    - Filtering helpers
    - Grouping functions
- **Usage:** Import specific functions as needed in components

---

### 11. Configuration Files

#### **File: `frontend/package.json`**
- **Path:** [frontend/package.json](frontend/package.json)
- **Description:** NPM package configuration for frontend
- **Key Dependencies:**
  - `react` (18.2.0) - React framework
  - `react-dom` (18.2.0) - React DOM rendering
  - `react-router-dom` (6.20.0) - Client-side routing
  - `axios` (1.6.0) - HTTP client for API calls
  - `framer-motion` (10.16.0) - Animation library
  - `recharts` (2.10.0) - Charts and visualization
  - `lucide-react` (0.294.0) - Icon library (300+ icons)
  - `react-datepicker` - Date picker component
  - `tailwindcss` (3.3.0) - Utility-first CSS framework
  - `@radix-ui` - Unstyled, accessible UI components
  - `class-variance-authority` - CSS class variants
  - `clsx` - Class name utility
  - `tailwind-merge` - Merge Tailwind classes
- **Dev Dependencies:**
  - `vite` (5.0.0) - Next-gen build tool
  - `@vitejs/plugin-react` - React support for Vite
  - `postcss` - CSS transformations
  - `autoprefixer` - CSS vendor prefixing
  - `eslint` - Code linting
  - `prettier` - Code formatting
- **Scripts:**
  - `npm run dev` - Start development server (Vite)
  - `npm run build` - Build for production
  - `npm run preview` - Preview production build locally
  - `npm run lint` - Run ESLint
  - `npm run format` - Format code with Prettier
- **Build Output:**
  - Minified production bundles
  - Code splitting for optimal loading
  - Tree-shaking for unused code elimination

---

#### **File: `frontend/vite.config.js`**
- **Path:** [frontend/vite.config.js](frontend/vite.config.js)
- **Description:** Vite build tool configuration
- **Configuration:**
  - React plugin for JSX transformation
  - Dev server port: 3000
  - API proxy configuration for backend calls
- **Features:**
  - Hot Module Replacement (HMR)
  - Fast development build
  - Optimized production builds

---

#### **File: `frontend/tailwind.config.js`**
- **Path:** [frontend/tailwind.config.js](frontend/tailwind.config.js)
- **Description:** Tailwind CSS theme configuration
- **Customization:**
  - Custom colors (primary, secondary, accent, etc.)
  - Border radius variants
  - Shadow effects (glass, soft, medium, lg)
  - Dark mode support
  - Theme variables for consistency

---

#### **File: `frontend/postcss.config.js`**
- **Path:** [frontend/postcss.config.js](frontend/postcss.config.js)
- **Description:** PostCSS configuration for CSS processing
- **Plugins:**
  - Tailwind CSS - Utility CSS framework
  - Autoprefixer - CSS vendor prefixing

---

#### **File: `frontend/index.html`**
- **Path:** [frontend/index.html](frontend/index.html)
- **Description:** HTML entry point for Vite application
- **Features:**
  - Meta tags for viewport and charset
  - Root div for React mounting
  - Vite module script tag
  - SEO-friendly title

---

## Technology Stack Summary

### Frontend Stack
- **Library:** React 18 with Hooks
- **Build Tool:** Vite (next-gen bundler)
- **Routing:** React Router v6
- **HTTP Client:** Axios with interceptors
- **State Management:** React Context API
- **Styling:** Tailwind CSS v3
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React (300+ icons)
- **Forms:** React Hook Form patterns
- **Date Picking:** react-datepicker
- **Dev Tools:** ESLint, Prettier

### Backend Stack
- **Runtime:** Node.js
- **Web Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs (10 salt rounds)
- **CORS:** cors middleware
- **File Handling:** Multer
- **Environment:** dotenv

---

## Data Flow Architecture

### Authentication Data Flow
1. User fills login/signup form
2. Frontend calls `loginUser()` or `registerUser()` from authApi
3. Axios interceptor adds token header
4. Request sent to backend `/api/auth/login` or `/api/auth/register`
5. Backend authController processes and validates
6. Backend returns user data + JWT token
7. Frontend stores in AuthContext state + localStorage
8. App updates routes based on token presence
9. User redirected to dashboard

### Transaction Data Flow
1. User clicks "Add Transaction" button
2. AddTransactionModal opens with form
3. User fills transaction details
4. Form submission calls `createTransaction()` from transactionApi
5. Axios interceptor adds JWT token to Authorization header
6. Backend receives at `/api/transactions` POST
7. authMiddleware verifies token
8. transactionController creates in database
9. Response returned with transaction ID
10. Frontend adds to transactions state
11. Dashboard rerenders with new transaction

### Protected Routes
- App checks `token` from AuthContext
- `ProtectedLayout` redirects unauth to `/login`
- All transaction APIs require valid JWT
- Backend authMiddleware verifies on each request
- 401 errors trigger frontend logout

---

## Key Features Implemented

✅ **User Authentication**
- Registration with validation
- Email/mobile login options
- JWT token generation (7-day expiration)
- Persistent authentication via localStorage
- Automatic token injection in API requests

✅ **Transaction Management**
- Create transactions (income/expense)
- View complete transaction history
- Update existing transactions
- Delete transactions
- Category classification (11 categories)
- Date-based filtering and sorting

✅ **UI/UX Excellence**
- Responsive design (mobile, tablet, desktop)
- Dark mode support capability
- Smooth animations and transitions
- Glassmorphic design elements
- Real-time form validation
- Error message feedback
- Loading states

✅ **Security**
- Password hashing with bcryptjs
- JWT authentication tokens
- Protected API routes
- CORS enabled
- Secure token storage (localStorage)
- Input validation (frontend & backend)

✅ **Performance**
- Code splitting via Vite
- Tree-shaking for unused code
- Optimized bundle size
- Lazy loading components
- Efficient state management

---

## Component Hierarchy

```
App
├── BrowserRouter
└── AuthProvider
    └── AppRoutes
        ├── /login → Login Page
        ├── /signup → Signup Page
        └── /dashboard (Protected)
            └── ProtectedLayout
                ├── Sidebar
                │   └── Navigation Menu Items
                └── div.flex-1
                    ├── Navbar
                    │   ├── Branding
                    │   └── User Controls
                    └── main (Dashboard)
                        ├── Header Section
                        ├── Add Transaction Button
                        ├── AddTransactionModal
                        │   ├── Amount Input
                        │   ├── Type Toggle
                        │   ├── Category Dropdown
                        │   ├── Date Picker
                        │   ├── Note Textarea
                        │   └── Image Upload
                        └── Transaction List
                            └── Transaction Cards
```

---

## State Management Flow

```
AuthContext (Global)
├── user (Object | null)
├── token (String | null)
├── loading (Boolean)
├── login() (Function)
├── logout() (Function)
└── signup() (Function)

Local Component States:
├── Dashboard
│   ├── transactions []
│   ├── editingTransaction
│   └── isModalOpen
└── AddTransactionModal
    ├── formData {}
    ├── loading
    └── errors []
```

---

**Documentation Complete - Last Updated:** May 30, 2026
**Total Files Documented:** 30+ files (Backend + Frontend)
**Project Status:** Active Development
