import { useState, useEffect, useCallback } from 'react';
import { STOCKS, obtenerCotizacion } from './services/yahooFinance';
import StockCard from './components/StockCard';
import StockChart from './components/StockChart';
import './App.css';

export default function App() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const cargarCotizaciones = useCallback(async () => {
    setCargando(true);
    setErrores([]);
    const resultados = await Promise.allSettled(
      STOCKS.map(s => obtenerCotizacion(s.ticker))
    );
    const ok = [];
    const err = [];
    resultados.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        ok.push({ ...STOCKS[i], ...r.value });
      } else {
        err.push(`${STOCKS[i].ticker}: ${r.reason?.message}`);
      }
    });
    setCotizaciones(ok);
    setErrores(err);
    setUltimaActualizacion(new Date());
    setCargando(false);
    if (ok.length > 0) {
      setSeleccionada(prev => {
        const actualizada = ok.find(s => s.ticker === prev?.ticker);
        return actualizada || ok[0];
      });
    }
  }, []);

  useEffect(() => {
    cargarCotizaciones();
  }, [cargarCotizaciones]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-titulo">📈 Cartera de Acciones</h1>
          {ultimaActualizacion && (
            <span className="ultima-act">
              Actualizado: {ultimaActualizacion.toLocaleTimeString('es-ES')}
            </span>
          )}
        </div>
        <button
          className="btn-actualizar"
          onClick={cargarCotizaciones}
          disabled={cargando}
        >
          {cargando ? 'Cargando...' : '↻ Actualizar'}
        </button>
      </header>

      {errores.length > 0 && (
        <div className="errores-banner">
          <strong>No se pudieron cargar:</strong> {errores.join(' · ')}
        </div>
      )}

      <main className="app-main">
        <section className="cards-grid">
          {cargando && cotizaciones.length === 0
            ? STOCKS.map(s => (
                <div key={s.ticker} className="stock-card-skeleton">
                  <div className="sk-ticker">{s.ticker}</div>
                  <div className="sk-nombre">{s.nombre}</div>
                  <div className="sk-precio">—</div>
                  <div className="sk-cambio">Cargando...</div>
                </div>
              ))
            : cotizaciones.map(stock => (
                <StockCard
                  key={stock.ticker}
                  stock={stock}
                  onClick={setSeleccionada}
                  seleccionada={seleccionada?.ticker === stock.ticker}
                />
              ))
          }
        </section>

        {seleccionada && (
          <section className="chart-section">
            <StockChart key={seleccionada.ticker} stock={seleccionada} />
          </section>
        )}
      </main>
    </div>
  );
}
