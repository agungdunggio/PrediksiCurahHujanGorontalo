# Prediksi Curah Hujan Gorontalo

Aplikasi ini memprediksi curah hujan di Gorontalo menggunakan model LSTM (Long Short-Term Memory) berbasis Python (FastAPI) untuk backend dan Astro/React untuk frontend. Proyek ini cocok untuk riset, edukasi, maupun pengembangan sistem peringatan dini bencana banjir.

---

## Fitur

- **Prediksi Time Series**: Prediksi curah hujan beberapa hari ke depan menggunakan model LSTM.
- **Manajemen Data**: Buffer data persisten, dapat diisi manual atau otomatis.
- **REST API**: Endpoint terstruktur untuk prediksi, penambahan data, dan monitoring buffer.
- **Frontend Modern**: UI interaktif berbasis Astro/React.
- **Dokumentasi API Otomatis**: Swagger/OpenAPI di `/docs`.

---

## Struktur Proyek

```
prediksi_banjir/
├── backend/
│   ├── main.py
│   ├── api/
│   ├── models/
│   ├── data/
│   ├── requirements.txt
│   ├── run_server.py
│   ├── init_data.py
│   ├── setup.py
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md
```

---

## Cara Menjalankan

### 1. Backend (FastAPI)

#### a. Instalasi Dependency
```bash
cd backend
pip install -r requirements.txt
```

#### b. Jalankan Server
```bash
python run_server.py
```
Server berjalan di [http://localhost:8000](http://localhost:8000)

#### c. Inisialisasi Data Buffer (Opsional)
```bash
python init_data.py
```
Atau gunakan endpoint `/api/v1/add-data` untuk menambah data manual.

#### d. Setup Otomatis (Opsional)
```bash
python setup.py
```
Akan menginstall dependency, menjalankan server, dan mengisi buffer otomatis.

#### e. Dokumentasi API
Buka [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend (Astro/React)

#### a. Instalasi Dependency
```bash
cd frontend
npm install
```

#### b. Jalankan Frontend
```bash
npm run dev
```
Frontend berjalan di [http://localhost:3000](http://localhost:3000)

---

## Contoh Penggunaan API

### Prediksi Curah Hujan
```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"n_days": 3}'
```
---

## Kontribusi

1. Fork repo ini
2. Buat branch fitur/bugfix baru
3. Pull request ke main branch