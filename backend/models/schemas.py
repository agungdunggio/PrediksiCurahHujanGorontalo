from pydantic import BaseModel, model_validator
from typing import List, Dict, Any, Optional
from datetime import date, timedelta

class PredictionRequest(BaseModel):
    n_days: int = 1

    @model_validator(mode='after')
    def check_n_days(self):
        if self.n_days > 90:
            raise ValueError('prediksi tidak boleh lebih dari 90 hari')
        if self.n_days < 1:
            raise ValueError('prediksi tidak boleh kurang dari 1 hari')
        return self

class DataAdditionRequest(BaseModel):
    data_start: date
    data_end: date
    values: List[float]

    @model_validator(mode='after')
    def check_values_length(self):
        n_days = (self.data_end - self.data_start).days + 1
        if len(self.values) != n_days:
            raise ValueError(f"jumlah data ({len(self.values)}) harus sama dengan jumlah hari antara data_start dan data_end ({n_days})")
        return self

class BaseAPIResponse(BaseModel):
    status: bool = True
    message: str

class PredictionPoint(BaseModel):
    date: date
    value: float

class PredictionData(BaseModel):
    location: str
    unit: str
    model_used: str
    prediction_start: date
    prediction_end: date
    predictions: List[PredictionPoint]

class PredictionResponse(BaseAPIResponse):
    data: List[PredictionData]

class BufferData(BaseModel):
    current_size: int
    needed: int
    updated_at: Optional[str] = None
    current_data: List[Dict[str, Any]]

class BufferStatusResponse(BaseAPIResponse):
    data: BufferData
    
class DataAdditionResponse(BaseAPIResponse):
    data: Dict[str, Any]

# === Schema untuk Data Historis ===
class RainfallDataPoint(BaseModel):
    rainfall: float
    duration: Optional[int] = 10

class HistoricalDataAddRequest(BaseModel):
    date: date
    rainfall: float
    duration: Optional[int] = 10

class HistoricalDataBulkAddRequest(BaseModel):
    data: List[HistoricalDataAddRequest]

class HistoricalDataUpdateRequest(BaseModel):
    rainfall: Optional[float] = None
    duration: Optional[int] = None

class HistoricalDataResponse(BaseAPIResponse):
    data: Dict[str, Any]

class HistoricalDataListResponse(BaseAPIResponse):
    location: str
    unit: str
    lastUpdated: str
    data: Dict[str, Any]