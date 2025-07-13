import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { CropData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CropDataForm from './CropDataForm';

const CropDataList: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CropData | null>(null);

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`cropData_${user.id}`);
      if (savedData) {
        setCropData(JSON.parse(savedData));
      }
    }
  }, [user]);

  const saveCropData = (data: CropData[]) => {
    if (user) {
      localStorage.setItem(`cropData_${user.id}`, JSON.stringify(data));
      setCropData(data);
    }
  };

  const handleSave = (formData: Omit<CropData, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    if (editingItem) {
      const updatedData = cropData.map(item =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      );
      saveCropData(updatedData);
    } else {
      const newItem: CropData = {
        ...formData,
        id: Date.now().toString(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      saveCropData([...cropData, newItem]);
    }

    setShowForm(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this crop data?')) {
      saveCropData(cropData.filter(item => item.id !== id));
    }
  };

  const handleEdit = (item: CropData) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const getCropIcon = (cropType: string) => {
    switch (cropType) {
      case 'maize': return '🌽';
      case 'rice': return '🌾';
      case 'beans': return '🫘';
      default: return '🌱';
    }
  };

  if (showForm) {
    return (
      <CropDataForm
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
        <h1 className="text-2xl font-bold text-gray-900">{t('cropData')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Plus size={20} />
          <span>Add Crop Data</span>
        </button>
      </div>

      {cropData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No crop data yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first crop data entry</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Crop Data
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cropData.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCropIcon(item.cropType)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t(item.cropType)}</h3>
                    <p className="text-sm text-gray-600">{item.seedVariety}</p>
                  </div>
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

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Planted: {new Date(item.plantingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{item.fieldSize} acres</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Fertilizer:</span> {item.fertilizerType} ({item.fertilizerAmount}kg)
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Irrigation:</span> {item.irrigationMethod}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropDataList;