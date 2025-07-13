import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Activity, Brain, BarChart3 } from 'lucide-react';
import { CropData, ClimateData, Prediction } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '../../services/aiService';
import ModelMetrics from '../AI/ModelMetrics';
import PredictionChart from '../AI/PredictionChart';

const EnhancedPredictionsList: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInitialized, setAiInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'predictions' | 'charts' | 'metrics'>('predictions');

  useEffect(() => {
    initializeAI();
    loadData();
  }, [user]);

  const initializeAI = async () => {
    try {
      await aiService.initialize();
      setAiInitialized(true);
    } catch (error) {
      console.error('Failed to initialize AI:', error);
    }
  };

  const loadData = () => {
    if (user) {
      const savedPredictions = localStorage.getItem(`predictions_${user.id}`);
      const savedCropData = localStorage.getItem(`cropData_${user.id}`);
      const savedClimateData = localStorage.getItem(`climateData_${user.id}`);
      
      if (savedPredictions) setPredictions(JSON.parse(savedPredictions));
      if (savedCropData) setCropData(JSON.parse(savedCropData));
      if (savedClimateData) setClimateData(JSON.parse(savedClimateData));
    }
  };

  const generateAIPredictions = async () => {
    if (!user || !aiInitialized || cropData.length === 0 || climateData.length === 0) {
      alert('Please ensure AI is initialized and you have both crop data and climate data before generating predictions.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const newPredictions: Prediction[] = [];
      
      for (const crop of cropData) {
        const aiPrediction = await aiService.predict(crop, climateData);
        const recommendations = aiService.generateRecommendations(aiPrediction, crop, climateData);
        
        const prediction: Prediction = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          userId: user.id,
          cropDataId: crop.id,
          predictedYield: aiPrediction.yield,
          predictedRainfall: aiPrediction.rainfall,
          predictedTemperature: aiPrediction.temperature,
          climateImpact: recommendations,
          confidence: Math.round(aiPrediction.confidence * 100),
          createdAt: new Date().toISOString()
        };
        
        newPredictions.push(prediction);
      }
      
      const updatedPredictions = [...predictions, ...newPredictions];
      setPredictions(updatedPredictions);
      localStorage.setItem(`predictions_${user.id}`, JSON.stringify(updatedPredictions));
      
    } catch (error) {
      console.error('AI Prediction error:', error);
      alert('Failed to generate AI predictions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'charts':
        return <PredictionChart predictions={predictions} cropData={cropData} />;
      case 'metrics':
        return <ModelMetrics />;
      default:
        return renderPredictionsList();
    }
  };

  const renderPredictionsList = () => {
    if (predictions.length === 0 && !isGenerating) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI predictions yet</h3>
          <p className="text-gray-600 mb-4">Generate AI-powered predictions using TensorFlow.js</p>
          <button
            onClick={generateAIPredictions}
            disabled={!aiInitialized}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {aiInitialized ? 'Generate AI Predictions' : 'Initializing AI...'}
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictions.map(prediction => (
          <div key={prediction.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCropIcon(prediction.cropDataId)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{getCropName(prediction.cropDataId)}</h3>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">
                      AI Confidence: {prediction.confidence}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Generated</p>
                <p className="text-sm font-medium">
                  {new Date(prediction.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{prediction.predictedYield.toFixed(2)}T</p>
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
                  {prediction.climateImpact.recommendations.slice(0, 3).map((rec, index) => (
                    <p key={index} className="text-sm text-blue-600 ml-6">• {rec}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('predictions')}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className={aiInitialized ? 'text-green-600' : 'text-yellow-600'}>
              AI: {aiInitialized ? 'Ready' : 'Initializing...'}
            </span>
          </div>
          <button
            onClick={generateAIPredictions}
            disabled={isGenerating || !aiInitialized}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Brain size={20} />
            <span>{isGenerating ? 'Generating AI Predictions...' : 'Generate AI Predictions'}</span>
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-medium text-blue-900">AI Processing Data</h3>
              <p className="text-sm text-blue-700">TensorFlow.js neural network is analyzing your data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'predictions'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} />
              <span>Predictions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'charts'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Charts</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Brain size={16} />
              <span>AI Metrics</span>
            </div>
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default EnhancedPredictionsList;