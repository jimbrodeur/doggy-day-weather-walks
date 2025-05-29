
import React from 'react';
import { WeatherData, WalkingRecommendation } from '@/types/weather';
import { generateWalkingRecommendations } from '@/utils/walkingLogic';

interface WalkingRecommendationsProps {
  weatherData: WeatherData;
}

export const WalkingRecommendations: React.FC<WalkingRecommendationsProps> = ({ weatherData }) => {
  const recommendations = generateWalkingRecommendations(weatherData);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🐕 Best Walking Times Today
      </h2>
      
      {/* Score Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 text-center">📊 Walking Score Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span><strong>80-100:</strong> Excellent - Perfect conditions!</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span><strong>60-79:</strong> Good - Great for walking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span><strong>0-59:</strong> Fair/Poor - Consider alternatives</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getScoreColor(rec.score)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{rec.icon}</span>
                <span className="text-lg font-semibold">{rec.time}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{rec.score}</div>
                <div className="text-xs font-medium">{getScoreLabel(rec.score)}</div>
              </div>
            </div>
            <p className="text-sm opacity-90">{rec.reason}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Pro Tips for Dog Walking:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Bring water for both you and your pup on hot days</li>
          <li>• Check pavement temperature with your hand before walks</li>
          <li>• Consider shorter walks during extreme weather</li>
          <li>• Early morning and evening are usually best for dogs</li>
        </ul>
      </div>
    </div>
  );
};
