import os
import math
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

MAPBOX_API_KEY = os.environ.get("MAPBOX_API_KEY")
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")

app = FastAPI(title="EV Trip Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TripRequest(BaseModel):
    start: str
    end: str
    batteryCapacity: float
    efficiency: float
    initialCharge: float


class ChargingStop(BaseModel):
    name: str
    location: List[float]
    distanceFromStart: float
    batteryAtStop: float


class TripResponse(BaseModel):
    distance: float
    eta: str
    temperature: float
    windSpeed: float
    energyRequired: float
    finalCharge: float
    isTripPossible: bool
    routeGeometry: Optional[dict] = None
    startCoords: Optional[List[float]] = None
    endCoords: Optional[List[float]] = None
    chargingStops: Optional[List[ChargingStop]] = None
    energyBreakdown: Optional[dict] = None
    warnings: Optional[List[str]] = None


async def geocode_location(location: str) -> dict:
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{location}.json"
    params = {"access_token": MAPBOX_API_KEY, "limit": 1}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=15)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Geocoding failed for '{location}'")
        data = resp.json()
        if not data.get("features"):
            raise HTTPException(status_code=400, detail=f"Location '{location}' not found")
        coords = data["features"][0]["center"]
        name = data["features"][0]["place_name"]
        return {"coords": coords, "name": name}


async def get_route(start_coords: list, end_coords: list) -> dict:
    coords_str = f"{start_coords[0]},{start_coords[1]};{end_coords[0]},{end_coords[1]}"
    url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{coords_str}"
    params = {
        "access_token": MAPBOX_API_KEY,
        "geometries": "geojson",
        "overview": "full",
        "steps": "true",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=15)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Route calculation failed")
        data = resp.json()
        if not data.get("routes"):
            raise HTTPException(status_code=400, detail="No route found between locations")
        route = data["routes"][0]
        return {
            "distance_km": route["distance"] / 1000,
            "duration_seconds": route["duration"],
            "geometry": route["geometry"],
        }


async def get_weather(lat: float, lon: float) -> dict:
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=15)
        if resp.status_code != 200:
            return {"temperature": 20, "wind_speed": 0, "description": "Unknown"}
        data = resp.json()
        return {
            "temperature": data["main"]["temp"],
            "wind_speed": data["wind"]["speed"],
            "description": data["weather"][0]["description"] if data.get("weather") else "Unknown",
        }


def calculate_energy(distance_km: float, efficiency: float, temperature: float, wind_speed: float) -> dict:
    base_energy = distance_km * efficiency

    temp_factor = 1.0
    if temperature < 10:
        temp_factor = 1.25
    elif temperature < 20:
        temp_factor = 1.10

    speed_factor = 1.15

    wind_factor = 1.0
    if wind_speed > 20:
        wind_factor = 1.10
    elif wind_speed > 10:
        wind_factor = 1.05

    total_energy = base_energy * temp_factor * speed_factor * wind_factor

    return {
        "base_energy": round(base_energy, 2),
        "temp_factor": temp_factor,
        "speed_factor": speed_factor,
        "wind_factor": wind_factor,
        "total_energy": round(total_energy, 2),
        "temp_adjustment": round(base_energy * (temp_factor - 1), 2),
        "speed_adjustment": round(base_energy * temp_factor * (speed_factor - 1), 2),
        "wind_adjustment": round(base_energy * temp_factor * speed_factor * (wind_factor - 1), 2),
    }


def suggest_charging_stops(distance_km: float, battery_capacity: float, efficiency: float,
                           initial_charge: float, energy_required: float,
                           route_geometry: dict) -> list:
    available_energy = battery_capacity * (initial_charge / 100)
    if available_energy >= energy_required:
        return []

    stops = []
    coords = route_geometry.get("coordinates", [])
    if not coords:
        return []

    range_km = available_energy / efficiency
    safe_range = range_km * 0.8

    total_stops = math.ceil(distance_km / safe_range) - 1
    if total_stops <= 0:
        return []

    for i in range(1, total_stops + 1):
        fraction = (i * safe_range) / distance_km
        fraction = min(fraction, 0.95)
        idx = int(fraction * (len(coords) - 1))
        coord = coords[idx]
        battery_at_stop = max(0, (initial_charge - (i * safe_range * efficiency / battery_capacity * 100)))
        stops.append(ChargingStop(
            name=f"Charging Stop {i}",
            location=coord,
            distanceFromStart=round(i * safe_range, 1),
            batteryAtStop=round(max(battery_at_stop, 5), 1),
        ))

    return stops


def format_duration(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    if hours > 0:
        return f"{hours}h {minutes}min"
    return f"{minutes}min"


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "EV Trip Planner API"}


@app.post("/api/calculate-trip", response_model=TripResponse)
async def calculate_trip(trip: TripRequest):
    if not MAPBOX_API_KEY:
        raise HTTPException(status_code=500, detail="Mapbox API key not configured")
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenWeather API key not configured")

    start_geo = await geocode_location(trip.start)
    end_geo = await geocode_location(trip.end)

    route = await get_route(start_geo["coords"], end_geo["coords"])

    mid_coords = route["geometry"]["coordinates"][len(route["geometry"]["coordinates"]) // 2]
    weather = await get_weather(mid_coords[1], mid_coords[0])

    energy_data = calculate_energy(
        route["distance_km"],
        trip.efficiency,
        weather["temperature"],
        weather["wind_speed"],
    )

    available_energy = trip.batteryCapacity * (trip.initialCharge / 100)
    remaining_energy = available_energy - energy_data["total_energy"]
    final_charge = (remaining_energy / trip.batteryCapacity) * 100
    is_trip_possible = final_charge > 0

    warnings = []
    if final_charge < 0:
        warnings.append("Insufficient battery! You need to charge during the trip.")
    elif final_charge < 20:
        warnings.append("Low battery warning: You'll arrive with less than 20% charge.")
    if weather["temperature"] < 10:
        warnings.append("Cold weather detected. Battery efficiency reduced by ~25%.")
    elif weather["temperature"] < 20:
        warnings.append("Cool weather detected. Battery efficiency reduced by ~10%.")
    if weather["wind_speed"] > 20:
        warnings.append("High winds detected. Energy consumption increased.")

    charging_stops = suggest_charging_stops(
        route["distance_km"],
        trip.batteryCapacity,
        trip.efficiency,
        trip.initialCharge,
        energy_data["total_energy"],
        route["geometry"],
    )

    return TripResponse(
        distance=round(route["distance_km"], 1),
        eta=format_duration(route["duration_seconds"]),
        temperature=round(weather["temperature"], 1),
        windSpeed=round(weather["wind_speed"], 1),
        energyRequired=energy_data["total_energy"],
        finalCharge=round(final_charge, 1),
        isTripPossible=is_trip_possible,
        routeGeometry=route["geometry"],
        startCoords=start_geo["coords"],
        endCoords=end_geo["coords"],
        chargingStops=charging_stops if charging_stops else None,
        energyBreakdown={
            "base": energy_data["base_energy"],
            "temperatureAdjustment": energy_data["temp_adjustment"],
            "speedAdjustment": energy_data["speed_adjustment"],
            "windAdjustment": energy_data["wind_adjustment"],
            "total": energy_data["total_energy"],
        },
        warnings=warnings if warnings else None,
    )
