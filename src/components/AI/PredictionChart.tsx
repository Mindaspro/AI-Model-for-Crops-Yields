import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Prediction, CropData } from '../../types';

interface PredictionChartProps {
  predictions: Prediction[];
  cropData: CropData[];
}

const PredictionChart: React.FC<PredictionChartProps> = ({ predictions, cropData }) => {
  // Prepare data for yield comparison chart
  const yieldData = predictions.map(prediction => {
    const crop = cropData.find(c => c.id === prediction.cropDataId);
    return {
      crop: crop ? `${crop.cropType} (${crop.fieldSize}A)` : 'Unknown',
      predicted: prediction.predictedYield,
      confidence: prediction.confidence,
      date: new Date(prediction.createdAt).toLocaleDateString()
    };
  });

  // Prepare data for climate trends
  const climateData = predictions.map((prediction, index) => ({
    prediction: `P${index + 1}`,
    rainfall: prediction.predictedRainfall,
    temperature: prediction.predictedTemperature,
    date: new Date(prediction.createdAt).toLocaleDateString()
  }));

  // Calculate yield by crop type
  const yieldByCrop = predictions.reduce((acc, prediction) => {
    const crop = cropData.find(c => c.id === prediction.cropDataId);
    if (crop) {
      if (!acc[crop.cropType]) {
        acc[crop.cropType] = { total: 0, count: 0 };
      }
      acc[crop.cropType].total += prediction.predictedYield;
      acc[crop.cropType].count += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const avgYieldData = Object.entries(yieldByCrop).map(([cropType, data]) => ({
    crop: cropType.charAt(0).toUpperCase() + cropType.slice(1),
    avgYield: data.total / data.count,
    predictions: data.count
  }));

  if (predictions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Prediction Data</h3>
          <p className="text-gray-600">Generate some predictions to see visualizations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Yield Predictions Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predicted Yields by Crop</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yieldData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="crop" />
            <YAxis label={{ value: 'Yield (Tons)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'predicted' ? `${value} tons` : `${value}%`,
                name === 'predicted' ? 'Predicted Yield' : 'Confidence'
              ]}
            />
            <Legend />
            <Bar dataKey="predicted" fill="#10b981" name="Predicted Yield" />
            <Bar dataKey="confidence" fill="#3b82f6" name="Confidence %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average Yield by Crop Type */}
      {avgYieldData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Yield by Crop Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgYieldData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" />
              <YAxis label={{ value: 'Avg Yield (Tons)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'avgYield' ? `${value.toFixed(2)} tons` : `${value} predictions`,
                  name === 'avgYield' ? 'Average Yield' : 'Number of Predictions'
                ]}
              />
              <Legend />
              <Bar dataKey="avgYield" fill="#f59e0b" name="Average Yield" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Climate Predictions Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Climate Predictions Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={climateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="prediction" />
            <YAxis yAxisId="left" label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight' }} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'rainfall' ? `${value.toFixed(0)} mm` : `${value.toFixed(1)}°C`,
                name === 'rainfall' ? 'Predicted Rainfall' : 'Predicted Temperature'
              ]}
            />
            <Legend />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="rainfall" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Rainfall"
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="temperature" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Temperature"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Confidence Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {yieldData.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{item.crop}</span>
                <span className="text-sm text-gray-600">{item.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.confidence >= 80 ? 'bg-green-500' :
                      item.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{item.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;