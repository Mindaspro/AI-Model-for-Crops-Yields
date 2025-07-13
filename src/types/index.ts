export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  location: string;
  createdAt: string;
}

export interface CropData {
  id: string;
  userId: string;
  cropType: 'maize' | 'rice' | 'beans';
  plantingDate: string;
  expectedHarvestDate: string;
  fieldSize: number;
  fertilizerType: string;
  fertilizerAmount: number;
  seedVariety: string;
  irrigationMethod: string;
  createdAt: string;
}

export interface ClimateData {
  id: string;
  userId: string;
  date: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
  createdAt: string;
}

export interface Prediction {
  id: string;
  userId: string;
  cropDataId: string;
  predictedYield: number;
  predictedRainfall: number;
  predictedTemperature: number;
  climateImpact: {
    positive: string[];
    negative: string[];
    recommendations: string[];
  };
  confidence: number;
  createdAt: string;
}

export interface Language {
  code: 'en' | 'sw';
  name: string;
  flag: string;
}