import React from 'react';
import { BarChart3, Cloud, Droplets, Sun, TrendingUp, Thermometer } from 'lucide-react';
import StatsCard from './StatsCard';
import AIInsights from '../AI/AIInsights';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('predictedYield'),
      value: '2.8T',
      icon: BarChart3,
      color: 'bg-green-500',
      change: '+12% from last season',
      trend: 'up' as const
    },
    {
      title: t('temperature'),
      value: '24°C',
      icon: Thermometer,
      color: 'bg-orange-500',
      change: '+2°C from average',
      trend: 'up' as const
    },
    {
      title: t('rainfall'),
      value: '850mm',
      icon: Droplets,
      color: 'bg-blue-500',
      change: '-5% from last year',
      trend: 'down' as const
    },
    {
      title: t('humidity'),
      value: '65%',
      icon: Cloud,
      color: 'bg-indigo-500',
      change: 'Normal range',
      trend: 'neutral' as const
    }
  ];

  // Load data for AI insights
  const { user } = useAuth();
  const cropData = user ? JSON.parse(localStorage.getItem(`cropData_${user.id}`) || '[]') : [];
  const climateData = user ? JSON.parse(localStorage.getItem(`climateData_${user.id}`) || '[]') : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Sun className="h-4 w-4" />
          <span>Mbeya, Tanzania</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{t('maize')} - Field A</span>
              </div>
              <span className="text-sm text-gray-600">2.5T/acre</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">{t('rice')} - Field B</span>
              </div>
              <span className="text-sm text-gray-600">1.8T/acre</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">{t('beans')} - Field C</span>
              </div>
              <span className="text-sm text-gray-600">0.9T/acre</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('climateImpact')}</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800">Positive Factors</h4>
              <p className="text-sm text-green-700 mt-1">Adequate rainfall in the growing season</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800">Watch Areas</h4>
              <p className="text-sm text-yellow-700 mt-1">Rising temperatures may affect grain filling</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800">{t('recommendations')}</h4>
              <p className="text-sm text-blue-700 mt-1">Consider drought-resistant varieties</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <AIInsights cropData={cropData} climateData={climateData} />
    </div>
  );
};

export default Dashboard;