
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
  hourlyForecast: HourlyForecast[];
  sunrise?: string;
  sunset?: string;
}

export interface HourlyForecast {
  time: number;
  temperature: number;
  condition: string;
  precipitation: number;
  uvIndex?: number;
  windSpeed?: number;
}

export interface WalkingRecommendation {
  time: string;
  score: number;
  reason: string;
  icon: string;
  hourlyData?: HourlyForecast;
  sunEvent?: {
    type: 'sunrise' | 'sunset';
    time: string;
  };
}
