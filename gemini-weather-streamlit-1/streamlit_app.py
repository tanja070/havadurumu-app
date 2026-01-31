import streamlit as st
from src.services.gemini_service import fetch_weather
import pandas as pd

st.set_page_config(page_title="Gemini Weather AI", page_icon="🌤️", layout="centered")

def main():
    st.title("🌤️ Gemini Weather AI")
    st.markdown("### Powered by Google Gemini 2.0 & Google Search")
    
    # Simple search
    city = st.text_input("Şehir adı girin:", "Istanbul")
    
    if st.button("Hava Durumunu Getir", type="primary"):
        with st.spinner(f"{city} için hava durumu alınıyor..."):
            weather_data = fetch_weather(city)
            
            if "error" in weather_data:
                st.error(weather_data["error"])
                return
                
            # Current Weather
            col1, col2 = st.columns([1, 1])
            with col1:
                st.metric(
                    label=f"{weather_data.get('city', city)}", 
                    value=f"{weather_data.get('temp', '--')}°C", 
                    delta=f"{weather_data.get('condition', '')}"
                )
                
            with col2:
                st.write(f"**Hissedilen:** {weather_data.get('feelsLike', '--')}°C")
                st.write(f"**Yüksek:** {weather_data.get('high', '--')}°C")
                st.write(f"**Düşük:** {weather_data.get('low', '--')}°C")
            
            # Hourly Forecast
            if "hourly" in weather_data and weather_data["hourly"]:
                st.subheader("Saatlik Tahmin")
                hourly_df = pd.DataFrame(weather_data["hourly"])
                if not hourly_df.empty:
                    st.dataframe(
                        hourly_df[["time", "temp", "icon"]].set_index("time").T,
                        height=100
                    )
            
            # Weekly Forecast
            if "weekly" in weather_data and weather_data["weekly"]:
                st.subheader("Haftalık Tahmin")
                weekly_df = pd.DataFrame(weather_data["weekly"])
                if not weekly_df.empty:
                    st.table(weekly_df[["day", "high", "low", "icon"]])

            # Sources
            if "sources" in weather_data:
                with st.expander("Kaynaklar"):
                    for source in weather_data["sources"]:
                        st.markdown(f"- [{source['title']}]({source['uri']})")
            
            if weather_data.get("isMock"):
                st.warning("Gerçek veri alınamadı, örnek veri gösteriliyor.")

if __name__ == "__main__":
    main()