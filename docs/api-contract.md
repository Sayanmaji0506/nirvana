# NIRVANA API Contract Documentation
**Northeast Intelligent Routing & Vehicle Accessibility Network Assistant (SIH26002)**

Base URL: `http://localhost:3000` (or `http://<LAN_IP>:3000`)
Prefixes supported: Both `/api/v1/...` and standard root paths `/...`

---

## 1. Authentication & KYC

### POST `/auth/otp/request`
Request a 6-digit OTP code for a phone number. In development, the code is printed to the server terminal.
- **Request Body:**
  ```json
  { "phone": "+919876543210" }
  ```
- **Response (200 OK):**
  ```json
  { "success": true, "phone": "+919876543210", "message": "OTP sent successfully" }
  ```

### POST `/auth/otp/verify`
Verify 6-digit OTP code and receive a signed JWT token.
- **Request Body:**
  ```json
  {
    "phone": "+919876543210",
    "code": "123456",
    "name": "Ratul Sharma",
    "role": "driver"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "user": {
      "id": 1,
      "name": "Ratul Sharma",
      "phone": "+919876543210",
      "role": "driver",
      "kyc_status": "unverified"
    }
  }
  ```

### POST `/auth/kyc/verify`
Mock KYC verification for Driving License, Aadhaar, or DigiLocker (§8).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "kyc_type": "license",
    "license_number": "AS-01-2021-0045892"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Identity and credentials verified successfully",
    "user": { "id": 1, "kyc_status": "verified", "license_number": "AS-01-2021-0045892" }
  }
  ```

---

## 2. Road Segments & Districts

### GET `/roads/status`
Returns road segments with live statuses and PostGIS geometries as GeoJSON.
- **Query Params:** `bbox=minLng,minLat,maxLng,maxLat` (optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "id": 10,
          "geometry": { "type": "LineString", "coordinates": [[91.881, 25.901], [91.891, 25.845]] },
          "properties": {
            "id": 10,
            "name": "NH-6 - Shangbangla Landslide Zone",
            "status": "blocked",
            "risk_score": 85
          }
        }
      ]
    }
  }
  ```

### GET `/districts`
Returns district boundary polygons as GeoJSON.

---

## 3. Route Planning & Dynamic Rerouting

### POST `/routes/plan`
Plans route avoiding `blocked` segments and penalizing `risky` segments.
- **Role Restriction:** Drivers and Officials allowed; Reporters receive 403 Forbidden.
- **Request Body:**
  ```json
  {
    "origin": { "lat": 26.1150, "lng": 91.8210, "name": "Guwahati Khanapara" },
    "destination": { "lat": 25.5720, "lng": 91.8830, "name": "Shillong Police Bazar" },
    "vehicle_type": "truck",
    "user_id": 1
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "routeId": "route_alt_1788454",
      "isAlternate": true,
      "distanceKm": "104.2",
      "durationMin": 185,
      "riskLevel": "Moderate (Bypass Active)",
      "coordinates": [[91.821, 26.115], ...],
      "turnByTurn": ["Depart Guwahati...", "Take East Ri-Bhoi Bypass..."],
      "safeSpots": [{ "name": "Nongpoh Safe Truck Haven", "lat": 25.901, "lng": 91.881 }]
    }
  }
  ```

### GET `/routes/:id/reroute-check`
Re-evaluates an active driving route against current road segment conditions.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "activeRouteValid": false,
      "scenario": "SCENARIO_B_EMERGENCY",
      "hasBlockage": true,
      "blockedSegment": { "name": "NH-6 - Shangbangla Landslide Zone" },
      "alternateFound": true,
      "alternateRoute": { ... }
    }
  }
  ```

---

## 4. Hazard Reports (Offline-First)

### POST `/reports` (Multipart or JSON)
Submit a crowd-sourced hazard report with optional image and voice attachments.
- **Form Fields:** `category`, `description`, `lat`, `lng`, `user_id`
- **Files:** `image` (max 1), `audio` (max 1)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": 12,
      "type": "landslide",
      "description": "Mudslide on NH-6",
      "status": "pending",
      "upvotes": 1,
      "reporter_weight": 2
    }
  }
  ```

### POST `/reports/:id/vote`
Upvote or downvote a report. Reaching 5 weighted net upvotes triggers automatic verification and updates the road segment status to `blocked`.
- **Request Body:** `{ "direction": "up", "user_id": 1 }`

### PATCH `/reports/:id/verify`
Direct verification reserved for `official` accounts. Immediately marks road as `blocked` and broadcasts `emergency-reroute-alert`.
- **Headers:** `Authorization: Bearer <official_token>`

---

## 5. Simulated USSD / SMS Gateway Webhook (§8)

### POST `/webhooks/gateway`
Accepts simulated USSD/SMS text messages.
- **Request Body:**
  ```json
  {
    "phone": "+919876543299",
    "raw_text": "BLOCKED NH6 KM42 Landslide at Shangbangla"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "parsed_command": "REPORT_BLOCKAGE",
    "response_text": "NIRVANA: Report #5 received. Emergency broadcast sent. Stay safe."
  }
  ```

---

## 6. Real-Time Socket.IO Events

| Event Name | Direction | Payload |
|---|---|---|
| `emergency-reroute-alert` | Server ➔ Driver | `{ message, blockedSegment, alternateRoute }` |
| `road-status-update` | Server ➔ All | `{ id, name, status, risk_score }` |
| `new-report` | Server ➔ All | `{ id, type, description, lat, lng, status }` |
| `join-driver` | Driver ➔ Server | `{ userId }` |
