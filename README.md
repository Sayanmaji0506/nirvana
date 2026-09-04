# NIRVANA
**Northeast Intelligent Routing & Vehicle Accessibility Network Assistant**
*Smart India Hackathon (SIH) Problem Statement: SIH26002*

NIRVANA is an offline-first, AI-assisted smart logistics and accessibility platform purpose-built for the North Eastern Region (NER) of India. It dynamically monitors mountain corridors (such as NH-27, NH-6, and NH-2 between Assam and Meghalaya), predicts weather-triggered landslides and road hazards, provides automated dynamic rerouting via Socket.IO, and supports emergency USSD/SMS gateway fallbacks during low-connectivity conditions.

---

## 🏗️ Monorepo Architecture

```
nirvana/
├── apps/
│   └── mobile/              # React Native (Expo) app (Android / iOS / Web)
├── services/
│   ├── api/                 # Node.js + Express + Knex + PostGIS + Socket.IO
│   └── risk-engine/         # Python FastAPI rule-based risk microservice & XGBoost scaffold
├── infra/
│   ├── docker-compose.yml   # PostGIS (port 5433), Redis (port 6379), Risk-Engine (port 8000)
│   ├── postgres/            # PostGIS initialization SQL
│   ├── graphhopper/         # GraphHopper custom vehicle routing config
│   └── osm/                 # NER OSM extract downloader
└── docs/
    ├── api-contract.md      # Full API endpoints and Socket.IO specification
    └── DEMO_SCRIPT.md       # 3-minute hackathon judge walkthrough
```

---

## 🚀 Quickstart (Local Dev Environment)

### Step 1: Start Infrastructure (Docker Compose)
Ensure Docker Desktop is running, then start the containers:
```bash
cd infra
docker compose up -d
```
This launches:
- **PostGIS 16**: Port `5433` (database: `nirvana`, user: `nirvana`)
- **Redis 7**: Port `6379`
- **AI Risk Engine (FastAPI)**: Port `8000`

### Step 2: Run Database Migrations & Seeds
Populate PostGIS with realistic NER districts, 18 road segments, and sample users:
```bash
cd ../services/api
npm run migrate
npm run seed
```

### Step 3: Start the Backend API
```bash
npm run dev
```
The API server starts on **`http://localhost:3000`** with live Socket.IO support.

### Step 4: Start the Mobile App
In another terminal:
```bash
cd ../../apps/mobile
npx expo start
```
- Press **`a`** to open in Android Emulator
- Press **`w`** to open in Web Browser
- Or scan the QR code with **Expo Go** on a physical phone connected to the same Wi-Fi.

---

## 🛡️ Key Features

1. **Role Gating (Server-Enforced):**
   - **Drivers:** Route planning, live mountain turn-by-turn guidance, dynamic alternate rerouting, safe haven discovery.
   - **Reporters:** Map observation, community hazard submission, upvoting/downvoting. Route driving is strictly restricted.
   - **Officials:** Direct verification of disruption reports and automated highway blockage broadcasts.

2. **Offline-First Reporting Engine:**
   - Reports save instantly to local storage (`AsyncStorage` / SQLite) with optional audio and image notes.
   - Background worker automatically flushes queued reports to the API when internet connectivity resumes.

3. **Dynamic Emergency Rerouting (Scenario A / B):**
   - **Scenario A (Clear):** Standard navigation along NH-6.
   - **Scenario B (Blockage):** When a landslide or obstruction is verified, Socket.IO pushes an alert to the driver. If an alternate exists (e.g. East Ri-Bhoi Bypass), the driver can accept with 1 tap; if all paths are blocked, designated safe havens are displayed.

4. **Simulated USSD / SMS Gateway Webhook (`*566#`):**
   - In areas with zero data signal, drivers can send an SMS or USSD string like `BLOCKED NH6 KM42`. The gateway webhook (`POST /webhooks/gateway`) parses the text, logs the incident, and broadcasts it across the network.

---

## 🧪 Testing the 3-Minute Demo Flow

Follow the step-by-step walkthrough in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).
