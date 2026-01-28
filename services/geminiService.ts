import { GoogleGenAI } from "@google/genai";
import { WeatherData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON string
const cleanAndParseJson = (text: string): any => {
  let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return JSON.parse(cleaned);
};

// Helper for delay (ms)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate realistic fallback data when API is unavailable
const getFallbackWeather = (location: string): WeatherData => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Create predictable but varied data based on location name length
  const baseTemp = 18 + (location.length % 10);
  const cityDisplay = location.split(',')[0].trim();
  const capCity = cityDisplay.charAt(0).toUpperCase() + cityDisplay.slice(1);

  return {
    city: `${capCity}`,
    temp: baseTemp,
    condition: "Parçalı Bulutlu",
    high: baseTemp + 4,
    low: baseTemp - 3,
    feelsLike: baseTemp + 1,
    hourly: Array.from({ length: 12 }, (_, i) => {
      const h = (currentHour + i) % 24;
      const isDay = h > 6 && h < 20;
      return {
        time: `${h.toString().padStart(2, '0')}:00`,
        temp: baseTemp + (isDay ? 2 : -2) + Math.floor(Math.random() * 3),
        icon: isDay ? "cloud-sun" : "cloud-moon",
        isNow: i === 0
      };
    }),
    weekly: [
      { day: "Pazartesi", high: baseTemp + 2, low: baseTemp - 2, icon: "sun" },
      { day: "Salı", high: baseTemp + 3, low: baseTemp - 1, icon: "cloud-sun" },
      { day: "Çarşamba", high: baseTemp + 1, low: baseTemp - 3, icon: "cloud-rain" },
      { day: "Perşembe", high: baseTemp, low: baseTemp - 4, icon: "cloud" },
      { day: "Cuma", high: baseTemp + 4, low: baseTemp, icon: "sun" },
    ],
    isMock: true
  };
};

export const fetchWeather = async (location: string): Promise<WeatherData> => {
  const model = "gemini-3-flash-preview"; 
  const now = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", timeZoneName: "short" });
  
  const systemInstruction = `
    You are a strictly factual Weather API. 
    Your ONLY job is to retrieve real-time weather data using the 'googleSearch' tool and format it as JSON.
    
    CRITICAL RULES:
    1. USE THE GOOGLE SEARCH TOOL. Do not use your internal training data (it is old).
    2. FIND THE CURRENT LIVE TEMPERATURE. Do not return a daily average or a forecast as the current temp.
    3. DO NOT GUESS. If search fails, throw an error.
    4. OUTPUT ONLY VALID JSON. No markdown formatting outside the block, no chat text.
  `;

  const jsonPrompt = `
    Context:
    - User Location Query: "${location}"
    - Current Request Time: ${now}

    Task:
    1. Search for "current weather in ${location} celsius".
    2. Extract the current temperature, condition, high/low for today, and the forecast.
    3. Format the response strictly according to this JSON Schema:
    {
      "city": "String (The specific city name found in Turkish if possible)",
      "temp": Number (The CURRENT live temperature in Celsius),
      "condition": "String (e.g., 'Bulutlu', 'Güneşli', 'Yağmurlu' - Translate to Turkish)",
      "high": Number (Today's High in Celsius),
      "low": Number (Today's Low in Celsius),
      "feelsLike": Number (in Celsius),
      "hourly": [
        { "time": "HH:MM", "temp": Number, "icon": "String (cloudy, rain, sun, partly-cloudy, storm, snow, moon)", "isNow": Boolean }
      ],
      "weekly": [
        { "day": "String (Day name in Turkish)", "high": Number, "low": Number, "icon": "String" }
      ]
    }
    
    Notes:
    - For 'hourly': Ensure times are in the future relative to ${now}.
    - For 'weekly': Forecast for the next 5 days.
  `;

  let lastError: any;
  const maxRetries = 2; 

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: jsonPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0, 
          systemInstruction: systemInstruction,
        },
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web)
        .map((web: any) => ({ title: web.title, uri: web.uri }));

      const textResponse = response.text || "{}";
      
      if (!textResponse.includes('{')) {
        throw new Error("Invalid response format from AI");
      }

      const data = cleanAndParseJson(textResponse) as WeatherData;
      
      // Ensure arrays exist to prevent crashes
      if (!Array.isArray(data.hourly)) data.hourly = [];
      if (!Array.isArray(data.weekly)) data.weekly = [];

      if (sources && sources.length > 0) {
        data.sources = sources;
      }

      return data;

    } catch (error: any) {
      lastError = error;
      const errorStr = JSON.stringify(error);
      
      const isQuotaError = errorStr.includes("429") || 
                           errorStr.includes("RESOURCE_EXHAUSTED") || 
                           errorStr.includes("quota");

      if (isQuotaError) {
        if (attempt < maxRetries) {
          const delayTime = Math.pow(2, attempt) * 1000;
          await wait(delayTime);
          continue;
        } else {
          // If we run out of retries on a quota error, return fallback data
          console.warn("Quota exceeded, returning fallback data.");
          return getFallbackWeather(location);
        }
      }
      
      // If it's not a quota error (e.g. 500, network), break and throw
      break;
    }
  }

  // Handle final error
  const finalErrorStr = lastError?.message || JSON.stringify(lastError);
  if (finalErrorStr.includes("429") || finalErrorStr.includes("RESOURCE_EXHAUSTED")) {
    // This fallback is redundant if the loop logic is correct, but safe to keep
    return getFallbackWeather(location);
  }
  
  throw lastError;
};