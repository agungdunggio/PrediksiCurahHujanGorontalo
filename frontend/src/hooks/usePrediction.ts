import { useState, useCallback } from 'react';
import type { PredictionItem, PredictionResponse, UsePredictionReturn } from '../types/Prediction.d.ts';

const API_URL = `${import.meta.env.PUBLIC_API_URL}/predict`;

const INITIAL_DISPLAY_LIMIT = 7;

export function usePrediction(): UsePredictionReturn {
  const [allPredictions, setAllPredictions] = useState<PredictionItem[]>([]);
  const [showAllPredictions, setShowAllPredictions] = useState<boolean>(false);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = useCallback(async (days: number) => {
    if (!days || days <= 0) {
      setError('Mohon isi jumlah hari prediksi.');
      return;
    }

    setLoading(true);
    setError(null);
    setAllPredictions([]);
    setRawJson(null);
    setShowAllPredictions(false);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_days: days }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 422 && errorData.detail && errorData.detail.length > 0) {
          throw new Error(errorData.detail[0].msg);
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: PredictionResponse = await res.json();

      if (data.status && data.data && data.data.length > 0) {
        const predictionData = data.data[0];
        const predictions = predictionData.predictions;

        if (!predictions || predictions.length === 0) {
          setError('Tidak ada data prediksi dari server.');
          return;
        }

        setAllPredictions(predictions);
        setRawJson(JSON.stringify(data, null, 2));
        setShowRawJson(true);
      } else {
        setError('Format respon tidak valid.');
      }
    } catch (err) {
      setError(`Gagal memproses data dari server: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    setShowAllPredictions(true);
  }, []);

  const toggleRawJson = useCallback(() => {
    setShowRawJson((prev) => !prev);
  }, []);

  const predictions = showAllPredictions
    ? allPredictions
    : allPredictions.slice(0, INITIAL_DISPLAY_LIMIT);

  const hasMore = allPredictions.length > INITIAL_DISPLAY_LIMIT && !showAllPredictions;
  const remainingCount = allPredictions.length - INITIAL_DISPLAY_LIMIT;

  return {
    predictions,
    allPredictions,
    rawJson,
    loading,
    error,
    showAllPredictions,
    showRawJson,
    fetchPrediction,
    loadMore,
    toggleRawJson,
    hasMore,
    remainingCount,
  };
}
