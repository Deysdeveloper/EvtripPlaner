import React, { useState, useCallback } from 'react';
import MapView from './components/MapView';
import TripForm from './components/TripForm';
import ResultsDashboard from './components/ResultsDashboard';
import ThemeToggle from './components/ThemeToggle';
import { Zap } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [tripResult, setTripResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculateTrip = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setTripResult(null);

    try {
      const response = await fetch(`${API_URL}/api/calculate-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to calculate trip');
      }

      const data = await response.json();
      setTripResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setTripResult(null);
    setError(null);
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Side Panel */}
        <div
          className="w-full md:w-[420px] h-[50vh] md:h-full flex flex-col border-r overflow-y-auto scrollbar-thin z-10"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          data-testid="side-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-heading text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }} data-testid="app-title">
                  EV Trip Planner
                </h1>
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>
                  Smart Route Planning
                </p>
              </div>
            </div>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
            {!tripResult ? (
              <TripForm
                onSubmit={handleCalculateTrip}
                loading={loading}
                error={error}
              />
            ) : (
              <ResultsDashboard
                result={tripResult}
                onReset={handleReset}
              />
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative" data-testid="map-container">
          <MapView tripResult={tripResult} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

export default App;
