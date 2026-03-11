import './StockCard.css';

export default function StockCard({ stock, onClick, seleccionada }) {
  const { ticker, nombre, precio, cambio, cambioPct, moneda } = stock;
  const positivo = cambio >= 0;

  return (
    <div
      className={`stock-card ${positivo ? 'positivo' : 'negativo'} ${seleccionada ? 'seleccionada' : ''}`}
      onClick={() => onClick(stock)}
    >
      <div className="card-header">
        <span className="ticker">{ticker}</span>
        <span className="moneda">{moneda}</span>
      </div>
      <div className="nombre">{nombre}</div>
      <div className="precio">
        {precio?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="cambio">
        <span>{positivo ? '▲' : '▼'}</span>
        <span>{Math.abs(cambio).toFixed(2)}</span>
        <span className="pct">({positivo ? '+' : ''}{cambioPct?.toFixed(2)}%)</span>
      </div>
    </div>
  );
}
