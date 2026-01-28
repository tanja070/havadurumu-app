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

export const fetchWeather = async (location: string): Promise<WeatherData> => {
  const model = "gemini-3-flash-preview";
  const jsonPrompt = `
    Return a valid JSON object for the weather in "${location}".
    Schema:
    {
      "city": "String",
      "temp": Number (Celsius),
      "condition": "String",
      "high": Number,
      "low": Number,
      "feelsLike": Number,
      "hourly": [{ "time": "String", "temp": Number, "icon": "String", "isNow": Boolean }],
      "weekly": [{ "day": "String", "high": Number, "low": Number, "icon": "String" }]
    }
    For hourly: provide next 5 hours.
    For weekly: provide next 5 days.
    Icon keys: 'cloudy', 'rain', 'sun', 'partly-cloudy', 'storm', 'snow', 'moon'.
    Return ONLY JSON.
  `;

  try {
    // Attempt 1: Try with Google Search for real-time accuracy
    const response = await ai.models.generateContent({
      model: model,
      contents: `Get current real-time weather for "${location}" using search. ${jsonPrompt}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    const data = cleanAndParseJson(response.text || "{}") as WeatherData;
    
    if (sources && sources.length > 0) {
      data.sources = sources;
    }

    return data;

  } catch (error) {
    console.warn("Search grounding failed, falling back to estimation:", error);
    
    // Attempt 2: Fallback to simple generation (no tools) if search fails (fixes RPC errors)
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: model,
        contents: `Estimate the current weather for "${location}" based on typical seasonal patterns. ${jsonPrompt}`,
      });
      
      const data = cleanAndParseJson(fallbackResponse.text || "{}") as WeatherData;
      return data;
    } catch (fallbackError) {
      console.error("Fallback failed:", fallbackError);
      throw fallbackError;
    }
  }
};