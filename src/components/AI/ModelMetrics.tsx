import React, { useState, useEffect } from 'react';
import { Activity, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface ModelMetrics {
  yieldModel: {
    loss: number;
    mae: number;
  };
  lastTraining: string;
}

const ModelMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const modelMetrics = await aiService.getModelMetrics();
      setMetrics(modelMetrics);
    } catch (error) {
      console.error('Failed to load model metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-blue-600 animate-spin" />
          <span>Loading model metrics...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span>Failed to load model metrics</span>
        </div>
      </div>
    );
  }

  const getAccuracyColor = (mae: number) => {
    if (mae < 0.3) return 'text-green-600';
    if (mae < 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyLabel = (mae: number) => {
    if (mae < 0.3) return 'Excellent';
    if (mae < 0.5) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Model Performance</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Yield Prediction Model</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Model Loss</span>
              <span className="font-semibold">{metrics.yieldModel.loss.toFixed(4)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mean Absolute Error</span>
              <span className={`font-semibold ${getAccuracyColor(metrics.yieldModel.mae)}`}>
                {metrics.yieldModel.mae.toFixed(3)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accuracy Rating</span>
              <span className={`font-semibold ${getAccuracyColor(metrics.yieldModel.mae)}`}>
                {getAccuracyLabel(metrics.yieldModel.mae)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Model Information</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Framework</span>
              <span className="font-semibold">TensorFlow.js</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Training Data</span>
              <span className="font-semibold">1,000 samples</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Training</span>
              <span className="font-semibold text-sm">
                {new Date(metrics.lastTraining).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900">Model Insights</h5>
            <p className="text-sm text-blue-700 mt-1">
              The AI model has been trained on synthetic data representing Mbeya, Tanzania agricultural conditions. 
              Lower MAE values indicate better prediction accuracy. The model considers crop type, field size, 
              climate conditions, and fertilizer usage to predict yields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelMetrics;