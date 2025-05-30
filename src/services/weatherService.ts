import { WeatherData } from '@/types/weather';

const API_KEY = '31256404362c4ef5b51180059253005';
const BASE_URL = 'https://api.weatherapi.com/v1';

export const weatherService = {
  async getWeatherByLocation(location: string): Promise<WeatherData> {
    try {
      // The WeatherAPI can handle zip codes, city names, and "city, state" format
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=no`
      );
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid location. Please try a zip code or city, state format.');
        }
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      const current = data.current;
      const locationData = data.location;
      const forecast = data.forecast.forecastday[0];

      return {
        location: `${locationData.name}, ${locationData.region}`,
        temperature: Math.round(current.temp_f),
        condition: this.mapWeatherCondition(current.condition.text),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_mph),
        uvIndex: current.uv || 0,
        precipitation: Math.round(current.precip_in * 100) || 0,
        hourlyForecast: this.generateHourlyFromForecast(forecast.hour)
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw new Error('Unable to fetch weather data. Please check your location and try again.');
    }
  },

  // Keep the old method for backward compatibility
  async getWeatherByZip(zipCode: string): Promise<WeatherData> {
    return this.getWeatherByLocation(zipCode);
  },

  mapWeatherCondition(condition: string): string {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return 'sunny';
    }
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
      return 'rainy';
    }
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return 'cloudy';
    }
    if (lowerCondition.includes('partly') || lowerCondition.includes('partial')) {
      return 'partly-cloudy';
    }
    
    return 'partly-cloudy';
  },

  generateHourlyFromForecast(hourlyData: any[]) {
    if (!hourlyData || !Array.isArray(hourlyData)) {
      return this.generateMockHourlyForecast();
    }

    return hourlyData.map((hour: any) => {
      const date = new Date(hour.time);
      return {
        time: date.getHours(),
        temperature: Math.round(hour.temp_f),
        condition: this.mapWeatherCondition(hour.condition.text),
        precipitation: Math.round(hour.chance_of_rain) || 0
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
  }
};
