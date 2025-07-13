import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Thermometer, Droplets, Cloud } from 'lucide-react';
import { ClimateData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import ClimateDataForm from './ClimateDataForm';

const ClimateDataList: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [climateData, setClimateData] = useState<ClimateData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ClimateData | null>(null);

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`climateData_${user.id}`);
      if (savedData) {
        setClimateData(JSON.parse(savedData));
      }
    }
  }, [user]);

  const saveClimateData = (data: ClimateData[]) => {
    if (user) {
      localStorage.setItem(`climateData_${user.id}`, JSON.stringify(data));
      setClimateData(data);
    }
  };

  const handleSave = (formData: Omit<ClimateData, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    if (editingItem) {
      const updatedData = climateData.map(item =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      );
      saveClimateData(updatedData);
    } else {
      const newItem: ClimateData = {
        ...formData,
        id: Date.now().toString(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      saveClimateData([...climateData, newItem]);
    }

    setShowForm(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this climate data?')) {
      saveClimateData(climateData.filter(item => item.id !== id));
    }
  };

  const handleEdit = (item: ClimateData) => {
    setEditingItem(item);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <ClimateDataForm
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        initialData={editingItem || undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('climateData')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Plus size={20} />
          <span>Add Climate Data</span>
        </button>
      </div>

      {climateData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌤️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No climate data yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first climate data entry</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Climate Data
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {climateData.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar size={20} className="text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Thermometer size={16} className="text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">{t('temperature')}</p>
                    <p className="font-semibold">{item.temperature}°C</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets size={16} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">{t('rainfall')}</p>
                    <p className="font-semibold">{item.rainfall}mm</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">{t('humidity')}</p>
                    <p className="font-semibold">{item.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">Solar</p>
                    <p className="font-semibold">{item.solarRadiation} MJ/m²</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-sky-600 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{item.location}</p>
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

export default ClimateDataList;