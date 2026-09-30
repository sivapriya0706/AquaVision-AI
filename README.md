# AquaVision AI — Intelligent Water Can Supply Chain & Edge Management System

> **A smart, edge-ready water can distribution and quality assurance platform with role-based portals for Customers, Delivery Partners, and Administrators.**

---

## 📌 Executive Summary

**AquaVision AI** solves a critical operational challenge in urban water distribution: fragmented communication, opaque delivery tracking, lost empty can inventory, delayed refills, and subjective can damage claims. 

By unifying **Consumers**, **Logistics Delivery Partners**, and **Operations Administrators** onto a single intelligent platform, AquaVision AI combines operational workflows with **machine learning models** and a **portable ONNX edge deployment architecture**.

---

## 🏗️ System Architecture & Workflow

```
                             ┌───────────────────────────────┐
                             │       AquaVision Client       │
                             │  (React 19 + Vite Frontend)   │
                             └──────────────┬────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
      ┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
      │  Customer Portal │        │  Partner Portal  │        │   Admin Console  │
      │ • Refill Reorder │        │ • Assigned Drops │        │ • Fleet Manager  │
      │ • Live Stepper   │        │ • Route Sequence │        │ • Dispatch Queue │
      │ • Damage Upload  │        │ • Empty Returns  │        │ • Photo Review   │
      │ • AI Forecast    │        │ • Delivery Log   │        │ • AI Telemetry   │
      └────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
               │                           │                           │
               └───────────────────────────┼───────────────────────────┘
                                           │ REST APIs / JSON (Port 5000)
                                           ▼
                             ┌───────────────────────────────┐
                             │     Express.js API Engine     │
                             │    (server/server.js)         │
                             │ • In-Memory / Demo Store      │
                             │ • Multer Photo Upload Storage │
                             │ • Python ChildProcess Runner  │
                             └──────────────┬────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   Python AI Engine        │                 │  Portable Edge Runtime    │
       │   (ai/.venv Python 3.14)  │                 │  (ONNX Opset 17)          │
       ├───────────────────────────┤                 ├───────────────────────────┤
       │ • predict_refill.py       │                 │ • refill_model.onnx       │
       │ • predict_demand.py       │                 │ • onnxruntime             │
       │ • predict_payment.py      │                 │ • Provider: CPU Provider  │
       │ • Random Forest Models    │                 │ • Target: Snapdragon NPU  │
       └───────────────────────────┘                 └───────────────────────────┘
```

---

## 👥 Three Dedicated User Portals

### 1. Customer Portal
* **Dashboard Overview**: Instant visibility of total cans, active deliveries, AI expected refill date, and outstanding dues.
* **My Water Cans**: Real-time status cards (Full, In Use, Empty, Damaged) with batch codes and container condition.
* **My Orders**: Complete history of refill orders with live status badges.
* **Delivery Status**: 5-stage visual milestone stepper:
  $$\text{Order Placed} \longrightarrow \text{Confirmed} \longrightarrow \text{Driver Assigned} \longrightarrow \text{Out for Delivery} \longrightarrow \text{Delivered}$$
* **Refill / Reorder**: Interactive ordering with dynamic can counter, scheduling slots, and automated price calculation (₹80/can).
* **Can Damage Report**: Attach photographic evidence and specify defect type (Crack, Dent, Leak, Valve defect).
* **Payments & Billing**: Current balance, billing history, and interactive sandbox digital payment modal.
* **Notifications**: Activity alerts on AI refill reminders and dispatch updates.
* **Profile**: Editable contact and delivery address settings.

---

### 2. Delivery Partner Portal
* **Driver Dashboard**: Today's assigned deliveries, completed count, pending count, and empty can collection target.
* **Today's Deliveries / Assigned Orders**: Customer address, phone, can count, and status toggles (*Mark Out for Delivery*, *Mark Delivered*).
* **Delivery Route Schedule**: Sequential stop manifest (Depot $\rightarrow$ Customer $1 \rightarrow$ Customer $2 \rightarrow$ Depot return).
  > **Note**: Uses simulated dispatch ordering; does not claim live GPS satellite tracking.
* **Empty Can Collection Log**: Form and audit trail to log empty cans retrieved during customer handovers.
* **Damage Reports Manifest**: View route damage reports so drivers know which cans require quarantine pickup.
* **Delivery History**: Audit log of verified deliveries with empty can reconciliation counts.
* **Driver Profile**: Vehicle number, cluster corridor, and driver star rating.

---

### 3. Administrator Command Center
* **Operational KPIs**: Total customers, fleet containers, today's orders, in-transit deliveries, pending damage reviews, and unpaid balances.
* **Water Can Inventory**: Complete fleet registry with status filters (*Full, In Use, Empty, Damaged, Maintenance*) and container registration modal.
* **Order Fulfillment Console**: Order status transitions and delivery partner assignment.
* **Delivery & Logistics Management**: Live driver capacity tracking and unallocated order dispatch queue.
* **Customer & Driver Directories**: Contact registries, subscription tiers, and performance metrics.
* **Damage Report Moderation**: Manual QA verification console to inspect uploaded customer photos, approve replacements, or reject invalid claims.
* **Payments & Revenue Ledger**: Financial audits, collection velocity, and digital vs. cash breakdowns.
* **AI Insights Center**: Dedicated telemetry dashboard for the 3 machine learning models.
* **Reports & Analytics**: Can condition distributions, weekly demand velocity charts, and CSV report export.
* **Settings & Demo State Controls**: Configurable pricing, hub parameters, and **1-Click Reset Demo Data** button.

---

## 🧠 Artificial Intelligence & Edge Deployment

### 1. Smart Refill Prediction
* **Script**: `ai/predict_refill.py`
* **Artifacts**: `ai/models/refill_model.pkl` & `ai/models/refill_model.onnx`
* **Algorithm**: Random Forest Classifier
* **Features**: `avg_days_between_refills`, `total_refills`, `days_since_last_refill`
* **Output**: Binary classification (`1` = *Refill likely needed soon*, `0` = *Refill not needed yet*).
* **Dataset Note**: Trained on synthetic consumption intervals (`ai/refill_data.csv`) for prototype demonstration.

### 2. Bottling Plant Demand Forecast
* **Script**: `ai/predict_demand.py`
* **Artifacts**: `ai/models/demand_model.pkl`
* **Algorithm**: Random Forest Regressor
* **Features**: `orders` (active queue), `festival` (0/1 holiday spike), `temperature` (°C summer coefficient).
* **Output**: Forecasted daily can volume (e.g., *Predicted Demand: 57 cans*).

### 3. Payment Intelligence
* **Script**: `ai/predict_payment.py`
* **Artifacts**: `ai/models/payment_model.pkl`
* **Algorithm**: Random Forest Risk Classifier
* **Features**: `total_bill`, `amount_paid`, `amount_pending`, `days_overdue`.
* **Output**: Risk classification & actionable reminder prompt (*High payment risk • Automated reminder recommended*).

---

## ⚡ Portable ONNX Runtime & Qualcomm Snapdragon NPU Positioning

```
[ Scikit-Learn Model ]
         │
         ▼ (via skl2onnx, opset 17)
[ refill_model.onnx ] ─────────────── Standardized Portable Format
         │
         ├─────────────────────────────────────────────┐
         ▼                                             ▼
[ Current Host Execution ]                    [ Target Edge Architecture ]
• Intel x64 CPU Host                          • Qualcomm Snapdragon NPU
• onnxruntime (CPUExecutionProvider)          • Qualcomm AI Hub / QNN Execution Provider
• Validated on dev laptop                     • Ultra-low power IoT dispensers & tablets
```

* **Standardized Intermediate Representation**: The refill model was converted to ONNX (Opset 17) using `skl2onnx` (`ai/convert_refill_to_onnx.py`).
* **Current Execution Host**: The system runs on an **Intel x86_64 CPU** using `onnxruntime` with `CPUExecutionProvider` (`ai/test_refill_onnx.py`).
* **Qualcomm Snapdragon Target Positioning**:
  * Qualcomm Snapdragon NPU via **QNN Execution Provider (Qualcomm Neural Network)** is the intended target architecture for deploying on low-power IoT water dispensers and field logistics tablets.
  * **Strict Engineering Transparency**: No fabricated Snapdragon NPU hardware benchmarks or simulated acceleration metrics are reported. ONNX is deployed as the cross-platform edge bridge.

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Vanilla CSS (Custom Design System), Plus Jakarta Sans |
| **Backend** | Node.js, Express.js 5, Multer (file uploads), CORS, ChildProcess Spawn |
| **AI / ML** | Python 3.14, Scikit-Learn, ONNX Runtime (`onnxruntime`), `joblib`, `pandas`, `skl2onnx` |
| **Data Layer** | In-Memory JSON store (`server/data/store.js`) with realistic mock data |
| **Target Hardware** | Qualcomm Snapdragon NPU via Qualcomm AI Hub (Target path) |

---

## 🚀 Setup & Execution Guide

### Prerequisites
* **Node.js**: v18+ or v20+ installed
* **Python**: Python 3.10+ (virtual environment configured in `ai/.venv`)

---

### Step 1: Start Backend Server
From the repository root:
```bash
# Navigate to server
cd server

# Install dependencies (if not already installed)
npm install

# Start backend server (runs on http://localhost:5000)
node server.js
```

---

### Step 2: Start Frontend Application
In a separate terminal window:
```bash
# Navigate to client
cd client

# Install dependencies (if not already installed)
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

### Step 3: Access the Application
Open your web browser and navigate to:
**`http://localhost:5173/`**

---

## 🔑 Demo Credentials & Instant 1-Click Login

The login portal features **1-Click Demo Access** buttons for instant evaluation during presentations:

| Role | Name | Email | Default Focus |
|---|---|---|---|
| **Customer** | Aravind Kumar | `customer@aquavision.ai` | Ordering refills, tracking delivery, damage report upload |
| **Delivery Partner** | Ramesh Babu | `partner@aquavision.ai` | Route schedule, marking delivered, empty can collection |
| **Administrator** | Dr. Rajesh Iyer | `admin@aquavision.ai` | Fleet inventory, dispatching drivers, photo QA verification, AI insights |

> **Pro-Tip for Presentations**: Once logged in, use the **"⚡ Switch Role"** button in the top navigation bar to seamlessly transition between Customer, Delivery Partner, and Admin views in 1 click!

---

## 📋 Limitations & Roadmap

### Current Limitations
1. **Synthetic Training Data**: AI models are trained on generated demo datasets to validate end-to-end integration.
2. **Simulated Route Sequencing**: Route manifests organize stops sequentially without live satellite GPS telemetry.
3. **Sandbox Payment Processing**: Digital payment is an interactive simulation without real banking webhooks.
4. **Local Photo Storage**: Uploaded damage photos are stored in `server/uploads/` on the local file system.

### Future Roadmap
* Integration with cloud storage (AWS S3 / Google Cloud Storage) for photographic evidence.
* Qualcomm AI Hub hardware deployment on Snapdragon X Elite and Snapdragon IoT edge gateways.
* Real-time GPS driver tracking using OpenStreetMap / Mapbox.
* Production database binding (MongoDB / PostgreSQL) using the modular data store interface.
