# 🚦 ParkWise – AI-Powered Parking Intelligence System

> Bengaluru Traffic Command Dashboard for intelligent parking enforcement, hotspot detection, and data-driven deployment planning.

ParkWise is a full-stack analytics and decision-support platform that transforms parking violation records into actionable enforcement insights. It identifies violation hotspots, evaluates data reliability, detects emerging risk zones, and optimizes officer deployment through simulation.

---

## 📌 Problem

Traffic authorities collect large volumes of parking violation data, but converting that data into effective enforcement decisions remains difficult.

ParkWise helps answer critical operational questions:

- Where are the worst parking violation hotspots?
- Which hotspots are most trustworthy?
- Which locations are rapidly getting worse?
- Where should available officers be deployed?
- What impact would additional enforcement have?

---

## ✨ Key Features

### 🚨 Hotspot Detection

Identifies parking violation clusters across Bengaluru using geospatial aggregation techniques.

### 📊 Traffic Impact Index (TII)

Ranks hotspots using multiple contributing factors:

- Density Score (D)
- Severity Score (S)
- Junction Impact Score (J)
- Peak-Hour Concentration Score (P)

Dynamic variance-based weighting is used to calculate the final Traffic Impact Index.

---

### 🛡 Detection Reliability Score (DRS)

Not all violation reports are equally reliable.

ParkWise evaluates validation history at the device level and classifies hotspots into:

- High Confidence
- Medium Confidence
- Low Confidence

This improves trustworthiness and reduces the impact of noisy data.

---

### 📈 Emerging Hotspots

Detects locations where parking violations are increasing significantly compared to historical trends.

This helps authorities proactively intervene before congestion worsens.

---

### 👮 Enforcement Capacity Planner

Generates deployment recommendations based on available enforcement resources.

Example:

```text
Deploy Team 1 → KR Market
Deploy Team 2 → Majestic
Deploy Team 3 → JC Road
```

---

### 🎯 Enforcement Impact Simulator

Estimates the potential reduction in city-wide traffic impact when additional officers are deployed.

Example:

```text
Current City TII: 38.81

Future City TII: 34.02

Improvement: 12.34%
```

---

### 🗺 Interactive Traffic Command Dashboard

Built using Next.js and React Leaflet.

Features:

- Interactive Bengaluru hotspot map
- Hotspot intelligence panel
- Emerging hotspot alerts
- Reliability visualization
- Enforcement simulator
- Deployment planner
- AI recommendation framework (future-ready)

---

## 🏗 System Architecture

```text
Parking Violation Dataset
            │
            ▼
    Analytics Engine
            │
 ┌──────────┼──────────┐
 │          │          │
 ▼          ▼          ▼
Hotspots   DRS     Emerging Trends
            │
            ▼
     Traffic Impact Index
            │
            ▼
      FastAPI Backend
            │
            ▼
     Next.js Dashboard
```

---

## 🛠 Tech Stack

### Backend

- FastAPI
- Pandas
- NumPy
- Pydantic

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- React Query
- React Leaflet
- Recharts
- Lucide React

---

## 📂 Project Structure

```text
ParkWise-Flipkart/
│
├── backend/
│   ├── services/
│   ├── models/
│   ├── cache/
│   └── README.md
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── README.md
│
└── README.md
```

---

## 📊 Dataset

The project analyzes approximately:

```text
298,445 parking violation records
```

covering Bengaluru parking enforcement activity.

⚠️ The dataset is not included in this repository because it exceeds GitHub's file size limits.

Place the dataset inside:

```text
backend/dataset/
```

before running the backend.

---

## 🚀 Running Locally

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000/docs
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 📡 API Endpoints

### Core APIs

```text
GET /health
GET /api/summary
GET /api/hotspots
GET /api/emerging
GET /api/planner
GET /api/simulator
GET /api/dashboard
```

### Debug APIs

```text
GET /api/debug/weights
GET /api/debug/confidence-distribution
GET /api/debug/emerging-stats
```

---

## 🔮 Future Scope

- Real-time violation ingestion
- Traffic camera integration
- Smart parking sensor integration
- WebSocket-based live updates
- Groq-powered AI recommendations
- Predictive hotspot forecasting
- Multi-city deployment support

---

## 📷 Screenshots

Add screenshots here after deployment:

```text
screenshots/dashboard.png
screenshots/map.png
screenshots/simulator.png
screenshots/planner.png
```

---

## 👩‍💻 Author

**Samridhi Dhamija**  
MIT Manipal – Computer Science (AI & ML)

Built using FastAPI, Next.js, React Leaflet, and geospatial analytics to support data-driven parking enforcement decisions.
