# FleetOps Pro – Fleet Management Dashboard

## Live Application

Live URL: [ADD_DEPLOYMENT_URL]

## Demo Credentials

Email: 51ankitkp@gmail.com

Password: test2121

---

# Project Overview

FleetOps Pro is a fleet management dashboard designed for fleet operators to monitor vehicles, inspect trip history, visualize routes on a map, review driver assignments, and track fleet activity from a centralized interface.

The application provides an operations-focused experience with vehicle monitoring, route visualization, trip analytics, authentication, and alert management.

---

# Features Implemented

### Authentication

- User Login
- User Registration
- Forgot Password
- Password Reset Flow
- Supabase Authentication

### Dashboard

- Fleet overview KPIs
- Vehicle inventory sidebar
- Vehicle selection and details
- Driver information panel
- Fleet alerts panel
- Trip analytics
- Recent trips table

### Vehicle Tracking

- Vehicle status monitoring
- Fuel level visualization
- Battery level monitoring
- Last seen tracking
- GPS coordinates tracking

### Route Visualization

- React Leaflet integration
- OpenStreetMap tiles
- Vehicle location markers
- Interactive map popups
- Route polyline rendering from stored route points
- Auto-centering on selected vehicles

### Driver Management

- Driver assignment display
- Driver contact information
- Driver experience information
- Driver status information

### Dispatch Module

- Dispatch creation interface
- Vehicle selection workflow
- Destination and scheduling inputs
- Dispatch preview panel

(Currently implemented as a frontend workflow and ready for backend persistence integration.)

---

# Technology Stack

## Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS

## Maps

- React Leaflet
- OpenStreetMap

## Backend

- Supabase
- PostgreSQL

## Deployment

- Vercel

---

# Database Schema

## Vehicles

Stores fleet vehicle information.

Fields:

- id
- name
- registration_number
- status
- battery_level
- fuel_level
- last_seen
- latitude
- longitude
- driver_id

## Drivers

Stores driver information.

Fields:

- id
- full_name
- phone_number
- license_number
- experience_years
- status

## Trips

Stores trip history and analytics.

Fields:

- id
- vehicle_id
- start_time
- end_time
- distance
- duration_minutes
- avg_speed
- max_speed
- idle_time
- halt_count
- overspeed_count
- start_location
- end_location

## Route Points

Stores route coordinates for map visualization.

Fields:

- id
- trip_id
- latitude
- longitude
- recorded_at

---

# Architecture

The application follows a layered architecture:

Frontend Components

↓

API Utility Layer

↓

Next.js API Routes

↓

Supabase

↓

PostgreSQL

This structure keeps data access separate from presentation logic and improves maintainability.

---

# Backend Setup Notes

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

Application runs at:

```text
http://localhost:3000
```

---

# Map Implementation

The dashboard uses React Leaflet with OpenStreetMap.

Features:

- Vehicle markers rendered from GPS coordinates
- Dynamic viewport adjustment
- Route visualization using stored route points
- Interactive vehicle popups
- Selected vehicle focus mode

---

# AI Usage

AI-assisted development was used during implementation.

## Tools Used

- ChatGPT
- GitHub Copilot

## Areas Assisted

- Database schema planning
- Dashboard architecture
- React component implementation
- API integration
- TypeScript typing
- Supabase integration
- Debugging and troubleshooting
- Route visualization logic

All generated code was reviewed, modified, tested, and integrated manually.

---

# Future Improvements

- Dispatch persistence and backend integration
- Real-time vehicle updates
- Geofencing
- Maintenance scheduling
- Vehicle health monitoring
- Driver performance analytics
- Role-based access control

---
