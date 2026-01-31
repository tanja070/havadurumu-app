import streamlit as st
from src.main import load_weather, delete_city, get_saved_cities

def main():
    st.title("Gemini Weather App")
    
    # Sidebar for saved cities
    st.sidebar.header("Saved Cities")
    saved_cities = get_saved_cities()
    if saved_cities:
        selected_city = st.sidebar.selectbox("Select a city", saved_cities)
        if st.sidebar.button("Load Weather"):
            load_weather(selected_city)

    # Search for a city
    search_query = st.text_input("Search for a city")
    if st.button("Search"):
        if search_query:
            load_weather(search_query)

    # Display weather data
    weather_data = st.session_state.get("weather_data")
    if weather_data:
        st.subheader(f"Weather in {weather_data['city']}")
        st.write(f"Temperature: {weather_data['temp']}°")
        st.write(f"Condition: {weather_data['condition']}")
        st.write(f"High: {weather_data['high']}° | Low: {weather_data['low']}°")
    else:
        st.write("No weather data available.")

if __name__ == "__main__":
    main()