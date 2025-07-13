import * as tf from '@tensorflow/tfjs';
import { CropData, ClimateData, Prediction } from '../types';

interface TrainingData {
  inputs: number[][];
  outputs: number[][];
}

interface ModelPrediction {
  yield: number;
  rainfall: number;
  temperature: number;
  confidence: number;
}

class AIService {
  private yieldModel: tf.LayersModel | null = null;
  private climateModel: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      
      // Create and train models
      await this.createModels();
      this.isInitialized = true;
      
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Service:', error);
    }
  }

  private async createModels() {
    // Create yield prediction model
    this.yieldModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [8], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    this.yieldModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Create climate prediction model
    this.climateModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [6], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 2, activation: 'linear' }) // rainfall, temperature
      ]
    });

    this.climateModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Train models with synthetic data
    await this.trainModels();
  }

  private async trainModels() {
    // Generate synthetic training data based on Mbeya, Tanzania agricultural patterns
    const trainingData = this.generateTrainingData();
    
    // Train yield model
    const yieldInputs = tf.tensor2d(trainingData.yield.inputs);
    const yieldOutputs = tf.tensor2d(trainingData.yield.outputs);
    
    await this.yieldModel!.fit(yieldInputs, yieldOutputs, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 0
    });

    // Train climate model
    const climateInputs = tf.tensor2d(trainingData.climate.inputs);
    const climateOutputs = tf.tensor2d(trainingData.climate.outputs);
    
    await this.climateModel!.fit(climateInputs, climateOutputs, {
      epochs: 30,
      batchSize: 16,
      validationSplit: 0.2,
      verbose: 0
    });

    // Clean up tensors
    yieldInputs.dispose();
    yieldOutputs.dispose();
    climateInputs.dispose();
    climateOutputs.dispose();
  }

  private generateTrainingData() {
    const samples = 1000;
    const yieldData = { inputs: [] as number[][], outputs: [] as number[][] };
    const climateData = { inputs: [] as number[][], outputs: [] as number[][] };

    for (let i = 0; i < samples; i++) {
      // Mbeya climate patterns (altitude ~1700m, tropical highland)
      const baseTemp = 20 + Math.random() * 10; // 20-30°C
      const baseRainfall = 800 + Math.random() * 600; // 800-1400mm annually
      const humidity = 60 + Math.random() * 30; // 60-90%
      const solarRadiation = 15 + Math.random() * 10; // 15-25 MJ/m²
      const windSpeed = 5 + Math.random() * 10; // 5-15 km/h

      // Crop factors
      const cropTypeEncoded = Math.floor(Math.random() * 3); // 0=maize, 1=rice, 2=beans
      const fieldSize = 0.5 + Math.random() * 4.5; // 0.5-5 acres
      const fertilizerAmount = Math.random() * 200; // 0-200 kg

      // Yield prediction input: [cropType, fieldSize, temp, rainfall, humidity, solar, wind, fertilizer]
      const yieldInput = [
        cropTypeEncoded, fieldSize, baseTemp, baseRainfall, humidity, 
        solarRadiation, windSpeed, fertilizerAmount
      ];

      // Calculate realistic yield based on Mbeya conditions
      let baseYield = 0;
      switch (cropTypeEncoded) {
        case 0: baseYield = 2.5; break; // Maize: 2.5 tons/acre average
        case 1: baseYield = 1.8; break; // Rice: 1.8 tons/acre average  
        case 2: baseYield = 0.9; break; // Beans: 0.9 tons/acre average
      }

      // Apply climate and management factors
      let yieldMultiplier = 1;
      if (baseTemp > 28) yieldMultiplier *= 0.9; // Heat stress
      if (baseTemp < 18) yieldMultiplier *= 0.85; // Cold stress
      if (baseRainfall < 600) yieldMultiplier *= 0.7; // Drought stress
      if (baseRainfall > 1200) yieldMultiplier *= 0.9; // Excess water
      if (humidity > 85) yieldMultiplier *= 0.95; // Disease pressure
      if (fertilizerAmount > 100) yieldMultiplier *= 1.1; // Good nutrition
      if (solarRadiation > 20) yieldMultiplier *= 1.05; // Good light

      const finalYield = baseYield * yieldMultiplier * fieldSize * (0.8 + Math.random() * 0.4);

      yieldData.inputs.push(yieldInput);
      yieldData.outputs.push([finalYield]);

      // Climate prediction input: [month, historical_temp, historical_rainfall, humidity, solar, wind]
      const month = Math.floor(Math.random() * 12);
      const climateInput = [month, baseTemp, baseRainfall, humidity, solarRadiation, windSpeed];
      
      // Predict next season climate with seasonal variations
      const seasonalTempVariation = Math.sin((month / 12) * 2 * Math.PI) * 3;
      const seasonalRainVariation = Math.cos((month / 12) * 2 * Math.PI) * 200;
      
      const predictedTemp = baseTemp + seasonalTempVariation + (Math.random() - 0.5) * 4;
      const predictedRainfall = Math.max(0, baseRainfall + seasonalRainVariation + (Math.random() - 0.5) * 300);

      climateData.inputs.push(climateInput);
      climateData.outputs.push([predictedRainfall, predictedTemp]);
    }

    return { yield: yieldData, climate: climateData };
  }

  async predict(cropData: CropData, climateData: ClimateData[]): Promise<ModelPrediction> {
    if (!this.isInitialized || !this.yieldModel || !this.climateModel) {
      throw new Error('AI Service not initialized');
    }

    try {
      // Prepare input data
      const avgClimate = this.calculateAverageClimate(climateData);
      
      // Encode crop type
      const cropTypeEncoded = cropData.cropType === 'maize' ? 0 : 
                             cropData.cropType === 'rice' ? 1 : 2;

      // Yield prediction input
      const yieldInput = tf.tensor2d([[
        cropTypeEncoded,
        cropData.fieldSize,
        avgClimate.temperature,
        avgClimate.rainfall,
        avgClimate.humidity,
        avgClimate.solarRadiation,
        avgClimate.windSpeed,
        cropData.fertilizerAmount
      ]]);

      // Climate prediction input
      const currentMonth = new Date().getMonth();
      const climateInput = tf.tensor2d([[
        currentMonth,
        avgClimate.temperature,
        avgClimate.rainfall,
        avgClimate.humidity,
        avgClimate.solarRadiation,
        avgClimate.windSpeed
      ]]);

      // Make predictions
      const yieldPrediction = this.yieldModel.predict(yieldInput) as tf.Tensor;
      const climatePrediction = this.climateModel.predict(climateInput) as tf.Tensor;

      const yieldResult = await yieldPrediction.data();
      const climateResult = await climatePrediction.data();

      // Calculate confidence based on data quality and model certainty
      const confidence = this.calculateConfidence(cropData, climateData);

      // Clean up tensors
      yieldInput.dispose();
      climateInput.dispose();
      yieldPrediction.dispose();
      climatePrediction.dispose();

      return {
        yield: Math.max(0, yieldResult[0]),
        rainfall: Math.max(0, climateResult[0]),
        temperature: climateResult[1],
        confidence
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Failed to generate prediction');
    }
  }

  private calculateAverageClimate(climateData: ClimateData[]) {
    if (climateData.length === 0) {
      // Default values for Mbeya, Tanzania
      return {
        temperature: 24,
        rainfall: 1000,
        humidity: 70,
        solarRadiation: 20,
        windSpeed: 8
      };
    }

    const totals = climateData.reduce((acc, data) => ({
      temperature: acc.temperature + data.temperature,
      rainfall: acc.rainfall + data.rainfall,
      humidity: acc.humidity + data.humidity,
      solarRadiation: acc.solarRadiation + data.solarRadiation,
      windSpeed: acc.windSpeed + data.windSpeed
    }), { temperature: 0, rainfall: 0, humidity: 0, solarRadiation: 0, windSpeed: 0 });

    const count = climateData.length;
    return {
      temperature: totals.temperature / count,
      rainfall: totals.rainfall / count,
      humidity: totals.humidity / count,
      solarRadiation: totals.solarRadiation / count,
      windSpeed: totals.windSpeed / count
    };
  }

  private calculateConfidence(cropData: CropData, climateData: ClimateData[]): number {
    let confidence = 0.7; // Base confidence

    // Data quality factors
    if (climateData.length >= 10) confidence += 0.1;
    if (climateData.length >= 30) confidence += 0.1;
    if (cropData.fertilizerAmount > 0) confidence += 0.05;
    if (cropData.seedVariety) confidence += 0.05;

    // Seasonal factors
    const currentMonth = new Date().getMonth();
    const plantingMonth = new Date(cropData.plantingDate).getMonth();
    const monthDiff = Math.abs(currentMonth - plantingMonth);
    if (monthDiff <= 2) confidence += 0.1; // Recent planting data

    return Math.min(0.95, confidence);
  }

  generateRecommendations(prediction: ModelPrediction, cropData: CropData, climateData: ClimateData[]): {
    positive: string[];
    negative: string[];
    recommendations: string[];
  } {
    const avgClimate = this.calculateAverageClimate(climateData);
    const recommendations = [];
    const positive = [];
    const negative = [];

    // Analyze predicted conditions
    if (prediction.rainfall > 800 && prediction.rainfall < 1200) {
      positive.push('Optimal rainfall expected for crop growth');
    } else if (prediction.rainfall < 600) {
      negative.push('Below-average rainfall predicted - drought risk');
      recommendations.push('Install drip irrigation system');
      recommendations.push('Apply mulch to conserve soil moisture');
    } else if (prediction.rainfall > 1400) {
      negative.push('Excessive rainfall predicted - waterlogging risk');
      recommendations.push('Improve field drainage systems');
      recommendations.push('Consider raised bed cultivation');
    }

    if (prediction.temperature > 18 && prediction.temperature < 28) {
      positive.push('Favorable temperature range for crop development');
    } else if (prediction.temperature > 30) {
      negative.push('High temperatures may cause heat stress');
      recommendations.push('Provide shade during hottest parts of day');
      recommendations.push('Increase irrigation frequency');
    } else if (prediction.temperature < 16) {
      negative.push('Low temperatures may slow crop growth');
      recommendations.push('Consider using row covers for protection');
    }

    // Crop-specific recommendations
    switch (cropData.cropType) {
      case 'maize':
        if (prediction.yield < 2.0) {
          recommendations.push('Consider drought-resistant maize varieties like H516');
          recommendations.push('Apply nitrogen fertilizer at tasseling stage');
        }
        if (avgClimate.humidity > 80) {
          recommendations.push('Monitor for gray leaf spot disease');
        }
        break;
      case 'rice':
        if (prediction.rainfall < 1000) {
          recommendations.push('Ensure adequate water supply for rice paddies');
        }
        recommendations.push('Apply phosphorus fertilizer before transplanting');
        break;
      case 'beans':
        if (prediction.temperature > 28) {
          recommendations.push('Plant beans in partial shade during hot season');
        }
        recommendations.push('Inoculate seeds with rhizobia bacteria');
        break;
    }

    // General recommendations
    if (cropData.fertilizerAmount < 50) {
      recommendations.push('Consider increasing fertilizer application');
    }
    
    if (prediction.confidence < 0.8) {
      recommendations.push('Collect more climate data for better predictions');
    }

    recommendations.push('Monitor weather forecasts regularly');
    recommendations.push('Keep detailed records of crop performance');

    return { positive, negative, recommendations };
  }

  async getModelMetrics() {
    if (!this.yieldModel || !this.climateModel) {
      return null;
    }

    // Generate test data for evaluation
    const testData = this.generateTrainingData();
    const testSize = 100;
    
    const yieldTestInputs = tf.tensor2d(testData.yield.inputs.slice(0, testSize));
    const yieldTestOutputs = tf.tensor2d(testData.yield.outputs.slice(0, testSize));
    
    const yieldEval = this.yieldModel.evaluate(yieldTestInputs, yieldTestOutputs) as tf.Tensor[];
    const yieldLoss = await yieldEval[0].data();
    const yieldMae = await yieldEval[1].data();

    yieldTestInputs.dispose();
    yieldTestOutputs.dispose();
    yieldEval.forEach(tensor => tensor.dispose());

    return {
      yieldModel: {
        loss: yieldLoss[0],
        mae: yieldMae[0]
      },
      lastTraining: new Date().toISOString()
    };
  }
}

export const aiService = new AIService();