from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import json
import os

from models.schemas import (
    HistoricalDataAddRequest,
    HistoricalDataBulkAddRequest,
    HistoricalDataUpdateRequest,
    HistoricalDataResponse,
    HistoricalDataListResponse
)
from core.security import get_api_key

router = APIRouter()

# Path ke file data historis
DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "data_historis.json")


def load_data() -> dict:
    """Load data dari file JSON"""
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "description": "Data curah hujan historis untuk simulasi banjir.",
            "location": "Makassar",
            "unit": "mm",
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "data": {},
            "howToUpdate": "Gunakan API untuk menambah atau mengubah data curah hujan."
        }


def save_data(data: dict):
    """Simpan data ke file JSON"""
    data["lastUpdated"] = datetime.now().strftime("%Y-%m-%d")
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@router.get("/", response_model=HistoricalDataListResponse, summary="Ambil semua data historis")
def get_all_historical_data():
    """Mengambil semua data curah hujan historis"""
    data = load_data()
    return HistoricalDataListResponse(
        message="Data historis berhasil diambil",
        location=data.get("location", "Makassar"),
        unit=data.get("unit", "mm"),
        lastUpdated=data.get("lastUpdated", ""),
        data=data.get("data", {})
    )


@router.get("/{date_str}", response_model=HistoricalDataResponse, summary="Ambil data historis berdasarkan tanggal")
def get_historical_data_by_date(date_str: str):
    """Mengambil data curah hujan untuk tanggal tertentu"""
    data = load_data()
    
    if date_str not in data.get("data", {}):
        raise HTTPException(
            status_code=404,
            detail=f"Data untuk tanggal {date_str} tidak ditemukan"
        )
    
    return HistoricalDataResponse(
        message=f"Data untuk tanggal {date_str} berhasil diambil",
        data={date_str: data["data"][date_str]}
    )


@router.post("/add", response_model=HistoricalDataResponse, summary="Tambah data historis baru", status_code=201)
def add_historical_data(request: HistoricalDataAddRequest, api_key: str = Depends(get_api_key)):
    """Menambahkan data curah hujan baru untuk tanggal tertentu"""
    data = load_data()
    date_str = request.date.strftime("%Y-%m-%d")
    
    if date_str in data.get("data", {}):
        raise HTTPException(
            status_code=400,
            detail=f"Data untuk tanggal {date_str} sudah ada. Gunakan endpoint PUT untuk update."
        )
    
    data["data"][date_str] = {
        "rainfall": request.rainfall,
        "duration": request.duration
    }
    
    save_data(data)
    
    return HistoricalDataResponse(
        message=f"Data untuk tanggal {date_str} berhasil ditambahkan",
        data={date_str: data["data"][date_str]}
    )


@router.post("/add-bulk", response_model=HistoricalDataResponse, summary="Tambah banyak data historis sekaligus", status_code=201)
def add_bulk_historical_data(request: HistoricalDataBulkAddRequest, api_key: str = Depends(get_api_key)):
    """Menambahkan beberapa data curah hujan sekaligus"""
    data = load_data()
    added_data = {}
    skipped = []
    
    for item in request.data:
        date_str = item.date.strftime("%Y-%m-%d")
        
        if date_str in data.get("data", {}):
            skipped.append(date_str)
            continue
        
        data["data"][date_str] = {
            "rainfall": item.rainfall,
            "duration": item.duration
        }
        added_data[date_str] = data["data"][date_str]
    
    save_data(data)
    
    message = f"{len(added_data)} data berhasil ditambahkan"
    if skipped:
        message += f". {len(skipped)} data dilewati (sudah ada): {', '.join(skipped)}"
    
    return HistoricalDataResponse(
        message=message,
        data=added_data
    )


@router.put("/{date_str}", response_model=HistoricalDataResponse, summary="Update data historis")
def update_historical_data(date_str: str, request: HistoricalDataUpdateRequest, api_key: str = Depends(get_api_key)):
    """Mengupdate data curah hujan untuk tanggal tertentu"""
    data = load_data()
    
    if date_str not in data.get("data", {}):
        raise HTTPException(
            status_code=404,
            detail=f"Data untuk tanggal {date_str} tidak ditemukan"
        )
    
    if request.rainfall is not None:
        data["data"][date_str]["rainfall"] = request.rainfall
    if request.duration is not None:
        data["data"][date_str]["duration"] = request.duration
    
    save_data(data)
    
    return HistoricalDataResponse(
        message=f"Data untuk tanggal {date_str} berhasil diupdate",
        data={date_str: data["data"][date_str]}
    )


@router.delete("/{date_str}", response_model=HistoricalDataResponse, summary="Hapus data historis")
def delete_historical_data(date_str: str, api_key: str = Depends(get_api_key)):
    """Menghapus data curah hujan untuk tanggal tertentu"""
    data = load_data()
    
    if date_str not in data.get("data", {}):
        raise HTTPException(
            status_code=404,
            detail=f"Data untuk tanggal {date_str} tidak ditemukan"
        )
    
    deleted_data = data["data"].pop(date_str)
    save_data(data)
    
    return HistoricalDataResponse(
        message=f"Data untuk tanggal {date_str} berhasil dihapus",
        data={date_str: deleted_data}
    )

