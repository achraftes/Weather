import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [unit, setUnit] = useState('metric');
  const [recentSearches, setRecentSearches] = useState([]);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    const savedTheme = localStorage.getItem('theme');

    if (savedSearches) {
      try {
        const parsed = JSON.parse(savedSearches);
        const validSearches = parsed.filter(item => 
          typeof item === 'string' && item.trim().length > 0
        );
        setRecentSearches(validSearches.slice(0, 5));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
        localStorage.removeItem('recentSearches');
      }
    }

    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }
  }, []);

  const apiKey = '18d2d9e6fbfca85fc00904fef86000b1';

  function getCurrentLocation() {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          getWeatherByCoords(lat, lon);
        },
        (err) => {
          setError('Impossible d\'obtenir votre position. ' + err.message);
          setLoading(false);
        }
      );
    } else {
      setError('La géolocalisation n\'est pas prise en charge par votre navigateur');
      setLoading(false);
    }
  }

  function getWeatherByCoords(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}&lang=fr`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}&lang=fr`;
    
    fetchWeatherData(weatherUrl, forecastUrl);
  }

  function getWeather() {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}&lang=fr`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}&lang=fr`;
    
    fetchWeatherData(weatherUrl, forecastUrl);
  }

  function fetchWeatherData(weatherUrl, forecastUrl) {
    fetch(weatherUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Ville non trouvée');
        }
        return response.json();
      })
      .then((data) => {
        if (!data?.name || typeof data.name !== 'string') {
          throw new Error('Réponse API invalide - Nom de ville manquant');
        }

        const weather = {
          location: data.name,
          country: data.sys.country,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          wind: data.wind.speed,
          pressure: data.main.pressure,
          condition: data.weather[0].description,
          icon: data.weather[0].icon,
          sunrise: new Date(data.sys.sunrise * 1000),
          sunset: new Date(data.sys.sunset * 1000)
        };
        setWeatherInfo(weather);
        
        addToRecentSearches(data.name);
        
        return fetch(forecastUrl);
      })
      .then(response => response.json())
      .then(data => {
        const dailyData = processDailyForecast(data.list);
        setForecastData(dailyData);
        
        const hourlyData = processHourlyForecast(data.list.slice(0, 8));
        setHourlyForecast(hourlyData);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }

  function addToRecentSearches(cityName) {
    if (typeof cityName !== 'string' || !cityName.trim()) {
      console.error('Invalid city name:', cityName);
      return;
    }

    const cleanedCity = cityName.trim().toLowerCase();
    
    setRecentSearches(prev => {
      const updated = [
        cleanedCity,
        ...prev.filter(item => 
          item.toLowerCase() !== cleanedCity && typeof item === 'string'
        )
      ].slice(0, 5);
      
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }

  function processDailyForecast(forecastList) {
    const dailyMap = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      
      if (!dailyMap[day] || date.getHours() === 12) {
        dailyMap[day] = {
          day: day,
          temp: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          icon: item.weather[0].icon,
          condition: item.weather[0].description
        };
      }
    });
    
    return Object.values(dailyMap).slice(0, 5);
  }
  
  function processHourlyForecast(hourlyList) {
    return hourlyList.map(item => {
      const date = new Date(item.dt * 1000);
      return {
        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon
      };
    });
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      getWeather();
    }
  }

  function formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  
  function formatSunTime(date) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  
  function toggleUnit() {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    
    if (weatherInfo) {
      setLoading(true);
      if (city) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${newUnit}&appid=${apiKey}&lang=fr`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${newUnit}&appid=${apiKey}&lang=fr`;
        fetchWeatherData(weatherUrl, forecastUrl);
      }
    }
  }
  
  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  }

  function getTemperatureUnit() {
    return unit === 'metric' ? '°C' : '°F';
  }
  
  function getSpeedUnit() {
    return unit === 'metric' ? 'm/s' : 'mph';
  }

  return (
    <div className={`app-container ${theme}`}>
      <div className="unified-weather-app">
        <div className="app-header">
          <div className="header-main">
            <h1>Météo</h1>
            <div className="header-actions">
              <button className="icon-button" onClick={toggleUnit} title="Changer d'unité">
                {unit === 'metric' ? '°C' : '°F'}
              </button>
              <button className="icon-button" onClick={toggleTheme} title="Changer de thème">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
          
          <div className="search-area">
            <div className="search-box">
              <input
                type="text"
                placeholder="Entrez le nom d'une ville"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={getWeather} disabled={loading}>
                {loading ? 
                  <span className="loading-spinner"></span> : 
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                }
              </button>
              <button 
                className="location-button" 
                onClick={getCurrentLocation}
                title="Utiliser ma position actuelle"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>
              </button>
            </div>
            
            <button 
              className="search-button-large" 
              onClick={getWeather} 
              disabled={loading}
            >
              {loading ? 'Recherche en cours...' : 'Rechercher'}
            </button>
            
            {recentSearches.length > 0 && (
              <div className="recent-searches">
                <p>Récentes:</p>
                {recentSearches.map((item, index) => (
                  <button 
                    key={`${item}-${index}`}
                    className="recent-search-item"
                    onClick={() => {
                      if (typeof item === 'string') {
                        setCity(item);
                        setTimeout(() => getWeather(), 0);
                      }
                    }}
                  >
                    {typeof item === 'string' ? item : 'Entrée invalide'}
                  </button>
                ))}
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {weatherInfo && (
          <div className="weather-content">
            <div className="current-weather">
              <div className="location-info">
                <h2>{weatherInfo.location}, {weatherInfo.country}</h2>
                <p className="current-time">{formatCurrentTime()}</p>
                <div className="current-condition">{weatherInfo.condition}</div>
              </div>
              <div className="temp-display">
                <div className="temp-icon">
                  <img src={`https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`} alt="Météo" />
                </div>
                <div className="temp-value">{weatherInfo.temperature}{getTemperatureUnit()}</div>
              </div>
            </div>

            <div className="weather-details-section">
              <h3>Détails météo</h3>
              <div className="weather-details">
                <div className="detail-card">
                  <div className="detail-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-2z"/>
                    </svg>
                  </div>
                  <div className="detail-info">
                    <div className="detail-label">Ressenti</div>
                    <div className="detail-value">{weatherInfo.feelsLike}{getTemperatureUnit()}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2zm-2-9.5c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"/>
                    </svg>
                  </div>
                  <div className="detail-info">
                    <div className="detail-label">Humidité</div>
                    <div className="detail-value">{weatherInfo.humidity}%</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M14.5 12c0 1.38-1.12 2.5-2.5 2.5S9.5 13.38 9.5 12s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5zm7.5 0c0-4.5-3-8.2-7-8.2S8 7.5 8 12c0-4.5-3-8.5-7-8.5v17h23V12z"/>
                    </svg>
                  </div>
                  <div className="detail-info">
                    <div className="detail-label">Vent</div>
                    <div className="detail-value">{weatherInfo.wind} {getSpeedUnit()}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M15.71 12.29l-6-6a.996.996 0 10-1.41 1.41L12.88 12l-4.58 4.59a.996.996 0 101.41 1.41l6-6a.996.996 0 000-1.41z"/>
                    </svg>
                  </div>
                  <div className="detail-info">
                    <div className="detail-label">Pression</div>
                    <div className="detail-value">{weatherInfo.pressure} hPa</div>
                  </div>
                </div>
              </div>
              
              <div className="sun-times">
                <div className="sun-time-item">
                  <div className="sun-time-icon sunrise">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                    </svg>
                  </div>
                  <div className="sun-time-info">
                    <div className="sun-time-label">Lever</div>
                    <div className="sun-time-value">{formatSunTime(weatherInfo.sunrise)}</div>
                  </div>
                </div>
                <div className="sun-time-item">
                  <div className="sun-time-icon sunset">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                    </svg>
                  </div>
                  <div className="sun-time-info">
                    <div className="sun-time-label">Coucher</div>
                    <div className="sun-time-value">{formatSunTime(weatherInfo.sunset)}</div>
                  </div>
                </div>
              </div>
            </div>

            {hourlyForecast.length > 0 && (
              <div className="forecast-section">
                <h3>Prévisions du jour</h3>
                <div className="hourly-forecast">
                  {hourlyForecast.map((hour, index) => (
                    <div className="hourly-item" key={index}>
                      <div className="hour">{hour.time}</div>
                      <div className="weather-icon">
                        <img src={`https://openweathermap.org/img/wn/${hour.icon}.png`} alt="Météo" />
                      </div>
                      <div className="temp">{hour.temp}{getTemperatureUnit()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {forecastData.length > 0 && (
              <div className="forecast-section">
                <h3>Prévisions {forecastData.length} jours</h3>
                <div className="days-forecast">
                  {forecastData.map((day, index) => (
                    <div className="day-item" key={index}>
                      <div className="day-name">{day.day}</div>
                      <div className="weather-icon">
                        <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="Météo" />
                      </div>
                      <div className="condition">{day.condition}</div>
                      <div className="temp-range">
                        <span className="temp-max">{day.tempMax}{getTemperatureUnit()}</span>
                        <span className="temp-min">{day.tempMin}{getTemperatureUnit()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!weatherInfo && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" width="64" height="64">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v7h-2zm0 9h2v2h-2z"/>
              </svg>
            </div>
            <h2>Recherchez une ville pour commencer</h2>
            <p>Entrez un nom de ville ci-dessus pour consulter la météo actuelle et les prévisions</p>
            <button className="location-button-large" onClick={getCurrentLocation}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
              Utiliser ma position actuelle
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner large"></div>
            <p>Chargement des données météo...</p>
          </div>
        )}
        
        <footer className="app-footer">
          <p>Données météo fournies par OpenWeatherMap</p>
        </footer>
      </div>
    </div>
  );
}

export default App;