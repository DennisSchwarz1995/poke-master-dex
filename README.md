# Pokémon Dex - Portfolio Project

Eine professionelle Angular Pokémon Dex Webapplikation mit Firebase-Backend und PokéAPI-Integration.

## 🚀 Features

- ✅ Google Authentication (Firebase)
- ✅ Multiple Pokédex Variants (Living Dex, Shiny Dex, etc.)
- ✅ 6000 Pokémon Storage Slots (200 Boxen × 30 pro Box)
- ✅ Detailliertes Pokémon-Management
- ✅ Pokémon HOME-Style Legality Checking
- ✅ Offline-Support mit Sync-Queue
- ✅ Mehrsprachigkeit (DE, EN, FR, ES, JP)
- ✅ Alle 9 Generationen (~1025 Pokémon)

## 🛠️ Tech Stack

- **Angular 20.3.0** (Standalone Components, Zoneless)
- **TypeScript 5.9**
- **Firebase** (Auth + Firestore 11.10.0)
- **PokéAPI v2** (Alle Generationen)
- **TailwindCSS 4.1** (Custom Pokémon Type Colors)
- **@angular/localize** (i18n)
- **@angular/service-worker** (Offline PWA)
- **IndexedDB** (idb 8.0.3 - Offline Cache)

## 📦 Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm start

# Auf http://localhost:4200/ öffnen
```

## ⚙️ Firebase Setup

1. Firebase Projekt erstellen: https://console.firebase.google.com
2. Authentication → Google Sign-In aktivieren
3. Firestore Database erstellen
4. Web App hinzufügen und Config kopieren
5. Erstelle `.env` Datei (Vorlage: `.env.example`)

## 📁 Projektstruktur

```
src/app/
├── core/                 # Singleton Services
│   ├── auth/            # Authentication
│   ├── api/             # API Services
│   └── state/           # State Management
├── features/            # Feature Modules
│   ├── auth/           # Login, Profile
│   ├── pokedex/        # Box View, Pokemon Detail
│   └── dashboard/      # Main Dashboard
└── shared/              # Wiederverwendbare Components
    ├── components/
    ├── pipes/
    ├── directives/
    └── models/
```

## 🌍 Unterstützte Sprachen

- 🇩🇪 Deutsch
- 🇬🇧 English
- 🇫🇷 Français
- 🇪🇸 Español
- 🇯🇵 日本語

## 🧪 Testing

```bash
# Unit Tests
npm test

# E2E Tests
npm run e2e
```

## 📝 Build

```bash
# Production Build
npm run build

# Build Output: dist/
```

## 📄 License

© 2026 Dennis Schwarz - Portfolio Project
