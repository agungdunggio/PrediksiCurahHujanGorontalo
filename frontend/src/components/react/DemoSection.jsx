import React, { useState } from 'react';
import { usePrediction } from '../../hooks/usePrediction.ts';

// Icon Components
const CloudIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 14v6m-4-3h8" />
  </svg>
);

const RainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-300" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M15.75 8.25a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-3.44l-2.22 2.22a.75.75 0 11-1.06-1.06l3.5-3.5a.75.75 0 011.03 0zm-10-1.06a.75.75 0 010 1.06L3.53 10.47l2.22-2.22a.75.75 0 011.06 1.06L4.59 11.53l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

const LoadingSpinner = ({ size = 'h-5 w-5', className = '' }) => (
  <svg className={`animate-spin ${size} ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Result Card Component
const ResultCard = ({ item }) => {
  const formattedDate = new Date(item.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="result-card">
      <div className="flex items-center space-x-4">
        <div className="icon-container">
          <RainIcon />
        </div>
        <div>
          <p className="font-semibold text-white">{formattedDate}</p>
          <p className="text-sm text-gray-400">Prediksi untuk Gorontalo</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-blue-400">
          {item.value.toFixed(2)} <span className="text-lg font-normal text-gray-400">mm/hari</span>
        </p>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-10 text-gray-500">
    <CloudIcon />
    <p className="mt-2">Hasil prediksi akan muncul di sini.</p>
  </div>
);

// Loading State Component
const LoadingState = () => (
  <div className="text-center py-10 text-gray-500">
    <LoadingSpinner size="h-10 w-10" className="mx-auto text-blue-400" />
    <p className="mt-4">Memproses prediksi...</p>
  </div>
);

// Error State Component
const ErrorState = ({ message }) => (
  <div className="text-center py-10 text-red-400">
    <p>{message}</p>
  </div>
);

// Main Demo Section Component
const DemoSection = () => {
  const [days, setDays] = useState(3);
  const {
    predictions,
    rawJson,
    loading,
    error,
    showRawJson,
    fetchPrediction,
    loadMore,
    toggleRawJson,
    hasMore,
    remainingCount,
  } = usePrediction();

  const handleSubmit = () => {
    fetchPrediction(days);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">
      {/* Form Section */}
      <div className="demo-form bg-gray-800 rounded-xl p-5 md:p-8 border border-gray-700">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Parameter Prediksi</h3>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-300 mb-2">
              Jumlah Hari Prediksi
            </label>
            <input
              type="number"
              placeholder="Contoh: 7"
              id="days"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 0)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 rounded bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>
        </form>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full text-white font-semibold px-6 py-3 rounded-full mt-8 flex items-center justify-center"
        >
          {loading ? <LoadingSpinner className="text-white" /> : <span>Dapatkan Prediksi</span>}
        </button>
      </div>

      {/* Result Section */}
      <div className="demo-result bg-gray-800 rounded-xl p-5 md:p-8 border border-gray-700 min-h-[250px] md:min-h-[300px] flex flex-col">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Hasil Prediksi (Visual)</h3>

        <div className="response-container-scrollable space-y-3 flex-grow">
          {loading && <LoadingState />}
          
          {!loading && error && <ErrorState message={error} />}
          
          {!loading && !error && predictions.length === 0 && <EmptyState />}
          
          {!loading && !error && predictions.length > 0 && (
            <>
              {predictions.map((item, index) => (
                <ResultCard key={`${item.date}-${index}`} item={item} />
              ))}
              
              {hasMore && (
                <button onClick={loadMore} className="load-more-btn">
                  Tampilkan {remainingCount} hasil lainnya...
                </button>
              )}
            </>
          )}
        </div>

        {/* Raw JSON Section */}
        {rawJson && (
          <div className="mt-6">
            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-white">Respon JSON Mentah</h4>
              <button onClick={toggleRawJson} className="text-sm text-blue-400 hover:text-blue-300">
                {showRawJson ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
            {showRawJson && <pre className="raw-json-box">{rawJson}</pre>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoSection;
