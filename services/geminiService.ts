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
  const maxRetries = 3; // Maximum number of retries

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
      
      // Validate response structure
      if (!textResponse.includes('{')) {
        throw new Error("Invalid response format from AI");
      }

      const data = cleanAndParseJson(textResponse) as WeatherData;
      
      if (sources && sources.length > 0) {
        data.sources = sources;
      }

      return data;

    } catch (error: any) {
      lastError = error;
      const errorStr = JSON.stringify(error);
      
      // Check for 429 (Too Many Requests) or Resource Exhausted errors
      const isQuotaError = errorStr.includes("429") || 
                           errorStr.includes("RESOURCE_EXHAUSTED") || 
                           errorStr.includes("quota");

      if (isQuotaError && attempt < maxRetries) {
        // Exponential backoff: Wait 1s, then 2s, then 4s...
        const delayTime = Math.pow(2, attempt - 1) * 1000;
        console.warn(`Attempt ${attempt} failed with 429/Quota. Retrying in ${delayTime}ms...`);
        await wait(delayTime);
        continue;
      }
      
      // If it's not a quota error or we ran out of retries, break the loop
      break;
    }
  }

  // Handle the final error to provide a user-friendly message
  const finalErrorStr = lastError?.message || JSON.stringify(lastError);
  
  if (finalErrorStr.includes("429") || finalErrorStr.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("⚠️ Sunucu çok yoğun (Kota Aşıldı). Lütfen 10-15 saniye bekleyip tekrar deneyin.");
  }
  
  throw lastError;
};