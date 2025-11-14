# LocalBusinessOS - Complete Development Guide (Using Refine)
## Build Your MVP in 1 WEEK Instead of 8 Weeks!

**Target:** Working production app in 7 days  
**Cost:** ₹0 (100% free, open source)  
**Result:** Web app that works like mobile app (PWA) with 10+ paying customers

---

## 🎯 WHY REFINE?

### Without Refine (Custom Build):
- ⏰ 8 weeks to build
- 😰 Write 5,000+ lines of code
- 🐛 Many bugs to fix
- 📚 Complex setup

### With Refine (Boilerplate):
- ⏰ 1 week to launch
- ✅ 90% code already written
- 🚀 Production-ready
- 🎁 Everything included

**Refine gives you:**
- ✅ Authentication (login/signup) - DONE
- ✅ CRUD operations - DONE
- ✅ Forms with validation - DONE
- ✅ Tables with filtering - DONE
- ✅ Dashboard - DONE
- ✅ Routing - DONE
- ✅ TypeScript - DONE
- ✅ UI components - DONE

**You just customize for your business!**

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#1-prerequisites)
2. [Day 1: Setup Supabase & Refine](#2-day-1-setup-supabase--refine)
3. [Day 2: Products Management](#3-day-2-products-management)
4. [Day 3: Stock Management](#4-day-3-stock-management)
5. [Day 4: Dashboard & Reports](#5-day-4-dashboard--reports)
6. [Day 5: Voice Input & PWA](#6-day-5-voice-input--pwa)
7. [Day 6: Testing & Polish](#7-day-6-testing--polish)
8. [Day 7: Deploy & Launch](#8-day-7-deploy--launch)
9. [Week 2+: Get Customers](#9-week-2-get-customers)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. PREREQUISITES

### What You Need

**Accounts (All Free):**
- ✅ GitHub account - github.com
- ✅ Supabase account - supabase.com
- ✅ Vercel account - vercel.com (for deployment)

**Software to Install:**

```bash
# 1. Node.js (v18 or higher)
brew install node

# Verify
node --version  # Should show v18.x or higher

# 2. Git
brew install git

# 3. VS Code (optional, any editor works)
brew install --cask visual-studio-code
```

**Create Project Folder:**

```bash
mkdir ~/shopmate
cd ~/shopmate
```

---

## 2. DAY 1: SETUP SUPABASE & REFINE

### Step 1: Create Supabase Database (15 minutes)

#### 1.1 Create Project

1. Go to https://supabase.com
2. Sign in with GitHub
3. Click "New Project"
   - Name: `shopmate-db`
   - Database Password: (create strong password, save it!)
   - Region: Mumbai
   - Plan: Free
4. Wait 2-3 minutes for database to initialize

#### 1.2 Run Database Schema

1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy and paste this ENTIRE schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
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
-- PRODUCTS TABLE
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

CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_stock ON products(current_stock);

-- ============================================
-- STOCK ENTRIES TABLE
-- ============================================
CREATE TABLE stock_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('purchase', 'sale', 'adjustment', 'waste')),
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
-- ALERTS TABLE
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

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update product stock when stock_entries added
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_type IN ('purchase', 'adjustment') THEN
    UPDATE products 
    SET current_stock = current_stock + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  ELSIF NEW.entry_type IN ('sale', 'waste') THEN
    UPDATE products 
    SET current_stock = GREATEST(current_stock - NEW.quantity, 0),
        updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_after_entry 
AFTER INSERT ON stock_entries
FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Create alert when stock is low
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  product_name VARCHAR(255);
  existing_alert_count INTEGER;
BEGIN
  IF NEW.current_stock <= NEW.min_stock_threshold THEN
    SELECT name INTO product_name FROM products WHERE id = NEW.id;
    
    -- Check if alert already exists (avoid duplicates)
    SELECT COUNT(*) INTO existing_alert_count
    FROM alerts
    WHERE product_id = NEW.id
      AND alert_type = 'low_stock'
      AND is_read = false;
    
    -- Only create alert if none exists
    IF existing_alert_count = 0 THEN
      INSERT INTO alerts (user_id, product_id, alert_type, message)
      VALUES (
        NEW.user_id,
        NEW.id,
        'low_stock',
        product_name || ' is running low. Current stock: ' || NEW.current_stock || ' ' || NEW.unit
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own products" 
ON products FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own stock entries" 
ON stock_entries FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alerts" 
ON alerts FOR ALL 
USING (auth.uid() = user_id);
```

4. Click "Run" button (bottom right)
5. You should see "Success. No rows returned"

✅ **Database is ready!**

#### 1.3 Get Supabase Credentials

1. In Supabase, go to Settings → API
2. Copy these values (you'll need them in Step 2):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

---

### Step 2: Create Refine App (10 minutes)

```bash
cd ~/shopmate

# Create Refine app
npm create refine-app@latest shopmate-web

# ⚠️ IMPORTANT: Answer prompts like this:
# ? Choose a project template: refine-vite
# ? What would you like to name your project?: shopmate-web
# ? Choose your backend service: Supabase
# ? Do you want to use a UI Framework?: Ant Design
# ? Do you want to add example pages?: Yes (recommended)
# ? Do you need i18n (Internationalization) support?: No
# ? Do you need to customize the default theme?: No
# ? Do you want to add dark mode support?: No (optional, choose Yes if you want)

# Wait for installation (2-3 minutes)

cd shopmate-web
```

---

### Step 3: Configure Supabase Connection (2 minutes)

Create `.env` file in `shopmate-web` folder:

```bash
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=your_anon_key_here
EOF
```

**⚠️ REPLACE** `xxxxx.supabase.co` and `your_anon_key_here` with YOUR actual values from Step 1.3!

---

### Step 4: Run the App (1 minute)

```bash
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
```

Open browser: http://localhost:5173

**YOU SHOULD SEE: Login page!** 🎉

---

### Step 5: Create Your First Account (2 minutes)

1. Click "Sign up" tab
2. Enter:
   - Email: your_email@example.com
   - Password: test123456
3. Click "Sign up"
4. You're logged in! 🎉

**You see a dashboard with sample pages!**

---

### ✅ DAY 1 COMPLETE!

**What you have:**
- ✅ Supabase database with all tables
- ✅ Refine app running
- ✅ Authentication working
- ✅ Dashboard showing
- ✅ Example pages (you'll customize these)

**Total time: ~30 minutes!**

---

## 3. DAY 2: PRODUCTS MANAGEMENT

### Overview

Today you'll customize the products page to match your inventory needs.

Refine already created example CRUD pages. You'll modify them for products.

---

### Step 1: Generate Products Resource (2 minutes)

```bash
cd ~/shopmate/shopmate-web

# Refine CLI to generate pages
npm run refine create-resource products
```

This creates:
- `src/pages/products/list.tsx` - View all products
- `src/pages/products/create.tsx` - Add new product
- `src/pages/products/edit.tsx` - Edit product
- `src/pages/products/show.tsx` - View single product

---

### Step 2: Update Products List Page (15 minutes)

Edit `src/pages/products/list.tsx`:

```typescript
import React from "react";
import { useTable, List, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

export const ProductList: React.FC = () => {
  const { tableProps } = useTable({
    resource: "products",
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Product Name" />
        
        <Table.Column dataIndex="category" title="Category" />
        
        <Table.Column 
          dataIndex="current_stock" 
          title="Current Stock"
          render={(value, record: any) => (
            <span>
              {value} {record.unit}
              {value <= record.min_stock_threshold && (
                <Tag color="red" style={{ marginLeft: 8 }}>Low Stock</Tag>
              )}
            </span>
          )}
        />
        
        <Table.Column 
          dataIndex="min_stock_threshold" 
          title="Min Stock"
          render={(value, record: any) => `${value} ${record.unit}`}
        />
        
        <Table.Column 
          dataIndex="selling_price" 
          title="Price"
          render={(value) => `₹${value}`}
        />
        
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
```

---

### Step 3: Update Create Product Form (15 minutes)

Edit `src/pages/products/create.tsx`:

```typescript
import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch } from "antd";

export const ProductCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "products",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Product Name"
          name="name"
          rules={[{ required: true, message: "Please enter product name" }]}
        >
          <Input placeholder="e.g., Tomato, Rice, Paracetamol" />
        </Form.Item>

        <Form.Item label="Category" name="category">
          <Select placeholder="Select category">
            <Select.Option value="Vegetables">Vegetables</Select.Option>
            <Select.Option value="Fruits">Fruits</Select.Option>
            <Select.Option value="Groceries">Groceries</Select.Option>
            <Select.Option value="Medicines">Medicines</Select.Option>
            <Select.Option value="Dairy">Dairy</Select.Option>
            <Select.Option value="Beverages">Beverages</Select.Option>
            <Select.Option value="Others">Others</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Unit"
          name="unit"
          initialValue="units"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="kg">Kilograms (kg)</Select.Option>
            <Select.Option value="grams">Grams</Select.Option>
            <Select.Option value="liters">Liters</Select.Option>
            <Select.Option value="ml">Milliliters (ml)</Select.Option>
            <Select.Option value="pieces">Pieces</Select.Option>
            <Select.Option value="units">Units</Select.Option>
            <Select.Option value="packets">Packets</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Minimum Stock Threshold"
          name="min_stock_threshold"
          initialValue={10}
          rules={[{ required: true }]}
        >
          <InputNumber 
            min={0} 
            style={{ width: "100%" }}
            placeholder="Alert when stock falls below this"
          />
        </Form.Item>

        <Form.Item label="Cost Price (₹)" name="cost_price">
          <InputNumber 
            min={0} 
            style={{ width: "100%" }}
            placeholder="Purchase price"
            prefix="₹"
          />
        </Form.Item>

        <Form.Item label="Selling Price (₹)" name="selling_price">
          <InputNumber 
            min={0} 
            style={{ width: "100%" }}
            placeholder="Selling price"
            prefix="₹"
          />
        </Form.Item>

        <Form.Item 
          label="Has Expiry Date?" 
          name="has_expiry" 
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
```

---

### Step 4: Update Edit Product Form (5 minutes)

Edit `src/pages/products/edit.tsx`:

```typescript
import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch } from "antd";

export const ProductEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "products",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Category" name="category">
          <Select>
            <Select.Option value="Vegetables">Vegetables</Select.Option>
            <Select.Option value="Fruits">Fruits</Select.Option>
            <Select.Option value="Groceries">Groceries</Select.Option>
            <Select.Option value="Medicines">Medicines</Select.Option>
            <Select.Option value="Dairy">Dairy</Select.Option>
            <Select.Option value="Beverages">Beverages</Select.Option>
            <Select.Option value="Others">Others</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Unit" name="unit">
          <Select>
            <Select.Option value="kg">Kilograms (kg)</Select.Option>
            <Select.Option value="grams">Grams</Select.Option>
            <Select.Option value="liters">Liters</Select.Option>
            <Select.Option value="ml">Milliliters (ml)</Select.Option>
            <Select.Option value="pieces">Pieces</Select.Option>
            <Select.Option value="units">Units</Select.Option>
            <Select.Option value="packets">Packets</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Minimum Stock Threshold" name="min_stock_threshold">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Cost Price (₹)" name="cost_price">
          <InputNumber min={0} style={{ width: "100%" }} prefix="₹" />
        </Form.Item>

        <Form.Item label="Selling Price (₹)" name="selling_price">
          <InputNumber min={0} style={{ width: "100%" }} prefix="₹" />
        </Form.Item>

        <Form.Item label="Has Expiry Date?" name="has_expiry" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
```

---

### Step 5: Update App Routing (5 minutes)

Edit `src/App.tsx` - add products resource:

```typescript
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  AuthPage,
  ErrorComponent,
  Layout,
  notificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerBindings, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { supabaseClient } from "./utility";
import authProvider from "./authProvider";
import { ShopOutlined, DashboardOutlined } from "@ant-design/icons";

// Import your pages
import { ProductList, ProductCreate, ProductEdit, ProductShow } from "./pages/products";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <Refine
          dataProvider={dataProvider(supabaseClient)}
          liveProvider={liveProvider(supabaseClient)}
          authProvider={authProvider}
          routerProvider={routerBindings}
          notificationProvider={notificationProvider}
          resources={[
            {
              name: "products",
              list: "/products",
              create: "/products/create",
              edit: "/products/edit/:id",
              show: "/products/show/:id",
              meta: {
                canDelete: true,
                icon: <ShopOutlined />,
              },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            liveMode: "auto",
          }}
        >
          <Routes>
            <Route
              element={
                <Layout>
                  <Outlet />
                </Layout>
              }
            >
              <Route index element={<NavigateToResource resource="products" />} />
              
              <Route path="/products">
                <Route index element={<ProductList />} />
                <Route path="create" element={<ProductCreate />} />
                <Route path="edit/:id" element={<ProductEdit />} />
                <Route path="show/:id" element={<ProductShow />} />
              </Route>

              <Route path="*" element={<ErrorComponent />} />
            </Route>

            <Route
              element={
                <AuthPage
                  type="login"
                  formProps={{
                    initialValues: { email: "", password: "" },
                  }}
                />
              }
              path="/login"
            />
            <Route element={<AuthPage type="register" />} path="/register" />
            <Route element={<AuthPage type="forgotPassword" />} path="/forgot-password" />
          </Routes>

          <RefineKbar />
          <UnsavedChangesNotifier />
          <DocumentTitleHandler />
        </Refine>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

### Step 6: Create Product Show Page (10 minutes)

Edit `src/pages/products/show.tsx`:

```typescript
import React from "react";
import { useShow } from "@refinedev/core";
import { Show, NumberField, TextField, BooleanField } from "@refinedev/antd";
import { Typography, Tag } from "antd";

const { Title } = Typography;

export const ProductShow: React.FC = () => {
  const { queryResult } = useShow({
    resource: "products",
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  const isLowStock = record && record.current_stock <= record.min_stock_threshold;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Product Name</Title>
      <TextField value={record?.name} />

      <Title level={5}>Category</Title>
      <TextField value={record?.category || "-"} />

      <Title level={5}>Current Stock</Title>
      <div>
        <NumberField value={record?.current_stock} /> {record?.unit}
        {isLowStock && (
          <Tag color="red" style={{ marginLeft: 8 }}>Low Stock!</Tag>
        )}
      </div>

      <Title level={5}>Minimum Stock Threshold</Title>
      <div>
        <NumberField value={record?.min_stock_threshold} /> {record?.unit}
      </div>

      <Title level={5}>Cost Price</Title>
      <NumberField
        value={record?.cost_price}
        options={{
          style: "currency",
          currency: "INR",
        }}
      />

      <Title level={5}>Selling Price</Title>
      <NumberField
        value={record?.selling_price}
        options={{
          style: "currency",
          currency: "INR",
        }}
      />

      <Title level={5}>Has Expiry Date?</Title>
      <BooleanField value={record?.has_expiry} />
    </Show>
  );
};
```

---

### Step 7: Export All Product Pages (2 minutes)

Create `src/pages/products/index.ts`:

```typescript
export { ProductList } from "./list";
export { ProductCreate } from "./create";
export { ProductEdit } from "./edit";
export { ProductShow } from "./show";
```

---

### Step 8: Test Products CRUD (5 minutes)

```bash
# Make sure app is running
npm run dev
```

1. Go to http://localhost:5173
2. Login if needed
3. Click "Products" in sidebar
4. Click "Create" button
5. Fill form:
   - Name: Tomato
   - Category: Vegetables
   - Unit: kg
   - Min Stock: 5
   - Cost Price: 30
   - Selling Price: 50
6. Click "Save"
7. **You should see your product in the list!** 🎉

Try:
- ✅ Creating more products
- ✅ Editing a product
- ✅ Viewing product details
- ✅ Deleting a product

---

### ✅ DAY 2 COMPLETE!

**What you have:**
- ✅ Products list with low stock badges
- ✅ Create product form
- ✅ Edit product form
- ✅ View product details
- ✅ Delete products
- ✅ All CRUD operations working

**Total time: ~1 hour!**

---

## 4. DAY 3: STOCK MANAGEMENT

### Overview

Today you'll add stock entry functionality to track purchases, sales, and adjustments.

---

### Step 1: Generate Stock Entries Resource (2 minutes)

```bash
npm run refine create-resource stock_entries
```

---

### Step 2: Create Stock Entry Form (20 minutes)

Edit `src/pages/stock_entries/create.tsx`:

```typescript
import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, DatePicker } from "antd";

export const StockEntryCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "stock_entries",
  });

  const { selectProps: productSelectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Product"
          name="product_id"
          rules={[{ required: true, message: "Please select a product" }]}
        >
          <Select 
            {...productSelectProps}
            showSearch
            placeholder="Select product"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Entry Type"
          name="entry_type"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select type">
            <Select.Option value="purchase">Purchase (Add Stock)</Select.Option>
            <Select.Option value="sale">Sale (Remove Stock)</Select.Option>
            <Select.Option value="adjustment">Adjustment (Correct Stock)</Select.Option>
            <Select.Option value="waste">Waste (Damaged/Expired)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: "Please enter quantity" }]}
        >
          <InputNumber 
            min={0.01}
            step={0.01}
            style={{ width: "100%" }}
            placeholder="e.g., 10.5"
          />
        </Form.Item>

        <Form.Item label="Unit Price (₹)" name="unit_price">
          <InputNumber 
            min={0}
            style={{ width: "100%" }}
            placeholder="Price per unit"
            prefix="₹"
          />
        </Form.Item>

        <Form.Item label="Batch Number" name="batch_number">
          <Input placeholder="Optional: Batch/Lot number" />
        </Form.Item>

        <Form.Item label="Expiry Date" name="expiry_date">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea 
            rows={3} 
            placeholder="Optional: Any additional notes"
          />
        </Form.Item>

        <Form.Item name="entry_method" initialValue="manual" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
```

---

### Step 3: Create Stock Entries List (15 minutes)

Edit `src/pages/stock_entries/list.tsx`:

```typescript
import React from "react";
import { useTable, List, DateField, NumberField } from "@refinedev/antd";
import { Table, Tag, Space } from "antd";

export const StockEntryList: React.FC = () => {
  const { tableProps } = useTable({
    resource: "stock_entries",
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    meta: {
      select: "*, products(name, unit)",
    },
  });

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "green";
      case "sale":
        return "blue";
      case "adjustment":
        return "orange";
      case "waste":
        return "red";
      default:
        return "default";
    }
  };

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case "purchase":
        return "Purchase";
      case "sale":
        return "Sale";
      case "adjustment":
        return "Adjustment";
      case "waste":
        return "Waste";
      default:
        return type;
    }
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["products", "name"]}
          title="Product"
        />

        <Table.Column
          dataIndex="entry_type"
          title="Type"
          render={(value) => (
            <Tag color={getEntryTypeColor(value)}>
              {getEntryTypeLabel(value)}
            </Tag>
          )}
        />

        <Table.Column
          dataIndex="quantity"
          title="Quantity"
          render={(value, record: any) => (
            <span>
              <NumberField value={value} /> {record.products?.unit}
            </span>
          )}
        />

        <Table.Column
          dataIndex="unit_price"
          title="Unit Price"
          render={(value) =>
            value ? (
              <NumberField
                value={value}
                options={{
                  style: "currency",
                  currency: "INR",
                }}
              />
            ) : (
              "-"
            )
          }
        />

        <Table.Column
          dataIndex="created_at"
          title="Date"
          render={(value) => <DateField value={value} format="DD/MM/YYYY HH:mm" />}
        />

        <Table.Column dataIndex="notes" title="Notes" />
      </Table>
    </List>
  );
};
```

---

### Step 4: Update App.tsx - Add Stock Entries (5 minutes)

Edit `src/App.tsx` - add stock_entries resource:

```typescript
// Add import
import { StockEntryList, StockEntryCreate } from "./pages/stock_entries";
import { HistoryOutlined } from "@ant-design/icons";

// In resources array, add:
resources={[
  {
    name: "products",
    list: "/products",
    create: "/products/create",
    edit: "/products/edit/:id",
    show: "/products/show/:id",
    meta: {
      canDelete: true,
      icon: <ShopOutlined />,
    },
  },
  {
    name: "stock_entries",
    list: "/stock_entries",
    create: "/stock_entries/create",
    meta: {
      label: "Stock History",
      icon: <HistoryOutlined />,
    },
  },
]}

// In Routes, add:
<Route path="/stock_entries">
  <Route index element={<StockEntryList />} />
  <Route path="create" element={<StockEntryCreate />} />
</Route>
```

---

### Step 5: Create index file (2 minutes)

Create `src/pages/stock_entries/index.ts`:

```typescript
export { StockEntryList } from "./list";
export { StockEntryCreate } from "./create";
```

---

### Step 6: Test Stock Management (5 minutes)

1. Go to http://localhost:5173
2. Click "Stock History" in sidebar
3. Click "Create" button
4. Select a product (e.g., Tomato)
5. Entry Type: Purchase
6. Quantity: 10
7. Unit Price: 30
8. Click "Save"
9. **Go to Products page - stock should increase!** 🎉

Try:
- ✅ Adding stock (purchase)
- ✅ Removing stock (sale)
- ✅ Check product page - stock updates automatically!
- ✅ Create waste entry - stock decreases

---

### ✅ DAY 3 COMPLETE!

**What you have:**
- ✅ Stock entry form
- ✅ Stock history list
- ✅ Automatic stock updates (database triggers working!)
- ✅ Purchase/Sale/Waste tracking

**Total time: ~50 minutes!**

---

## 5. DAY 4: DASHBOARD & REPORTS

### Step 1: Create Dashboard (30 minutes)

Create `src/pages/dashboard/index.tsx`:

```typescript
import React from "react";
import { useList } from "@refinedev/core";
import { Row, Col, Card, Statistic, Table, Tag } from "antd";
import {
  ShoppingCartOutlined,
  WarningOutlined,
  DollarOutlined,
  DropboxOutlined,
} from "@ant-design/icons";

export const Dashboard: React.FC = () => {
  // Get all products
  const { data: productsData } = useList({
    resource: "products",
  });

  const products = productsData?.data || [];

  // Calculate statistics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p: any) => p.current_stock <= p.min_stock_threshold
  );
  const totalStockValue = products.reduce(
    (sum: number, p: any) => sum + (p.current_stock * (p.cost_price || 0)),
    0
  );
  const outOfStock = products.filter((p: any) => p.current_stock === 0);

  return (
    <div style={{ padding: "24px" }}>
      <h1>Dashboard</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={totalProducts}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={lowStockProducts.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: lowStockProducts.length > 0 ? "#cf1322" : undefined }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={outOfStock.length}
              prefix={<DropboxOutlined />}
              valueStyle={{ color: outOfStock.length > 0 ? "#cf1322" : undefined }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Stock Value"
              value={totalStockValue}
              prefix={<DollarOutlined />}
              precision={0}
              prefix="₹"
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Products Table */}
      {lowStockProducts.length > 0 && (
        <Card
          title="⚠️ Low Stock Alert"
          style={{ marginTop: 24 }}
        >
          <Table
            dataSource={lowStockProducts}
            rowKey="id"
            pagination={false}
          >
            <Table.Column dataIndex="name" title="Product" />
            <Table.Column
              dataIndex="current_stock"
              title="Current Stock"
              render={(value, record: any) => (
                <span>
                  {value} {record.unit}
                  <Tag color="red" style={{ marginLeft: 8 }}>Low</Tag>
                </span>
              )}
            />
            <Table.Column
              dataIndex="min_stock_threshold"
              title="Min Required"
              render={(value, record: any) => `${value} ${record.unit}`}
            />
          </Table>
        </Card>
      )}

      {/* Recent Stock Movements */}
      <Card
        title="Recent Activity"
        style={{ marginTop: 24 }}
      >
        <RecentStockMovements />
      </Card>
    </div>
  );
};

// Recent Stock Movements Component
const RecentStockMovements: React.FC = () => {
  const { data } = useList({
    resource: "stock_entries",
    pagination: { pageSize: 10 },
    sorters: [{ field: "created_at", order: "desc" }],
    meta: {
      select: "*, products(name, unit)",
    },
  });

  const entries = data?.data || [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "purchase": return "green";
      case "sale": return "blue";
      case "adjustment": return "orange";
      case "waste": return "red";
      default: return "default";
    }
  };

  return (
    <Table
      dataSource={entries}
      rowKey="id"
      pagination={false}
      size="small"
    >
      <Table.Column
        dataIndex={["products", "name"]}
        title="Product"
      />
      <Table.Column
        dataIndex="entry_type"
        title="Type"
        render={(value) => (
          <Tag color={getTypeColor(value)}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Tag>
        )}
      />
      <Table.Column
        dataIndex="quantity"
        title="Quantity"
        render={(value, record: any) => `${value} ${record.products?.unit}`}
      />
      <Table.Column
        dataIndex="created_at"
        title="Date"
        render={(value) => new Date(value).toLocaleDateString()}
      />
    </Table>
  );
};
```

---

### Step 2: Update App.tsx - Add Dashboard Route (5 minutes)

Edit `src/App.tsx`:

```typescript
// Add import
import { Dashboard } from "./pages/dashboard";

// Update <Route index> to show Dashboard
<Route index element={<Dashboard />} />

// Or update to redirect:
<Route index element={<Navigate to="/dashboard" />} />

// Add dashboard route:
<Route path="/dashboard" element={<Dashboard />} />
```

---

### Step 3: Test Dashboard (2 minutes)

1. Go to http://localhost:5173
2. You should see dashboard with:
   - Total products count
   - Low stock items count
   - Stock value
   - Low stock alerts table
   - Recent activity

---

### ✅ DAY 4 COMPLETE!

**What you have:**
- ✅ Dashboard with key metrics
- ✅ Low stock alerts highlighted
- ✅ Stock value calculation
- ✅ Recent activity feed

**Total time: ~40 minutes!**

---

## 6. DAY 5: VOICE INPUT & PWA

### Step 1: Add Voice Input to Stock Entry (30 minutes)

Edit `src/pages/stock_entries/create.tsx` - add voice functionality:

```typescript
import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, DatePicker, Button, message } from "antd";
import { AudioOutlined } from "@ant-design/icons";

export const StockEntryCreate: React.FC = () => {
  const { formProps, saveButtonProps, form } = useForm({
    resource: "stock_entries",
  });

  const { selectProps: productSelectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
  });

  const [isListening, setIsListening] = useState(false);

  // Voice input handler
  const handleVoiceInput = () => {
    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      message.error("Voice input not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ta-IN"; // Tamil
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      message.info("Listening... Speak now!");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      message.success(`Heard: ${transcript}`);

      // Parse voice command
      // Example: "tomato 10 kg purchase"
      parseVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      message.error(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const parseVoiceCommand = (transcript: string) => {
    // Simple parsing logic
    // Format: "product_name quantity unit entry_type"
    // Example: "tomato 10 kg purchase"

    const words = transcript.split(" ");

    // Extract quantity (first number found)
    const quantityMatch = transcript.match(/\d+(\.\d+)?/);
    if (quantityMatch) {
      form?.setFieldsValue({ quantity: parseFloat(quantityMatch[0]) });
    }

    // Extract entry type
    if (transcript.includes("purchase") || transcript.includes("buy")) {
      form?.setFieldsValue({ entry_type: "purchase" });
    } else if (transcript.includes("sale") || transcript.includes("sell")) {
      form?.setFieldsValue({ entry_type: "sale" });
    }

    message.info("Voice command processed! Please verify and submit.");
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        {/* Voice Input Button */}
        <Form.Item>
          <Button
            type="primary"
            icon={<AudioOutlined />}
            onClick={handleVoiceInput}
            loading={isListening}
            block
            size="large"
            danger={isListening}
          >
            {isListening ? "Listening..." : "🎤 Voice Input (Tamil)"}
          </Button>
        </Form.Item>

        <Form.Item
          label="Product"
          name="product_id"
          rules={[{ required: true }]}
        >
          <Select {...productSelectProps} showSearch placeholder="Select product" />
        </Form.Item>

        <Form.Item label="Entry Type" name="entry_type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="purchase">Purchase</Select.Option>
            <Select.Option value="sale">Sale</Select.Option>
            <Select.Option value="adjustment">Adjustment</Select.Option>
            <Select.Option value="waste">Waste</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
          <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Unit Price (₹)" name="unit_price">
          <InputNumber min={0} style={{ width: "100%" }} prefix="₹" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item name="entry_method" initialValue="voice" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
```

---

### Step 2: Make it a PWA (20 minutes)

#### 2.1 Install vite-plugin-pwa

```bash
npm install vite-plugin-pwa -D
```

#### 2.2 Update vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "LocalBusinessOS",
        short_name: "ShopMate",
        description: "Inventory management for small retailers",
        theme_color: "#1890ff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
});
```

#### 2.3 Add Icons

Create icons (or use placeholder):
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)

You can generate icons at: https://www.favicon-generator.org/

---

### Step 3: Test Voice & PWA (5 minutes)

```bash
# Build for production to test PWA
npm run build
npm run preview

# Open: http://localhost:4173
```

Test:
1. ✅ Click voice button on stock entry page
2. ✅ Say: "tomato 10 kg purchase"
3. ✅ Check if form fills automatically
4. ✅ On mobile: Add to home screen
5. ✅ Works like native app!

---

### ✅ DAY 5 COMPLETE!

**What you have:**
- ✅ Voice input (Tamil) for stock entries
- ✅ PWA (installable on mobile)
- ✅ Works offline
- ✅ Fast and responsive

**Total time: ~55 minutes!**

---

## 7. DAY 6: TESTING & POLISH

### Checklist:

- [ ] All products CRUD working
- [ ] Stock entries creating successfully
- [ ] Stock levels updating automatically
- [ ] Low stock alerts showing
- [ ] Dashboard displaying correctly
- [ ] Voice input working (in supported browsers)
- [ ] PWA installable
- [ ] Mobile responsive

### Test on Real Phone:

1. Deploy to Vercel (see Day 7)
2. Open URL on phone
3. Add to home screen
4. Test all features

---

## 8. DAY 7: DEPLOY & LAUNCH

### Step 1: Push to GitHub (5 minutes)

```bash
cd ~/shopmate/shopmate-web

# Initialize git (if not already)
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules
dist
.env
.env.local
.DS_Store
EOF

# Commit
git add .
git commit -m "Initial commit - LocalBusinessOS"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/shopmate-web.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy to Vercel (5 minutes)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
6. Click "Deploy"

**Wait 2-3 minutes → Your app is LIVE!** 🎉

You get a URL like: `https://shopmate-web.vercel.app`

---

### Step 3: Test Production App (5 minutes)

1. Open your Vercel URL
2. Create account
3. Add products
4. Add stock entries
5. Check dashboard
6. Test on mobile phone
7. Add to home screen

**IT WORKS!** 🚀

---

### ✅ DAY 7 COMPLETE!

**What you have:**
- ✅ Production app deployed
- ✅ Public URL to share
- ✅ Works on any device
- ✅ Ready for customers!

**Total time: ~15 minutes!**

---

## 9. WEEK 2+: GET CUSTOMERS

### Your Customer Acquisition Plan

#### Week 2: Visit 20 Shops

**Script (Tamil):**
```
"Vanakkam Anna/Akka,

Naan software engineer. Small kadaikaaranga-ku oru app panren.

Voice la stock update pannalam - phone la open pannunga,
button click pannunga, 'Tomato 10 kg purchase' nu sollunga - 
automatic-a entry aayidum!

Low stock WhatsApp alert varum.

Try pannunga - completely free for 1 month. Pidichcha, 
₹300/month continue pannunga. Phone browser-la work aagum, 
app install panna vendam."

(Show them the app on your phone)
```

**Goal:** 10 shops say "YES"

#### Week 3: Train & Support

Visit each shop:
1. Open app on their phone browser
2. Create account (2 min)
3. Add to home screen (1 min)
4. Add 5-10 products (5 min)
5. Show stock entry (2 min)
6. Show voice input (2 min)
7. Exchange phone number for support

**Daily:** Answer their WhatsApp questions

#### Week 4: Convert to Paid

"Anna, 1 month free use panninga. Useful-a irukka?
Ipo monthly ₹300 - oru naal ku ₹10 dhaan.
Continue pannuringala?"

**Goal:** 5 paying customers = ₹1,500 MRR

---

## 10. TROUBLESHOOTING

### Common Issues:

**Issue: "Unauthorized" errors**
- Check: .env file has correct Supabase URL and key
- Check: RLS policies enabled in Supabase
- Try: Login again

**Issue: Stock not updating**
- Check: Database triggers created (see Day 1, Step 1.2)
- Check: Supabase dashboard → Database → Tables → products
- Manually run: `SELECT * FROM products;` in SQL Editor

**Issue: Voice not working**
- Voice only works on HTTPS (not localhost)
- After deploying to Vercel, test voice on production URL
- Or use: Chrome/Edge (has best support)

**Issue: PWA not installing**
- Need HTTPS (works on Vercel, not localhost)
- Check: manifest.json has icons
- Check: Service worker registered

---

## 11. WHAT'S NEXT?

### Phase 2 Features (After Getting 10+ Customers):

1. **WhatsApp Automation** (use n8n)
   - Daily reports
   - Low stock alerts
   - Weekly summary

2. **Multi-language Support**
   - Add Hindi, Telugu
   - Use i18n

3. **Advanced Reports**
   - Sales by category
   - Profit/loss
   - Stock movement trends

4. **Expiry Management**
   - Track expiry dates
   - Alert 7 days before
   - FEFO sorting

5. **Multi-location**
   - For shops with branches
   - Stock transfer

---

## 12. CONGRATULATIONS! 🎉

### You Built a Production App in 1 Week!

**What you have:**
- ✅ Web app (works on mobile + desktop)
- ✅ Authentication
- ✅ Products management
- ✅ Stock tracking
- ✅ Dashboard with analytics
- ✅ Voice input (Tamil)
- ✅ PWA (installable)
- ✅ Deployed on Vercel
- ✅ Public URL to share

**Total development time:** ~6-8 hours (instead of 8 weeks!)

**Cost:** ₹0 (completely free!)

---

## 13. QUICK COMMAND REFERENCE

```bash
# Start development server
cd ~/shopmate/shopmate-web
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Check Supabase connection
# Open browser console and run:
# console.log(import.meta.env.VITE_SUPABASE_URL)
```

---

## 14. SUPPORT & RESOURCES

**Refine Docs:** https://refine.dev/docs  
**Supabase Docs:** https://supabase.com/docs  
**Ant Design:** https://ant.design/components  

---

**YOU DID IT! NOW GO GET CUSTOMERS!** 🚀

**Remember:**
- Show shop owners the app
- Explain benefits (voice, alerts, easy)
- First month free
- ₹300/month after
- WhatsApp support

**Target:** 10 customers in 2 weeks = ₹3,000 MRR

**YOU CAN DO THIS!** 💪
