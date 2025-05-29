
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
  hourlyForecast: HourlyForecast[];
}

export interface HourlyForecast {
  time: number;
  temperature: number;
  condition: string;
  precipitation: number;
}

export interface WalkingRecommendation {
  time: string;
  score: number;
  reason: string;
  icon: string;
}
