import { useEffect, useState } from 'react';      
import type { BufferStatusResponse, ChartDataItem } from '../types/DataBuffer.d.ts';
import { formatTanggalTooltip, formatUpdatedAt } from '../utils/dateFormat.ts';

const API_URL = `${import.meta.env.PUBLIC_API_URL}/buffer-status`;
const API_KEY = import.meta.env.PUBLIC_API_KEY;

export function useBufferChartData(apiUrl: string = API_URL) {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [current_size, setCurrentSize] = useState<number>(0);

  useEffect(() => {
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((json: BufferStatusResponse) => {
        const rawData = json?.data?.current_data || [];

        const sorted: ChartDataItem[] = rawData
          .map((item) => ({
            tanggal: formatTanggalTooltip(item.date),
            value: item.value,
          }))
          .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

        setData(sorted);
        setLastUpdate(formatUpdatedAt(json?.data?.updated_at || null));
        setCurrentSize(json?.data?.current_size || sorted.length);

        setLoading(false);
      })
      .catch((error) => {
        console.error('Gagal memuat data buffer:', error);
        setLoading(false);
      });
  }, [apiUrl]);

  return { data, lastUpdate, loading, current_size };
}
