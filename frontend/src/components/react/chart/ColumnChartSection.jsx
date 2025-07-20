import { Column } from '@ant-design/plots';
import { useBufferChartData } from '../../../hooks/useBufferChartData.ts';
import { formatTanggalTooltip } from '../../../utils/dateFormat.ts';

const ColumnChartSection = () => {
  const { data, lastUpdate, loading } = useBufferChartData();

  const config = {
    data,
    xField: 'tanggal',
    yField: 'value',
    theme: 'dark', 
    color: 'l(270) 0:#3b82f6 1:#80a9f8',
    columnWidthRatio: 0.6,
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
      title: {
        text: 'Tanggal',
        style: {
          fontSize: 14,
        },
      },
    },
    yAxis: {
      title: {
        text: 'Curah Hujan (mm)',
        style: {
          fontSize: 14,
        },
      },
      label: {
        formatter: (v) => `${v} mm`,
      },
      grid: {
        line: {
          style: {
            stroke: '#4b5563',
            lineDash: [4, 5],
            opacity: 0.5,
          },
        },
      },
    },
    // tooltip: {
    //   showMarkers: false,
    //   customContent: (title, items) => {
    //     const tanggal = title;
    //     const value = items?.[0]?.data?.value ?? '-';

    //     return `
    //       <div style="padding: 10px 12px; background-color: #1f2937; border-radius: 6px; border: 1px solid #4b5563; color: white; font-family: sans-serif;">
    //         <div style="font-weight: 600; margin-bottom: 8px;">${formatTanggalTooltip(tanggal)}</div>
    //         <div>Curah Hujan: <strong>${value} mm</strong></div>
    //       </div>
    //     `;
    //   },
    // },
    animation: {
      appear: {
        animation: 'scale-in-y',
        duration: 500,
      },
    },
    interactions: [{ type: 'active-region' }],
  };

  return (
    <>
      <div className="w-full">
        {!loading && data.length ? (
          <Column {...config} />
        ) : (
          <div className="w-full h-96 flex items-center justify-center text-gray-400">Memuat grafik...</div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-right mt-4">
        Terakhir diperbarui: {loading ? 'Memuat...' : lastUpdate || '-'}
      </p>
    </>
  );
};

export default ColumnChartSection;
