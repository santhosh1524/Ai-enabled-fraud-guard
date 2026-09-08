# 🛡️ AI-Enabled Financial Fraud Guard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-blue)]()
[![Python](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-3776AB)]()

An intelligent, real-time financial fraud detection engine powered by machine learning algorithms, continuous anomaly scoring, and instant alert dispatching.

---

## 🌟 Features

- ⚡ **Real-Time Transaction Screening**: Evaluates incoming transaction payloads against ML anomaly detection models in sub-millisecond latencies.
- 📊 **Interactive Risk Dashboard**: Provides visual metrics for risk scoring, flagged transactions, and high-frequency risk patterns.
- 🔔 **Instant Alerting Mechanism**: Integrates with notification webhooks to alert compliance and security teams when suspicious activity is detected.
- 🔑 **Rule-Based & ML Hybrid Engine**: Combines deterministic compliance rules with machine learning classification for maximum precision.

---

## 🛠️ Architecture & Tech Stack

```
 ┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
 │   React + Vite  │ ────> │ FastAPI Backend  │ ────> │   ML Pipeline   │
 │   User Interface│ <──── │ REST API Engine  │ <──── │ Scikit-Learn/Py │
 └─────────────────┘       └──────────────────┘       └─────────────────┘
```

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Shadcn UI
- **Backend**: Python, FastAPI, Pandas, Scikit-Learn
- **Database/Storage**: Supabase / SQLite

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+

### 1. Frontend Setup
```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

### 2. Backend & ML Model Execution
```bash
# Run transaction checker script
python check_transactions.py
```

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more details.

---

## 👨‍💻 Author

Developed by **Santhosh Mahalingam** ([@santhosh1524](https://github.com/santhosh1524))
