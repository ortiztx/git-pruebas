import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { obtenerHistorico, RANGOS } from '../services/yahooFinance';
import './StockChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip-custom">
        <p className="tooltip-fecha">{label}</p>
        <p className="tooltip-precio">{payload[0].value?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

export default function StockChart({ stock }) {
  const [datos, setDatos] = useState(null);
  const [rango, setRango] = useState(RANGOS[2]); // 3M por defecto
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const hist = await obtenerHistorico(stock.ticker, rango.range, rango.interval);
      setDatos(hist);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [stock.ticker, rango]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const positivo = stock.cambio >= 0;
  const colorLinea = positivo ? '#4ade80' : '#f87171';
  const colorFondo = positivo ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)';

  const minPrecio = datos ? Math.min(...datos.puntos.map(p => p.precio)) : 0;
  const maxPrecio = datos ? Math.max(...datos.puntos.map(p => p.precio)) : 0;
  const margen = (maxPrecio - minPrecio) * 0.05;

  return (
    <div className="stock-chart">
      <div className="chart-header">
        <div>
          <h2 className="chart-titulo">{stock.nombre || stock.ticker}</h2>
          <span className="chart-ticker">{stock.ticker}</span>
        </div>
        <div className="chart-precio-info">
          <span className="chart-precio">
            {stock.precio?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stock.moneda}
          </span>
          <span className={`chart-cambio ${positivo ? 'pos' : 'neg'}`}>
            {positivo ? '▲' : '▼'} {Math.abs(stock.cambio).toFixed(2)} ({positivo ? '+' : ''}{stock.cambioPct?.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="rango-selector">
        {RANGOS.map(r => (
          <button
            key={r.label}
            className={`rango-btn ${rango.label === r.label ? 'activo' : ''}`}
            onClick={() => setRango(r)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="chart-area">
        {cargando && <div className="chart-overlay">Cargando datos...</div>}
        {error && <div className="chart-overlay error">{error}</div>}
        {datos && !cargando && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={datos.puntos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrecio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorLinea} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colorLinea} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
              <XAxis
                dataKey="fecha"
                tick={{ fill: '#6b6b8a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPrecio - margen, maxPrecio + margen]}
                tick={{ fill: '#6b6b8a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v.toFixed(0)}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="precio"
                stroke={colorLinea}
                strokeWidth={2}
                fill="url(#colorPrecio)"
                dot={false}
                activeDot={{ r: 4, fill: colorLinea }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
