import os
import json
import time
from google import genai
from google.genai import types
from datetime import datetime
import pytz

def clean_and_parse_json(text: str):
    cleaned = text.replace("```json", "").replace("```", "").strip()
    start = cleaned.find('{')
    end = cleaned.rfind('}')
    if start != -1 and end != -1:
        cleaned = cleaned[start:end+1]
    return json.loads(cleaned)

def get_fallback_weather(location: str):
    # Basic fallback mock data
    return {
        "city": location.capitalize(),
        "temp": 20,
        "condition": "Data Unavailable (Fallback)",
        "high": 25,
        "low": 15,
        "feelsLike": 21,
        "hourly": [],
        "weekly": [],
        "isMock": True
    }

def fetch_weather(location: str):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"error": "API Key not found. Please set GEMINI_API_KEY in secrets."}

    client = genai.Client(api_key=api_key)
    
    model_id = "gemini-2.5-flash" # Exact model from user list
    tz = pytz.timezone('Europe/Istanbul')
    now = datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S %Z")

    system_instruction = """
    You are a strictly factual Weather API.
    Your ONLY job is to retrieve real-time weather data using the 'google_search_tool' tool and format it as JSON.
    
    CRITICAL RULES:
    1. USE THE GOOGLE SEARCH TOOL. Do not use your internal training data.
    2. FIND THE CURRENT LIVE TEMPERATURE. Do not return a daily average.
    3. DO NOT GUESS. If search fails, throw an error.
    4. OUTPUT ONLY VALID JSON. No markdown formatting outside the block.
    """

    json_prompt = f"""
    Context:
    - User Location Query: "{location}"
    - Current Request Time: {now}

    Task:
    1. Search for "current weather in {location} celsius".
    2. Extract the current temperature, condition, high/low for today, and the forecast.
    3. Format the response strictly according to this JSON Schema:
    {{
      "city": "String (The specific city name found in Turkish if possible)",
      "temp": Number (The CURRENT live temperature in Celsius),
      "condition": "String (e.g., 'Bulutlu', 'Güneşli', 'Yağmurlu' - Translate to Turkish)",
      "high": Number (Today's High in Celsius),
      "low": Number (Today's Low in Celsius),
      "feelsLike": Number (in Celsius),
      "hourly": [
        {{ "time": "HH:MM", "temp": Number, "icon": "String (cloudy, rain, sun, partly-cloudy, storm, snow, moon)", "isNow": Boolean }}
      ],
      "weekly": [
        {{ "day": "String (Day name in Turkish)", "high": Number, "low": Number, "icon": "String" }}
      ]
    }}
    """

    try:
        response = client.models.generate_content(
            model=model_id,
            contents=json_prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0,
                system_instruction=system_instruction
            )
        )
        
        text_response = response.text or "{}"
        if '{' not in text_response:
             raise Exception("Invalid response format")

        data = clean_and_parse_json(text_response)
        
        # Add source metadata if available
        if response.candidates and response.candidates[0].grounding_metadata and response.candidates[0].grounding_metadata.grounding_chunks:
             chunks = response.candidates[0].grounding_metadata.grounding_chunks
             sources = [{"title": c.web.title, "uri": c.web.uri} for c in chunks if c.web]
             if sources:
                 data["sources"] = sources

        return data

    except Exception as e:
        # Return error message to UI for easier debugging
        print(f"Error fetching weather: {e}")
        fallback = get_fallback_weather(location)
        fallback["error_details"] = str(e) # Expose error to UI
        return fallback