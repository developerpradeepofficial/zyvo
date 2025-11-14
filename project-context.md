# LocalBusinessOS - Complete Development Documentation

## Simple Step-by-Step Guide to Build Your MVP

**Target:** Working MVP in 8 weeks (part-time, 20-30 hours/week)  
**Cost:** ₹0-₹10,000 total  
**Result:** Production-ready app with 10+ paying customers

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Prerequisites & Setup](#2-prerequisites--setup)
3. [Week 1-2: Database & Backend Foundation](#3-week-1-2-database--backend-foundation)
4. [Week 3-4: Core APIs](#4-week-3-4-core-apis)
5. [Week 5-6: Mobile App](#5-week-5-6-mobile-app)
6. [Week 7-8: Voice & Testing](#6-week-7-8-voice--testing)
7. [Deployment](#7-deployment)
8. [Getting First Customers](#8-getting-first-customers)

---

## 1. PROJECT OVERVIEW

### What You're Building

**LocalBusinessOS** - Voice-first inventory management for small Indian retailers

**Core Features (MVP):**

1. ✅ Voice stock entry (Tamil): "Tomato 5 kg add pannu"
2. ✅ Product list with current stock levels
3. ✅ Low stock alerts (WhatsApp)
4. ✅ Simple dashboard
5. ✅ Offline-first (works without internet)

**NOT in MVP (Phase 2):**

- ❌ AI demand forecasting
- ❌ Multi-location support
- ❌ Advanced analytics
- ❌ Cost prediction

### Tech Stack

```
Mobile:    React Native + Expo
Backend:   Node.js + Express + TypeScript
Database:  Supabase (PostgreSQL)
Voice:     Google Cloud Speech-to-Text (add Week 7)
Hosting:   Railway.app (backend), Expo (mobile)
```

### Architecture (Simple View)

```
┌──────────────────┐
│  Mobile App      │  ← User interacts here
│  (React Native)  │
└────────┬─────────┘
         │ HTTP REST API
         ↓
┌──────────────────┐
│  Backend API     │  ← Your Node.js code
│  (Express.js)    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Database        │  ← Supabase PostgreSQL
│  (Supabase)      │
└──────────────────┘
```

---

## 2. PREREQUISITES & SETUP

### What You Need

**Hardware:**

- ✅ Mac Mini M4 (you have this)
- ✅ iPad 11th gen (for testing)
- ✅ Android phone (borrow one for testing)

**Accounts (All Free):**

- ✅ Supabase account (database) - supabase.com
- ✅ Railway account (hosting) - railway.app
- ✅ Expo account (mobile deployment) - expo.dev
- ✅ Twilio account (WhatsApp) - twilio.com
- ✅ GitHub account (code storage) - github.com

**Software to Install:**

```bash
# 1. Node.js (v18 or higher)
brew install node

# Verify
node --version  # Should show v18.x or higher
npm --version   # Should show 9.x or higher

# 2. Git
brew install git

# 3. VS Code (or your preferred editor)
brew install --cask visual-studio-code

# 4. Expo CLI
npm install -g expo-cli

# 5. PostgreSQL client (optional, for testing)
brew install postgresql
```

### Folder Structure (Create This)

```bash
# Create main project folder
mkdir shopmate
cd shopmate

# Create subfolders
mkdir backend
mkdir mobile
mkdir docs

# Your structure:
shopmate/
├── backend/          ← Node.js API
├── mobile/           ← React Native app
└── docs/             ← Documentation
```

---

## 3. WEEK 1-2: DATABASE & BACKEND FOUNDATION

### Day 1-2: Set Up Supabase Database

#### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub
4. Create new project:
   - Name: `shopmate-db`
   - Database Password: (save this!)
   - Region: Mumbai (closest to you)
   - Free plan: ✅

#### Step 2: Create Database Schema

1. In Supabase dashboard, click "SQL Editor"
2. Click "New query"
3. Copy-paste this ENTIRE schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: USER PROFILES
-- ============================================
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50),
  language_preference VARCHAR(10) DEFAULT 'tamil',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 2: PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'units',
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock_threshold DECIMAL(10,2) DEFAULT 10,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  has_expiry BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create indexes for faster queries
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_name ON products(name);

-- ============================================
-- TABLE 3: STOCK ENTRIES
-- ============================================
CREATE TABLE stock_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  entry_type VARCHAR(20) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  expiry_date DATE,
  batch_number VARCHAR(100),
  notes TEXT,
  entry_method VARCHAR(20) DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stock_entries_product ON stock_entries(product_id);
CREATE INDEX idx_stock_entries_user ON stock_entries(user_id);
CREATE INDEX idx_stock_entries_date ON stock_entries(created_at DESC);

-- ============================================
-- TABLE 4: ALERTS
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_via_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_read ON alerts(is_read);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-update product stock when stock_entries added
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_type = 'purchase' OR NEW.entry_type = 'adjustment' THEN
    UPDATE products
    SET current_stock = current_stock + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  ELSIF NEW.entry_type = 'sale' OR NEW.entry_type = 'waste' THEN
    UPDATE products
    SET current_stock = current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock entries
CREATE TRIGGER update_stock_after_entry
AFTER INSERT ON stock_entries
FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Function: Create alert when stock is low
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  product_name VARCHAR(255);
BEGIN
  IF NEW.current_stock <= NEW.min_stock_threshold THEN
    SELECT name INTO product_name FROM products WHERE id = NEW.id;

    INSERT INTO alerts (user_id, product_id, alert_type, message)
    VALUES (
      NEW.user_id,
      NEW.id,
      'low_stock',
      product_name || ' is running low. Current stock: ' || NEW.current_stock || ' ' || NEW.unit
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for low stock check
CREATE TRIGGER check_low_stock_trigger
AFTER UPDATE OF current_stock ON products
FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can view own products"
ON products FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stock entries"
ON stock_entries FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own alerts"
ON alerts FOR ALL
USING (auth.uid() = user_id);
```

4. Click "Run" (bottom right)
5. You should see "Success. No rows returned"

#### Step 3: Get Supabase Credentials

1. In Supabase, go to Settings → API
2. Copy these values (you'll need them):
   - Project URL: `https://xxxxx.supabase.co`
   - Anon/Public Key: `eyJhbGc...` (long string)
   - Service Role Key: `eyJhbGc...` (different long string)

---

### Day 3-5: Create Backend Project

#### Step 1: Initialize Backend

```bash
cd ~/shopmate/backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express cors dotenv
npm install @supabase/supabase-js
npm install typescript ts-node @types/node @types/express @types/cors nodemon --save-dev

# Initialize TypeScript
npx tsc --init
```

#### Step 2: Update package.json

Open `package.json` and update the scripts section:

```json
{
  "name": "shopmate-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

#### Step 3: Update tsconfig.json

Replace contents with:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Step 4: Create .env File

```bash
# Create .env file
cat > .env << 'EOF'
# Server
NODE_ENV=development
PORT=3000

# Supabase (replace with YOUR values from Step 3 above)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
EOF
```

**⚠️ IMPORTANT:** Replace the `xxxxx` and keys with YOUR actual values!

#### Step 5: Create Folder Structure

```bash
cd ~/shopmate/backend

# Create folders
mkdir -p src/config
mkdir -p src/routes
mkdir -p src/services
mkdir -p src/middleware
mkdir -p src/types
```

Your structure should look like:

```
backend/
├── src/
│   ├── config/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── types/
├── package.json
├── tsconfig.json
└── .env
```

#### Step 6: Create Database Config

Create file: `src/config/database.ts`

```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase credentials in .env file");
}

export const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log("✅ Supabase client initialized");
```

#### Step 7: Create Main Server File

Create file: `src/server.ts`

```typescript
import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple logging
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "LocalBusinessOS API is running!",
  });
});

// Test database connection
app.get("/test-db", async (req: Request, res: Response) => {
  try {
    const { supabase } = await import("./config/database");
    const { data, error } = await supabase.from("products").select("count");

    if (error) throw error;

    res.json({
      status: "Database connected!",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "Database connection failed",
      error: error.message,
    });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
```

#### Step 8: Test Your Backend

```bash
# Make sure you're in backend folder
cd ~/shopmate/backend

# Run the server
npm run dev

# You should see:
# 🚀 Server running on http://localhost:3000
# 📊 Health check: http://localhost:3000/health
```

Open browser and go to: `http://localhost:3000/health`

You should see:

```json
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "message": "LocalBusinessOS API is running!"
}
```

Also test: `http://localhost:3000/test-db`

Should see:

```json
{
  "status": "Database connected!",
  "data": ...
}
```

✅ **If you see this, Week 1-2 foundation is COMPLETE!**

---

## 4. WEEK 3-4: CORE APIs

### Day 6-8: Authentication API

#### Step 1: Create Auth Middleware

Create file: `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/database";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    phone?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
```

#### Step 2: Create Auth Routes

Create file: `src/routes/auth.routes.ts`

```typescript
import { Router, Request, Response } from "express";
import { supabase } from "../config/database";

const router = Router();

// POST /api/auth/signup - Register new user
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { phone, password, businessName } = req.body;

    // Validate input
    if (!phone || !password || !businessName) {
      return res.status(400).json({
        error: "Phone, password, and business name are required",
      });
    }

    // Create auth user (using phone as email for now)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${phone}@shopmate.app`, // Temporary email format
      password: password,
      phone: phone,
    });

    if (authError) throw authError;

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user!.id,
        phone: phone,
        business_name: businessName,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    res.status(201).json({
      message: "User created successfully",
      user: profileData,
      session: authData.session,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login - Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${phone}@shopmate.app`,
      password: password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", data.user!.id)
      .single();

    res.json({
      message: "Login successful",
      user: profile,
      session: data.session,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default router;
```

#### Step 3: Add Auth Routes to Server

Update `src/server.ts`:

```typescript
import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes"; // ADD THIS

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ADD THIS LINE - Mount auth routes
app.use("/api/auth", authRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

#### Step 4: Test Authentication

```bash
# Make sure server is running
npm run dev

# Test signup (use a REST client like Postman or curl)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "test123",
    "businessName": "Test Shop"
  }'

# You should get a response with user data and session token
```

✅ **Authentication is working!**

---

### Day 9-11: Products API

#### Step 1: Create Product Service

Create file: `src/services/productService.ts`

```typescript
import { supabase } from "../config/database";

export interface Product {
  id?: string;
  user_id?: string;
  name: string;
  category?: string;
  unit?: string;
  current_stock?: number;
  min_stock_threshold?: number;
  cost_price?: number;
  selling_price?: number;
  has_expiry?: boolean;
}

export class ProductService {
  // List all products for a user
  async listProducts(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get single product
  async getProduct(userId: string, productId: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .eq("id", productId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  // Create new product
  async createProduct(userId: string, productData: Product): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: userId,
        ...productData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update product
  async updateProduct(
    userId: string,
    productId: string,
    updates: Partial<Product>
  ): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("user_id", userId)
      .eq("id", productId)
      .select()
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  // Delete product
  async deleteProduct(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("user_id", userId)
      .eq("id", productId);

    if (error) throw error;
  }

  // Get low stock products
  async getLowStockProducts(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .filter("current_stock", "lte", "min_stock_threshold")
      .order("current_stock", { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
```

#### Step 2: Create Product Routes

Create file: `src/routes/products.routes.ts`

```typescript
import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { ProductService } from "../services/productService";

const router = Router();
const productService = new ProductService();

// All routes require authentication
router.use(authenticate);

// GET /api/products - List all products
router.get("/", async (req: AuthRequest, res) => {
  try {
    const products = await productService.listProducts(req.user!.id);
    res.json({ data: products });
  } catch (error: any) {
    console.error("Error listing products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const product = await productService.getProduct(
      req.user!.id,
      req.params.id
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ data: product });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products - Create new product
router.post("/", async (req: AuthRequest, res) => {
  try {
    const productData = req.body;

    if (!productData.name) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const product = await productService.createProduct(
      req.user!.id,
      productData
    );

    res.status(201).json({ data: product });
  } catch (error: any) {
    console.error("Error creating product:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Product with this name already exists",
      });
    }

    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id - Update product
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const product = await productService.updateProduct(
      req.user!.id,
      req.params.id,
      req.body
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ data: product });
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await productService.deleteProduct(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// GET /api/products/alerts/low-stock - Get low stock products
router.get("/alerts/low-stock", async (req: AuthRequest, res) => {
  try {
    const products = await productService.getLowStockProducts(req.user!.id);
    res.json({ data: products });
  } catch (error: any) {
    console.error("Error fetching low stock:", error);
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
});

export default router;
```

#### Step 3: Add Products Routes to Server

Update `src/server.ts`:

```typescript
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes"; // ADD THIS

// ... existing code ...

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // ADD THIS LINE

// ... rest of code ...
```

#### Step 4: Test Products API

```bash
# First, login to get a token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "test123"
  }'

# Copy the "access_token" from response

# Create a product (replace YOUR_TOKEN with actual token)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Tomato",
    "category": "Vegetables",
    "unit": "kg",
    "min_stock_threshold": 5,
    "cost_price": 30,
    "selling_price": 50
  }'

# List products
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ **Products API is working!**

---

### Day 12-14: Stock Entry API

#### Step 1: Create Stock Service

Create file: `src/services/stockService.ts`

```typescript
import { supabase } from "../config/database";

export interface StockEntry {
  id?: string;
  user_id?: string;
  product_id: string;
  entry_type: "purchase" | "sale" | "adjustment" | "waste";
  quantity: number;
  unit_price?: number;
  expiry_date?: string;
  batch_number?: string;
  notes?: string;
  entry_method?: string;
}

export class StockService {
  // Add stock entry
  async addStockEntry(
    userId: string,
    entryData: StockEntry
  ): Promise<StockEntry> {
    const { data, error } = await supabase
      .from("stock_entries")
      .insert({
        user_id: userId,
        ...entryData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log(
      `Stock entry added: ${entryData.entry_type} ${entryData.quantity} for product ${entryData.product_id}`
    );

    return data;
  }

  // Get stock history for a product
  async getStockHistory(
    userId: string,
    productId: string,
    limit: number = 50
  ): Promise<StockEntry[]> {
    const { data, error } = await supabase
      .from("stock_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get all stock entries for a user
  async getAllStockEntries(
    userId: string,
    limit: number = 100
  ): Promise<StockEntry[]> {
    const { data, error } = await supabase
      .from("stock_entries")
      .select("*, products(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
```

#### Step 2: Create Stock Routes

Create file: `src/routes/stock.routes.ts`

```typescript
import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { StockService } from "../services/stockService";

const router = Router();
const stockService = new StockService();

router.use(authenticate);

// POST /api/stock - Add stock entry
router.post("/", async (req: AuthRequest, res) => {
  try {
    const entryData = req.body;

    // Validate required fields
    if (!entryData.product_id || !entryData.entry_type || !entryData.quantity) {
      return res.status(400).json({
        error: "product_id, entry_type, and quantity are required",
      });
    }

    // Validate entry_type
    const validTypes = ["purchase", "sale", "adjustment", "waste"];
    if (!validTypes.includes(entryData.entry_type)) {
      return res.status(400).json({
        error: `entry_type must be one of: ${validTypes.join(", ")}`,
      });
    }

    const entry = await stockService.addStockEntry(req.user!.id, entryData);

    res.status(201).json({
      data: entry,
      message: "Stock entry added successfully",
    });
  } catch (error: any) {
    console.error("Error adding stock entry:", error);
    res.status(500).json({ error: "Failed to add stock entry" });
  }
});

// GET /api/stock/product/:productId - Get stock history for a product
router.get("/product/:productId", async (req: AuthRequest, res) => {
  try {
    const history = await stockService.getStockHistory(
      req.user!.id,
      req.params.productId
    );

    res.json({ data: history });
  } catch (error: any) {
    console.error("Error fetching stock history:", error);
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
});

// GET /api/stock - Get all stock entries
router.get("/", async (req: AuthRequest, res) => {
  try {
    const entries = await stockService.getAllStockEntries(req.user!.id);
    res.json({ data: entries });
  } catch (error: any) {
    console.error("Error fetching stock entries:", error);
    res.status(500).json({ error: "Failed to fetch stock entries" });
  }
});

export default router;
```

#### Step 3: Add Stock Routes to Server

Update `src/server.ts`:

```typescript
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import stockRoutes from "./routes/stock.routes"; // ADD THIS

// ... existing code ...

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes); // ADD THIS LINE
```

#### Step 4: Test Stock API

```bash
# Add stock purchase (replace YOUR_TOKEN and PRODUCT_ID)
curl -X POST http://localhost:3000/api/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product_id": "PRODUCT_ID_HERE",
    "entry_type": "purchase",
    "quantity": 10,
    "unit_price": 30,
    "notes": "Weekly purchase"
  }'

# Check product stock increased
curl -X GET http://localhost:3000/api/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN"

# current_stock should be 10 now!
```

✅ **Stock management working! Database triggers auto-updating stock levels!**

---

## 5. WEEK 5-6: MOBILE APP

### Day 15-17: Set Up React Native App

#### Step 1: Create Expo App

```bash
cd ~/shopmate/mobile

# Create new Expo app
npx create-expo-app@latest . --template blank-typescript

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install axios
npm install react-native-paper react-native-vector-icons

# Install Expo specific packages
npx expo install expo-av expo-constants
```

#### Step 2: Create Project Structure

```bash
cd ~/shopmate/mobile

# Create folders
mkdir -p src/screens
mkdir -p src/components
mkdir -p src/services
mkdir -p src/types
mkdir -p src/navigation
```

#### Step 3: Create API Service

Create file: `src/services/api.ts`

```typescript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Change this to your computer's IP address
// Find it with: ifconfig (Mac) or ipconfig (Windows)
// Look for something like 192.168.1.x
const API_URL = "http://192.168.1.5:3000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (phone: string, password: string) => {
    const response = await api.post("/auth/login", { phone, password });
    // Save token
    if (response.data.session?.access_token) {
      await AsyncStorage.setItem(
        "auth_token",
        response.data.session.access_token
      );
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  signup: async (phone: string, password: string, businessName: string) => {
    const response = await api.post("/auth/signup", {
      phone,
      password,
      businessName,
    });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user");
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Products API
export const productsAPI = {
  list: async () => {
    const response = await api.get("/products");
    return response.data.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  create: async (product: any) => {
    const response = await api.post("/products", product);
    return response.data.data;
  },

  update: async (id: string, updates: any) => {
    const response = await api.put(`/products/${id}`, updates);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },

  getLowStock: async () => {
    const response = await api.get("/products/alerts/low-stock");
    return response.data.data;
  },
};

// Stock API
export const stockAPI = {
  add: async (entry: any) => {
    const response = await api.post("/stock", entry);
    return response.data.data;
  },

  getHistory: async (productId: string) => {
    const response = await api.get(`/stock/product/${productId}`);
    return response.data.data;
  },
};

export default api;
```

#### Step 4: Create Types

Create file: `src/types/index.ts`

```typescript
export interface Product {
  id: string;
  name: string;
  category?: string;
  unit: string;
  current_stock: number;
  min_stock_threshold: number;
  cost_price?: number;
  selling_price?: number;
  has_expiry: boolean;
}

export interface StockEntry {
  product_id: string;
  entry_type: "purchase" | "sale" | "adjustment" | "waste";
  quantity: number;
  unit_price?: number;
  notes?: string;
  entry_method?: string;
}

export interface User {
  id: string;
  phone: string;
  business_name: string;
  business_type?: string;
}
```

#### Step 5: Create Login Screen

Create file: `src/screens/LoginScreen.tsx`

```typescript
import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Title } from "react-native-paper";
import { authAPI } from "../services/api";

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter phone and password");
      return;
    }

    setLoading(true);
    try {
      await authAPI.login(phone, password);
      // Navigate to home screen
      navigation.replace("Home");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.error || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>LocalBusinessOS</Title>

      <TextInput
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Login
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate("Signup")}
        style={styles.signupButton}
      >
        Don't have an account? Sign up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  signupButton: {
    marginTop: 15,
  },
});
```

#### Step 6: Create Home Screen

Create file: `src/screens/HomeScreen.tsx`

```typescript
import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Card, Title, Paragraph, FAB, Chip } from "react-native-paper";
import { productsAPI } from "../services/api";
import { Product } from "../types";

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.list();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isLowStock = item.current_stock <= item.min_stock_threshold;

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetail", { product: item })}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>{item.name}</Title>
            {isLowStock && (
              <Chip
                mode="flat"
                textStyle={styles.lowStockText}
                style={styles.lowStockChip}
              >
                Low Stock
              </Chip>
            )}
          </View>
          <Paragraph>
            Stock: {item.current_stock} {item.unit}
          </Paragraph>
          <Paragraph style={styles.threshold}>
            Min: {item.min_stock_threshold} {item.unit}
          </Paragraph>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Title>No products yet</Title>
            <Paragraph>Tap + to add your first product</Paragraph>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddProduct")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lowStockChip: {
    backgroundColor: "#ffebee",
  },
  lowStockText: {
    color: "#c62828",
    fontSize: 12,
  },
  threshold: {
    color: "#666",
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
});
```

#### Step 7: Create Navigation

Create file: `src/navigation/AppNavigator.tsx`

```typescript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "My Products" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

#### Step 8: Update App.tsx

Replace contents of `App.tsx`:

```typescript
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}
```

#### Step 9: Test Mobile App

```bash
# Make sure backend is running on your Mac
cd ~/shopmate/backend
npm run dev

# In another terminal, start mobile app
cd ~/shopmate/mobile
npx expo start

# Scan QR code with Expo Go app on your phone
# Or press 'i' for iOS simulator, 'a' for Android emulator
```

**⚠️ IMPORTANT:** Update `API_URL` in `src/services/api.ts` with your Mac's IP address!

```bash
# Find your IP:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Use that IP in api.ts:
const API_URL = 'http://YOUR_IP_HERE:3000/api';
```

✅ **You should see login screen! Try logging in with your test account!**

---

## 6. WEEK 7-8: VOICE & TESTING

### Voice Integration (Optional - Can add in Phase 2)

**For MVP, you can skip voice and add it later!**

**Simple alternative:** Just use text input for now. Voice is complex and can be added after you have customers.

---

### Day 18-21: Testing & Polish

#### Checklist:

- [ ] Backend APIs all working
- [ ] Mobile app can login
- [ ] Can create products
- [ ] Can view products list
- [ ] Can add stock entries
- [ ] Stock levels update automatically
- [ ] Low stock products show badge
- [ ] App works offline (test by turning off WiFi)

#### Common Issues & Fixes:

**Issue: "Network Error" in mobile app**

- Fix: Check API_URL has correct IP address
- Fix: Make sure backend is running (`npm run dev`)
- Fix: Check firewall isn't blocking port 3000

**Issue: "Invalid token" error**

- Fix: Login again to get fresh token
- Fix: Check Authorization header format

**Issue: Products not showing**

- Fix: Check you're logged in as the right user
- Fix: Try creating a product first

---

## 7. DEPLOYMENT

### Deploy Backend to Railway

#### Step 1: Prepare for Deployment

```bash
cd ~/shopmate/backend

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.log
EOF

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

#### Step 2: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add environment variables in Railway dashboard:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY
# - NODE_ENV=production

# Deploy
railway up
```

Railway will give you a URL like: `https://your-app.railway.app`

#### Step 3: Update Mobile App API URL

Update `src/services/api.ts`:

```typescript
const API_URL = "https://your-app.railway.app/api";
```

---

### Build Mobile App

#### For Testing (Development Build):

```bash
cd ~/shopmate/mobile

# Android APK
eas build --platform android --profile preview

# iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

#### For Production:

```bash
# Configure EAS
eas build:configure

# Build production APK
eas build --platform android --profile production
```

Download the APK and install on Android phones for testing!

---

## 8. GETTING FIRST CUSTOMERS

### Week 9+: Customer Acquisition

#### Day 1-3: Visit 20 Shops

**Script (Tamil):**

```
"Vanakkam Anna/Akka,

Naan software engineer. Small kadaikaaranga-ku oru simple app
panren - inventory track panna, low stock alert koduka.

Voice la update pannalam: "Tomato 5kg add pannu"
Automatic-a low stock WhatsApp message varumpaan kada mukiyathana samaan mudinjiruppagannu theriyum..

₹300/month. First month completely free. Try pannunga?"
```

**Goal:** Get 10 people to say "YES, I'll try"

#### Day 4-7: Install & Train

Visit each shop:

1. Install app on their phone (5 min)
2. Create account (2 min)
3. Add 10 products (10 min)
4. Show how to add stock (5 min)
5. Show WhatsApp alerts (3 min)
6. **Total: 25 minutes per shop**

#### Week 2-3: Follow Up

Visit each shop weekly:

- "Epdi iruku? (How is it?)"
- "Enna problem?" (Any problems?)
- "Enna feature venum?" (What features needed?)

#### Week 4: Convert to Paid

"First month free mudinjudu. Romba useful-a irukunu solringa.
Ipo ₹300/month - oru naal ku ₹10. Continue pannuringala?"

**Goal:** 50% conversion (5 paying customers)

---

## 9. PHASE 2 FEATURES (After Getting 10+ Customers)

### What to Add Next:

1. **Voice Input** (Week 10-11)

   - Integrate Google Cloud Speech-to-Text
   - Add Tamil voice commands

2. **WhatsApp Automation** (Week 12)

   - Daily stock reports at 9 AM
   - Low stock alerts
   - Weekly summary

3. **Expiry Date Management** (Week 13-14)

   - Track expiry dates for medicines/food
   - Alert 7 days before expiry
   - FEFO (First Expiry First Out) logic

4. **Basic Reports** (Week 15)

   - Sales summary
   - Stock movement
   - Profit/loss by product

5. **Multi-Location** (Week 16+)
   - For shops with branches
   - Stock transfer between locations

---

## 10. TROUBLESHOOTING

### Common Issues:

**Backend won't start:**

```bash
# Check node version
node --version  # Should be 18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Database connection fails:**

- Check .env file has correct Supabase URL and keys
- Check Supabase project is active (not paused)

**Mobile app won't connect:**

- Check API_URL has correct IP
- Check backend is running
- Try pinging: `curl http://YOUR_IP:3000/health`

**Can't scan QR code:**

- Make sure phone and Mac on same WiFi
- Try USB connection: `npx expo start --tunnel`

---

## 11. FINAL CHECKLIST

### MVP Complete When You Have:

- [x] Backend API deployed and running
- [x] Mobile app builds successfully
- [x] Can signup/login
- [x] Can add products
- [x] Can update stock
- [x] Can see product list
- [x] Low stock shows badge
- [x] Works offline
- [x] Tested on real phone
- [x] 10 shops using it
- [x] 5 paying customers (₹1,500 MRR)

---

## 12. NEXT STEPS

### You now have:

✅ Working MVP  
✅ 5-10 paying customers  
✅ ₹1,500-3,000 monthly revenue  
✅ Product-market fit validation

### What to do:

**Option A:** Scale to 100 customers (part-time)

- Hire 1 sales person (₹15K/month + commission)
- Target: 20 new customers/month
- Timeline: 6 months to 100 customers

**Option B:** Raise funding

- Create pitch deck
- Apply to accelerators (Y Combinator, Sequoia Surge)
- Target: ₹50L-1Cr seed round

**Option C:** Continue bootstrapping

- Keep your job
- Grow organically to 500 customers
- Quit when MRR crosses ₹1.5L (18 months)

---

## 13. SUPPORT & HELP

### If You Get Stuck:

**Backend Issues:**

- Check server logs: `npm run dev` output
- Check Supabase logs in dashboard
- Test APIs with Postman/curl

**Mobile Issues:**

- Check Expo errors in terminal
- Check React Native debugger
- Console.log everything!

**Database Issues:**

- Check Supabase dashboard → Database → Tables
- Run queries in SQL Editor
- Check RLS policies

---

## CONGRATULATIONS! 🎉

**You now have a complete guide to build LocalBusinessOS from scratch!**

**Remember:**

- Start simple (MVP features only)
- Talk to customers weekly
- Don't build features nobody asks for
- Focus on getting 10 paying customers first
- Then add more features

**You can do this!** 💪

---

## QUICK COMMAND REFERENCE

```bash
# Start backend
cd ~/shopmate/backend && npm run dev

# Start mobile app
cd ~/shopmate/mobile && npx expo start

# Check backend health
curl http://localhost:3000/health

# Test database
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres

# Deploy to Railway
railway up

# Build Android APK
eas build --platform android
```

---

**Total Time:** 8 weeks part-time (20-30 hours/week)  
**Total Cost:** ₹0-₹10,000  
**Result:** Production app with paying customers!

**NOW GO BUILD IT!** 🚀
