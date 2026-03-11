const PROXY = 'https://corsproxy.io/?url=';

export const STOCKS = [
  { ticker: 'ABT',   nombre: 'Abbott Laboratories' },
  { ticker: 'MSFT',  nombre: 'Microsoft' },
  { ticker: 'TSMC',  nombre: 'TSMC' },
  { ticker: 'NVDA',  nombre: 'NVIDIA' },
  { ticker: 'ARM',   nombre: 'ARM Holdings' },
  { ticker: 'NVO',   nombre: 'Novo Nordisk' },
  { ticker: 'BRK-B', nombre: 'Berkshire Hathaway B' },
];

export const RANGOS = [
  { label: '1S', range: '5d',  interval: '1d' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '3M', range: '3mo', interval: '1d' },
  { label: '6M', range: '6mo', interval: '1wk' },
  { label: '1A', range: '1y',  interval: '1wk' },
  { label: '5A', range: '5y',  interval: '1mo' },
];

async function fetchYahoo(ticker, range, interval) {
  const base = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}&includePrePost=false`;
  const url = PROXY + encodeURIComponent(base);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status} para ${ticker}`);
  const json = await res.json();
  return json;
}

export async function obtenerCotizacion(ticker) {
  const data = await fetchYahoo(ticker, '5d', '1d');
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`Sin datos para ${ticker}`);
  const meta = result.meta;
  return {
    ticker,
    precio: meta.regularMarketPrice,
    precioAnterior: meta.regularMarketPreviousClose,
    cambio: meta.regularMarketPrice - meta.regularMarketPreviousClose,
    cambioPct: ((meta.regularMarketPrice - meta.regularMarketPreviousClose) / meta.regularMarketPreviousClose) * 100,
    moneda: meta.currency,
    nombre: meta.longName || meta.shortName || ticker,
  };
}

export async function obtenerHistorico(ticker, range, interval) {
  const data = await fetchYahoo(ticker, range, interval);
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`Sin datos históricos para ${ticker}`);

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const meta = result.meta;

  const puntos = timestamps
    .map((ts, i) => ({
      fecha: new Date(ts * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      fechaISO: new Date(ts * 1000).toISOString().split('T')[0],
      precio: closes[i] !== null ? parseFloat(closes[i]?.toFixed(2)) : null,
    }))
    .filter(p => p.precio !== null);

  return {
    ticker,
    moneda: meta.currency,
    puntos,
  };
}
