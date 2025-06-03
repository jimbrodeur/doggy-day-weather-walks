import { WeatherData } from '@/types/weather';

const API_KEY = '31256404362c4ef5b51180059253005';
const BASE_URL = 'https://api.weatherapi.com/v1';

export const weatherService = {
  async getWeatherByLocation(location: string, date?: string): Promise<WeatherData> {
    try {
      // Determine how many days to fetch (1 for today, or calculate days ahead for future dates)
      let days = 1;
      let targetDate = new Date();
      
      if (date) {
        targetDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        days = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        days = Math.min(days, 7); // API supports up to 7 days
      }

      // Get current weather and forecast with realtime updates
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=${days}&aqi=no&alerts=no&realtime=yes`
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
      
      // If requesting a future date, use forecast data for that specific day
      let targetForecast;
      if (date && days > 1) {
        const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        targetForecast = data.forecast.forecastday.find((day: any) => day.date === dateStr);
        
        if (!targetForecast) {
          // Fallback to the last available day if exact date not found
          targetForecast = data.forecast.forecastday[data.forecast.forecastday.length - 1];
        }
      } else {
        targetForecast = data.forecast.forecastday[0];
      }

      // For future dates, use forecast data instead of current weather
      const weatherSource = date && days > 1 ? targetForecast.day : current;
      const isCurrentDay = !date || days === 1;

      return {
        location: `${locationData.name}, ${locationData.region}`,
        temperature: Math.round(isCurrentDay ? current.temp_f : weatherSource.avgtemp_f),
        condition: this.mapWeatherCondition(isCurrentDay ? current.condition.text : weatherSource.condition.text),
        humidity: isCurrentDay ? current.humidity : weatherSource.avghumidity,
        windSpeed: Math.round(isCurrentDay ? current.wind_mph : weatherSource.maxwind_mph),
        uvIndex: isCurrentDay ? (current.uv || 0) : (weatherSource.uv || 0),
        precipitation: this.calculatePrecipitation(isCurrentDay ? current : weatherSource, targetForecast),
        hourlyForecast: this.generateHourlyFromForecast(targetForecast.hour, isCurrentDay ? current : null),
        sunrise: targetForecast.astro?.sunrise || undefined,
        sunset: targetForecast.astro?.sunset || undefined
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw new Error('Unable to fetch weather data. Please check your location and try again.');
    }
  },

  calculatePrecipitation(weatherSource: any, forecast: any): number {
    if (weatherSource.precip_in !== undefined) {
      return weatherSource.precip_in > 0 ? Math.round(weatherSource.precip_in * 100) : 0;
    }
    
    // For forecast data, use chance of rain or precipitation amount
    if (forecast?.day) {
      return forecast.day.daily_chance_of_rain || 0;
    }
    
    return weatherSource.condition?.text?.toLowerCase().includes('rain') ? 80 : 0;
  },

  // Keep the old method for backward compatibility
  async getWeatherByZip(zipCode: string): Promise<WeatherData> {
    return this.getWeatherByLocation(zipCode);
  },

  parseTimeToDate(timeString: string): string {
    // Convert "06:30 AM" or "06:30 PM" format to ISO string
    const today = new Date();
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour24, minutes);
    return date.toISOString();
  },

  mapWeatherCondition(condition: string): string {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return 'sunny';
    }
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
      return 'rainy';
    }
    if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
      return 'thunderstorm';
    }
    if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) {
      return 'snow';
    }
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return 'cloudy';
    }
    if (lowerCondition.includes('partly') || lowerCondition.includes('partial')) {
      return 'partly-cloudy';
    }
    
    return 'partly-cloudy';
  },

  generateHourlyFromForecast(hourlyData: any[], currentWeather: any) {
    if (!hourlyData || !Array.isArray(hourlyData)) {
      return this.generateMockHourlyForecast();
    }

    const now = new Date();
    const currentHour = now.getHours();
    const isToday = currentWeather !== null;

    return hourlyData.map((hour: any, index: number) => {
      const date = new Date(hour.time);
      const hourTime = date.getHours();
      
      // Use current weather data for the current hour if it's today
      const isCurrentHour = isToday && hourTime === currentHour;
      
      return {
        time: hourTime,
        temperature: isCurrentHour ? Math.round(currentWeather.temp_f) : Math.round(hour.temp_f),
        condition: this.mapWeatherCondition(isCurrentHour ? currentWeather.condition.text : hour.condition.text),
        precipitation: isCurrentHour ? 
          (currentWeather.precip_in > 0 ? Math.round(currentWeather.precip_in * 100) : Math.round(hour.chance_of_rain)) :
          Math.round(hour.chance_of_rain) || 0,
        uvIndex: isCurrentHour ? currentWeather.uv : (hour.uv || 0),
        windSpeed: isCurrentHour ? Math.round(currentWeather.wind_mph) : Math.round(hour.wind_mph)
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
        precipitation: Math.random() > 0.8 ? Math.floor(Math.random() * 20) : 0,
        uvIndex: Math.floor(Math.random() * 10),
        windSpeed: Math.floor(Math.random() * 15) + 5
      });
    }
    
    return hours;
  }
};
