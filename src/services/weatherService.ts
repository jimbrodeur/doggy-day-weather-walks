
import { WeatherData } from '@/types/weather';

const API_KEY = process.env.OPENWEATHER_API_KEY || 'demo'; // You'll need to set this
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export const weatherService = {
  async getWeatherByZip(zipCode: string): Promise<WeatherData> {
    try {
      // If no API key, fall back to demo data
      if (API_KEY === 'demo') {
        return this.getDemoWeatherData(zipCode);
      }

      // Get coordinates and location info from zip code
      const geoResponse = await fetch(
        `${GEO_URL}/zip?zip=${zipCode},US&appid=${API_KEY}`
      );
      
      if (!geoResponse.ok) {
        throw new Error('Invalid zip code');
      }
      
      const geoData = await geoResponse.json();
      const { lat, lon, name, state } = geoData;

      // Get current weather
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const weatherData = await weatherResponse.json();

      // Get hourly forecast
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      
      const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;

      return {
        location: `${name}, ${state}`,
        temperature: Math.round(weatherData.main.temp),
        condition: this.mapWeatherCondition(weatherData.weather[0].main),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed),
        uvIndex: 5, // UV index requires separate API call
        precipitation: weatherData.rain?.['1h'] ? Math.round(weatherData.rain['1h'] * 100) : 0,
        hourlyForecast: this.generateHourlyFromForecast(forecastData)
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw new Error('Unable to fetch weather data. Please check your zip code and try again.');
    }
  },

  mapWeatherCondition(condition: string): string {
    const conditionMap: { [key: string]: string } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'rainy',
      'Snow': 'cloudy',
      'Mist': 'cloudy',
      'Fog': 'cloudy'
    };
    return conditionMap[condition] || 'partly-cloudy';
  },

  generateHourlyFromForecast(forecastData: any) {
    if (!forecastData?.list) {
      return this.generateMockHourlyForecast();
    }

    return forecastData.list.slice(0, 24).map((item: any, index: number) => {
      const date = new Date(item.dt * 1000);
      return {
        time: date.getHours(),
        temperature: Math.round(item.main.temp),
        condition: this.mapWeatherCondition(item.weather[0].main),
        precipitation: item.rain?.['3h'] ? Math.round(item.rain['3h'] * 100 / 3) : 0
      };
    });
  },

  generateMockHourlyForecast() {
    const hours = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() + (i * 60 * 60 * 1000));
      hours.push({
        time: hour.getHours(),
        temperature: Math.floor(Math.random() * 20) + 50,
        condition: ['sunny', 'cloudy', 'partly-cloudy'][Math.floor(Math.random() * 3)],
        precipitation: Math.random() > 0.8 ? Math.floor(Math.random() * 20) : 0
      });
    }
    
    return hours;
  },

  async getDemoWeatherData(zipCode: string): Promise<WeatherData> {
    // Enhanced demo data that's more realistic
    const mockData = {
      location: `${zipCode} Area`,
      temperature: Math.floor(Math.random() * 40) + 40,
      condition: ['sunny', 'cloudy', 'partly-cloudy', 'rainy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 30,
      windSpeed: Math.floor(Math.random() * 15) + 2,
      uvIndex: Math.floor(Math.random() * 8) + 1,
      precipitation: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0,
      hourlyForecast: this.generateMockHourlyForecast()
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockData;
  }
};
