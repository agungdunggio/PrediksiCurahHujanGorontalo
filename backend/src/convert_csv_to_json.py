import pandas as pd
import json
import os

# Dapatkan direktori script ini berada
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "..", "data")

# Path file
INPUT_CSV = os.path.join(DATA_DIR, "data_hujan_gorontalo_5tahun.csv")
OUTPUT_JSON = os.path.join(DATA_DIR, "data_historis_add.json")

df = pd.read_csv(INPUT_CSV)
df.columns = [c.lower() for c in df.columns]

date_col = [c for c in df.columns if "tanggal" in c or "date" in c][0]
rain_col = [c for c in df.columns if "hujan" in c or "rain" in c][0]

df[rain_col] = df[rain_col].replace(
    ["8888", 8888, "-", "nil", "null"], pd.NA
)

df[rain_col] = pd.to_numeric(df[rain_col], errors="coerce")
df[rain_col] = df[rain_col].interpolate().bfill().ffill()

result = {
    "data": [
        {
            "date": str(row[date_col]),
            "rainfall": round(float(row[rain_col]), 2),
            "duration": 10
        }
        for _, row in df.iterrows()
    ]
}

with open(OUTPUT_JSON, "w") as f:
    json.dump(result, f, indent=2)

print(f"✅ Berhasil! Data disimpan ke: {OUTPUT_JSON}")
print(f"   Total: {len(result['data'])} baris data")
