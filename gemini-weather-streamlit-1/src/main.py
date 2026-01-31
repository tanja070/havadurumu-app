from streamlit import st
from src.services.gemini_service import fetch_weather
from src.components.ui import display_weather
from src.components.widgets import city_input

def main():
    st.title("Gemini Weather App")
    
    city = city_input()
    
    if city:
        weather_data = fetch_weather(city)
        if weather_data:
            display_weather(weather_data)
        else:
            st.error("Weather data could not be retrieved.")

if __name__ == "__main__":
    main()