import numpy as np
import json
import os
from collections import deque
from datetime import datetime, timedelta
from tensorflow.keras.models import load_model
from typing import List
import joblib

from core.config import settings 

class PredictionService:
    def __init__(self):
        self.model = load_model(settings.MODEL_PATH)
        self.scaler = joblib.load(settings.SCALER_PATH) 
        self.data_buffer = self._load_data_buffer()
        print("Prediction Service Initialized: Model and Buffer Loaded.")

    def _load_data_buffer(self) -> dict:
        if os.path.exists(settings.DATA_BUFFER_PATH):
            try:
                with open(settings.DATA_BUFFER_PATH, 'r') as f:
                    data = json.load(f)
                    # Jika data buffer lama (list), konversi ke dict
                    if isinstance(data, list):
                        return {"buffer": data, "updated_at": None}
                    return data
            except (json.JSONDecodeError, IOError) as e:
                print(f"Warning: Could not load buffer file. Creating a new one. Error: {e}")
        return {"buffer": [], "updated_at": None}

    def _save_data_buffer(self):
        buffer_dir = os.path.dirname(settings.DATA_BUFFER_PATH)
        os.makedirs(buffer_dir, exist_ok=True)
        with open(settings.DATA_BUFFER_PATH, 'w') as f:
            json.dump(self.data_buffer, f)
            
    def add_data(self, values: List) -> dict:
        new_buffer = []

        # Jika values adalah list of dict (format baru)
        if values and isinstance(values[0], dict) and 'date' in values[0] and 'value' in values[0]:
            for entry in values:
                new_buffer.append({
                    "date": entry["date"],
                    "value": entry["value"]
                })
        else:
            # Fallback: list of float
            start_date = datetime.now()
            for i, value in enumerate(values):
                entry = {
                    "date": (start_date + timedelta(days=i)).strftime("%Y-%m-%d"),
                    "value": value
                }
                new_buffer.append(entry)

        # Potong agar hanya simpan TIME_STEP terakhir
        new_buffer = new_buffer[-settings.TIME_STEP:]

        self.data_buffer["buffer"] = new_buffer
        self.data_buffer["updated_at"] = datetime.now().isoformat()
        self._save_data_buffer()

        return {
            "message": f"Buffer overwritten with {len(new_buffer)} data points",
            "buffer_size": len(new_buffer),
            "needed": max(0, settings.TIME_STEP - len(new_buffer)),
            "updated_at": self.data_buffer["updated_at"]
        }
        
    def get_buffer_status(self) -> dict:
        return {
            "current_size": len(self.data_buffer["buffer"]),
            "needed": max(0, settings.TIME_STEP - len(self.data_buffer["buffer"])),
            "current_data": list(self.data_buffer["buffer"]),
            "updated_at": self.data_buffer["updated_at"]
        }

    def predict(self, n_days: int) -> List[dict]:
        self.data_buffer["buffer"].sort(key=lambda x: x['date'])
        history_items = self.data_buffer["buffer"][-settings.TIME_STEP:]

        if len(history_items) < settings.TIME_STEP:
            return []

        history_values = [item['value'] for item in history_items]
        last_date = datetime.strptime(history_items[-1]['date'], "%Y-%m-%d")

        predictions = []
        
        # 1. SCALING INPUT
        # Ubah list history menjadi numpy array dan scale
        scaled_history = self.scaler.transform(np.array(history_values).reshape(-1, 1))
        
        # Buat temporary list untuk proses prediksi autoregressive
        temp_input = list(scaled_history.flatten())

        for i in range(n_days):
            input_seq_scaled = np.array(temp_input[-settings.TIME_STEP:]).reshape(1, settings.TIME_STEP, 1)
            
            # Model memprediksi berdasarkan data yang sudah di-scale
            next_pred_scaled = self.model.predict(input_seq_scaled, verbose=0)
            
            # 2. INVERSE TRANSFORM (UNSCALING) OUTPUT
            # Kembalikan prediksi ke skala aslinya (mm)
            next_pred_real = self.scaler.inverse_transform(next_pred_scaled)[0][0]
            # Pastikan tidak ada nilai negatif
            next_pred_real = max(0, float(next_pred_real))

            rounded_value = round(next_pred_real, 2)
            pred_date = (last_date + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            predictions.append({"date": pred_date, "value": rounded_value})
            
            # Tambahkan hasil prediksi (yang sudah di-scale) ke input untuk iterasi berikutnya
            temp_input.append(next_pred_scaled[0, 0])
            
        return predictions

# Buat satu instance service yang akan digunakan oleh seluruh aplikasi (singleton pattern)
prediction_service = PredictionService()