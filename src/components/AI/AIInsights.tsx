import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';
import { externalAiService } from '../../services/externalAiService';
import { CropData, ClimateData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface AIInsightsProps {
  cropData: CropData[];
  climateData: ClimateData[];
}

interface WeatherInsight {
  summary: string;
  recommendations: string[];
  riskFactors: string[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ cropData, climateData }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Record<string, WeatherInsight>>({});
  const [optimizationAdvice, setOptimizationAdvice] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cropData.length > 0 && climateData.length > 0) {
      generateInsights();
    }
  }, [cropData, climateData]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const newInsights: Record<string, WeatherInsight> = {};
      const newAdvice: Record<string, string[]> = {};

      for (const crop of cropData) {
        // Get weather insights
        const insight = await externalAiService.getWeatherInsights(
          crop.cropType,
          user?.location || 'Mbeya, Tanzania',
          climateData
        );
        newInsights[crop.id] = insight;

        // Get optimization advice (using mock yield for now)
        const mockYield = crop.cropType === 'maize' ? 2.5 : crop.cropType === 'rice' ? 1.8 : 0.9;
        const advice = await externalAiService.getCropOptimizationAdvice(
          crop.cropType,
          mockYield * crop.fieldSize,
          crop.fieldSize
        );
        newAdvice[crop.id] = advice;
      }

      setInsights(newInsights);
      setOptimizationAdvice(newAdvice);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCropIcon = (cropType: string) => {
    switch (cropType) {
      case 'maize': return '🌽';
      case 'rice': return '🌾';
      case 'beans': return '🫘';
      default: return '🌱';
    }
  };

  if (cropData.length === 0 || climateData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights Unavailable</h3>
          <p className="text-gray-600">Add both crop data and climate data to get AI-powered insights</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
          <div>
            <h3 className="font-medium text-blue-900">Generating AI Insights</h3>
            <p className="text-sm text-blue-700">Analyzing your data with external AI models...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
      </div>

      {cropData.map(crop => {
        const insight = insights[crop.id];
        const advice = optimizationAdvice[crop.id];

        if (!insight) return null;

        return (
          <div key={crop.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{getCropIcon(crop.cropType)}</span>
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">{crop.cropType}</h3>
                <p className="text-sm text-gray-600">{crop.seedVariety} - {crop.fieldSize} acres</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Climate Impact Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Climate Impact Analysis</h4>
                      <p className="text-sm text-blue-700 mt-1">{insight.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                {insight.riskFactors.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Risk Factors</h4>
                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                          {insight.riskFactors.map((risk, index) => (
                            <li key={index}>• {risk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">AI Recommendations</h4>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Optimization Advice */}
                {advice && advice.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">Optimization Strategies</h4>
                        <ul className="text-sm text-purple-700 mt-1 space-y-1">
                          {advice.map((tip, index) => (
                            <li key={index}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AIInsights;