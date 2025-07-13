import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { CropData, ClimateData, Prediction } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const PredictionsList: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      const savedPredictions = localStorage.getItem(`predictions_${user.id}`);
      const savedCropData = localStorage.getItem(`cropData_${user.id}`);
      const savedClimateData = localStorage.getItem(`climateData_${user.id}`);
      
      if (savedPredictions) setPredictions(JSON.parse(savedPredictions));
      if (savedCropData) setCropData(JSON.parse(savedCropData));
      if (savedClimateData) setClimateData(JSON.parse(savedClimateData));
    }
  }, [user]);

  const generatePredictions = async () => {
    if (!user || cropData.length === 0 || climateData.length === 0) {
      alert('Please add both crop data and climate data before generating predictions.');
      return;
    }

    setIsGenerating(true);
    
    // Simulate ML prediction processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newPredictions: Prediction[] = cropData.map(crop => {
      // Simple mock prediction logic
      const avgTemp = climateData.reduce((sum, c) => sum + c.temperature, 0) / climateData.length;
      const avgRainfall = climateData.reduce((sum, c) => sum + c.rainfall, 0) / climateData.length;
      const avgHumidity = climateData.reduce((sum, c) => sum + c.humidity, 0) / climateData.length;
      
      // Mock yield prediction based on crop type and conditions
      let baseYield = 0;
      switch (crop.cropType) {
        case 'maize': baseYield = 2.5; break;
        case 'rice': baseYield = 1.8; break;
        case 'beans': baseYield = 0.9; break;
      }
      
      // Adjust yield based on climate conditions
      let yieldMultiplier = 1;
      if (avgTemp > 30) yieldMultiplier *= 0.9; // Hot weather reduces yield
      if (avgRainfall < 500) yieldMultiplier *= 0.8; // Low rainfall reduces yield
      if (avgHumidity > 80) yieldMultiplier *= 0.95; // High humidity slightly reduces yield
      
      const predictedYield = baseYield * yieldMultiplier * crop.fieldSize;
      
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        cropDataId: crop.id,
        predictedYield: Math.round(predictedYield * 100) / 100,
        predictedRainfall: avgRainfall + (Math.random() - 0.5) * 100,
        predictedTemperature: avgTemp + (Math.random() - 0.5) * 5,
        climateImpact: {
          positive: avgRainfall > 600 ? ['Adequate rainfall expected'] : [],
          negative: avgTemp > 30 ? ['High temperatures may stress crops'] : [],
          recommendations: [
            'Monitor soil moisture levels',
            'Consider supplemental irrigation if needed',
            'Apply mulch to retain soil moisture'
          ]
        },
        confidence: Math.round((0.7 + Math.random() * 0.3) * 100),
        createdAt: new Date().toISOString()
      };
    });
    
    const updatedPredictions = [...predictions, ...newPredictions];
    setPredictions(updatedPredictions);
    localStorage.setItem(`predictions_${user.id}`, JSON.stringify(updatedPredictions));
    
    setIsGenerating(false);
  };

  const getCropName = (cropDataId: string) => {
    const crop = cropData.find(c => c.id === cropDataId);
    return crop ? t(crop.cropType) : 'Unknown';
  };

  const getCropIcon = (cropDataId: string) => {
    const crop = cropData.find(c => c.id === cropDataId);
    switch (crop?.cropType) {
      case 'maize': return '🌽';
      case 'rice': return '🌾';
      case 'beans': return '🫘';
      default: return '🌱';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('predictions')}</h1>
        <button
          onClick={generatePredictions}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          <TrendingUp size={20} />
          <span>{isGenerating ? 'Generating...' : 'Generate Predictions'}</span>
        </button>
      </div>

      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-medium text-blue-900">Processing Data</h3>
              <p className="text-sm text-blue-700">Our AI model is analyzing your crop and climate data...</p>
            </div>
          </div>
        </div>
      )}

      {predictions.length === 0 && !isGenerating ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions yet</h3>
          <p className="text-gray-600 mb-4">Generate AI-powered predictions for your crops</p>
          <button
            onClick={generatePredictions}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Generate Predictions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {predictions.map(prediction => (
            <div key={prediction.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCropIcon(prediction.cropDataId)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{getCropName(prediction.cropDataId)}</h3>
                    <p className="text-sm text-gray-600">
                      Confidence: {prediction.confidence}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(prediction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{prediction.predictedYield}T</p>
                  <p className="text-sm text-gray-600">{t('predictedYield')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{Math.round(prediction.predictedRainfall)}mm</p>
                  <p className="text-sm text-gray-600">{t('rainfall')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{Math.round(prediction.predictedTemperature)}°C</p>
                  <p className="text-sm text-gray-600">{t('temperature')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('climateImpact')}</h4>
                  
                  {prediction.climateImpact.positive.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-700">Positive Factors</span>
                      </div>
                      {prediction.climateImpact.positive.map((factor, index) => (
                        <p key={index} className="text-sm text-green-600 ml-6">• {factor}</p>
                      ))}
                    </div>
                  )}
                  
                  {prediction.climateImpact.negative.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertCircle size={16} className="text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700">Risk Factors</span>
                      </div>
                      {prediction.climateImpact.negative.map((factor, index) => (
                        <p key={index} className="text-sm text-yellow-600 ml-6">• {factor}</p>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">{t('recommendations')}</span>
                    </div>
                    {prediction.climateImpact.recommendations.map((rec, index) => (
                      <p key={index} className="text-sm text-blue-600 ml-6">• {rec}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictionsList;