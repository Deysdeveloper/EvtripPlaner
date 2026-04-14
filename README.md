# EV Trip Planner

A smart route planning application for Electric Vehicles (EVs) that calculates trip energy requirements, suggests charging stops based on battery capacity and efficiency, and accounts for real-time weather conditions.

## 🚀 Features

- **Advanced Route Planning**: Calculate optimal routes between two locations using Mapbox with live traffic considerations.
- **Granular Energy Estimation**: Comprehensive energy consumption calculation based on:
    - Distance and EV efficiency.
    - **Live Traffic Impact**: Dynamic energy adjustment based on real-time congestion levels.
    - **Elevation Impact**: Integrated Mapbox Tilequery API for uphill consumption and downhill regenerative braking.
    - **Weather Impact**: Real-time temperature (cold/cool weather impact) and wind speed/direction.
    - **Driving Modes**: Support for **Eco**, **Normal**, and **Sport** modes.
    - **Optimization Toggles**: Choose between "Optimize for Time" or "Optimize for Battery".
- **Charging Recommendations**: Automatically suggests charging stops if the destination is beyond the vehicle's current range.
- **Visual Dashboards**:
    - **Energy Breakdown**: Detailed chart showing base consumption, drag, elevation, traffic, and regen.
    - **Battery Graph**: Visualize battery % over distance with smooth area charts.
    - **Weather & Traffic Cards**: Explicitly see how conditions affect your range.
- **Interactive Map**:
    - **Live Traffic Overlay**: Toggleable traffic layers showing congestion levels (Green/Yellow/Red).
    - **Route Visualization**: Start/end points, route line, and suggested charging stops.
- **Indian EV Presets**: Quick selection for popular Indian EVs like Tata Nexon EV, MG Comet, BYD Atto 3, Mahindra XUV400, and more.
- **Dark/Light Mode**: Fully responsive interface with theme toggling.

## 🛠️ Technologies Used

### Frontend
- **React**: UI library.
- **Mapbox GL JS**: Interactive maps, geocoding, and traffic data.
- **Lucide React**: Icon library.
- **Recharts**: For energy breakdown and battery curve visualization.
- **Tailwind CSS**: Utility-first CSS framework for styling.

### Backend
- **FastAPI**: Modern, fast Python web framework.
- **Httpx**: For asynchronous HTTP requests to Mapbox and OpenWeather APIs.
- **Pydantic**: Data validation and settings management.
- **Python Dotenv**: Environment variable management.

## 📋 Prerequisites

Before running the application, you need to obtain API keys from the following services:

1. **Mapbox API Key**: [Mapbox Dashboard](https://account.mapbox.com/)
2. **OpenWeather API Key**: [OpenWeather Dashboard](https://home.openweathermap.org/api_keys)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EvtripPlaner
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file and add your API keys:
   ```env
   MAPBOX_API_KEY=your_mapbox_api_key_here
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn server:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Create a `.env` file:
   ```env
   REACT_APP_MAPBOX_TOKEN=your_mapbox_api_key_here
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Start the frontend application:
   ```bash
   npm start
   # or
   yarn start
   ```
   The application will be available at `http://localhost:3000`.

## 📂 Project Structure

- `backend/`: FastAPI application and business logic.
- `frontend/`: React application and UI components.
- `design_guidelines.json`: Project design and theme configuration.
- `test_reports/`: Automated test results and performance reports.
