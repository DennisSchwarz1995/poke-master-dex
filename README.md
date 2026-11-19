# Poke-Master-Dex - Portfolio Project

A professional Angular Pokemon Dex web application with Firebase backend and PokeAPI integration.

## Features

- Google Authentication (Firebase)
- Multiple Pokedex Variants (Living Dex, Shiny Dex, etc.)
- 6000 Pokemon Storage Slots (200 boxes x 30 per box)
- Detailed Pokemon Management
- Pokemon HOME-Style Legality Checking
- Offline Support with Sync Queue
- Multilingual Support for Pokémon (DE, EN, FR, ES, JP)
- All 9 Generations (~1025 Pokemon)

## Tech Stack

- **Angular 20.3.0** (Standalone Components, Zoneless)
- **TypeScript 5.9**
- **Firebase** (Auth + Firestore 11.10.0)
- **PokeAPI v2** (All Generations)
- **TailwindCSS 4.1** (Custom Pokemon Type Colors)
- **@angular/localize** (i18n)
- **@angular/service-worker** (Offline PWA)
- **IndexedDB** (idb 8.0.3 - Offline Cache)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:4200/
```

## Firebase Setup

1. Create Firebase project: https://console.firebase.google.com
2. Enable Authentication -> Google Sign-In
3. Create Firestore Database
4. Add Web App and copy config
5. Create `.env` file (template: `.env.example`)
