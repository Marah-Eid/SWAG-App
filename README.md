<p align="center">
  <img src="https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/frontend-React%20Native-61DAFB?logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/backend-ASP.NET%20Core-512BD4?logo=dotnet&logoColor=white" alt="ASP.NET Core" />
  <img src="https://img.shields.io/badge/database-PostgreSQL-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/status-completed-brightgreen" alt="Status" />
</p>

# SWAG — A Smart Mobile Platform for Automotive Services

SWAG connects car owners with verified spare-part shops, dealerships, and automotive workshops in a single role-based mobile app. Customers can search for vendors, view verified profiles, browse posts and events, find nearby shops, and leave reviews. Vendors get a structured digital channel to publish content, manage their profile, and reach customers directly.

Built as a senior graduation project at **The Hashemite University**, Faculty of Prince Al-Hussein Bin Abdallah II for Information Technology, Software Engineering Department — Academic Year 2025/2026.

---

## Table of Contents

- [Problem & Motivation](#problem--motivation)
- [Features](#features)
- [CarBot — AI Car Assistant](#carbot--ai-car-assistant)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Project Scope & Limitations](#project-scope--limitations)
- [Future Work](#future-work)
- [Team](#team)

---

## Problem & Motivation

Car owners typically rely on physical visits and word-of-mouth to find reliable vendors, while small automotive businesses lack a structured way to reach customers and manage their digital presence. Existing platforms in the region (Autobeeb, PartSouq, Haraj, Speero) each solve part of the problem — but none combine verified business profiles, direct customer–vendor communication, location-based discovery, and a community layer (posts, events, reviews) in one place. SWAG was built to close that gap.

## Features

- **Role-based access** — separate, tailored interfaces for Customer, Vendor, and Admin
- **Verified vendor profiles** — admin approval before a business can publish content
- **Nearby vendor discovery** — real-time geolocation with manual-entry fallback when GPS is unavailable
- **Reviews & ratings** — structured feedback that builds vendor trust
- **Posts & events** — vendors publish updates, promotions, and community events; customers follow, comment, and get real-time push notifications
- **Vehicle management** — customers can save and manage their vehicle information
- **In-app communication** — direct interaction between customers and vendors

## CarBot — AI Car Assistant

CarBot is an AI-powered assistant that lets customers get answers about their specific vehicle.

1. Customer provides their **VIN** (Vehicle Identification Number)
2. The app calls the **NHTSA VIN Decode API** to automatically retrieve make, model, year, and specs
3. Customer is taken to a chat screen and can ask about maintenance, repairs, specs, or troubleshooting
4. The assistant (powered by the **Groq API**, Llama model) responds with full awareness of the customer's exact car
5. Conversations are **saved and bilingual** (auto-detects and replies in English or Arabic)

This added two new use cases to the customer flow: **Use AI Assistant** and **Provide VIN** (an `<<include>>` of the former).

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (JavaScript / JSX) |
| Backend API | ASP.NET Core Web API (C#) |
| Database | PostgreSQL |
| Push Notifications | Expo Notifications |
| Location Services | Lightweight geolocation (distance calculation to nearby vendors) |
| AI Assistant | NHTSA VIN Decode API + Groq API (Llama model) |
| UI Design | Figma |
| UML Modeling | StarUML |
| Project Management | Asana |
| Version Control | Git / GitHub |
| Testing | Jest (frontend), Postman + Newman (API), xUnit (backend), GitHub Actions (CI) |

## Architecture

SWAG follows a **layered architecture**:

- **Presentation Layer** — Customer and Vendor React Native apps
- **Backend Layer** — modular services for authentication, profiles, content, feeds, reviews, location, and notifications (ASP.NET Core Web API)
- **Data Layer** — unified data access component connected to a central PostgreSQL database
- **External Services** — geolocation and Expo push notifications

**Deployment:** the Android app communicates with the backend over HTTPS/REST APIs; the backend communicates with PostgreSQL via SQL connections. This allows horizontal scaling of backend instances independent of the client.

Core entities: `User` (superclass) → `Customer`, `Vendor`, `Admin`, with supporting entities `Vehicle`, `Content` (`Post`, `Event`), `Review`, `Feedback`, and a `Follow` relationship between Customers and Vendors.

## Getting Started

> Update the commands below to match your actual repo structure/scripts.

### Prerequisites
- Node.js & npm/yarn
- .NET SDK 8+
- PostgreSQL
- Expo CLI (for the React Native app)

### Backend (ASP.NET Core)
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

### Mobile App (React Native / Expo)
```bash
cd mobile
npm install
npx expo start
```

Configure your API base URL, database connection string, and Groq/NHTSA API keys in the relevant `.env` / `appsettings.json` files before running.

## Testing

A combined testing strategy was used:

- **Black-box testing** — functional behavior validated against use cases
- **White-box testing** — internal backend logic verified via statement, branch, and path coverage
- **Automated testing** — Jest (frontend), Postman/Newman (API), xUnit (backend), run on every commit via GitHub Actions

All representative test cases (authentication, vendor profile updates, nearby-shop discovery, post creation, feed interactions, vehicle management) passed.

## Project Scope & Limitations

- Android-only (no iOS yet)
- No in-app online payment — transactions remain offline
- Operates within Amman, Jordan — no international logistics

## Future Work

- AI-driven vendor recommendations and predictive maintenance insights
- Smart customer–vendor matching based on vehicle and inquiry history
- Cross-platform expansion to iOS
- In-app online payments
- VIN-based part matching for precise compatibility
- Vendor analytics dashboards and integrations with insurance, inspection, and scheduling services

## Team

| Name | Student ID |
|---|---|
| Zaid Mostafa Shareef | 2239726 |
| Marah Eid Al-Naimat | 2231597 |
| Leen Nader Assayed | 2231939 |
| Layan Ebrahim Abu Al-Joud | 2232544 |

**Supervised by:** Dr. Mohammad Zarour
**Institution:** The Hashemite University — Software Engineering Department

---

<p align="center"><em>SWAG — connecting car owners with trusted automotive vendors.</em></p>
