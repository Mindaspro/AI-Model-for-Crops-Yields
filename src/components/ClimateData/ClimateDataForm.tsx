import React, { useState, useEffect } from 'react';
import { Save, X, Upload } from 'lucide-react';
import { ClimateData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface ClimateDataFormProps {
  onSave: (data: Omit<ClimateData, 'id' | 'userId' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: ClimateData;
}

const ClimateDataForm: React.FC<ClimateDataFormProps> = ({ onSave, onCancel, initialData }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location, setLocation] = useState(initialData?.location || '');
  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    temperature: initialData?.temperature || 0,
    rainfall: initialData?.rainfall || 0,
    humidity: initialData?.humidity || 0,
    windSpeed: initialData?.windSpeed || 0,
    solarRadiation: initialData?.solarRadiation || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, location });
  };

  const fetchClimateData = async (date: string, locationName: string) => {
    try {
      const geo = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json`);
      if (!geo.data || geo.data.length === 0) {
        alert('📍 Location not found. Please enter a valid place.');
        return;
      }
      const lat = geo.data[0].lat;
      const lon = geo.data[0].lon;

      const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,shortwave_radiation_sum,relative_humidity_2m_max&timezone=Africa%2FNairobi`;

      const weather = await axios.get(api);
      const daily = weather.data?.daily;

      if (!daily || !daily.temperature_2m_max) {
        alert('🌧️ Weather data unavailable for the selected date.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        temperature: daily.temperature_2m_max[0] ?? 0,
        rainfall: daily.precipitation_sum[0] ?? 0,
        humidity: daily.relative_humidity_2m_max[0] ?? 0,
        windSpeed: daily.wind_speed_10m_max[0] ?? 0,
        solarRadiation: daily.shortwave_radiation_sum[0] ?? 0
      }));
    } catch (err) {
      console.error("❌ API Fetch Error:", err);
      alert('❌ Failed to fetch climate data. Check the console for details.');
    }
  };

  useEffect(() => {
    if (formData.date && location) {
      fetchClimateData(formData.date, location);
    }
  }, [formData.date, location]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        alert(`CSV uploaded successfully! Found ${lines.length - 1} records.`);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid CSV file.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Climate Data' : 'Add Climate Data'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csvUpload"
          />
          <label
            htmlFor="csvUpload"
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
          >
            <Upload size={16} />
            <span>Upload CSV</span>
          </label>
          <span className="text-sm text-gray-600">or enter data manually</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Mbeya, Tanzania"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              {t('date')}
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
              {t('temperature')}
            </label>
            <input
              type="number"
              id="temperature"
              value={formData.temperature}
              onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              step="0.1"
              required
            />
          </div>

          <div>
            <label htmlFor="rainfall" className="block text-sm font-medium text-gray-700 mb-2">
              {t('rainfall')}
            </label>
            <input
              type="number"
              id="rainfall"
              value={formData.rainfall}
              onChange={(e) => setFormData({...formData, rainfall: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              step="0.1"
              required
            />
          </div>

          <div>
            <label htmlFor="humidity" className="block text-sm font-medium text-gray-700 mb-2">
              {t('humidity')}
            </label>
            <input
              type="number"
              id="humidity"
              value={formData.humidity}
              onChange={(e) => setFormData({...formData, humidity: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              step="0.1"
              required
            />
          </div>

          <div>
            <label htmlFor="windSpeed" className="block text-sm font-medium text-gray-700 mb-2">
              {t('windSpeed')}
            </label>
            <input
              type="number"
              id="windSpeed"
              value={formData.windSpeed}
              onChange={(e) => setFormData({...formData, windSpeed: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              step="0.1"
              required
            />
          </div>

          <div>
            <label htmlFor="solarRadiation" className="block text-sm font-medium text-gray-700 mb-2">
              {t('solarRadiation')}
            </label>
            <input
              type="number"
              id="solarRadiation"
              value={formData.solarRadiation}
              onChange={(e) => setFormData({...formData, solarRadiation: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{t('save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClimateDataForm;
