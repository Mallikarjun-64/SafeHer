
# Women Safety Alert System — Build Plan

A modern, responsive web app focused on fast SOS, live location, and trusted-contact alerts. Built with React + Lovable Cloud (auth, database, edge functions, real-time).

## Visual Design
- **Theme**: Trust & calm — deep purple/teal primary with strong red SOS accent for urgency.
- **Typography**: Clean sans-serif (Inter), large readable buttons, high contrast.
- **Layout**: Mobile-first, large tap targets, sticky SOS button always reachable.
- **Tone**: Reassuring, empowering, professional.

## Roles
1. **User (Woman)** — sends SOS, manages guardians, views alert history
2. **Guardian** — receives alerts, views live location on map, acknowledges
3. **Police/Authority** — sees all active alerts, updates response status
4. **Admin** — manages users, guardians, police stations, monitors system

## Pages & Features

### Public
- **Landing page** — Hero, problem/solution, features, how-it-works, CTA to sign up
- **Login / Signup** — Email + password, role selection (User/Guardian/Police), forgot password

### User Dashboard
- **Big SOS Button** — One-click alert; captures GPS location, sends to all guardians + nearest police, logs in DB
- **Quick actions** — Fake call, share live location link, panic timer
- **Trusted Contacts** — Add/edit/remove guardians (name, phone, email, relation)
- **Alert History** — Past alerts with timestamp, location (mini-map), status, who responded
- **Profile** — Personal info, emergency medical notes, primary address

### Guardian Dashboard
- **Active alerts** from linked users with live map (location updates in real-time)
- **Acknowledge** button + notes
- **Linked users** list

### Police Dashboard
- **Live alerts feed** — sortable by time/proximity, with user details and map
- **Status updates** — Pending → Responded → In Progress → Resolved
- **Alert detail view** — full user info, guardians, history

### Admin Panel
- **Users management** — verify, approve, block
- **Police stations & helplines** — CRUD
- **All alerts monitor** — filters, export
- **Reports** — counts, response times, simple charts

## Backend (Lovable Cloud)
- **Auth**: Email/password with role assignment via separate `user_roles` table (secure, no privilege escalation)
- **Tables**: profiles, user_roles, guardians, alerts, alert_updates, police_stations, helplines
- **Real-time**: Subscribe to `alerts` table so guardians/police see new SOS instantly
- **Edge function**: `send-sos` — creates alert, captures location, notifies guardians (in-app + email)
- **Email notifications**: Guardian alert emails via Resend (will request API key when needed)

## Key UX Details
- Sticky floating SOS button on all user pages
- 3-second countdown to cancel accidental SOS
- Geolocation permission prompt on first login
- Toast confirmations for all critical actions
- Fully responsive — works great on phones

## Out of Scope (Phase 2)
- Real SMS via Twilio (can add later with API key)
- Voice-activated SOS, wearable integration, mobile native app

Once approved, I'll build it step-by-step starting with auth + database schema, then the User SOS flow, then Guardian/Police/Admin dashboards.
