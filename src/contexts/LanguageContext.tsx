import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' }
];

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    cropData: 'Crop Data',
    climateData: 'Climate Data',
    predictions: 'Predictions',
    profile: 'Profile',
    logout: 'Logout',
    
    // Auth
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    fullName: 'Full Name',
    location: 'Location',
    
    // Crop Data
    cropType: 'Crop Type',
    plantingDate: 'Planting Date',
    expectedHarvestDate: 'Expected Harvest Date',
    fieldSize: 'Field Size (acres)',
    fertilizerType: 'Fertilizer Type',
    fertilizerAmount: 'Fertilizer Amount (kg)',
    seedVariety: 'Seed Variety',
    irrigationMethod: 'Irrigation Method',
    
    // Climate Data
    temperature: 'Temperature (°C)',
    rainfall: 'Rainfall (mm)',
    humidity: 'Humidity (%)',
    windSpeed: 'Wind Speed (km/h)',
    solarRadiation: 'Solar Radiation (MJ/m²)',
    
    // Predictions
    predictedYield: 'Predicted Yield',
    climateImpact: 'Climate Impact Assessment',
    recommendations: 'Recommendations',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    submit: 'Submit',
    date: 'Date',
    maize: 'Maize',
    rice: 'Rice',
    beans: 'Beans'
  },
  sw: {
    // Navigation
    dashboard: 'Dashibodi',
    cropData: 'Taarifa za Mazao',
    climateData: 'Taarifa za Hali ya Hewa',
    predictions: 'Utabiri',
    profile: 'Wasifu',
    logout: 'Ondoka',
    
    // Auth
    login: 'Ingia',
    register: 'Jisajili',
    username: 'Jina la mtumiaji',
    password: 'Neno la siri',
    email: 'Barua pepe',
    fullName: 'Jina kamili',
    location: 'Eneo',
    
    // Crop Data
    cropType: 'Aina ya Mazao',
    plantingDate: 'Tarehe ya Kupanda',
    expectedHarvestDate: 'Tarehe ya Kuvuna',
    fieldSize: 'Ukubwa wa Shamba (ekari)',
    fertilizerType: 'Aina ya Mbolea',
    fertilizerAmount: 'Kiasi cha Mbolea (kg)',
    seedVariety: 'Aina ya Mbegu',
    irrigationMethod: 'Njia ya Umwagiliaji',
    
    // Climate Data
    temperature: 'Joto (°C)',
    rainfall: 'Mvua (mm)',
    humidity: 'Unyevunyevu (%)',
    windSpeed: 'Kasi ya Upepo (km/h)',
    solarRadiation: 'Mionzi ya Jua (MJ/m²)',
    
    // Predictions
    predictedYield: 'Utabiri wa Mazao',
    climateImpact: 'Tathmini ya Mabadiliko ya Tabianchi',
    recommendations: 'Mapendekezo',
    
    // Common
    save: 'Hifadhi',
    cancel: 'Ghairi',
    loading: 'Inapakia...',
    submit: 'Tuma',
    date: 'Tarehe',
    maize: 'Mahindi',
    rice: 'Mchele',
    beans: 'Maharage'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      const lang = languages.find(l => l.code === savedLanguage);
      if (lang) setCurrentLanguage(lang);
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language.code);
  };

  const t = (key: string): string => {
    return translations[currentLanguage.code][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { languages };