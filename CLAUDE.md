# CLAUDE.md - AI Assistant Guide for LocalBusinessOS

## Project Overview

**LocalBusinessOS** is a voice-first inventory management system designed for small Indian retailers, particularly targeting shops in Tamil Nadu. This is a B2B SaaS application with a React Native mobile app and Node.js backend.

**Current Status:** Pre-development phase with comprehensive documentation in place. No code has been written yet.

**Target Timeline:** 8-week MVP development (part-time, 20-30 hours/week)

## Architecture

```
┌──────────────────┐
│  Mobile App      │  ← React Native + Expo
│  (React Native)  │     Voice input, offline-first
└────────┬─────────┘
         │ HTTP REST API
         ↓
┌──────────────────┐
│  Backend API     │  ← Node.js + Express + TypeScript
│  (Express.js)    │     Authentication, business logic
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Database        │  ← Supabase (PostgreSQL)
│  (Supabase)      │     Row-Level Security, triggers
└──────────────────┘
```

## Repository Structure

```
/home/user/zyvo/          # Current repo (documentation only)
├── project-context.md    # Complete implementation guide (2,150 lines)
├── CLAUDE.md            # This file
└── .git/                # Git repository

Expected future structure (from project-context.md):
shopmate/
├── backend/             # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/      # Database config, environment setup
│   │   ├── routes/      # API route handlers (auth, products, stock)
│   │   ├── services/    # Business logic (ProductService, StockService)
│   │   ├── middleware/  # Auth middleware
│   │   └── types/       # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── mobile/              # React Native + Expo app
│   ├── src/
│   │   ├── screens/     # UI screens (Login, Home, ProductDetail)
│   │   ├── components/  # Reusable UI components
│   │   ├── services/    # API client layer
│   │   ├── types/       # TypeScript interfaces
│   │   └── navigation/  # React Navigation setup
│   ├── App.tsx
│   └── package.json
└── docs/                # Additional documentation
```

## Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database Client:** @supabase/supabase-js
- **Dev Tools:** nodemon, ts-node
- **Key Dependencies:** cors, dotenv

### Mobile
- **Framework:** React Native with Expo
- **Navigation:** React Navigation (Stack Navigator)
- **UI Library:** React Native Paper
- **Icons:** React Native Vector Icons
- **Storage:** AsyncStorage (offline-first)
- **HTTP Client:** axios

### Database
- **Platform:** Supabase (PostgreSQL)
- **Security:** Row-Level Security (RLS) policies
- **Features:** Auto-triggers, UUID primary keys, timestamps

### External Services (Phase 2)
- **Voice:** Google Cloud Speech-to-Text (Tamil)
- **Messaging:** Twilio WhatsApp API
- **Hosting:** Railway.app (backend), EAS Build (mobile)

## Database Schema

### Tables

**user_profiles**
- `id` (UUID, FK to auth.users)
- `phone` (VARCHAR(15), unique)
- `business_name` (VARCHAR(255))
- `business_type` (VARCHAR(50))
- `language_preference` (VARCHAR(10), default 'tamil')
- Timestamps: `created_at`, `updated_at`

**products**
- `id` (UUID, primary key)
- `user_id` (UUID, FK to user_profiles)
- `name` (VARCHAR(255))
- `category` (VARCHAR(100))
- `unit` (VARCHAR(20), default 'units')
- `current_stock` (DECIMAL(10,2), default 0)
- `min_stock_threshold` (DECIMAL(10,2), default 10)
- `cost_price`, `selling_price` (DECIMAL(10,2))
- `has_expiry` (BOOLEAN, default false)
- Timestamps: `created_at`, `updated_at`
- Unique constraint: (user_id, name)

**stock_entries**
- `id` (UUID, primary key)
- `user_id`, `product_id` (UUIDs, foreign keys)
- `entry_type` (VARCHAR(20): 'purchase', 'sale', 'adjustment', 'waste')
- `quantity` (DECIMAL(10,2))
- `unit_price` (DECIMAL(10,2))
- `expiry_date` (DATE)
- `batch_number` (VARCHAR(100))
- `notes` (TEXT)
- `entry_method` (VARCHAR(20), default 'manual')
- Timestamp: `created_at`

**alerts**
- `id` (UUID, primary key)
- `user_id`, `product_id` (UUIDs, foreign keys)
- `alert_type` (VARCHAR(50))
- `message` (TEXT)
- `is_read` (BOOLEAN, default false)
- `sent_via_whatsapp` (BOOLEAN, default false)
- Timestamp: `created_at`

### Database Triggers & Functions

**Auto-update stock on entries:** When a stock_entry is inserted, `update_product_stock()` automatically updates the product's `current_stock`:
- `purchase` or `adjustment`: adds quantity
- `sale` or `waste`: subtracts quantity

**Auto-generate alerts:** When `current_stock` drops below `min_stock_threshold`, the `check_low_stock()` function creates a low stock alert.

**Auto-update timestamps:** The `update_updated_at_column()` function updates `updated_at` on product modifications.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user (phone, password, businessName)
- `POST /login` - Login user (phone, password) → returns session token

### Products (`/api/products`)
All routes require Bearer token authentication.
- `GET /` - List all products for authenticated user
- `GET /:id` - Get single product
- `POST /` - Create new product
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product
- `GET /alerts/low-stock` - Get low stock products

### Stock (`/api/stock`)
All routes require Bearer token authentication.
- `POST /` - Add stock entry
- `GET /product/:productId` - Get stock history for a product
- `GET /` - Get all stock entries for user

## Development Workflows

### Starting Development (First Time)

1. **Review Documentation**
   ```bash
   # Read the comprehensive guide
   cat project-context.md
   ```

2. **Set Up Backend** (Week 1-2)
   ```bash
   mkdir -p ~/shopmate/backend
   cd ~/shopmate/backend
   npm init -y
   npm install express cors dotenv @supabase/supabase-js
   npm install -D typescript ts-node @types/node @types/express @types/cors nodemon
   npx tsc --init
   ```

3. **Set Up Supabase**
   - Create project at supabase.com
   - Run SQL schema from project-context.md (lines 162-336)
   - Copy credentials to `.env`

4. **Set Up Mobile** (Week 5-6)
   ```bash
   mkdir -p ~/shopmate/mobile
   cd ~/shopmate/mobile
   npx create-expo-app@latest . --template blank-typescript
   npm install @react-navigation/native @react-navigation/stack
   npm install react-native-screens react-native-safe-area-context
   npm install @react-native-async-storage/async-storage axios
   npm install react-native-paper react-native-vector-icons
   ```

### Daily Development

**Backend:**
```bash
cd ~/shopmate/backend
npm run dev  # Starts nodemon on port 3000
```

**Mobile:**
```bash
cd ~/shopmate/mobile
npx expo start  # Starts Expo dev server
```

**Testing:**
```bash
# Health check
curl http://localhost:3000/health

# Database test
curl http://localhost:3000/test-db

# API test (after auth)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "password": "test123"}'
```

## Code Conventions

### TypeScript
- **Strict mode enabled** in tsconfig.json
- Use explicit types for all function parameters and returns
- Use interfaces for data structures (see `src/types/`)
- No `any` types except for error handling

### Backend Structure
- **Routes:** Define HTTP endpoints, delegate to services
- **Services:** Business logic, database operations
- **Middleware:** Authentication, logging, error handling
- **Config:** Database connections, environment variables

### Mobile Structure
- **Screens:** Full-page components with navigation
- **Components:** Reusable UI elements
- **Services:** API client layer (axios)
- **Types:** TypeScript interfaces matching backend

### Authentication
- Backend uses Supabase Auth with Bearer tokens
- Mobile stores token in AsyncStorage
- All protected routes use `authenticate` middleware
- Token format: `Bearer <access_token>`

### Naming Conventions
- **Files:** camelCase for TypeScript, kebab-case for routes
  - `auth.routes.ts`, `productService.ts`, `LoginScreen.tsx`
- **Components:** PascalCase (React convention)
  - `LoginScreen`, `ProductCard`, `HomeScreen`
- **Functions:** camelCase
  - `createProduct()`, `handleLogin()`, `loadProducts()`
- **Database:** snake_case (PostgreSQL convention)
  - `user_profiles`, `created_at`, `business_name`

### Error Handling
- Try-catch blocks for all async operations
- Return meaningful error messages
- Log errors to console with context
- HTTP status codes: 400 (bad request), 401 (unauthorized), 404 (not found), 409 (conflict), 500 (server error)

### API Response Format
```typescript
// Success
{ data: <result>, message?: "Success message" }

// Error
{ error: "Error message" }
```

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### Mobile (src/services/api.ts)
```typescript
// Development: Use Mac IP address
const API_URL = "http://192.168.1.x:3000/api";

// Production: Use Railway URL
const API_URL = "https://your-app.railway.app/api";
```

## Testing Strategy

### Manual Testing (MVP)
- Use curl or Postman for API testing
- Test on real devices (iOS iPad, Android phone)
- Verify offline functionality by disabling WiFi
- Check low stock alerts trigger correctly

### Key Test Cases
1. **Authentication**
   - Signup with phone/password
   - Login with existing credentials
   - Invalid credentials rejected

2. **Products**
   - Create product with required fields
   - List products shows all user products
   - Update product details
   - Delete product

3. **Stock Management**
   - Add purchase entry → stock increases
   - Add sale entry → stock decreases
   - Low stock alert triggers when threshold reached

4. **Mobile App**
   - Login persists across app restarts (AsyncStorage)
   - Products list updates on pull-to-refresh
   - Low stock badge appears correctly
   - Offline mode works (cached data)

## Deployment

### Backend (Railway)
```bash
cd ~/shopmate/backend
git init
git add .
git commit -m "Initial commit"
railway login
railway init
railway up
```

Set environment variables in Railway dashboard:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- NODE_ENV=production

### Mobile (EAS Build)
```bash
cd ~/shopmate/mobile
eas build:configure
eas build --platform android --profile production
```

Download APK from EAS dashboard and distribute to customers.

## Common Commands

```bash
# Backend
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm start            # Run production build

# Mobile
npx expo start       # Start Expo dev server
npx expo start --tunnel  # Use tunnel for remote testing
eas build --platform android  # Build APK

# Git
git status
git add .
git commit -m "message"
git push -u origin <branch-name>

# Find Mac IP for mobile testing
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Important Notes for AI Assistants

### When Implementing Code

1. **Follow the Guide:** The project-context.md file (2,150 lines) contains complete, production-ready code snippets. Use these as the source of truth.

2. **Week-by-Week Approach:** Development is planned in 8 weekly phases:
   - Weeks 1-2: Database + Backend foundation
   - Weeks 3-4: Core APIs (Auth, Products, Stock)
   - Weeks 5-6: Mobile app
   - Weeks 7-8: Testing and polish

3. **No Premature Features:** The MVP explicitly excludes:
   - AI demand forecasting
   - Multi-location support
   - Advanced analytics
   - Cost prediction
   These are Phase 2 features to add after getting 10+ paying customers.

4. **Voice Integration:** Planned for Phase 2. MVP can use text input first to validate product-market fit.

5. **Customer-First:** The goal is 10 paying customers (₹1,500-3,000 MRR) before adding more features.

### When Debugging

1. **Check Logs:** Backend logs show all requests, Expo shows React Native errors
2. **Verify Environment:** Ensure .env has correct Supabase credentials
3. **Test Database:** Use `/test-db` endpoint to verify Supabase connection
4. **Network Issues:** Mobile app must use Mac's IP address (not localhost)

### When Making Changes

1. **Maintain Type Safety:** All code uses TypeScript strict mode
2. **Preserve RLS:** Database has Row-Level Security - don't bypass it
3. **Keep It Simple:** This is a bootstrapped MVP for small retailers
4. **Document Decisions:** Update this file when architecture changes

## MVP Success Criteria

- [ ] Backend API deployed and running on Railway
- [ ] Mobile app builds successfully (APK)
- [ ] User can signup/login
- [ ] User can add products
- [ ] User can update stock (purchase/sale)
- [ ] Product list shows current stock levels
- [ ] Low stock products show visual indicator
- [ ] App works offline (AsyncStorage)
- [ ] Tested on real phone
- [ ] 10 shops using it
- [ ] 5 paying customers (₹1,500 MRR minimum)

## Resources

- **Full Implementation Guide:** See `project-context.md` (2,150 lines)
- **Supabase Docs:** https://supabase.com/docs
- **Expo Docs:** https://docs.expo.dev
- **React Native Paper:** https://callstack.github.io/react-native-paper/
- **Railway Docs:** https://docs.railway.app

## Quick Reference Links

| Component | Documentation Line Range |
|-----------|-------------------------|
| Database Schema | project-context.md:162-336 |
| Backend Setup | project-context.md:352-593 |
| Auth API | project-context.md:599-808 |
| Products API | project-context.md:812-1084 |
| Stock API | project-context.md:1088-1284 |
| Mobile Setup | project-context.md:1288-1784 |
| Deployment | project-context.md:1831-1913 |
| Customer Acquisition | project-context.md:1916-1963 |
| Troubleshooting | project-context.md:1999-2102 |

---

**Last Updated:** 2025-11-14
**Project Phase:** Pre-development (documentation complete)
**Next Step:** Begin Week 1-2 implementation (Database + Backend)
