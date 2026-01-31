# Gemini Weather Streamlit

This project is a weather application built using Streamlit, which provides real-time weather information and forecasts. The application fetches data from an external weather API and presents it in an interactive user interface.

## Project Structure

```
gemini-weather-streamlit
├── streamlit_app.py          # Entry point for the Streamlit application
├── requirements.txt          # Python dependencies for the project
├── .streamlit                # Configuration settings for Streamlit
│   └── config.toml
├── src                       # Source code for the application
│   ├── __init__.py          # Marks the src directory as a Python package
│   ├── main.py              # Main logic of the application
│   ├── services              # Contains service functions
│   │   └── gemini_service.py # Fetches weather data from an external API
│   ├── components            # UI components for the Streamlit app
│   │   ├── ui.py            # Layout elements and visual components
│   │   └── widgets.py        # Custom interactive widgets
│   └── models                # Data models and types
│       └── types.py         # Defines data structures used in the app
├── tests                     # Unit tests for the application
│   └── test_gemini_service.py # Tests for the gemini_service functions
├── .gitignore                # Specifies files to ignore in Git
└── README.md                 # Documentation for the project
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd gemini-weather-streamlit
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

To run the Streamlit application, execute the following command in your terminal:
```
streamlit run streamlit_app.py
```

## Features

- Real-time weather data fetching
- Hourly and weekly forecasts
- User-friendly interface with interactive components

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.