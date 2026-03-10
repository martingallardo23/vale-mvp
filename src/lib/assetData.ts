// ─── Types ────────────────────────────────────────────────────────────────────

export type AssetKind = "equity" | "etf" | "bond" | "fci" | "fx" | "option" | "other";

export interface AssetInfo {
  ticker: string;
  name: string;
  kind: AssetKind;
  subtype?: string;
  exchange?: string;
  sector?: string;
  description?: string;
  currency: "USD" | "ARS";

  // Price
  price: number;
  priceChange: number;
  priceChangePct: number;

  // Equity / ETF metrics
  marketCap?: string;
  pe?: number;
  forwardPE?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  high52w?: number;
  low52w?: number;
  avgVolume?: string;

  // ETF specific
  expenseRatio?: number;
  ytdReturn?: number;
  aum?: string;

  // Fixed income
  tna?: number;
  tea?: number;
  maturityDate?: string;
  duration?: number;
  yieldToMaturity?: number;

  // FCI
  fciType?: string;
  return7d?: number;
  return30d?: number;
  return1y?: number;

  // Analyst
  analystBuy?: number;
  analystHold?: number;
  analystSell?: number;
  priceTargetAvg?: number;
  priceTargetLow?: number;
  priceTargetHigh?: number;

  // 60 daily closing prices (oldest → newest). Last point = price.
  priceHistory: number[];
}

// ─── Price history generator ──────────────────────────────────────────────────

function genH(price: number, vol: number, trend: number, seed: number, n = 60): number[] {
  let s = Math.abs(seed * 48271) % 0x7fffffff || 1;
  const rand = () => { s = (s * 48271) % 0x7fffffff; return s / 0x7fffffff; };
  const pts: number[] = [price * (0.90 + rand() * 0.05)];
  for (let i = 1; i < n; i++) {
    const delta = (rand() - 0.5) * vol + trend;
    pts.push(Math.max(0.01, pts[i - 1] * (1 + delta)));
  }
  const scale = price / pts[pts.length - 1];
  return pts.map(v => parseFloat((v * scale).toFixed(3)));
}

// ─── Asset data map ───────────────────────────────────────────────────────────

export const ASSET_DATA: Record<string, AssetInfo> = {

  // ── US Equities ─────────────────────────────────────────────────────────────

  NVDA: {
    ticker: "NVDA", name: "NVIDIA Corporation", kind: "equity", exchange: "NASDAQ",
    sector: "Tecnología", currency: "USD",
    description: "NVIDIA diseña y fabrica unidades de procesamiento gráfico (GPU) y sistemas en chip para los mercados de gaming, centros de datos e inteligencia artificial. Su arquitectura Blackwell domina la demanda de chips para IA generativa.",
    price: 891.24, priceChange: 20.12, priceChangePct: 2.31,
    marketCap: "$2.18T", pe: 46.2, forwardPE: 32.1, eps: 19.28, dividendYield: 0.03,
    beta: 1.68, high52w: 974.0, low52w: 455.0, avgVolume: "42M",
    analystBuy: 36, analystHold: 5, analystSell: 1,
    priceTargetAvg: 1020, priceTargetLow: 850, priceTargetHigh: 1250,
    priceHistory: genH(891.24, 0.034, 0.003, 1001),
  },

  AAPL: {
    ticker: "AAPL", name: "Apple Inc.", kind: "equity", exchange: "NASDAQ",
    sector: "Tecnología", currency: "USD",
    description: "Apple diseña, fabrica y comercializa smartphones, computadoras personales, tablets, wearables y servicios. Su ecosistema integrado de hardware, software y servicios genera ingresos altamente recurrentes.",
    price: 221.50, priceChange: 1.06, priceChangePct: 0.48,
    marketCap: "$3.38T", pe: 35.2, forwardPE: 30.8, eps: 6.29, dividendYield: 0.44,
    beta: 1.24, high52w: 237.23, low52w: 164.08, avgVolume: "58M",
    analystBuy: 27, analystHold: 11, analystSell: 2,
    priceTargetAvg: 240, priceTargetLow: 195, priceTargetHigh: 280,
    priceHistory: genH(221.50, 0.017, 0.001, 1002),
  },

  MSFT: {
    ticker: "MSFT", name: "Microsoft Corporation", kind: "equity", exchange: "NASDAQ",
    sector: "Tecnología", currency: "USD",
    description: "Microsoft desarrolla y licencia software, servicios en la nube (Azure), hardware y soluciones empresariales. Su alianza con OpenAI y la integración de IA en su suite de productividad son catalizadores clave.",
    price: 402.30, priceChange: 3.56, priceChangePct: 0.89,
    marketCap: "$3.00T", pe: 34.8, forwardPE: 29.4, eps: 11.56, dividendYield: 0.72,
    beta: 0.90, high52w: 468.35, low52w: 309.45, avgVolume: "22M",
    analystBuy: 40, analystHold: 4, analystSell: 0,
    priceTargetAvg: 480, priceTargetLow: 400, priceTargetHigh: 560,
    priceHistory: genH(402.30, 0.016, 0.001, 1003),
  },

  AMZN: {
    ticker: "AMZN", name: "Amazon.com Inc.", kind: "equity", exchange: "NASDAQ",
    sector: "Consumo / Tecnología", currency: "USD",
    description: "Amazon opera en e-commerce, servicios en la nube (AWS), publicidad digital y entretenimiento. AWS representa ~60% del beneficio operativo. La inversión de $12B en Anthropic refuerza su posición en IA.",
    price: 208.40, priceChange: 2.54, priceChangePct: 1.23,
    marketCap: "$2.20T", pe: 40.2, forwardPE: 32.6, eps: 5.19, dividendYield: 0,
    beta: 1.18, high52w: 232.76, low52w: 159.28, avgVolume: "38M",
    analystBuy: 44, analystHold: 3, analystSell: 0,
    priceTargetAvg: 250, priceTargetLow: 210, priceTargetHigh: 310,
    priceHistory: genH(208.40, 0.022, 0.002, 1004),
  },

  TSLA: {
    ticker: "TSLA", name: "Tesla Inc.", kind: "equity", exchange: "NASDAQ",
    sector: "Automotriz / Energía", currency: "USD",
    description: "Tesla diseña y fabrica vehículos eléctricos, sistemas de almacenamiento de energía y paneles solares. Su posición como líder en EV es desafiada por competidores chinos mientras expande su negocio de energía.",
    price: 248.10, priceChange: -1.80, priceChangePct: -0.72,
    marketCap: "$796B", pe: 85.4, forwardPE: 58.2, eps: 2.91, dividendYield: 0,
    beta: 2.08, high52w: 488.54, low52w: 138.80, avgVolume: "118M",
    analystBuy: 17, analystHold: 15, analystSell: 8,
    priceTargetAvg: 290, priceTargetLow: 115, priceTargetHigh: 550,
    priceHistory: genH(248.10, 0.048, -0.001, 1005),
  },

  META: {
    ticker: "META", name: "Meta Platforms Inc.", kind: "equity", exchange: "NASDAQ",
    sector: "Comunicaciones", currency: "USD",
    description: "Meta opera Facebook, Instagram, WhatsApp y Threads. Su negocio publicitario se recupera fuertemente mientras invierte masivamente en IA y el metaverso. Los AI feeds han mejorado significativamente el engagement.",
    price: 612.80, priceChange: 8.76, priceChangePct: 1.45,
    marketCap: "$1.56T", pe: 28.4, forwardPE: 22.8, eps: 21.58, dividendYield: 0.34,
    beta: 1.42, high52w: 733.12, low52w: 414.50, avgVolume: "15M",
    analystBuy: 40, analystHold: 6, analystSell: 1,
    priceTargetAvg: 700, priceTargetLow: 550, priceTargetHigh: 850,
    priceHistory: genH(612.80, 0.025, 0.002, 1006),
  },

  JPM: {
    ticker: "JPM", name: "JPMorgan Chase & Co.", kind: "equity", exchange: "NYSE",
    sector: "Financiero", currency: "USD",
    description: "JPMorgan Chase es el mayor banco de EE.UU. por activos. Opera en banca de inversión, banca minorista, gestión de activos y mercados. El entorno de tasas altas beneficia sus márgenes de interés neto.",
    price: 248.20, priceChange: 1.54, priceChangePct: 0.62,
    marketCap: "$714B", pe: 13.8, forwardPE: 12.6, eps: 17.98, dividendYield: 2.10,
    beta: 1.12, high52w: 280.64, low52w: 182.86, avgVolume: "10M",
    analystBuy: 18, analystHold: 9, analystSell: 2,
    priceTargetAvg: 270, priceTargetLow: 225, priceTargetHigh: 310,
    priceHistory: genH(248.20, 0.018, 0.001, 1007),
  },

  KO: {
    ticker: "KO", name: "The Coca-Cola Company", kind: "equity", exchange: "NYSE",
    sector: "Consumo Masivo", currency: "USD",
    description: "Coca-Cola es la mayor empresa de bebidas no alcohólicas del mundo. Su portfolio de más de 500 marcas le otorga poder de fijación de precios y flujos de caja estables. Es holding core de Berkshire Hathaway.",
    price: 62.40, priceChange: -0.11, priceChangePct: -0.18,
    marketCap: "$269B", pe: 24.2, forwardPE: 22.8, eps: 2.58, dividendYield: 3.12,
    beta: 0.58, high52w: 74.98, low52w: 55.36, avgVolume: "14M",
    analystBuy: 12, analystHold: 10, analystSell: 2,
    priceTargetAvg: 70, priceTargetLow: 60, priceTargetHigh: 80,
    priceHistory: genH(62.40, 0.008, -0.0002, 1008),
  },

  JNJ: {
    ticker: "JNJ", name: "Johnson & Johnson", kind: "equity", exchange: "NYSE",
    sector: "Salud", currency: "USD",
    description: "J&J es una multinacional de salud especializada en productos farmacéuticos y dispositivos médicos. Tras escindir su división de consumo (Kenvue), se focaliza en segmentos de mayor margen y crecimiento.",
    price: 158.30, priceChange: 0.35, priceChangePct: 0.22,
    marketCap: "$382B", pe: 22.6, forwardPE: 14.2, eps: 7.00, dividendYield: 3.22,
    beta: 0.54, high52w: 175.90, low52w: 142.38, avgVolume: "8M",
    analystBuy: 8, analystHold: 12, analystSell: 2,
    priceTargetAvg: 170, priceTargetLow: 148, priceTargetHigh: 195,
    priceHistory: genH(158.30, 0.009, 0.0, 1009),
  },

  UNH: {
    ticker: "UNH", name: "UnitedHealth Group Inc.", kind: "equity", exchange: "NYSE",
    sector: "Salud / Seguros", currency: "USD",
    description: "UnitedHealth es el mayor operador de seguros de salud de EE.UU., con 50M de afiliados. Optum, su rama de servicios de salud, genera sinergias importantes y crece por encima del mercado.",
    price: 492.60, priceChange: -4.18, priceChangePct: -0.84,
    marketCap: "$456B", pe: 19.4, forwardPE: 16.8, eps: 25.39, dividendYield: 1.62,
    beta: 0.68, high52w: 601.84, low52w: 389.12, avgVolume: "4M",
    analystBuy: 20, analystHold: 6, analystSell: 1,
    priceTargetAvg: 600, priceTargetLow: 500, priceTargetHigh: 700,
    priceHistory: genH(492.60, 0.012, -0.0005, 1010),
  },

  "BRK.B": {
    ticker: "BRK.B", name: "Berkshire Hathaway Inc. Class B", kind: "equity", exchange: "NYSE",
    sector: "Holding / Financiero", currency: "USD",
    description: "Berkshire Hathaway es el holding de Warren Buffett con participaciones en seguros (GEICO, Gen Re), ferrocarriles (BNSF), energía, y una cartera accionaria de ~$320B. Acumula $334B en efectivo al cierre de 2025.",
    price: 471.20, priceChange: 1.64, priceChangePct: 0.35,
    marketCap: "$1.04T", pe: 21.8, forwardPE: 20.4, eps: 21.61, dividendYield: 0,
    beta: 0.88, high52w: 508.45, low52w: 362.78, avgVolume: "5M",
    analystBuy: 6, analystHold: 8, analystSell: 0,
    priceTargetAvg: 510, priceTargetLow: 440, priceTargetHigh: 570,
    priceHistory: genH(471.20, 0.010, 0.001, 1011),
  },

  PLTR: {
    ticker: "PLTR", name: "Palantir Technologies Inc.", kind: "equity", exchange: "NASDAQ",
    sector: "Tecnología / Defensa", currency: "USD",
    description: "Palantir desarrolla plataformas de análisis de datos y IA para gobiernos y empresas (Gotham, Foundry, AIP). Sus contratos gubernamentales con EE.UU., OTAN y aliados le dan visibilidad de ingresos de largo plazo.",
    price: 88.40, priceChange: 5.18, priceChangePct: 6.22,
    marketCap: "$191B", pe: 248.0, forwardPE: 68.4, eps: 0.36, dividendYield: 0,
    beta: 2.68, high52w: 141.35, low52w: 17.86, avgVolume: "62M",
    analystBuy: 8, analystHold: 12, analystSell: 10,
    priceTargetAvg: 80, priceTargetLow: 28, priceTargetHigh: 150,
    priceHistory: genH(88.40, 0.058, 0.008, 1012),
  },

  // ── US ETFs ──────────────────────────────────────────────────────────────────

  VTI: {
    ticker: "VTI", name: "Vanguard Total Stock Market ETF", kind: "etf", exchange: "NYSE Arca",
    sector: "Renta Variable EE.UU.", currency: "USD",
    description: "ETF de Vanguard que replica el índice CRSP US Total Market, con exposición a más de 3.700 acciones de todo el mercado accionario estadounidense (large, mid y small caps).",
    price: 275.40, priceChange: 2.14, priceChangePct: 0.78,
    high52w: 291.60, low52w: 210.18, beta: 1.00, ytdReturn: 4.8,
    expenseRatio: 0.03, aum: "$410B",
    priceHistory: genH(275.40, 0.015, 0.001, 2001),
  },

  AGG: {
    ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", kind: "etf", exchange: "NYSE Arca",
    sector: "Renta Fija EE.UU.", currency: "USD",
    description: "ETF de BlackRock que replica el Bloomberg U.S. Aggregate Bond Index, con exposición a bonos del Tesoro, corporativos investment grade e hipotecas. Es el benchmark de referencia para renta fija USD.",
    price: 98.20, priceChange: 0.18, priceChangePct: 0.18,
    high52w: 102.48, low52w: 91.54, beta: 0.10, ytdReturn: 1.2,
    expenseRatio: 0.03, aum: "$120B",
    duration: 6.2,
    priceHistory: genH(98.20, 0.006, 0.0002, 2002),
  },

  TLT: {
    ticker: "TLT", name: "iShares 20+ Year Treasury Bond ETF", kind: "etf", exchange: "NASDAQ",
    sector: "Renta Fija EE.UU.", currency: "USD",
    description: "ETF de BlackRock con exposición exclusiva a bonos del Tesoro de EE.UU. con vencimiento a más de 20 años. Altamente sensible a movimientos de tasas (duration ~17 años). Instrumento de largo plazo o cobertura.",
    price: 91.50, priceChange: -0.31, priceChangePct: -0.34,
    high52w: 106.22, low52w: 82.43, beta: 0.04, ytdReturn: -2.8,
    expenseRatio: 0.15, aum: "$52B",
    duration: 17.1,
    priceHistory: genH(91.50, 0.012, -0.0005, 2003),
  },

  VCSH: {
    ticker: "VCSH", name: "Vanguard Short-Term Corporate Bond ETF", kind: "etf", exchange: "NYSE Arca",
    sector: "Renta Fija Corporativa", currency: "USD",
    description: "ETF de Vanguard con exposición a bonos corporativos investment grade de corto plazo (1–5 años). Ofrece rendimientos superiores a los bonos del Tesoro con bajo riesgo de crédito y sensibilidad moderada a tasas.",
    price: 78.60, priceChange: 0.09, priceChangePct: 0.12,
    high52w: 80.48, low52w: 74.82, beta: 0.08, ytdReturn: 1.6,
    expenseRatio: 0.04, aum: "$44B",
    duration: 2.8,
    priceHistory: genH(78.60, 0.005, 0.0001, 2004),
  },

  VYM: {
    ticker: "VYM", name: "Vanguard High Dividend Yield ETF", kind: "etf", exchange: "NYSE Arca",
    sector: "Renta Variable EE.UU.", currency: "USD",
    description: "ETF de Vanguard que sigue el FTSE High Dividend Yield Index, compuesto por acciones con dividendos elevados excluidas REITs. Enfocado en empresas maduras con sólidos flujos de caja.",
    price: 128.30, priceChange: 0.31, priceChangePct: 0.24,
    high52w: 136.54, low52w: 107.28, beta: 0.76, ytdReturn: 3.2, dividendYield: 3.18,
    expenseRatio: 0.06, aum: "$60B",
    priceHistory: genH(128.30, 0.010, 0.001, 2005),
  },

  VHT: {
    ticker: "VHT", name: "Vanguard Health Care ETF", kind: "etf", exchange: "NYSE Arca",
    sector: "Salud", currency: "USD",
    description: "ETF de Vanguard con exposición al sector salud de EE.UU., incluyendo farmacéuticas, biotecnología, dispositivos médicos y seguros de salud.",
    price: 262.40, priceChange: 0.42, priceChangePct: 0.16,
    high52w: 278.92, low52w: 228.40, beta: 0.60, ytdReturn: 1.4, dividendYield: 1.58,
    expenseRatio: 0.10, aum: "$18B",
    priceHistory: genH(262.40, 0.010, 0.0, 2006),
  },

  VXU: {
    ticker: "VXU", name: "Vanguard Extended Market ETF", kind: "etf", exchange: "NYSE Arca",
    sector: "Renta Variable EE.UU.", currency: "USD",
    description: "ETF de Vanguard que replica el S&P Completion Index, con exposición a acciones mid y small cap de EE.UU. excluidas las del S&P 500. Complemento del VTI para mayor exposición a empresas menores.",
    price: 185.20, priceChange: 1.20, priceChangePct: 0.65,
    high52w: 202.50, low52w: 148.30, beta: 1.18, ytdReturn: 3.6,
    expenseRatio: 0.06, aum: "$8B",
    priceHistory: genH(185.20, 0.018, 0.001, 2007),
  },

  // ── Argentine Sovereign Bonds ─────────────────────────────────────────────────

  AL30: {
    ticker: "AL30", name: "Bono Soberano Argentina AL30", kind: "bond",
    sector: "Soberano Argentina", currency: "USD",
    description: "Bono soberano argentino en dólares ley local (Ley Argentina) con vencimiento en 2030. Paga cupón semestral y amortización parcial. Referencia clave del mercado de deuda soberana argentina en USD.",
    price: 55.20, priceChange: 1.10, priceChangePct: 2.03,
    yieldToMaturity: 12.4, duration: 3.8, maturityDate: "Jul 2030",
    tna: 12.4, tea: 13.0,
    priceHistory: genH(55.20, 0.020, 0.002, 3001),
  },

  GD35: {
    ticker: "GD35", name: "Bono Soberano Argentina GD35", kind: "bond",
    sector: "Soberano Argentina", currency: "USD",
    description: "Bono soberano argentino en dólares ley extranjera (Ley Nueva York) con vencimiento en 2035. Ofrece mayor protección legal al inversor extranjero. Par junto con AL35 en el canje de 2020.",
    price: 52.80, priceChange: 0.95, priceChangePct: 1.83,
    yieldToMaturity: 11.8, duration: 5.2, maturityDate: "Jul 2035",
    tna: 11.8, tea: 12.4,
    priceHistory: genH(52.80, 0.022, 0.002, 3002),
  },

  "LECAP-S16A5": {
    ticker: "LECAP-S16A5", name: "LECAP Vencimiento Abril 2025", kind: "bond",
    sector: "Tesoro Nacional Argentina", currency: "ARS",
    description: "Letra de Capitalización (LECAP) del Tesoro Nacional argentino. Instrumento de renta fija en pesos que capitaliza intereses al vencimiento. No paga cupones periódicos.",
    price: 1124.50, priceChange: 2.80, priceChangePct: 0.25,
    tna: 38.5, tea: 45.2, maturityDate: "Abr 2025", duration: 0.12,
    priceHistory: genH(1124.50, 0.004, 0.0008, 3003),
  },

  "LECAP-S31O5": {
    ticker: "LECAP-S31O5", name: "LECAP Vencimiento Octubre 2025", kind: "bond",
    sector: "Tesoro Nacional Argentina", currency: "ARS",
    description: "Letra de Capitalización (LECAP) del Tesoro Nacional argentino con vencimiento en octubre 2025. Mayor duration que las LECAPs de corto plazo, con mayor rendimiento implícito.",
    price: 1208.30, priceChange: 3.20, priceChangePct: 0.27,
    tna: 40.2, tea: 47.8, maturityDate: "Oct 2025", duration: 0.56,
    priceHistory: genH(1208.30, 0.004, 0.0008, 3004),
  },

  "LECAP-S16J5": {
    ticker: "LECAP-S16J5", name: "LECAP Vencimiento Junio 2025", kind: "bond",
    sector: "Tesoro Nacional Argentina", currency: "ARS",
    description: "Letra de Capitalización del Tesoro Nacional con vencimiento en junio 2025.",
    price: 1165.80, priceChange: 2.90, priceChangePct: 0.25,
    tna: 39.1, tea: 46.2, maturityDate: "Jun 2025", duration: 0.27,
    priceHistory: genH(1165.80, 0.004, 0.0008, 3005),
  },

  "LECAP-S16J5B": {
    ticker: "LECAP-S16J5B", name: "LECAP Junio 2025 Serie B", kind: "bond",
    sector: "Tesoro Nacional Argentina", currency: "ARS",
    description: "Letra de Capitalización del Tesoro Nacional, segunda serie con vencimiento en junio 2025.",
    price: 1164.20, priceChange: 2.85, priceChangePct: 0.25,
    tna: 39.0, tea: 46.1, maturityDate: "Jun 2025", duration: 0.27,
    priceHistory: genH(1164.20, 0.004, 0.0008, 3006),
  },

  "CAUC-7D": {
    ticker: "CAUC-7D", name: "Caución Bursátil 7 días", kind: "bond",
    sector: "Mercado de Dinero Argentina", currency: "ARS",
    description: "Caución bursátil a 7 días. Instrumento de corto plazo del mercado de capitales argentino, equivalente a un repo garantizado con títulos valores. Rendimiento cercano a la tasa de política monetaria del BCRA.",
    price: 100.0, priceChange: 0.0, priceChangePct: 0.0,
    tna: 40.0, tea: 48.2, duration: 0.019,
    priceHistory: genH(100.0, 0.001, 0.0003, 3007),
  },

  "ON-YPF": {
    ticker: "ON-YPF", name: "ON YPF Serie XIV 7.25% 2030", kind: "bond",
    sector: "Corporativo Argentina", currency: "USD",
    description: "Obligación Negociable de YPF S.A. con vencimiento 2030 y tasa fija del 7.25% anual. Última emisión con sobredemanda 3x y destino fondos a inversión en Vaca Muerta.",
    price: 98.40, priceChange: 0.45, priceChangePct: 0.46,
    tna: 7.25, tea: 7.51, yieldToMaturity: 7.58, maturityDate: "Mar 2030", duration: 3.9,
    priceHistory: genH(98.40, 0.008, 0.001, 3008),
  },

  MUNI38: {
    ticker: "MUNI38", name: "Bono Ciudad de Buenos Aires 2038", kind: "bond",
    sector: "Sub-soberano Argentina", currency: "USD",
    description: "Bono de la Ciudad Autónoma de Buenos Aires con vencimiento en 2038. Calidad crediticia superior a la soberana argentina dado el historial de pagos de la Ciudad.",
    price: 62.40, priceChange: 0.80, priceChangePct: 1.30,
    yieldToMaturity: 10.2, duration: 6.8, maturityDate: "Jun 2038",
    priceHistory: genH(62.40, 0.015, 0.001, 3009),
  },

  "T4.25N27": {
    ticker: "T4.25N27", name: "US Treasury Note 4.25% Nov 2027", kind: "bond",
    sector: "Tesoro EE.UU.", currency: "USD",
    description: "Nota del Tesoro de Estados Unidos con cupón 4.25% y vencimiento noviembre 2027. Máxima calidad crediticia (AAA). Referencia de la curva de tasas de interés global.",
    price: 99.12, priceChange: 0.08, priceChangePct: 0.08,
    tna: 4.25, tea: 4.34, yieldToMaturity: 4.52, maturityDate: "Nov 2027", duration: 1.62,
    priceHistory: genH(99.12, 0.004, 0.0001, 3010),
  },

  "T4.50N29": {
    ticker: "T4.50N29", name: "US Treasury Note 4.50% Nov 2029", kind: "bond",
    sector: "Tesoro EE.UU.", currency: "USD",
    description: "Nota del Tesoro de Estados Unidos con cupón 4.50% y vencimiento noviembre 2029. Instrumento de alta calidad y liquidez con duration intermedia.",
    price: 99.45, priceChange: 0.10, priceChangePct: 0.10,
    tna: 4.50, tea: 4.60, yieldToMaturity: 4.62, maturityDate: "Nov 2029", duration: 2.88,
    priceHistory: genH(99.45, 0.005, 0.0001, 3011),
  },

  TBOND3: {
    ticker: "TBOND3", name: "US Treasury Bond 3% 2048", kind: "bond",
    sector: "Tesoro EE.UU.", currency: "USD",
    description: "Bono del Tesoro de EE.UU. de largo plazo con cupón 3% y vencimiento 2048. Alta sensibilidad a tasas de interés (duration elevada). Instrumento de cobertura contra recesión.",
    price: 76.20, priceChange: -0.42, priceChangePct: -0.55,
    tna: 3.0, tea: 3.04, yieldToMaturity: 4.68, maturityDate: "Feb 2048", duration: 14.2,
    priceHistory: genH(76.20, 0.014, -0.0003, 3012),
  },

  // ── FCIs ─────────────────────────────────────────────────────────────────────

  "FCI-MM1": {
    ticker: "FCI-MM1", name: "FCI Money Market Premier", kind: "fci",
    sector: "Mercado de Dinero ARS", currency: "ARS",
    description: "Fondo de money market en pesos argentinos. Invierte en cauciones, plazos fijos y letras del tesoro de muy corto plazo. Objetivo: preservar capital y ofrecer rendimiento T+0.",
    price: 1.0, priceChange: 0.001, priceChangePct: 0.11,
    fciType: "MM", return7d: 39.8, return30d: 40.2, return1y: 82.4, aum: "$48B ARS",
    priceHistory: genH(1.0, 0.0005, 0.0011, 4001),
  },

  "FCI-MM2": {
    ticker: "FCI-MM2", name: "FCI Money Market Institucional", kind: "fci",
    sector: "Mercado de Dinero ARS", currency: "ARS",
    description: "Fondo de money market para clientes institucionales. Rentabilidad similar al FCI-MM1 con mayor liquidez intradiaria.",
    price: 1.0, priceChange: 0.001, priceChangePct: 0.11,
    fciType: "MM", return7d: 39.5, return30d: 39.9, return1y: 81.8, aum: "$32B ARS",
    priceHistory: genH(1.0, 0.0005, 0.0011, 4002),
  },

  "FCI-RF1": {
    ticker: "FCI-RF1", name: "FCI Renta Fija Pesos", kind: "fci",
    sector: "Renta Fija ARS", currency: "ARS",
    description: "Fondo de renta fija en pesos con duration moderada. Invierte en LECAPs, bonos CER y activos dollar-linked. Objetivo: superar la inflación en el mediano plazo.",
    price: 1.0, priceChange: 0.0008, priceChangePct: 0.08,
    fciType: "RF", return7d: 42.1, return30d: 44.8, return1y: 95.2, aum: "$22B ARS",
    priceHistory: genH(1.0, 0.0008, 0.0012, 4003),
  },

  "FCI-RF2": {
    ticker: "FCI-RF2", name: "FCI Renta Fija Mixto", kind: "fci",
    sector: "Renta Fija ARS / USD", currency: "ARS",
    description: "Fondo mixto con exposición a renta fija en pesos y activos en dólares (soberanos y corporativos). Busca aprovechar el carry trade y la compresión de spreads.",
    price: 1.0, priceChange: 0.0009, priceChangePct: 0.09,
    fciType: "RF", return7d: 38.4, return30d: 41.2, return1y: 88.6, aum: "$15B ARS",
    priceHistory: genH(1.0, 0.0010, 0.0011, 4004),
  },

  "FCI-RV1": {
    ticker: "FCI-RV1", name: "FCI Renta Variable Argentina", kind: "fci",
    sector: "Renta Variable Argentina", currency: "ARS",
    description: "Fondo de acciones argentinas (Merval). Alta volatilidad y potencial de retorno. Invierte principalmente en empresas del panel general del BYMA con foco en energía y bancos.",
    price: 1.0, priceChange: 0.003, priceChangePct: 0.32,
    fciType: "RV", return7d: 68.4, return30d: 124.8, return1y: 312.0, aum: "$8B ARS",
    priceHistory: genH(1.0, 0.025, 0.003, 4005),
  },

  "FCI-MM-CONS": {
    ticker: "FCI-MM-CONS", name: "FCI Money Market Consultatio", kind: "fci",
    sector: "Mercado de Dinero ARS", currency: "ARS",
    description: "Fondo de money market de Consultatio Asset Management. Uno de los fondos de mayor tamaño del mercado argentino.",
    price: 1.0, priceChange: 0.001, priceChangePct: 0.11,
    fciType: "MM", return7d: 39.6, return30d: 40.0, return1y: 82.1, aum: "$78B ARS",
    priceHistory: genH(1.0, 0.0005, 0.0011, 4006),
  },

  "FCI-MM-GALI": {
    ticker: "FCI-MM-GALI", name: "FCI Money Market Galicia", kind: "fci",
    sector: "Mercado de Dinero ARS", currency: "ARS",
    description: "Fondo de money market del Banco Galicia. Integrado con la cuenta bancaria para suscripciones y rescates automáticos T+0.",
    price: 1.0, priceChange: 0.001, priceChangePct: 0.11,
    fciType: "MM", return7d: 39.4, return30d: 39.8, return1y: 81.6, aum: "$55B ARS",
    priceHistory: genH(1.0, 0.0005, 0.0011, 4007),
  },

  "FCI-MM-SUR": {
    ticker: "FCI-MM-SUR", name: "FCI Money Market SurInvest", kind: "fci",
    sector: "Mercado de Dinero ARS", currency: "ARS",
    description: "Fondo de money market de SurInvest Asset Management, especializado en clientes del sur del país.",
    price: 1.0, priceChange: 0.001, priceChangePct: 0.11,
    fciType: "MM", return7d: 39.3, return30d: 39.7, return1y: 81.4, aum: "$12B ARS",
    priceHistory: genH(1.0, 0.0005, 0.0011, 4008),
  },

  // ── FX / Dólar ──────────────────────────────────────────────────────────────

  MEP: {
    ticker: "MEP", name: "Dólar MEP (Bolsa)", kind: "fx",
    sector: "Tipo de Cambio", currency: "ARS",
    description: "Dólar MEP (Mercado Electrónico de Pagos) o Dólar Bolsa. Se obtiene comprando un bono en pesos y vendiéndolo en dólares en el mercado local. Brecha actual con el tipo de cambio oficial: 4.2%.",
    price: 1148.50, priceChange: 2.30, priceChangePct: 0.20,
    priceHistory: genH(1148.50, 0.006, 0.001, 5001),
  },

  // ── Options ──────────────────────────────────────────────────────────────────

  "AAPL-CALL": {
    ticker: "AAPL-CALL", name: "AAPL Call Option", kind: "option", currency: "USD",
    sector: "Derivados", subtype: "Call",
    description: "Opción de compra (call) sobre acciones de Apple Inc. Instrumento derivado con vencimiento definido y precio de ejercicio (strike) determinado.",
    price: 8.40, priceChange: 0.62, priceChangePct: 7.97,
    priceHistory: genH(8.40, 0.08, 0.002, 6001),
  },

  "NVDA-PUT": {
    ticker: "NVDA-PUT", name: "NVDA Put Option", kind: "option", currency: "USD",
    sector: "Derivados", subtype: "Put",
    description: "Opción de venta (put) sobre acciones de NVIDIA Corporation. Instrumento de cobertura o especulación bajista con vencimiento definido.",
    price: 12.80, priceChange: -2.10, priceChangePct: -14.09,
    priceHistory: genH(12.80, 0.10, -0.003, 6002),
  },

  // ── Other ────────────────────────────────────────────────────────────────────

  CASH: {
    ticker: "CASH", name: "Efectivo / Liquidez", kind: "other", currency: "USD",
    sector: "Efectivo",
    description: "Posición en efectivo o equivalentes de alta liquidez. No genera retornos pero mantiene capacidad de inversión inmediata.",
    price: 1.0, priceChange: 0, priceChangePct: 0,
    priceHistory: Array(60).fill(1.0),
  },

  "529": {
    ticker: "529", name: "529 College Savings Plan", kind: "other", currency: "USD",
    sector: "Educación / Ahorro",
    description: "Plan de ahorro universitario 529, con ventajas impositivas para el ahorro destinado a educación superior en EE.UU.",
    price: 1.0, priceChange: 0.008, priceChangePct: 0.82,
    priceHistory: genH(1.0, 0.008, 0.001, 7001),
  },
};

// ─── Lookup helper ────────────────────────────────────────────────────────────

export function getAssetInfo(ticker: string): AssetInfo | undefined {
  return ASSET_DATA[ticker];
}

/** All searchable assets for the search bar, sorted: equities first */
export const SEARCHABLE_ASSETS: { ticker: string; name: string; kind: AssetKind; price: number; currency: "USD" | "ARS" }[] =
  Object.values(ASSET_DATA)
    .sort((a, b) => {
      const kindOrder: Record<AssetKind, number> = { equity: 0, etf: 1, bond: 2, fci: 3, fx: 4, option: 5, other: 6 };
      return kindOrder[a.kind] - kindOrder[b.kind];
    })
    .map(({ ticker, name, kind, price, currency }) => ({ ticker, name, kind, price, currency }));
