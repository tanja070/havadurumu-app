export interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
  isNow?: boolean;
}

export interface DailyForecast {
  day: string;
  high: number;
  low: number;
  icon: string;
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  feelsLike: number;
  hourly: HourlyForecast[];
  weekly: DailyForecast[];
  sources?: { title: string; uri: string }[];
}

export enum TabView {
  HOURLY = 'Hourly',
  WEEKLY = 'Weekly'
}