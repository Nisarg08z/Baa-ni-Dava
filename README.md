# Baa ni Dava

A family medicine management application.

## Prerequisites
- Node.js installed on your machine.
- MongoDB installed and running locally, or a Mongo URI in `Server/.env`.

## Setup & Run

### 1. Server (Backend)
Open a terminal in the `Server` directory:
```bash
cd Server
npm install
# Create a .env file if not exists with PORT=5000 and MONGO_URI=...
npm run dev
```
The server will start on http://localhost:5000.

### 2. Client (Frontend)
Open a terminal in the `Client` directory:
```bash
cd Client
npm install
npm run dev
```
The application will open at http://localhost:5173.

## Features
- **Manage Data**: Add Stores and Medicines easily.
- **Select Medicines**: Pick items for the monthly purchase.
- **Generate List**: Download a clean PDF sorted by store.
- **History**: View and re-download past purchase lists.
