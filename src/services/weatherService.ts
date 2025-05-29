
import { WeatherData } from '@/types/weather';

const API_KEY = 'demo'; // Using demo mode for OpenWeatherMap
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const weatherService = {
  async getWeatherByZip(zipCode: string): Promise<WeatherData> {
    try {
      // For demo purposes, we'll simulate weather data
      // In a real app, you'd use: `${BASE_URL}/weather?zip=${zipCode}&appid=${API_KEY}&units=imperial`
      
      // Simulated weather data based on zip code
      const mockData = {
        location: `${zipCode} Area`,
        temperature: Math.floor(Math.random() * 40) + 40, // 40-80°F
        condition: ['sunny', 'cloudy', 'partly-cloudy', 'rainy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
        windSpeed: Math.floor(Math.random() * 15) + 2, // 2-17 mph
        uvIndex: Math.floor(Math.random() * 8) + 1, // 1-8
        precipitation: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0,
        hourlyForecast: generateHourlyForecast()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockData;
    } catch (error) {
      throw new Error('Failed to fetch weather data');
    }
  }
};

function generateHourlyForecast() {
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
