import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { CropData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface CropDataFormProps {
  onSave: (data: Omit<CropData, 'id' | 'userId' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: CropData;
}

const CropDataForm: React.FC<CropDataFormProps> = ({ onSave, onCancel, initialData }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    cropType: initialData?.cropType || 'maize' as 'maize' | 'rice' | 'beans',
    plantingDate: initialData?.plantingDate || '',
    expectedHarvestDate: initialData?.expectedHarvestDate || '',
    fieldSize: initialData?.fieldSize || 0,
    fertilizerType: initialData?.fertilizerType || '',
    fertilizerAmount: initialData?.fertilizerAmount || 0,
    seedVariety: initialData?.seedVariety || '',
    irrigationMethod: initialData?.irrigationMethod || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const cropTypes = [
    { value: 'maize', label: t('maize') },
    { value: 'rice', label: t('rice') },
    { value: 'beans', label: t('beans') }
  ];

  const irrigationMethods = [
    { value: 'rainfed', label: 'Rainfed' },
    { value: 'sprinkler', label: 'Sprinkler' },
    { value: 'drip', label: 'Drip' },
    { value: 'flood', label: 'Flood' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Crop Data' : 'Add New Crop Data'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-2">
              {t('cropType')}
            </label>
            <select
              id="cropType"
              value={formData.cropType}
              onChange={(e) => setFormData({...formData, cropType: e.target.value as 'maize' | 'rice' | 'beans'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {cropTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="seedVariety" className="block text-sm font-medium text-gray-700 mb-2">
              {t('seedVariety')}
            </label>
            <input
              type="text"
              id="seedVariety"
              value={formData.seedVariety}
              onChange={(e) => setFormData({...formData, seedVariety: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., H516, Supa"
            />
          </div>

          <div>
            <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700 mb-2">
              {t('plantingDate')}
            </label>
            <input
              type="date"
              id="plantingDate"
              value={formData.plantingDate}
              onChange={(e) => setFormData({...formData, plantingDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="expectedHarvestDate" className="block text-sm font-medium text-gray-700 mb-2">
              {t('expectedHarvestDate')}
            </label>
            <input
              type="date"
              id="expectedHarvestDate"
              value={formData.expectedHarvestDate}
              onChange={(e) => setFormData({...formData, expectedHarvestDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="fieldSize" className="block text-sm font-medium text-gray-700 mb-2">
              {t('fieldSize')}
            </label>
            <input
              type="number"
              id="fieldSize"
              value={formData.fieldSize}
              onChange={(e) => setFormData({...formData, fieldSize: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.0"
              step="0.1"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="irrigationMethod" className="block text-sm font-medium text-gray-700 mb-2">
              {t('irrigationMethod')}
            </label>
            <select
              id="irrigationMethod"
              value={formData.irrigationMethod}
              onChange={(e) => setFormData({...formData, irrigationMethod: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select irrigation method</option>
              {irrigationMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fertilizerType" className="block text-sm font-medium text-gray-700 mb-2">
              {t('fertilizerType')}
            </label>
            <input
              type="text"
              id="fertilizerType"
              value={formData.fertilizerType}
              onChange={(e) => setFormData({...formData, fertilizerType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., NPK, Urea, DAP"
            />
          </div>

          <div>
            <label htmlFor="fertilizerAmount" className="block text-sm font-medium text-gray-700 mb-2">
              {t('fertilizerAmount')}
            </label>
            <input
              type="number"
              id="fertilizerAmount"
              value={formData.fertilizerAmount}
              onChange={(e) => setFormData({...formData, fertilizerAmount: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.0"
              step="0.1"
              min="0"
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

export default CropDataForm;