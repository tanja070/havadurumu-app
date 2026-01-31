from streamlit import st

def city_input():
    city = st.text_input("Şehir adı girin:", "")
    return city

def submit_button():
    return st.button("Hava Durumunu Getir")

def display_weather_data(weather_data):
    if weather_data:
        st.write(f"**Şehir:** {weather_data['city']}")
        st.write(f"**Sıcaklık:** {weather_data['temp']}°")
        st.write(f"**Durum:** {weather_data['condition']}")
        st.write(f"**Yüksek:** {weather_data['high']}°")
        st.write(f"**Düşük:** {weather_data['low']}°")
    else:
        st.write("Hava durumu verisi mevcut değil.")