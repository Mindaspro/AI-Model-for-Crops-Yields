interface ExternalAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface WeatherInsight {
  summary: string;
  recommendations: string[];
  riskFactors: string[];
}

class ExternalAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = "tgp_v1_mk58-T0sCOsQLPDQ6-6HrcXFjScnAK3WBQ6Dl3hoKRU";
    this.baseUrl = "https://api.together.xyz/v1";
  }

  async getWeatherInsights(
    cropType: string,
    location: string,
    climateData: any[]
  ): Promise<WeatherInsight> {
    try {
      const avgTemp = climateData.reduce((sum, d) => sum + d.temperature, 0) / climateData.length;
      const avgRainfall = climateData.reduce((sum, d) => sum + d.rainfall, 0) / climateData.length;
      const avgHumidity = climateData.reduce((sum, d) => sum + d.humidity, 0) / climateData.length;

      const prompt = `As an agricultural expert specializing in East African farming, analyze the following climate data for ${cropType} cultivation in ${location}:

Climate Data:
- Average Temperature: ${avgTemp.toFixed(1)}°C
- Average Rainfall: ${avgRainfall.toFixed(0)}mm
- Average Humidity: ${avgHumidity.toFixed(1)}%
- Location: ${location}

Please provide:
1. A brief summary of how these conditions affect ${cropType} growth
2. Specific recommendations for optimizing yield under these conditions
3. Key risk factors to monitor

Format your response as JSON with keys: summary, recommendations (array), riskFactors (array)`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-2-7b-chat-hf',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: ExternalAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in API response');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        return {
          summary: content.substring(0, 200) + '...',
          recommendations: [
            'Monitor weather conditions regularly',
            'Adjust irrigation based on rainfall patterns',
            'Consider climate-adapted varieties'
          ],
          riskFactors: [
            'Temperature fluctuations',
            'Irregular rainfall patterns',
            'Humidity-related diseases'
          ]
        };
      }
    } catch (error) {
      console.error('External AI API error:', error);
      
      // Fallback response
      return {
        summary: `Climate analysis for ${cropType} in ${location} shows mixed conditions that require careful management.`,
        recommendations: [
          'Implement water conservation techniques',
          'Use appropriate fertilizer timing',
          'Monitor for pest and disease pressure',
          'Consider intercropping for risk mitigation'
        ],
        riskFactors: [
          'Climate variability',
          'Seasonal weather changes',
          'Potential drought stress',
          'Disease pressure from humidity'
        ]
      };
    }
  }

  async getCropOptimizationAdvice(
    cropType: string,
    yieldPrediction: number,
    fieldSize: number
  ): Promise<string[]> {
    try {
      const prompt = `As an agricultural advisor, provide 5 specific optimization strategies for ${cropType} cultivation with a predicted yield of ${yieldPrediction} tons on ${fieldSize} acres. Focus on practical, actionable advice for farmers in Tanzania.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-2-7b-chat-hf',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: ExternalAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in API response');
      }

      // Extract advice points from the response
      const advicePoints = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 5);

      return advicePoints.length > 0 ? advicePoints : [
        'Optimize planting density for maximum yield',
        'Implement precision fertilizer application',
        'Use integrated pest management strategies',
        'Improve soil health through organic matter',
        'Monitor crop growth stages carefully'
      ];
    } catch (error) {
      console.error('Crop optimization API error:', error);
      
      // Fallback advice
      return [
        'Optimize planting density for maximum yield',
        'Implement precision fertilizer application',
        'Use integrated pest management strategies',
        'Improve soil health through organic matter',
        'Monitor crop growth stages carefully'
      ];
    }
  }
}

export const externalAiService = new ExternalAIService();