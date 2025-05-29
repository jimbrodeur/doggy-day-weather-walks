
import { WeatherData, WalkingRecommendation } from '@/types/weather';

export const generateWalkingRecommendations = (weatherData: WeatherData): WalkingRecommendation[] => {
  const recommendations: WalkingRecommendation[] = [];
  const timeSlots = [
    { time: 'Early Morning (6-8 AM)', hour: 7, icon: '🌅' },
    { time: 'Morning (8-10 AM)', hour: 9, icon: '☀️' },
    { time: 'Late Morning (10 AM-12 PM)', hour: 11, icon: '🌤️' },
    { time: 'Afternoon (12-3 PM)', hour: 14, icon: '☀️' },
    { time: 'Late Afternoon (3-6 PM)', hour: 16, icon: '🌤️' },
    { time: 'Evening (6-8 PM)', hour: 19, icon: '🌆' },
    { time: 'Night (8-10 PM)', hour: 21, icon: '🌙' }
  ];

  timeSlots.forEach(slot => {
    const hourlyData = weatherData.hourlyForecast.find(h => h.time === slot.hour) || 
                      weatherData.hourlyForecast[0]; // fallback to current data
    
    let score = 100;
    let reasons: string[] = [];

    // Temperature scoring
    const temp = hourlyData.temperature;
    if (temp < 32) {
      score -= 40;
      reasons.push('Very cold - consider booties for your dog');
    } else if (temp < 45) {
      score -= 20;
      reasons.push('Cold weather - shorter walk recommended');
    } else if (temp > 85) {
      score -= 30;
      reasons.push('Hot weather - risk of paw burns on pavement');
    } else if (temp > 75) {
      score -= 15;
      reasons.push('Warm weather - bring water');
    } else {
      reasons.push('Comfortable temperature for walking');
    }

    // Precipitation scoring
    if (hourlyData.precipitation > 50) {
      score -= 40;
      reasons.push('Heavy rain expected - indoor activities recommended');
    } else if (hourlyData.precipitation > 20) {
      score -= 20;
      reasons.push('Light rain possible - bring umbrella');
    }

    // Time of day adjustments
    if (slot.hour >= 6 && slot.hour <= 8) {
      score += 10; // Early morning bonus
      reasons.push('Cooler temps and less crowded');
    } else if (slot.hour >= 19 && slot.hour <= 21) {
      score += 10; // Evening bonus
      reasons.push('Cooler evening temperatures');
    } else if (slot.hour >= 12 && slot.hour <= 15) {
      score -= 10; // Midday penalty
    }

    // UV index consideration
    if (weatherData.uvIndex > 7 && slot.hour >= 10 && slot.hour <= 16) {
      score -= 15;
      reasons.push('High UV - seek shade when possible');
    }

    // Wind consideration
    if (weatherData.windSpeed > 15) {
      score -= 10;
      reasons.push('Windy conditions');
    }

    score = Math.max(0, Math.min(100, score));

    recommendations.push({
      time: slot.time,
      score: Math.round(score),
      reason: reasons.join('. '),
      icon: slot.icon
    });
  });

  return recommendations.sort((a, b) => b.score - a.score);
};
