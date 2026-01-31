import os
import google.genai as genai
from google.genai import types

# API Key'i buraya yapıştırın veya ortam değişkeninden alın
# Eger export GEMINI_API_KEY="..." yaptiysaniz buna gerek yok
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Lutfen API Key'inizi asagidaki satira yazin.")
    api_key = input("API Key: ")

print(f"Testing with key: {api_key[:5]}...")

client = genai.Client(api_key=api_key)

print("\n--- Listing Available Models ---")
try:
    for m in client.models.list(config={"page_size": 100}):
        print(f"- {m.name}")
        if "generateContent" in m.supported_generation_methods:
             print(f"  (Supports generateContent) -> OK")
        else:
             print(f"  (READ ONLY or other method)")
             
except Exception as e:
    print(f"\nError listing models: {e}")

print("\n--- Testing Generation with 'gemini-1.5-flash' ---")
try:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents="Hello, are you working?",
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error testing gemini-1.5-flash: {e}")
