# NIRVANA 3-Minute Hackathon Demo Script (SIH26002)

This walkthrough demonstrates the complete offline-first smart logistics, dynamic rerouting, and crowd-sourced hazard verification platform for Northeast India.

---

## Prerequisites (30 Seconds Setup)
1. **Infra running:**
   ```bash
   cd infra && docker compose up -d
   ```
2. **API running:**
   ```bash
   cd services/api && npm run dev
   ```
3. **Mobile app running:**
   ```bash
   cd apps/mobile && npx expo start
   ```

---

## Phase 1: Authentication & KYC Verification (45 Seconds)
1. Open the NIRVANA Mobile App.
2. Tap **"Sign up as Driver"**.
3. Enter Name (`Ratul Sharma`) and Mobile (`+919876543210`). Tap **"Request OTP Code"**.
4. Enter Demo OTP: **`123456`** and tap **"Verify OTP"**.
5. On the KYC Screen, verify your Driving License (`AS-01-2021-0045892`) or tap **"Verify with DigiLocker"**.
6. **Result:** Identity is verified and you are routed to the **Central Dashboard** populated with real PostGIS road segments (Green = Open, Amber = Risky, Red = Blocked).

---

## Phase 2: Route Planning & Drive Mode (45 Seconds)
1. View the corridor: **Guwahati Khanapara ➔ Shillong Police Bazar (NH-6)**.
2. Notice the distance (104.2 km) and mountain time estimate (185 mins).
3. Tap **"SELECT ROUTE ➔ START DRIVE"**.
4. **Result:** UI transforms into stripped-down **Drive Mode**:
   - Navigation chrome disappears.
   - Green pulsating **"LIVE SYNC ON"** badge appears.
   - Turn-by-turn guidance displays next mountain curve.
   - Bottom bar shows only location pin, next step, and red **STOP DRIVE** button.

---

## Phase 3: Simulated Road Blockage & Dynamic Reroute (45 Seconds)
Simulate an emergency incident on the active highway corridor.

### Option A: Via Terminal (Simulating USSD/SMS fallback)
Open a terminal and run:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/webhooks/gateway" -Method Post -ContentType "application/json" -Body '{"phone":"+919876543299","raw_text":"BLOCKED NH6 KM42 Landslide at Shangbangla"}' | ConvertTo-Json
```

### Option B: Via Reporter Mode or Quick Report Button
Tap the red **"🚨 REPORT"** button in the app:
- Category: **Landslide**
- Note: *"Severe mudslide blocking both lanes after heavy monsoon rainfall"*
- Tap **"Submit & Broadcast Report"**

### Watch the Real-Time Event:
1. Backend verifies report and triggers `emergency-reroute-alert` over **Socket.IO**.
2. **The Driver's app immediately fires the blue "HAZARD / BLOCKAGE DETECTED" popup**:
   - Details: *Segment 'NH-6 - Shangbangla Landslide Zone' is BLOCKED!*
   - Offers: *East Ri-Bhoi Bypass Diversion (104.2 km, avoids landslide hotspot)*
3. Tap **"✓ Accept Alternate Route"**.
4. **Result:** The route on the map dynamically transitions to the purple bypass line, and navigation recalculates safely around the blockage!

---

## Phase 4: Role-Based Gating & Verification (30 Seconds)
1. Tap the red **"STOP DRIVE"** button to return to the Central Dashboard.
2. Open the Hamburger menu (☰) ➔ Tap **"Log Out"**.
3. Tap **"Sign up as Reporter"** and log in.
4. Try tapping **"SELECT ROUTE ➔ START DRIVE"**:
   - Notice the button is locked with the notice:
   *"Reporter accounts are restricted to map observation and hazard reporting. Route planning requires Driver status."*
5. Tap **"Hazard Hub"** to view the **PENDING** vs **VERIFIED** community tabs and test upvoting/downvoting crowd-sourced reports.

---

## Definition of Done Verification
- ✅ **Offline-first reporting:** Reports save immediately to local storage and sync in background.
- ✅ **PostGIS Data:** Live GeoJSON road features displayed with green/amber/red status colors.
- ✅ **Server-Side Role Gating:** Drivers navigate; Reporters are strictly restricted to reporting.
- ✅ **Real-Time Dynamic Rerouting:** Socket.IO pushes emergency alerts and calculates alternate diversions.
- ✅ **SMS/USSD Webhook:** `POST /webhooks/gateway` parses text messages into active reports.
- ✅ **Zero Cloud Dependencies:** Entire stack runs locally on Docker + Node.js.
