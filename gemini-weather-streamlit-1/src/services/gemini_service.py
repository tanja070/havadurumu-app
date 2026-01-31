import requests

def fetch_weather(location: str) -> dict:
    api_key = "YOUR_API_KEY"  # Replace with your actual API key
    base_url = "http://api.weatherapi.com/v1/current.json"
    response = requests.get(f"{base_url}?key={api_key}&q={location}")

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error fetching weather data: {response.status_code} - {response.text}")