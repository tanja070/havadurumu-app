from streamlit import container, title, header, subheader, markdown

def render_header():
    container.header("Gemini Weather App")
    container.subheader("Your personal weather assistant")

def render_weather_info(city, temperature, condition):
    container.markdown(f"### Weather in **{city}**")
    container.markdown(f"**Temperature:** {temperature}°C")
    container.markdown(f"**Condition:** {condition}")

def render_error_message(message):
    container.markdown(f"<div style='color: red;'>{message}</div>", unsafe_allow_html=True)

def render_loading():
    container.markdown("Loading...")