# 🔐 FRAUD DETECTION SYSTEM - COMPLETE CODE ANALYSIS

---

## 📋 PROJECT OVERVIEW

**Project Name:** Fraud Detection Web Application  
**Tech Stack:** React + TypeScript + Vite + TailwindCSS (Frontend) + Python/FastAPI (Backend)  
**Key Features:** Real-time fraud prediction, transaction monitoring, ML-based risk assessment

---

## 📁 PROJECT STRUCTURE

```
fraud_detect/
├── src/                          # Frontend (React + TypeScript)
│   ├── pages/                    # Main route pages
│   │   ├── Landing.tsx          # Homepage
│   │   ├── Auth.tsx             # Login/Signup
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Transactions.tsx     # Transaction list & filters
│   │   ├── Predict.tsx          # Fraud prediction form
│   │   ├── Explainability.tsx   # Model explanation
│   │   ├── About.tsx            # About page
│   │   └── NotFound.tsx         # 404 page
│   │
│   ├── hooks/                    # React hooks
│   │   ├── useAuth.tsx          # Authentication context
│   │   ├── useFraudPrediction.ts # Fraud prediction API
│   │   ├── useTransactions.ts   # Transaction CRUD operations
│   │   ├── use-toast.ts         # Toast notifications
│   │   └── use-mobile.tsx       # Mobile detection
│   │
│   ├── components/               # Reusable components
│   │   ├── dashboard/           # Dashboard-specific charts
│   │   │   ├── StatsCard.tsx
│   │   │   ├── TransactionChart.tsx
│   │   │   ├── FraudPieChart.tsx
│   │   │   ├── AnomalyScoreChart.tsx
│   │   │   └── RecentTransactions.tsx
│   │   ├── layout/
│   │   ├── auth/
│   │   ├── ui/                  # ShadCN UI components (pre-built)
│   │   └── NavLink.tsx
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts        # Supabase connection
│   │       └── types.ts         # TypeScript types from Supabase
│   │
│   ├── lib/                      # Utilities
│   ├── App.tsx                   # Main app routing
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
│
├── fraud-api/                    # Python FastAPI Backend
│   ├── app.py                   # Main FastAPI application
│   ├── train_fraud_model.py     # ML model training script
│   ├── fraud_model.pkl          # Trained model (serialized)
│   ├── encoders.pkl             # Label encoders
│   ├── transactions.csv         # Training data
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Docker configuration
│
├── ml model/                     # Alternative ML models folder
│   ├── train_model.py
│   ├── isolation forest/
│   ├── rand forest/
│   ├── xg boost/
│   └── transactions.csv
│
├── supabase/                     # Supabase configuration
│   ├── migrations/              # Database migrations
│   └── functions/               # Edge functions
│       └── fraud-predict/
│
├── package.json                  # NPM dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts               # Vite build config
├── tailwind.config.ts           # Tailwind CSS config
└── README.md                     # Project documentation
```

---

## 🔧 FRONTEND ARCHITECTURE

### **1. APP.TSX - Main Application Entry Point**

```typescript
- QueryClient setup (TanStack React Query)
- Route definitions (7 pages total)
- Auth protection via ProtectedRoute component
- Provider stack: QueryClientProvider → AuthProvider → TooltipProvider → BrowserRouter
```

**Routes:**
- `/` - Landing page (public)
- `/auth` - Login/Signup (public)
- `/dashboard` - Main dashboard (protected)
- `/transactions` - Transaction monitoring (protected)
- `/predict` - Fraud prediction tool (protected)
- `/explainability` - Model explanation (protected)
- `/about` - About page (protected)
- `*` - 404 page (catch-all)

---

### **2. AUTHENTICATION - useAuth.tsx Hook**

**Context Data:**
```typescript
interface AuthContextType {
  user: User | null                           // Current Supabase user
  readableUserId: string | null               // Human-readable user ID
  isLoading: boolean                          // Auth state loading
  signIn: (email, password) => Promise        // Sign in function
  signUp: (email, password) => Promise        // Sign up function
  signOut: () => Promise                      // Sign out function
}
```

**Key Features:**
- Uses Supabase Auth for user management
- Fetches "readable_user_id" from profiles table
- Auto-initializes session on app load
- Listens for auth state changes (login/logout)
- Session persistence across page refreshes

**Error Handling:**
- Uses `.maybeSingle()` for profile queries (returns null if not found)
- Try-catch blocks for error logging
- Type-safe error returns

---

### **3. TRANSACTION MANAGEMENT - useTransactions.ts**

**Three Custom Hooks:**

#### **useTransactions()**
- Fetches all transactions (ordered by created_at DESC)
- Limits to 100 most recent
- Query key: `["transactions"]`

#### **useTransactionStats()**
- Calculates:
  - `total` - Total transaction count
  - `fraud` - Count of fraud transactions
  - `anomaly` - Count of anomalies
  - `normal` - Count of normal transactions
  - `fraudRate` - Percentage of frauds
  - `anomalyRate` - Percentage of anomalies

#### **useCreateTransaction() & useUpdateTransaction()**
- Uses React Query mutations
- Auto-invalidates cache on success
- Shows toast notifications (success/error)
- Supports partial updates to fraud status, risk level, anomaly score

---

### **4. FRAUD PREDICTION - useFraudPrediction.ts**

**Input Structure:**
```typescript
interface TransactionData {
  amount: number
  user_id: string
  transactionTime?: string
  location: string
  deviceType: string
  transactionType: string
  merchantCategory: string
}
```

**Process:**
1. Accepts transaction data from form
2. Builds payload with standardized field names
3. Calls Supabase Edge Function: `analyze-transaction`
4. Returns prediction result with fraud probability
5. Handles errors gracefully with error throwing

---

### **5. PAGES BREAKDOWN**

#### **Dashboard.tsx**
**Components:**
- Navbar
- 4 Stats Cards: Total Transactions, Fraud Detected, Anomalies, Detection Accuracy
- TransactionChart (line/area chart)
- FraudPieChart (pie chart)
- AnomalyScoreChart (distribution chart)
- RecentTransactions (data table)

**State Management:**
- `useTransactionStats()` hook provides stats
- Loader shown while data fetches

#### **Predict.tsx** ⚠️ ISSUES FOUND
**Form Fields:**
- Amount (₹)
- Location (New York, London, Tokyo, Mumbai, Unknown)
- Device Type (Mobile, Desktop, Tablet)
- Transaction Type (Purchase, Transfer, Withdrawal, Payment)
- Merchant Category (Retail, Electronics, Travel, Entertainment, Other)

**Issues:**
1. **Lines 97-138:** Duplicate/unused functions `handlePredict()` and `handleAISubmit()`
   - These are NOT integrated with the main form
   - Hardcoded API endpoints (localhost:8000)
   - Manual encoding mapping for Python API
   - These appear to be test code left behind

2. **Primary form (lines 39-56):** Uses Supabase Edge Function correctly
3. **Result display:** Shows risk assessment, recommendation, probability, confidence, anomaly score, and key factors

#### **Transactions.tsx**
**Features:**
- Search by transaction ID or merchant
- Filter by fraud status (All, Normal, Fraud, Anomaly, Pending)
- Filter by amount ranges (Under ₹70k, ₹70k-₹1.5L, Over ₹1.5L)
- Refresh button to refetch data
- Export button (not yet implemented)
- Responsive table design

**Status Styling:**
```
- normal: Green background
- fraud: Red background
- anomaly: Yellow background
- pending: Gray background
```

---

## 🐍 BACKEND ARCHITECTURE

### **1. FastAPI Application - app.py**

**Model Setup:**
```python
model = joblib.load("fraud_model.pkl")          # XGBoost classifier
encoders = joblib.load("encoders.pkl")          # LabelEncoders for 4 categorical features
```

**Endpoint: POST /predict**

**Input Schema:**
```python
class Transaction(BaseModel):
    amount: float                    # Transaction amount
    location: str                    # Location string
    device_type: str                 # Device type
    transaction_type: str            # Type of transaction
    category: str                    # Merchant category
    irregular_time: int              # Binary: 1 if off-hours (8-22)
    impossible_travel: int           # Binary: 1 if travel speed > 900 km/h
    velocity_30min: int              # Count of transactions in 30 min window
```

**Output:**
```json
{
  "fraud_prediction": 0 or 1,
  "fraud_probability": 0.0 to 1.0
}
```

**Processing:**
1. Convert input to DataFrame
2. Encode categorical features using saved encoders
3. Predict using XGBoost model
4. Return prediction + probability

---

### **2. Model Training - train_fraud_model.py**

**Data Processing Pipeline:**

1. **Load & Parse:**
   - CSV data loading
   - Convert transaction_time to datetime

2. **Feature Engineering (7 features + fraud label):**

   **Time-based:**
   - `hour` - Extracted from transaction_time
   - `irregular_time` - Binary flag for off-hours (before 8 AM or after 10 PM)

   **Location-based:**
   - Hardcoded coordinates for 5 locations
   - Previous location tracking (grouped by user_id)
   - Haversine distance calculation between consecutive transactions
   - `impossible_travel` - Binary flag for speed > 900 km/h

   **Velocity-based:**
   - `velocity_30min` - Count of transactions within 30-minute window

3. **Fraud Label Generation:**
   ```
   final_prob = base_prob (amount/150k) + random_noise + risk_factors
   fraud_label = 1 if final_prob > 0.65 else 0
   
   Risk factors:
   - location_risk: Unknown or Tokyo (+0.25)
   - device_risk: Desktop (+0.15)
   - type_risk: Transfer type (+0.2)
   - time_risk: Irregular time (+0.2)
   - travel_risk: Impossible travel (+0.3)
   - velocity_risk: >3 transactions in 30min (+0.25)
   ```

4. **Encoding:**
   - LabelEncoder for: location, device_type, transaction_type, category
   - Saved to `encoders.pkl`

5. **Model Training:**
   ```python
   XGBClassifier(
     n_estimators=200,
     max_depth=6,
     learning_rate=0.1,
     eval_metric='logloss'
   )
   ```
   - Train/test split: 80/20 with stratification
   - Metrics: Classification report + ROC-AUC
   - Feature importance analysis
   - SHAP explainability

6. **Output:**
   - `fraud_model.pkl` - Trained model
   - `encoders.pkl` - Categorical encoders

---

## 🔌 INTEGRATIONS

### **Supabase Integration**
- **Auth:** User authentication (email/password)
- **Database:** Real-time transactions table
- **Edge Functions:** Cloud functions for prediction
- **Profiles Table:** Stores readable_user_id for each user

### **External Libraries**

**Frontend (package.json):**
- React 18.3.1 + TypeScript
- React Router v6 (routing)
- TanStack React Query (data fetching)
- Supabase JS (auth + db)
- Recharts (charting)
- ShadCN UI (component library)
- Tailwind CSS (styling)
- React Hook Form + Zod (form validation)
- Lucide React (icons)

**Backend (fraud-api):**
- FastAPI (web framework)
- Pandas (data manipulation)
- XGBoost (ML model)
- Scikit-learn (preprocessing)
- Joblib (model serialization)
- SHAP (explainability)

---

## ⚠️ IDENTIFIED ISSUES & BUGS

### **1. Predict.tsx - Dead Code (Lines 97-138)**
**Problem:** Two unused functions that don't integrate with form submission
```typescript
handlePredict()    // Calls localhost:8000 directly
handleAISubmit()   // Manual encoding mapping for Python API
```
**Impact:** Confusing, unmaintained code path  
**Fix:** Remove or properly integrate these functions

### **2. Auth.tsx - Missing signUp Parameters**
**Line 89:** `signUp()` is called with 2 parameters but may need more
```typescript
const { error } = await signUp(email, password, fullName, role);
```
**Issue:** fullName and role parameters may not be handled by actual signUp function  
**Fix:** Update useAuth.tsx signUp signature or remove params

### **3. Import Organization**
**Dashboard.tsx - Line 10-12:** Unused import
```typescript
import { LogIn } from "lucide-react";
```
**Fix:** Remove unused imports

### **4. Dashboard.tsx - Comment Syntax Error**
**Line 26-28:** JSX syntax issue with comment
```typescript
{/* Header */}
   <Navbar/>
}
```
**Fix:** Proper JSX closing:
```typescript
{/* Header */}
<Navbar />
```

### **5. Model Location Coordinates**
**train_fraud_model.py - Line 24-29:** Missing some locations
```python
location_coords = {
    "Paris, FR": ...,
    "Tokyo, JP": ...,
    "New York, US": ...,
    "London, UK": ...,
    "Unknown": (0, 0)
}
```
**Issue:** Predict.tsx offers "Mumbai, IN" but it's not in coordinates  
**Fix:** Add Mumbai coordinates or align locations between frontend/backend

### **6. API Endpoint Mismatch**
**useFraudPrediction.ts:** Calls `analyze-transaction` edge function
**fraud-api/app.py:** Has `/predict` endpoint on different port  
**Issue:** Two different backend systems (Supabase Edge Function vs FastAPI)  
**Fix:** Consolidate to one backend (recommend Supabase Edge Functions)

---

## 📊 DATA FLOW DIAGRAM

```
USER INPUT (Predict.tsx)
    ↓
    ↓ Form: amount, location, device, type, category
    ↓
useFraudPrediction() Hook
    ↓
    ↓ Calls supabase.functions.invoke("analyze-transaction")
    ↓
Supabase Edge Function (analyze-transaction)
    ↓
    ↓ [Routes to Python API OR processes internally]
    ↓
FastAPI /predict Endpoint (app.py)
    ↓
    ├─ Load model from fraud_model.pkl
    ├─ Load encoders from encoders.pkl
    ├─ Encode categorical features
    ├─ Predict fraud (0/1)
    └─ Predict probability (0-1)
    ↓
Response: { fraud_prediction, fraud_probability }
    ↓
setResult() in Predict.tsx
    ↓
Display Results Panel
    ├─ Risk Level (High/Medium/Low)
    ├─ Recommendation (Block/Review/Approve)
    ├─ Probability & Confidence
    ├─ Anomaly Score
    └─ Key Risk Factors
```

---

## 🎯 KEY FEATURES IMPLEMENTED

✅ **Authentication**
- Supabase Auth with email/password
- User context provider
- Protected routes

✅ **Real-time Dashboard**
- Transaction stats (total, fraud, anomaly, normal)
- Multiple chart types (line, pie, distribution)
- Recent transactions table

✅ **Transaction Monitoring**
- Full transaction list with filtering
- Search by ID or merchant
- Status-based filtering
- Amount-range filtering

✅ **Fraud Prediction**
- ML-based prediction form
- Real-time risk assessment
- Probability & confidence scores
- Key risk factors explanation

✅ **Responsive Design**
- Mobile-friendly layouts
- Grid-based component system
- Tailwind CSS utilities

❌ **Not Fully Implemented**
- Explainability page (exists but content missing)
- Export functionality (button without handler)
- Some Edge Function integration unclear

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### **Frontend**
- Built with Vite (fast builds)
- ShadCN UI + Tailwind (lightweight)
- Supabase client (no auth server needed)

### **Backend**
- FastAPI runs on port 8000
- Model files must be in same directory as app.py
- Requires Python + dependencies (requirements.txt)

### **Environment Variables**
- `.env` file needed for Supabase keys
- No hardcoded credentials (good practice)

---

## 📈 NEXT STEPS FOR MODIFICATIONS

When you're ready to make changes, I can help with:

1. **Bug Fixes:** Remove dead code, fix imports, align data models
2. **Feature Addition:** New pages, additional filters, real-time updates
3. **Backend Migration:** Switch between Supabase Edge Functions & FastAPI
4. **Model Updates:** Retrain with new data, add more features
5. **Performance:** Caching, pagination, lazy loading
6. **Security:** Input validation, error boundaries, logging

---

**Ready to tell me what changes you'd like to make!** 👀
