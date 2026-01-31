from typing import List, Optional, Dict, Any

class WeatherData:
    def __init__(self, city: str, temp: float, condition: str, high: float, low: float, hourly: Optional[List[Dict[str, Any]]] = None, weekly: Optional[List[Dict[str, Any]]] = None):
        self.city = city
        self.temp = temp
        self.condition = condition
        self.high = high
        self.low = low
        self.hourly = hourly if hourly is not None else []
        self.weekly = weekly if weekly is not None else []

class TabView:
    HOURLY = "hourly"
    WEEKLY = "weekly"