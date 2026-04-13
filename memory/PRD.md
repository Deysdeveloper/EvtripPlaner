# EV Trip Planner - PRD

## Problem Statement
Build a full-stack EV Trip Planner web app with Mapbox map, route planning, weather-aware energy calculations, charging stop suggestions, and energy consumption charts.

## Architecture
- **Backend**: FastAPI (Python) on port 8001
- **Frontend**: React + Tailwind CSS on port 3000
- **Map**: Mapbox GL JS
- **APIs**: Mapbox Directions/Geocoding, OpenWeather

## Core Requirements
- Trip input form (start/end locations, vehicle specs)
- Address autocomplete using Mapbox Geocoding API
- Route display on interactive map
- Energy calculation engine (temp/speed/wind adjustments)
- Results dashboard (distance, ETA, battery %, warnings)
- Charging stop suggestions when battery < 20%
- Energy consumption bar chart (Recharts)
- Dark/Light theme toggle

## What's Been Implemented (Jan 2026)
- [x] FastAPI backend with `/api/calculate-trip` endpoint
- [x] Mapbox Geocoding integration (backend + frontend autocomplete)
- [x] Mapbox Directions API for route calculation
- [x] OpenWeather API for midpoint weather data
- [x] Energy calculation engine with temperature, speed, wind factors
- [x] Interactive Mapbox GL JS map with route, markers, charging stops
- [x] Address autocomplete with debounce, keyboard nav, dropdown
- [x] Results dashboard with stats cards, warnings, status banner
- [x] Energy breakdown bar chart (Recharts)
- [x] Charging stop suggestions with map markers
- [x] Vehicle presets (Tesla Model 3, Nissan Leaf, BMW iX)
- [x] Dark/Light theme toggle
- [x] Swiss & High-Contrast design with Chivo + IBM Plex Sans fonts

## User Personas
- EV owners planning long-distance trips
- Fleet managers optimizing EV routes

## Backlog
- P1: Trip history (save to MongoDB)
- P1: User authentication for saved trips
- P2: Real charging station data integration (e.g., Open Charge Map API)
- P2: Multi-stop route planning
- P3: Elevation data impact on energy calculation
- P3: Share trip via URL
