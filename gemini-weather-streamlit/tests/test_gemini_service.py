import pytest
from src.services.gemini_service import fetch_weather

def test_fetch_weather_success(mocker):
    mock_response = {
        "city": "Istanbul",
        "temp": 20,
        "condition": "Clear",
        "high": 25,
        "low": 15,
        "hourly": [{"time": "10:00", "temp": 20, "icon": "sun", "isNow": True}],
        "weekly": [{"day": "Monday", "high": 25, "low": 15, "icon": "sun"}]
    }
    
    mocker.patch('src.services.gemini_service.requests.get', return_value=mock_response)
    
    result = fetch_weather("Istanbul")
    
    assert result["city"] == "Istanbul"
    assert result["temp"] == 20
    assert result["condition"] == "Clear"

def test_fetch_weather_failure(mocker):
    mocker.patch('src.services.gemini_service.requests.get', side_effect=Exception("Network Error"))
    
    with pytest.raises(Exception) as excinfo:
        fetch_weather("InvalidCity")
    
    assert str(excinfo.value) == "Network Error"