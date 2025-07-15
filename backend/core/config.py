# /core/config.py
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Nama folder utama proyek
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Konfigurasi Model
    MODEL_PATH: str = os.path.join(BASE_DIR, 'ml_models', 'model_LSTM_beta.h5')
    TIME_STEP: int = 15
    
    # Konfigurasi Buffer
    DATA_BUFFER_PATH: str = os.path.join(BASE_DIR, 'data', 'data_buffer.json')

    API_KEY: str 
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

# Buat satu instance settings untuk digunakan di seluruh aplikasi
settings = Settings()