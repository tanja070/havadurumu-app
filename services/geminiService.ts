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
  // Using gemini-3-flash-preview. 
  // It is critical to use a model that supports Grounding (Search) well.
  const model = "gemini-3-flash-preview"; 
  const now = new Date().toLocaleString("en-US", { timeZoneName: "short" });
  
  // We move the core instructions to systemInstruction to enforce behavior strongly.
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
      "city": "String (The specific city name found)",
      "temp": Number (The CURRENT live temperature in Celsius),
      "condition": "String (e.g., 'Cloudy', 'Sunny', 'Rain')",
      "high": Number (Today's High in Celsius),
      "low": Number (Today's Low in Celsius),
      "feelsLike": Number (in Celsius),
      "hourly": [
        { "time": "HH:MM", "temp": Number, "icon": "String (cloudy, rain, sun, partly-cloudy, storm, snow, moon)", "isNow": Boolean }
      ],
      "weekly": [
        { "day": "String", "high": Number, "low": Number, "icon": "String" }
      ]
    }
    
    Notes:
    - For 'hourly': Ensure times are in the future relative to ${now}.
    - For 'weekly': Forecast for the next 5 days.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: jsonPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Temperature 0 is CRITICAL for factual data retrieval. 
        // It prevents the model from "hallucinating" plausible but wrong numbers.
        temperature: 0, 
        systemInstruction: systemInstruction,
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    const textResponse = response.text || "{}";
    
    // Safety check: ensure the response looks like JSON before parsing
    if (!textResponse.includes('{')) {
      throw new Error("Invalid response format from AI");
    }

    const data = cleanAndParseJson(textResponse) as WeatherData;
    
    if (sources && sources.length > 0) {
      data.sources = sources;
    }

    return data;

  } catch (error) {
    console.error("Weather fetch failed:", error);
    throw error;
  }
};