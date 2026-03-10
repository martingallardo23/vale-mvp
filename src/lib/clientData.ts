export type RiskTier = "Conservative" | "Moderate" | "Aggressive";
export type Status = "On Track" | "Review Due" | "Needs Attention";
export type TradeType = "Buy" | "Sell" | "Deposit" | "Withdrawal";
export type NoteType = "Meeting" | "Call" | "Email" | "Internal Note";
/** Argentine product taxonomy */
export type AssetType =
  | "Renta Variable"   // acciones, CEDEARs, equity ETFs
  | "Renta Fija"       // bonos soberanos, ONs, cauciones, bond ETFs
  | "FCI"              // fondos comunes de inversión (MM, RF, RV, Mixto)
  | "Dólar"            // MEP, CCL, cable
  | "Efectivo"         // cash & equivalents
  | "Opciones"         // puts, calls y otros derivados
  | "Otro";            // 529, misc

export interface Position {
  ticker: string;
  name: string;
  sector: string;
  type: AssetType;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  gainLossPct: number;
  weight: number;
  // Renta Fija fields
  tna?: number;         // Tasa Nominal Anual (%)
  tea?: number;         // Tasa Efectiva Anual (%)
  maturityDate?: string;
  duration?: number;    // modified duration in years
  // FCI fields
  fciType?: "MM" | "RF" | "RV" | "Mixto";
  return7d?: number;    // 7-day annualized return (%)
  return30d?: number;   // 30-day annualized return (%)
  // Dólar fields
  dollarType?: "MEP" | "CCL" | "Cable";
}

export interface MonthlyData {
  month: string;
  value: number;
  benchmark: number;
}

export interface Trade {
  id: string;
  date: string;
  type: TradeType;
  ticker: string;
  name: string;
  shares: number;
  price: number;
  total: number;
  note?: string;
}

export interface ClientNote {
  id: string;
  date: string;
  type: NoteType;
  content: string;
  followUp?: string;
  author: string;
}

export interface RiskAnswer {
  question: string;
  answer: string;
  score: number;
}

export interface Client {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  dob: string;
  age: number;
  location: string;
  since: string;
  aum: number;
  ytdReturn: number;
  benchmark: number;
  risk: RiskTier;
  riskScore: number;
  status: Status;
  lastReview: string;
  nextReview: string;
  accountType: string;
  goals: string[];
  positions: Position[];
  monthlyData: MonthlyData[];
  trades: Trade[];
  notes: ClientNote[];
  riskAnswers: RiskAnswer[];
  volatility: number;
  maxDrawdown: number;
  sharpe: number;
  beta: number;
  loyalty: number;      // 0–100: likelihood to stay (low = churn risk)
  satisfaction: number; // 0–100: happiness with performance
  potential: number;    // 0–100: AUM growth potential
}

// ─── Liquidity utilities ────────────────────────────────────────────────────

export type LiquidityTier = "inmediata" | "alta" | "resto";

/**
 * Classify a position by liquidity tier:
 * - "inmediata" (T+0): cash, FCI money market
 * - "alta"      (T+1–5): letras del tesoro, cauciones, Dólar MEP
 * - "resto"     (T+5+): everything else
 */
export function getLiquidityTier(pos: Position): LiquidityTier {
  if (pos.type === "Efectivo") return "inmediata";
  if (pos.type === "FCI" && pos.fciType === "MM") return "inmediata";
  // Letras del Tesoro y cauciones bursátiles: RF with duration ≤ 90 days (≤ 0.25 years)
  if (pos.type === "Renta Fija" && pos.duration !== undefined && pos.duration <= 0.25) return "alta";
  // Dólar MEP / CCL: liquid in 1–2 días hábiles
  if (pos.type === "Dólar") return "alta";
  return "resto";
}

export interface LiquidityItem {
  ticker: string;
  name: string;
  type: string;
  tier: LiquidityTier;
  value: number;
  pct: number;      // % of total portfolio
  tna?: number;
}

export interface LiquidityBreakdown {
  total: number;          // sum of all positions
  immediate: number;      // T+0
  near: number;           // T+1–5
  liquid: number;         // immediate + near
  liquidPct: number;
  immediatePct: number;
  nearPct: number;
  items: LiquidityItem[];
}

export function getLiquidityBreakdown(positions: Position[]): LiquidityBreakdown {
  const total = positions.reduce((s, p) => s + p.value, 0);
  const items: LiquidityItem[] = positions
    .map(p => ({ ticker: p.ticker, name: p.name, type: p.type, tier: getLiquidityTier(p), value: p.value, pct: total ? (p.value / total) * 100 : 0, tna: p.tna }))
    .filter(p => p.tier !== "resto")
    .sort((a, b) => {
      const order: Record<LiquidityTier, number> = { inmediata: 0, alta: 1, resto: 2 };
      return order[a.tier] - order[b.tier] || b.value - a.value;
    });
  const immediate = items.filter(p => p.tier === "inmediata").reduce((s, p) => s + p.value, 0);
  const near      = items.filter(p => p.tier === "alta").reduce((s, p) => s + p.value, 0);
  const liquid    = immediate + near;
  return { total, immediate, near, liquid, liquidPct: total ? (liquid / total) * 100 : 0, immediatePct: total ? (immediate / total) * 100 : 0, nearPct: total ? (near / total) * 100 : 0, items };
}

export const clients: Client[] = [
  {
    id: "TC001",
    name: "Santiago González",
    initials: "SG",
    email: "santiago.gonzalez@email.com",
    phone: "+54 9 11 5555-0182",
    dob: "1973-08-14",
    age: 52,
    location: "Buenos Aires, CABA",
    since: "Enero 2019",
    aum: 4100000,
    ytdReturn: 15.6,
    benchmark: 12.1,
    risk: "Moderate",
    riskScore: 5,
    status: "On Track",
    lastReview: "3 days ago",
    nextReview: "June 8, 2026",
    accountType: "Individual Brokerage + IRA",
    goals: ["Retirement in 10 years", "Estate planning", "College fund (2 children)"],
    positions: [
      { ticker: "BRK.B",    name: "Berkshire Hathaway B (CEDEAR)", sector: "Financials",   type: "Renta Variable", shares: 2500, avgCost: 320.10, currentPrice: 383.12, value: 957800,  gainLossPct: 19.7, weight: 22.8 },
      { ticker: "VTI",      name: "Vanguard Total Stock Mkt ETF",  sector: "Blend ETF",    type: "Renta Variable", shares: 2900, avgCost: 210.40, currentPrice: 248.30, value: 720070,  gainLossPct: 18.0, weight: 17.1 },
      { ticker: "MSFT",     name: "Microsoft Corp. (CEDEAR)",       sector: "Technology",   type: "Renta Variable", shares: 1400, avgCost: 310.00, currentPrice: 415.20, value: 581280,  gainLossPct: 33.9, weight: 13.8 },
      { ticker: "JPM",      name: "JPMorgan Chase (CEDEAR)",        sector: "Financials",   type: "Renta Variable", shares: 2400, avgCost: 185.20, currentPrice: 228.65, value: 548760,  gainLossPct: 23.5, weight: 13.1 },
      { ticker: "AGG",      name: "iShares Core US Agg Bond ETF",  sector: "Fixed Income", type: "Renta Fija",     shares: 5000, avgCost: 98.40,  currentPrice: 95.10,  value: 475500,  gainLossPct: -3.4, weight: 11.3, tna: 4.2, tea: 4.3, duration: 6.5 },
      { ticker: "AAPL",     name: "Apple Inc. (CEDEAR)",            sector: "Technology",   type: "Renta Variable", shares: 2200, avgCost: 155.80, currentPrice: 213.49, value: 469678,  gainLossPct: 37.0, weight: 11.2 },
      { ticker: "VXUS",     name: "Vanguard Total Intl Stock ETF",  sector: "Intl Blend",   type: "Renta Variable", shares: 4200, avgCost: 55.20,  currentPrice: 58.10,  value: 244020,  gainLossPct: 5.3,  weight: 5.8  },
      { ticker: "T4.25N27", name: "US T-Note 4.25% May 2027",       sector: "Fixed Income", type: "Renta Fija",     shares: 200,  avgCost: 994.80, currentPrice: 988.50, value: 197700,  gainLossPct: -0.6, weight: 4.7, tna: 4.25, tea: 4.34, maturityDate: "May 2027", duration: 1.1 },
      { ticker: "AL30",     name: "Bono Soberano Argentina AL30",   sector: "Soberano",     type: "Renta Fija",     shares: 50,   avgCost: 480.00, currentPrice: 512.00, value: 25600,   gainLossPct: 6.7,  weight: 0.6, tna: 9.75, tea: 10.2, maturityDate: "Jul 2030",  duration: 3.2 },
      { ticker: "CAUC-7D",  name: "Caución Bursátil 7D",             sector: "Cauciones",    type: "Renta Fija",     shares: 1,    avgCost: 165000, currentPrice: 167850, value: 167850,  gainLossPct: 1.7,  weight: 4.0, tna: 91.0, tea: 147.3, duration: 0.019, maturityDate: "Mar 2026" },
      { ticker: "CASH",     name: "Efectivo",                        sector: "Cash",         type: "Efectivo",       shares: 1,    avgCost: 80022,  currentPrice: 80022,  value: 80022,   gainLossPct: 0.0,  weight: 1.9  },
    ],
    monthlyData: [
      { month: "Jan", value: 3547000, benchmark: 3547000 },
      { month: "Feb", value: 3610000, benchmark: 3590000 },
      { month: "Mar", value: 3575000, benchmark: 3562000 },
      { month: "Apr", value: 3720000, benchmark: 3640000 },
      { month: "May", value: 3810000, benchmark: 3698000 },
      { month: "Jun", value: 3760000, benchmark: 3720000 },
      { month: "Jul", value: 3890000, benchmark: 3760000 },
      { month: "Aug", value: 3970000, benchmark: 3810000 },
      { month: "Sep", value: 3920000, benchmark: 3780000 },
      { month: "Oct", value: 4030000, benchmark: 3842000 },
      { month: "Nov", value: 4080000, benchmark: 3890000 },
      { month: "Dec", value: 4100000, benchmark: 3978000 },
    ],
    trades: [
      { id: "t1", date: "Dec 12, 2025", type: "Buy",        ticker: "BRK.B",  name: "Berkshire Hathaway B",         shares: 200,  price: 378.40, total: 75680,  note: "Added on pullback, strong fundamentals." },
      { id: "t2", date: "Nov 28, 2025", type: "Sell",       ticker: "AGG",    name: "iShares Core US Agg Bond ETF", shares: 500,  price: 95.80,  total: 47900,  note: "Trimmed bond exposure; rotating into equities." },
      { id: "t3", date: "Oct 15, 2025", type: "Buy",        ticker: "MSFT",   name: "Microsoft Corp.",               shares: 200,  price: 398.50, total: 79700  },
      { id: "t4", date: "Sep 03, 2025", type: "Buy",        ticker: "VXUS",   name: "Vanguard Total Intl Stock ETF", shares: 700,  price: 55.90,  total: 39130,  note: "Increasing international diversification." },
      { id: "t5", date: "Jul 22, 2025", type: "Sell",       ticker: "AAPL",   name: "Apple Inc.",                    shares: 300,  price: 195.00, total: 58500,  note: "Tax-loss harvest offset; will re-enter in 31 days." },
      { id: "t6", date: "May 10, 2025", type: "Buy",        ticker: "JPM",    name: "JPMorgan Chase",                shares: 400,  price: 208.20, total: 83280  },
      { id: "t7", date: "Mar 18, 2025", type: "Buy",        ticker: "VTI",    name: "Vanguard Total Stock Mkt ETF",  shares: 500,  price: 225.60, total: 112800 },
      { id: "t8", date: "Feb 03, 2026", type: "Deposit",    ticker: "—",      name: "Depósito bancario",             shares: 0,    price: 0,      total: 50000,  note: "Aporte mensual programado." },
      { id: "t9", date: "Aug 15, 2025", type: "Withdrawal", ticker: "—",      name: "Extracción",                    shares: 0,    price: 0,      total: 20000,  note: "Retiro para gastos de reforma del hogar." },
    ],
    notes: [
      { id: "n1", date: "5 mar 2026",  type: "Meeting",       author: "M. Gallardo", content: "Revisión trimestral. Santiago está satisfecho con el rendimiento del portafolio. Hablamos de mover 3–5% de renta fija a acciones dado el contexto de tasas. Quiere revisar los documentos patrimoniales con su abogado antes de hacer cambios. Seguimiento a fin de marzo.", followUp: "Solicitar el plan patrimonial actualizado a Santiago." },
      { id: "n2", date: "14 ene 2026", type: "Call",          author: "M. Gallardo", content: "Santiago llamó consultando sobre exposición a acciones de IA. Expliqué la exposición indirecta actual vía VTI y MSFT. Está cómodo; no quiere perseguir momentum. Menciona que su hija inicia la universidad en 2028 — comenzamos modelo de aportes al FCI educativo." },
      { id: "n3", date: "20 nov 2025", type: "Email",         author: "M. Gallardo", content: "Se envió el informe de rendimiento del T3. Santiago respondió satisfecho y preguntó si deberíamos rebalancear la renta fija. Respondí con análisis — mantener por ahora a la espera de la decisión del BCRA.", followUp: "Revisar rebalanceo de renta fija después de la reunión del BCRA de diciembre." },
      { id: "n4", date: "8 sep 2025",  type: "Meeting",       author: "M. Gallardo", content: "Revisión anual del IPS. Se confirma que el perfil de riesgo sigue siendo Moderado. Horizonte de retiro en 10 años. Sin cambios de vida relevantes. Analizamos posible estrategia de conversión para el ejercicio 2025." },
      { id: "n5", date: "2 jun 2025",  type: "Internal Note", author: "M. Gallardo", content: "Santiago mencionó el fallecimiento de su madre — podría recibir una herencia (~USD 250k). Marcado para seguimiento cuando se resuelva la sucesión. Habrá que actualizar el plan financiero." },
    ],
    riskAnswers: [
      { question: "How would you react if your portfolio dropped 20% in a month?", answer: "I'd be concerned but would hold and wait for recovery.", score: 3 },
      { question: "What is your primary investment goal?", answer: "Balanced growth and capital preservation.", score: 3 },
      { question: "What is your investment horizon?", answer: "10+ years.", score: 4 },
      { question: "How much income do you need from this portfolio annually?", answer: "None currently — fully reinvesting.", score: 5 },
      { question: "How familiar are you with investment products?", answer: "Somewhat familiar — I understand ETFs and stocks.", score: 3 },
    ],
    volatility: 11.4,
    maxDrawdown: -8.2,
    sharpe: 1.82,
    beta: 0.78,
    loyalty: 87,
    satisfaction: 82,
    potential: 65,
  },

  {
    id: "ER002",
    name: "Valentina Rodríguez",
    initials: "VR",
    email: "v.rodriguez@email.com",
    phone: "+54 9 351 555-0247",
    dob: "1987-03-22",
    age: 38,
    location: "Córdoba, Córdoba",
    since: "Marzo 2021",
    aum: 3200000,
    ytdReturn: 22.7,
    benchmark: 18.4,
    risk: "Aggressive",
    riskScore: 8,
    status: "On Track",
    lastReview: "1 week ago",
    nextReview: "September 15, 2026",
    accountType: "Individual Brokerage + Roth IRA",
    goals: ["Long-term wealth building", "Financial independence by 50", "Real estate down payment (2028)"],
    positions: [
      { ticker: "NVDA",     name: "NVIDIA Corp. (CEDEAR)",        sector: "Semiconductors", type: "Renta Variable", shares: 1800, avgCost: 580.00, currentPrice: 875.40, value: 1575720, gainLossPct: 50.9,  weight: 48.0 },
      { ticker: "AAPL",     name: "Apple Inc. (CEDEAR)",           sector: "Technology",     type: "Renta Variable", shares: 2800, avgCost: 145.20, currentPrice: 213.49, value: 597772,  gainLossPct: 47.0,  weight: 18.2 },
      { ticker: "META",     name: "Meta Platforms (CEDEAR)",       sector: "Technology",     type: "Renta Variable", shares: 700,  avgCost: 320.00, currentPrice: 548.20, value: 383740,  gainLossPct: 71.3,  weight: 11.7 },
      { ticker: "MSFT",     name: "Microsoft Corp. (CEDEAR)",      sector: "Technology",     type: "Renta Variable", shares: 600,  avgCost: 290.00, currentPrice: 415.20, value: 249120,  gainLossPct: 43.2,  weight: 7.6  },
      { ticker: "AMZN",     name: "Amazon.com Inc. (CEDEAR)",      sector: "Technology",     type: "Renta Variable", shares: 900,  avgCost: 145.00, currentPrice: 218.80, value: 196920,  gainLossPct: 50.9,  weight: 6.0  },
      { ticker: "PLTR",     name: "Palantir Technologies (CEDEAR)",sector: "Technology",     type: "Renta Variable", shares: 2000, avgCost: 18.40,  currentPrice: 42.60,  value: 85200,   gainLossPct: 131.5, weight: 2.6  },
      { ticker: "FCI-MM1",  name: "FCI Liquidez Inmediata (MM)",   sector: "Money Market",   type: "FCI",            shares: 1,    avgCost: 48000,  currentPrice: 51200,  value: 51200,   gainLossPct: 6.7,   weight: 1.6, fciType: "MM",  return7d: 92.4, return30d: 88.6 },
      { ticker: "LECAP-S16A5", name: "LECAP S16A5 Abr 2026",       sector: "Letras",         type: "Renta Fija",     shares: 130,  avgCost: 960.00, currentPrice: 986.00, value: 128180,  gainLossPct: 2.7,   weight: 4.0, tna: 86.0, tea: 130.2, duration: 0.12, maturityDate: "Abr 2026" },
      { ticker: "NVDA-PUT", name: "NVDA Put $700 Dic 2026",        sector: "Derivados",      type: "Opciones",       shares: 20,   avgCost: 2480.00,currentPrice: 1920.00,value: 38400,   gainLossPct: -22.6, weight: 1.2  },
      { ticker: "CASH",     name: "Efectivo",                       sector: "Cash",           type: "Efectivo",       shares: 1,    avgCost: 22568,  currentPrice: 22568,  value: 22568,   gainLossPct: 0.0,   weight: 0.7  },
      { ticker: "FCI-MM-GALI", name: "FCI Galicia Ahorro (MM)",    sector: "Money Market",   type: "FCI",            shares: 1,    avgCost: 90000,  currentPrice: 96000,  value: 96000,   gainLossPct: 6.7,   weight: 3.0, fciType: "MM",  return7d: 94.2, return30d: 90.1 },
    ],
    monthlyData: [
      { month: "Jan", value: 2608000, benchmark: 2608000 },
      { month: "Feb", value: 2720000, benchmark: 2640000 },
      { month: "Mar", value: 2610000, benchmark: 2620000 },
      { month: "Apr", value: 2880000, benchmark: 2710000 },
      { month: "May", value: 3040000, benchmark: 2780000 },
      { month: "Jun", value: 2920000, benchmark: 2820000 },
      { month: "Jul", value: 3150000, benchmark: 2870000 },
      { month: "Aug", value: 3280000, benchmark: 2910000 },
      { month: "Sep", value: 3100000, benchmark: 2880000 },
      { month: "Oct", value: 3340000, benchmark: 2950000 },
      { month: "Nov", value: 3420000, benchmark: 3020000 },
      { month: "Dec", value: 3200000, benchmark: 3088000 },
    ],
    trades: [
      { id: "t1", date: "Dec 28, 2025", type: "Buy",  ticker: "PLTR",  name: "Palantir Technologies",  shares: 500,  price: 40.10,  total: 20050,  note: "AI government contracts thesis — added position." },
      { id: "t2", date: "Nov 15, 2025", type: "Sell", ticker: "NVDA",  name: "NVIDIA Corp.",           shares: 400,  price: 910.00, total: 364000, note: "Partial profit-taking. Still bullish long-term." },
      { id: "t3", date: "Oct 02, 2025", type: "Buy",  ticker: "META",  name: "Meta Platforms",         shares: 200,  price: 520.00, total: 104000 },
      { id: "t4", date: "Aug 19, 2025", type: "Buy",  ticker: "AMZN",  name: "Amazon.com Inc.",        shares: 400,  price: 192.30, total: 76920,  note: "AWS growth remains compelling." },
      { id: "t5", date: "Jun 05, 2025", type: "Buy",  ticker: "NVDA",  name: "NVIDIA Corp.",           shares: 200,  price: 830.00, total: 166000, note: "Added on post-earnings dip." },
      { id: "t6", date: "Apr 11, 2025", type: "Buy",  ticker: "MSFT",  name: "Microsoft Corp.",        shares: 200,  price: 385.20, total: 77040 },
      { id: "t7", date: "Feb 28, 2025", type: "Sell",       ticker: "AAPL", name: "Apple Inc.",       shares: 400, price: 178.50, total: 71400,  note: "Rotated into NVDA on AI GPU demand." },
      { id: "t8", date: "Jan 10, 2026", type: "Deposit",    ticker: "—",    name: "Depósito bancario", shares: 0,   price: 0,      total: 150000, note: "Aporte extraordinario — bono anual." },
      { id: "t9", date: "Mar 05, 2026", type: "Withdrawal", ticker: "—",    name: "Extracción",        shares: 0,   price: 0,      total: 30000,  note: "Retiro para pago de impuestos." },
    ],
    notes: [
      { id: "n1", date: "1 mar 2026",  type: "Meeting",       author: "M. Gallardo", content: "Revisión trimestral. Valentina muy satisfecha con el rendimiento de NVDA. Hablamos del riesgo de concentración — NVDA ya representa el 49% del portafolio. Entiende el riesgo pero quiere mantener. Acordamos recortar si supera el 55%. También preguntó por diversificación en fondos de private equity.", followUp: "Enviar opciones de FCIs alternativos antes del 15 de marzo." },
      { id: "n2", date: "10 dic 2025", type: "Call",          author: "M. Gallardo", content: "Valentina llamó para consultar las implicancias impositivas de una venta parcial de NVDA. Expliqué diferencias entre ganancias de capital. Va a consultar con su contador. Sugiero coordinar cualquier venta adicional para 2026.", followUp: "Coordinar con el contador de Valentina (Lucas Pérez, 351-555-0191) para planificación fiscal." },
      { id: "n3", date: "15 sep 2025", type: "Meeting",       author: "M. Gallardo", content: "Revisión semestral. Hablamos del horizonte inmobiliario — apunta a 2028 para la compra de un departamento (~USD 400k). Sugerí mantener esa porción en un FCI MM en lugar de renta variable. Acordó mover USD 100k del portafolio gradualmente." },
      { id: "n4", date: "20 may 2025", type: "Internal Note", author: "M. Gallardo", content: "Valentina recibió un vesting importante de stock options (~USD 180k neto). Depositado en la cuenta. Asignado principalmente a NVDA y META según mandato de crecimiento del IPS." },
    ],
    riskAnswers: [
      { question: "How would you react if your portfolio dropped 20% in a month?", answer: "I'd see it as a buying opportunity.", score: 5 },
      { question: "What is your primary investment goal?", answer: "Aggressive growth — maximize returns.", score: 5 },
      { question: "What is your investment horizon?", answer: "12+ years.", score: 5 },
      { question: "How much income do you need from this portfolio annually?", answer: "None — I have high earned income.", score: 5 },
      { question: "How familiar are you with investment products?", answer: "Very familiar — I follow markets closely.", score: 5 },
    ],
    volatility: 24.8,
    maxDrawdown: -18.4,
    sharpe: 1.56,
    beta: 1.42,
    loyalty: 91,
    satisfaction: 88,
    potential: 78,
  },

  {
    id: "MA003",
    name: "Facundo Martínez",
    initials: "FM",
    email: "facundo.martinez@email.com",
    phone: "+54 9 341 555-0391",
    dob: "1981-11-05",
    age: 44,
    location: "Rosario, Santa Fe",
    since: "Agosto 2020",
    aum: 2900000,
    ytdReturn: 19.8,
    benchmark: 18.4,
    risk: "Aggressive",
    riskScore: 7,
    status: "On Track",
    lastReview: "5 days ago",
    nextReview: "August 5, 2026",
    accountType: "Individual Brokerage + SEP-IRA",
    goals: ["Business succession planning", "Early retirement at 55", "Real estate portfolio"],
    positions: [
      { ticker: "AAPL",      name: "Apple Inc. (CEDEAR)",        sector: "Technology",     type: "Renta Variable", shares: 3200, avgCost: 152.40, currentPrice: 213.49, value: 683168,  gainLossPct: 40.1, weight: 22.9 },
      { ticker: "NVDA",      name: "NVIDIA Corp. (CEDEAR)",      sector: "Semiconductors", type: "Renta Variable", shares: 680,  avgCost: 620.00, currentPrice: 875.40, value: 595272,  gainLossPct: 41.2, weight: 19.9 },
      { ticker: "MSFT",      name: "Microsoft Corp. (CEDEAR)",   sector: "Technology",     type: "Renta Variable", shares: 1100, avgCost: 295.00, currentPrice: 415.20, value: 456720,  gainLossPct: 40.7, weight: 15.3 },
      { ticker: "AMZN",      name: "Amazon.com Inc. (CEDEAR)",   sector: "Technology",     type: "Renta Variable", shares: 1400, avgCost: 138.00, currentPrice: 218.80, value: 306320,  gainLossPct: 58.6, weight: 10.3 },
      { ticker: "BRK.B",     name: "Berkshire Hathaway B (CEDEAR)",sector: "Financials",  type: "Renta Variable", shares: 600,  avgCost: 340.00, currentPrice: 383.12, value: 229872,  gainLossPct: 12.7, weight: 7.7  },
      { ticker: "VTI",       name: "Vanguard Total Stock",        sector: "Blend ETF",     type: "Renta Variable", shares: 700,  avgCost: 220.00, currentPrice: 248.30, value: 173810,  gainLossPct: 12.9, weight: 5.8  },
      { ticker: "TSLA",      name: "Tesla Inc. (CEDEAR)",         sector: "Automotive",    type: "Renta Variable", shares: 800,  avgCost: 190.00, currentPrice: 248.50, value: 198800,  gainLossPct: 30.8, weight: 6.7  },
      { ticker: "GD35",      name: "Bono Global Argentina GD35",  sector: "Soberano",      type: "Renta Fija",     shares: 50,   avgCost: 810.00, currentPrice: 845.00, value: 42250,   gainLossPct: 4.3,  weight: 1.4, tna: 8.75, tea: 9.14, maturityDate: "Jul 2035", duration: 5.8 },
      { ticker: "MEP",       name: "Posición Dólar MEP",          sector: "Dólar",         type: "Dólar",          shares: 150,  avgCost: 1140.00,currentPrice: 1180.00,value: 177000,  gainLossPct: 3.5,  weight: 5.9, dollarType: "MEP" },
      { ticker: "AAPL-CALL", name: "AAPL Call $250 Jun 2026",     sector: "Derivados",     type: "Opciones",       shares: 30,   avgCost: 890.00, currentPrice: 1140.00,value: 34200,   gainLossPct: 28.1, weight: 1.1  },
      { ticker: "CAUC-7D-B", name: "Caución Bursátil 7D",           sector: "Cauciones",     type: "Renta Fija",     shares: 1,    avgCost: 85000,  currentPrice: 86445,  value: 86445,   gainLossPct: 1.7,  weight: 3.0, tna: 91.0, tea: 147.3, duration: 0.019, maturityDate: "Mar 2026" },
      { ticker: "CASH",      name: "Efectivo",                     sector: "Cash",          type: "Efectivo",       shares: 1,    avgCost: 2358,   currentPrice: 2358,   value: 2358,    gainLossPct: 0.0,  weight: 0.1  },
    ],
    monthlyData: [
      { month: "Jan", value: 2421000, benchmark: 2421000 },
      { month: "Feb", value: 2510000, benchmark: 2445000 },
      { month: "Mar", value: 2430000, benchmark: 2415000 },
      { month: "Apr", value: 2640000, benchmark: 2510000 },
      { month: "May", value: 2760000, benchmark: 2580000 },
      { month: "Jun", value: 2690000, benchmark: 2610000 },
      { month: "Jul", value: 2830000, benchmark: 2650000 },
      { month: "Aug", value: 2950000, benchmark: 2700000 },
      { month: "Sep", value: 2840000, benchmark: 2665000 },
      { month: "Oct", value: 3010000, benchmark: 2730000 },
      { month: "Nov", value: 3060000, benchmark: 2800000 },
      { month: "Dec", value: 2900000, benchmark: 2867000 },
    ],
    trades: [
      { id: "t1", date: "Dec 20, 2025", type: "Buy",  ticker: "TSLA",  name: "Tesla Inc.",          shares: 300,  price: 240.00, total: 72000,  note: "FSD progress and energy storage thesis." },
      { id: "t2", date: "Nov 08, 2025", type: "Buy",  ticker: "NVDA",  name: "NVIDIA Corp.",        shares: 180,  price: 860.00, total: 154800 },
      { id: "t3", date: "Oct 01, 2025", type: "Sell", ticker: "AAPL",  name: "Apple Inc.",          shares: 500,  price: 225.00, total: 112500, note: "Trimmed position after strong run." },
      { id: "t4", date: "Aug 14, 2025", type: "Buy",  ticker: "AMZN",  name: "Amazon.com Inc.",     shares: 500,  price: 185.20, total: 92600 },
      { id: "t5", date: "Jun 25, 2025", type: "Buy",  ticker: "MSFT",  name: "Microsoft Corp.",     shares: 300,  price: 395.00, total: 118500 },
      { id: "t6", date: "Apr 03, 2025", type: "Sell",       ticker: "BRK.B", name: "Berkshire Hathaway B", shares: 400, price: 360.00, total: 144000, note: "Rotated into higher-growth names." },
      { id: "t7", date: "Feb 20, 2026", type: "Deposit",    ticker: "—",     name: "Depósito bancario",    shares: 0,   price: 0,      total: 200000, note: "Anticipo por venta parcial de empresa." },
    ],
    notes: [
      { id: "n1", date: "3 mar 2026",  type: "Meeting",       author: "M. Gallardo", content: "Revisión trimestral. Facundo está evaluando la venta parcial de su empresa (~USD 1,2M neto). Si se concreta, habrá que redesplegar el capital. Quiere mantener el portafolio agresivo pero discutimos agregar un FCI inmobiliario. Revisando documentos sucesorios con su abogado.", followUp: "Preparar plan de redespliegue de capital ante posible venta de la empresa." },
      { id: "n2", date: "12 nov 2025", type: "Call",          author: "M. Gallardo", content: "Facundo llamó por TSLA después de la volatilidad reciente. Lo tranquilicé sobre la tesis de largo plazo. Agregó USD 75k y asignamos a nueva posición en TSLA. También hablamos de maximizar aportes al SEP-IRA antes de fin de año.", followUp: "Confirmar aporte máximo al SEP-IRA antes del 31 de dic." },
      { id: "n3", date: "5 ago 2025",  type: "Meeting",       author: "M. Gallardo", content: "Revisión semestral. Se analizó el sólido rendimiento YTD. Facundo preguntó por exposición internacional — actualmente mínima. Acordamos mantener el sesgo actual dada su convicción en tecnología. Perfil de riesgo Agresivo confirmado en cuestionario actualizado." },
      { id: "n4", date: "10 mar 2025", type: "Internal Note", author: "M. Gallardo", content: "Facundo mencionó planes de comprar un segundo inmueble en alquiler (~USD 500k). Aconsejé no liquidar portafolio; sugerí hipoteca sobre residencia principal. Lo pongo en contacto con un asesor hipotecario." },
    ],
    riskAnswers: [
      { question: "How would you react if your portfolio dropped 20% in a month?", answer: "I'd be uncomfortable but wouldn't sell — I'd likely add more.", score: 4 },
      { question: "What is your primary investment goal?", answer: "High growth — I have a long horizon and high income.", score: 5 },
      { question: "What is your investment horizon?", answer: "10–12 years to retirement.", score: 4 },
      { question: "How much income do you need from this portfolio annually?", answer: "None currently — business covers all income needs.", score: 5 },
      { question: "How familiar are you with investment products?", answer: "Very familiar — I follow individual stocks closely.", score: 4 },
    ],
    volatility: 21.3,
    maxDrawdown: -15.6,
    sharpe: 1.64,
    beta: 1.28,
    loyalty: 74,
    satisfaction: 70,
    potential: 82,
  },

  {
    id: "SC004",
    name: "Lucía Fernández",
    initials: "LF",
    email: "lucia.fernandez@email.com",
    phone: "+54 9 11 4555-0158",
    dob: "1984-06-18",
    age: 41,
    location: "Buenos Aires, CABA",
    since: "Febrero 2022",
    aum: 2400000,
    ytdReturn: 18.3,
    benchmark: 18.4,
    risk: "Aggressive",
    riskScore: 7,
    status: "Review Due",
    lastReview: "2 weeks ago",
    nextReview: "March 22, 2026",
    accountType: "Individual Brokerage + 403(b) + 529 Plans",
    goals: ["College funding (2 children, 2031 & 2034)", "Wealth building", "Paying down student loans"],
    positions: [
      { ticker: "UNH",      name: "UnitedHealth Group (CEDEAR)",  sector: "Healthcare",     type: "Renta Variable", shares: 700,  avgCost: 480.00, currentPrice: 524.80, value: 367360,  gainLossPct: 9.3,  weight: 15.3 },
      { ticker: "AAPL",     name: "Apple Inc. (CEDEAR)",           sector: "Technology",     type: "Renta Variable", shares: 2600, avgCost: 150.20, currentPrice: 213.49, value: 555074,  gainLossPct: 42.1, weight: 23.1 },
      { ticker: "NVDA",     name: "NVIDIA Corp. (CEDEAR)",         sector: "Semiconductors", type: "Renta Variable", shares: 500,  avgCost: 540.00, currentPrice: 875.40, value: 437700,  gainLossPct: 62.1, weight: 18.2 },
      { ticker: "VHT",      name: "Vanguard Health Care ETF",      sector: "Healthcare",     type: "Renta Variable", shares: 1500, avgCost: 225.00, currentPrice: 248.50, value: 372750,  gainLossPct: 10.4, weight: 15.5 },
      { ticker: "MSFT",     name: "Microsoft Corp. (CEDEAR)",      sector: "Technology",     type: "Renta Variable", shares: 800,  avgCost: 280.00, currentPrice: 415.20, value: 332160,  gainLossPct: 48.3, weight: 13.8 },
      { ticker: "FCI-RV1",  name: "FCI Crecimiento AR (RV)",       sector: "Renta Variable", type: "FCI",            shares: 1,    avgCost: 168000, currentPrice: 191200, value: 191200,  gainLossPct: 13.8, weight: 8.0, fciType: "RV",  return7d: 78.2, return30d: 82.4 },
      { ticker: "529",      name: "FCI Educación 2031",             sector: "Education",      type: "FCI",            shares: 1,    avgCost: 193000, currentPrice: 218500, value: 218500,  gainLossPct: 13.2, weight: 9.1, fciType: "Mixto", return7d: 68.4, return30d: 71.2 },
      { ticker: "LECAP-S31O5", name: "LECAP S31O5 May 2026",         sector: "Letras",         type: "Renta Fija",     shares: 95,   avgCost: 960.00, currentPrice: 984.00, value: 93480,   gainLossPct: 2.5,  weight: 3.9, tna: 83.0, tea: 124.5, duration: 0.16, maturityDate: "May 2026" },
      { ticker: "CASH",     name: "Efectivo",                       sector: "Cash",           type: "Efectivo",       shares: 1,    avgCost: 25256,  currentPrice: 25256,  value: 25256,   gainLossPct: 0.0,  weight: 1.1  },
    ],
    monthlyData: [
      { month: "Jan", value: 2028000, benchmark: 2028000 },
      { month: "Feb", value: 2110000, benchmark: 2050000 },
      { month: "Mar", value: 2050000, benchmark: 2025000 },
      { month: "Apr", value: 2190000, benchmark: 2100000 },
      { month: "May", value: 2280000, benchmark: 2160000 },
      { month: "Jun", value: 2200000, benchmark: 2190000 },
      { month: "Jul", value: 2340000, benchmark: 2230000 },
      { month: "Aug", value: 2420000, benchmark: 2270000 },
      { month: "Sep", value: 2310000, benchmark: 2240000 },
      { month: "Oct", value: 2470000, benchmark: 2300000 },
      { month: "Nov", value: 2500000, benchmark: 2360000 },
      { month: "Dec", value: 2400000, benchmark: 2421000 },
    ],
    trades: [
      { id: "t1", date: "Nov 30, 2025", type: "Buy",  ticker: "529",  name: "529 College Savings",  shares: 1, price: 15000, total: 15000,  note: "Annual 529 contribution for both children." },
      { id: "t2", date: "Oct 18, 2025", type: "Buy",  ticker: "NVDA", name: "NVIDIA Corp.",          shares: 200, price: 840.00, total: 168000 },
      { id: "t3", date: "Sep 05, 2025", type: "Buy",  ticker: "VHT",  name: "Vanguard Health Care ETF",shares: 300, price: 238.00, total: 71400, note: "Increasing sector conviction." },
      { id: "t4", date: "Jul 14, 2025", type: "Sell", ticker: "AAPL", name: "Apple Inc.",            shares: 400, price: 195.50, total: 78200,  note: "Partial rebalance — AAPL overweight." },
      { id: "t5", date: "May 28, 2025", type: "Buy",  ticker: "MSFT", name: "Microsoft Corp.",       shares: 200, price: 398.00, total: 79600 },
      { id: "t6", date: "Feb 12, 2025", type: "Buy",  ticker: "UNH",  name: "UnitedHealth Group",    shares: 200, price: 510.00, total: 102000 },
    ],
    notes: [
      { id: "n1", date: "22 feb 2026", type: "Meeting",       author: "M. Gallardo", content: "Reunión de revisión del portafolio. Lucía señaló que su hijo mayor necesitará fondos para la universidad en 6 años — revisamos saldos del FCI educativo. El portafolio está prácticamente alineado con el benchmark agresivo. Hablamos de reducir levemente el riesgo dado el plazo educativo. Quiere revisitarlo.", followUp: "Preparar propuesta ajustada por riesgo para FCI educativo vs. portafolio." },
      { id: "n2", date: "10 nov 2025", type: "Email",         author: "M. Gallardo", content: "Lucía escribió sobre el bajo rendimiento de UNH. Respondí con análisis de vientos en contra del sector. Está cómoda manteniendo — convicción de largo plazo en salud.", followUp: "Monitorear posición en UNH. Alertar si cae por debajo de USD 480." },
      { id: "n3", date: "19 ago 2025", type: "Meeting",       author: "M. Gallardo", content: "Revisión semestral. Año de buen rendimiento, pero portafolio casi a la par del benchmark. Recomendé recortar levemente AAPL y agregar diversificación. Lucía está enfocada en cancelar deuda estudiantil remanente (~USD 80k) — analizamos si usar bono anual o portafolio." },
      { id: "n4", date: "8 abr 2025",  type: "Internal Note", author: "M. Gallardo", content: "Lucía comentó que recibió su bono anual como médica (~USD 85k). Invertirá USD 50k en posiciones existentes del portafolio. Asignado por igual entre AAPL y MSFT según su preferencia." },
    ],
    riskAnswers: [
      { question: "How would you react if your portfolio dropped 20% in a month?", answer: "Nervous, but I'd hold. I wouldn't sell.", score: 3 },
      { question: "What is your primary investment goal?", answer: "Long-term growth with some priority on education funding.", score: 4 },
      { question: "What is your investment horizon?", answer: "15+ years for retirement, 6 years for education.", score: 4 },
      { question: "How much income do you need from this portfolio annually?", answer: "None — salary covers all needs.", score: 5 },
      { question: "How familiar are you with investment products?", answer: "Moderately familiar — I trust your recommendations.", score: 3 },
    ],
    volatility: 19.6,
    maxDrawdown: -14.2,
    sharpe: 1.58,
    beta: 1.18,
    loyalty: 68,
    satisfaction: 65,
    potential: 71,
  },

  {
    id: "JW005",
    name: "Pablo Sánchez",
    initials: "PS",
    email: "p.sanchez@email.com",
    phone: "+54 9 261 555-0374",
    dob: "1967-02-09",
    age: 58,
    location: "Mendoza, Mendoza",
    since: "Junio 2018",
    aum: 1800000,
    ytdReturn: 12.1,
    benchmark: 12.1,
    risk: "Moderate",
    riskScore: 4,
    status: "Review Due",
    lastReview: "1 month ago",
    nextReview: "April 10, 2026",
    accountType: "Individual Brokerage + 401(k) Rollover IRA",
    goals: ["Retirement in 7 years", "Income generation", "Travel fund"],
    positions: [
      { ticker: "VTI",     name: "Vanguard Total Stock",        sector: "Blend ETF",    type: "Renta Variable", shares: 2200, avgCost: 195.00, currentPrice: 248.30, value: 546260,  gainLossPct: 27.3, weight: 28.6 },
      { ticker: "AGG",     name: "iShares Core US Agg Bond",    sector: "Fixed Income", type: "Renta Fija",     shares: 4000, avgCost: 100.20, currentPrice: 95.10,  value: 380400,  gainLossPct: -5.1, weight: 19.9, tna: 4.2, tea: 4.3, duration: 6.5 },
      { ticker: "VYM",     name: "Vanguard High Div Yield",     sector: "Dividend ETF", type: "Renta Variable", shares: 2800, avgCost: 95.00,  currentPrice: 118.40, value: 331520,  gainLossPct: 24.6, weight: 17.4 },
      { ticker: "BRK.B",   name: "Berkshire Hathaway B (CEDEAR)",sector: "Financials",  type: "Renta Variable", shares: 600,  avgCost: 330.00, currentPrice: 383.12, value: 229872,  gainLossPct: 16.1, weight: 12.0 },
      { ticker: "VXUS",    name: "Vanguard Total Intl Stock",   sector: "Intl Blend",   type: "Renta Variable", shares: 2500, avgCost: 52.00,  currentPrice: 58.10,  value: 145250,  gainLossPct: 11.7, weight: 7.6  },
      { ticker: "T4.50N29",name: "US T-Note 4.50% Mar 2029",    sector: "Fixed Income", type: "Renta Fija",     shares: 100,  avgCost: 996.40, currentPrice: 991.20, value: 99120,   gainLossPct: -0.5, weight: 5.2, tna: 4.50, tea: 4.60, maturityDate: "Mar 2029", duration: 2.8 },
      { ticker: "ON-YPF",  name: "ON YPF 6.5% 2027",            sector: "Corporativo",  type: "Renta Fija",     shares: 80,   avgCost: 920.00, currentPrice: 948.00, value: 75840,   gainLossPct: 3.0,  weight: 4.0, tna: 6.50, tea: 6.61, maturityDate: "Abr 2027", duration: 1.2 },
      { ticker: "LECAP-S16J5", name: "LECAP S16J5 Jun 2026",      sector: "Letras",       type: "Renta Fija",     shares: 90,   avgCost: 970.00, currentPrice: 993.00, value: 89370,   gainLossPct: 2.4,  weight: 5.0, tna: 83.0, tea: 124.5, duration: 0.30, maturityDate: "Jun 2026" },
      { ticker: "CAUC-7D-C", name: "Caución Bursátil 7D",       sector: "Cauciones",    type: "Renta Fija",     shares: 1,    avgCost: 36000,  currentPrice: 36612,  value: 36612,   gainLossPct: 1.7,  weight: 2.0, tna: 91.0, tea: 147.3, duration: 0.019, maturityDate: "Mar 2026" },
      { ticker: "CASH",    name: "Efectivo",                     sector: "Cash",         type: "Efectivo",       shares: 1,    avgCost: 11178,  currentPrice: 11178,  value: 11178,   gainLossPct: 0.0,  weight: 0.6  },
    ],
    monthlyData: [
      { month: "Jan", value: 1605000, benchmark: 1605000 },
      { month: "Feb", value: 1635000, benchmark: 1622000 },
      { month: "Mar", value: 1618000, benchmark: 1608000 },
      { month: "Apr", value: 1668000, benchmark: 1650000 },
      { month: "May", value: 1700000, benchmark: 1680000 },
      { month: "Jun", value: 1685000, benchmark: 1692000 },
      { month: "Jul", value: 1720000, benchmark: 1712000 },
      { month: "Aug", value: 1755000, benchmark: 1735000 },
      { month: "Sep", value: 1735000, benchmark: 1718000 },
      { month: "Oct", value: 1772000, benchmark: 1748000 },
      { month: "Nov", value: 1790000, benchmark: 1775000 },
      { month: "Dec", value: 1800000, benchmark: 1800000 },
    ],
    trades: [
      { id: "t1", date: "Dec 05, 2025", type: "Buy",  ticker: "VYM",  name: "Vanguard High Div Yield",  shares: 500, price: 114.20, total: 57100,  note: "Increasing income exposure ahead of retirement." },
      { id: "t2", date: "Oct 22, 2025", type: "Buy",  ticker: "VTI",  name: "Vanguard Total Stock",     shares: 300, price: 238.00, total: 71400 },
      { id: "t3", date: "Sep 11, 2025", type: "Sell", ticker: "AGG",  name: "iShares Core US Agg Bond", shares: 600, price: 96.20,  total: 57720,  note: "Rebalanced; reduced bond duration risk." },
      { id: "t4", date: "Jun 18, 2025", type: "Buy",  ticker: "BRK.B",name: "Berkshire Hathaway B",     shares: 200, price: 358.00, total: 71600 },
      { id: "t5", date: "Mar 04, 2025", type: "Buy",  ticker: "VXUS", name: "Vanguard Total Intl Stock", shares: 800, price: 54.10,  total: 43280 },
    ],
    notes: [
      { id: "n1", date: "10 feb 2026", type: "Meeting",       author: "M. Gallardo", content: "Revisión anual. Pablo está a 7 años de su retiro objetivo. Hablamos del glide path — empezaremos a rotar 2% anual de renta variable a renta fija/FCI en los próximos 5 años. Mencionó interés en convertir parte del portafolio a instrumentos más conservadores antes del retiro.", followUp: "Correr análisis de conversión a portafolio conservador para el ejercicio 2026." },
      { id: "n2", date: "30 oct 2025", type: "Call",          author: "M. Gallardo", content: "Pablo preocupado por los bonos después de noticias de tasas. Expliqué que ya redujimos la duración. Quedó tranquilo. Mencionó que él y su esposa planean viajar más en 2026 — quieren una subcuenta de viajes.", followUp: "Constituir reserva de viajes de ARS 3M en FCI MM." },
      { id: "n3", date: "20 jun 2025", type: "Meeting",       author: "M. Gallardo", content: "Revisión de mitad de año. Portafolio alineado con benchmark — sólido rendimiento. Pablo expresó satisfacción. Revisamos estrategia de aportes al fondo jubilatorio. Recibirá beneficio del sistema previsional a los 65, lo que modifica la planificación de retiros." },
      { id: "n4", date: "15 ene 2025", type: "Email",         author: "M. Gallardo", content: "Se envió proyección actualizada del plan financiero con escenarios de ingresos al retiro a los 65 y 67. Pablo respondió que quiere apuntar a los 65 si es posible. Actualizando el plan de largo plazo en consecuencia." },
    ],
    riskAnswers: [
      { question: "How would you react if your portfolio dropped 20% in a month?", answer: "I'd be worried and might reduce exposure.", score: 2 },
      { question: "What is your primary investment goal?", answer: "Balanced growth with capital preservation as I near retirement.", score: 3 },
      { question: "What is your investment horizon?", answer: "7 years to retirement.", score: 3 },
      { question: "How much income do you need from this portfolio annually?", answer: "None yet, but I want to start drawing in 7 years.", score: 3 },
      { question: "How familiar are you with investment products?", answer: "Comfortable with ETFs and bonds.", score: 3 },
    ],
    volatility: 9.8,
    maxDrawdown: -6.4,
    sharpe: 1.74,
    beta: 0.65,
    loyalty: 62,
    satisfaction: 58,
    potential: 55,
  },

  {
    id: "PW006",
    name: "María Álvarez",
    initials: "MA",
    email: "maria.alvarez@email.com",
    phone: "+54 9 223 555-0219",
    dob: "1960-09-30",
    age: 65,
    location: "Mar del Plata, Buenos Aires",
    since: "Noviembre 2017",
    aum: 1500000,
    ytdReturn: 8.9,
    benchmark: 7.2,
    risk: "Moderate",
    riskScore: 3,
    status: "Review Due",
    lastReview: "6 weeks ago",
    nextReview: "April 1, 2026",
    accountType: "IRA Rollover + Taxable Brokerage",
    goals: ["Income generation ($60k/year)", "Preserve capital", "Travel fund", "Legacy for grandchildren"],
    positions: [
      { ticker: "VYM",     name: "Vanguard High Div Yield",      sector: "Dividend ETF", type: "Renta Variable", shares: 4500, avgCost: 88.00,  currentPrice: 118.40, value: 532800,  gainLossPct: 34.5, weight: 33.5 },
      { ticker: "AGG",     name: "iShares Core US Agg Bond",     sector: "Fixed Income", type: "Renta Fija",     shares: 3500, avgCost: 101.20, currentPrice: 95.10,  value: 332850,  gainLossPct: -6.0, weight: 20.9, tna: 4.2, tea: 4.3, duration: 6.5 },
      { ticker: "VCSH",    name: "Vanguard Short-Term Corp Bond",sector: "Fixed Income", type: "Renta Fija",     shares: 3000, avgCost: 77.20,  currentPrice: 78.40,  value: 235200,  gainLossPct: 1.6,  weight: 14.8, tna: 5.1, tea: 5.23, duration: 2.8 },
      { ticker: "VTI",     name: "Vanguard Total Stock",         sector: "Blend ETF",    type: "Renta Variable", shares: 900,  avgCost: 200.00, currentPrice: 248.30, value: 223470,  gainLossPct: 24.2, weight: 14.0 },
      { ticker: "BRK.B",   name: "Berkshire Hathaway B (CEDEAR)",sector: "Financials",   type: "Renta Variable", shares: 300,  avgCost: 345.00, currentPrice: 383.12, value: 114936,  gainLossPct: 11.1, weight: 7.2  },
      { ticker: "FCI-RF1", name: "FCI Renta Plus (RF)",          sector: "Renta Fija",   type: "FCI",            shares: 1,    avgCost: 53200,  currentPrice: 56400,  value: 56400,   gainLossPct: 6.0,  weight: 3.5, fciType: "RF",  return7d: 74.8, return30d: 78.2 },
      { ticker: "MUNI38",  name: "Bono Municipal 3.8% 2031",     sector: "Municipal",    type: "Renta Fija",     shares: 60,   avgCost: 1008.00,currentPrice: 994.50, value: 59670,   gainLossPct: -1.3, weight: 3.7, tna: 3.80, tea: 3.87, maturityDate: "Mar 2031", duration: 4.2 },
      { ticker: "FCI-MM-CONS", name: "FCI Consultatio Money Market (MM)", sector: "Money Market", type: "FCI",       shares: 1,    avgCost: 115000, currentPrice: 122500, value: 122500,  gainLossPct: 6.5,  weight: 7.8, fciType: "MM",  return7d: 93.8, return30d: 91.2 },
      { ticker: "LECAP-S16J5B", name: "LECAP S16J5 Jun 2026",    sector: "Letras",       type: "Renta Fija",     shares: 78,   avgCost: 960.00, currentPrice: 982.00, value: 76596,   gainLossPct: 2.3,  weight: 4.9, tna: 83.0, tea: 124.5, duration: 0.30, maturityDate: "Jun 2026" },
      { ticker: "CASH",    name: "Efectivo",                      sector: "Cash",         type: "Efectivo",       shares: 1,    avgCost: 38424,  currentPrice: 38424,  value: 38424,   gainLossPct: 0.0,  weight: 2.4  },
    ],
    monthlyData: [
      { month: "Jan", value: 1377000, benchmark: 1377000 },
      { month: "Feb", value: 1395000, benchmark: 1387000 },
      { month: "Mar", value: 1383000, benchmark: 1374000 },
      { month: "Apr", value: 1412000, benchmark: 1398000 },
      { month: "May", value: 1428000, benchmark: 1408000 },
      { month: "Jun", value: 1418000, benchmark: 1416000 },
      { month: "Jul", value: 1440000, benchmark: 1428000 },
      { month: "Aug", value: 1458000, benchmark: 1440000 },
      { month: "Sep", value: 1445000, benchmark: 1430000 },
      { month: "Oct", value: 1470000, benchmark: 1450000 },
      { month: "Nov", value: 1488000, benchmark: 1470000 },
      { month: "Dec", value: 1500000, benchmark: 1476000 },
    ],
    trades: [
      { id: "t1", date: "Nov 25, 2025", type: "Sell", ticker: "AGG",  name: "iShares Core US Agg Bond", shares: 500, price: 95.40, total: 47700,  note: "Reduced long-duration exposure; rotating to VCSH." },
      { id: "t2", date: "Nov 25, 2025", type: "Buy",  ticker: "VCSH", name: "Vanguard Short-Term Corp Bond",shares:600, price:78.10, total: 46860, note: "Shorter duration provides stability." },
      { id: "t3", date: "Aug 08, 2025", type: "Buy",  ticker: "VYM",  name: "Vanguard High Div Yield",  shares: 400, price: 110.00, total: 44000, note: "Dividend income re-investment per IPS." },
      { id: "t4", date: "May 15, 2025", type: "Buy",  ticker: "BRK.B",name: "Berkshire Hathaway B",     shares: 100, price: 365.00, total: 36500 },
      { id: "t5", date: "Feb 20, 2025", type: "Sell", ticker: "VTI",  name: "Vanguard Total Stock",     shares: 300, price: 228.00, total: 68400,  note: "Rebalanced equity down per retirement income plan." },
    ],
    notes: [
      { id: "n1", date: "20 ene 2026", type: "Meeting",       author: "M. Gallardo", content: "Revisión anual. María retira ARS 580k/mes del portafolio para gastos de vida — dentro del plan. Satisfecha con los ingresos por dividendos y FCI. Hablamos del plan patrimonial: quiere dejar USD 50k a cada uno de sus tres nietos. Revisamos beneficiarios — todos actualizados.", followUp: "Redactar memo actualizado de planificación patrimonial." },
      { id: "n2", date: "5 oct 2025",  type: "Call",          author: "M. Gallardo", content: "María llamó por la caída en el valor de los bonos. Expliqué el rendimiento de la renta fija en el contexto de tasas. Está preocupada pero lo entiende. Revisamos el flujo de ingresos de dividendos y FCI — cómoda mientras los retiros mensuales estén cubiertos." },
      { id: "n3", date: "12 jul 2025", type: "Meeting",       author: "M. Gallardo", content: "Revisión de mitad de año. Portafolio levemente por encima del benchmark conservador. María contenta con los ingresos. Planea hacer un crucero por el Mediterráneo en otoño — solicitó separar ARS 1,5M en liquidez. Usaremos FCI MM para el sweep.", followUp: "Mover ARS 1,5M a FCI MM de María para viaje." },
      { id: "n4", date: "18 mar 2025", type: "Internal Note", author: "M. Gallardo", content: "Revisamos las distribuciones mínimas requeridas — María debe retirar ARS 5,2M del portafolio previsional este año. Procesaremos la distribución en diciembre. También detectamos una oportunidad de optimización en la estrategia de retiro de la ANSES." },
    ],
    riskAnswers: [
      { question: "How would you react if your portfolio dropped 20% in a month?", answer: "Very uncomfortable — I'd want to move to safety.", score: 1 },
      { question: "What is your primary investment goal?", answer: "Income and capital preservation — I'm retired.", score: 2 },
      { question: "What is your investment horizon?", answer: "I need income now; 15–20 year legacy horizon.", score: 3 },
      { question: "How much income do you need from this portfolio annually?", answer: "~$60k/year ($5k/month).", score: 2 },
      { question: "How familiar are you with investment products?", answer: "I understand bonds and dividend stocks.", score: 2 },
    ],
    volatility: 7.2,
    maxDrawdown: -4.8,
    sharpe: 1.68,
    beta: 0.48,
    loyalty: 34,
    satisfaction: 28,
    potential: 22,
  },

  {
    id: "RK007",
    name: "Gustavo Torres",
    initials: "GT",
    email: "gustavo.torres@email.com",
    phone: "+54 9 381 555-0483",
    dob: "1953-04-17",
    age: 72,
    location: "San Miguel de Tucumán, Tucumán",
    since: "Septiembre 2016",
    aum: 890000,
    ytdReturn: -2.4,
    benchmark: 6.1,
    risk: "Conservative",
    riskScore: 2,
    status: "Needs Attention",
    lastReview: "3 months ago",
    nextReview: "March 15, 2026",
    accountType: "IRA Rollover + Joint Brokerage",
    goals: ["Capital preservation", "Income ($45k/year)", "Medical expense reserve"],
    positions: [
      { ticker: "TLT",    name: "iShares 20+ Year Trs Bond", sector: "Fixed Income",    type: "Renta Fija",     shares: 3000, avgCost: 115.00, currentPrice: 88.20,  value: 264600,  gainLossPct: -23.3, weight: 28.5, tna: 4.5, tea: 4.61, duration: 17.2 },
      { ticker: "AGG",    name: "iShares Core US Agg Bond",  sector: "Fixed Income",    type: "Renta Fija",     shares: 2500, avgCost: 102.00, currentPrice: 95.10,  value: 237750,  gainLossPct: -6.8,  weight: 25.6, tna: 4.2, tea: 4.30, duration: 6.5 },
      { ticker: "JNJ",    name: "Johnson & Johnson (CEDEAR)", sector: "Healthcare",      type: "Renta Variable", shares: 1200, avgCost: 165.00, currentPrice: 148.90, value: 178680,  gainLossPct: -9.8,  weight: 19.2 },
      { ticker: "KO",     name: "Coca-Cola Co. (CEDEAR)",    sector: "Consumer Staples", type: "Renta Variable", shares: 1800, avgCost: 58.00,  currentPrice: 61.30,  value: 110340,  gainLossPct: 5.7,   weight: 11.9 },
      { ticker: "FCI-MM2",name: "FCI Fima Premium (MM)",     sector: "Money Market",    type: "FCI",            shares: 1,    avgCost: 28800,  currentPrice: 30600,  value: 30600,   gainLossPct: 6.3,   weight: 3.3, fciType: "MM",  return7d: 95.1, return30d: 90.4 },
      { ticker: "CAUC-7D-D", name: "Caución Bursátil 7D",    sector: "Cauciones",       type: "Renta Fija",     shares: 1,    avgCost: 35000,  currentPrice: 35595,  value: 35595,   gainLossPct: 1.7,   weight: 4.0, tna: 91.0, tea: 147.3, duration: 0.019, maturityDate: "Mar 2026" },
      { ticker: "TBOND3", name: "US T-Bond 3.0% 2045",       sector: "Fixed Income",    type: "Renta Fija",     shares: 40,   avgCost: 982.00, currentPrice: 891.00, value: 35640,   gainLossPct: -9.3,  weight: 3.8, tna: 3.00, tea: 3.04, maturityDate: "Feb 2045", duration: 18.4 },
      { ticker: "CASH",   name: "Efectivo",                   sector: "Cash",            type: "Efectivo",       shares: 1,    avgCost: 32430,  currentPrice: 32430,  value: 32430,   gainLossPct: 0.0,   weight: 3.5  },
    ],
    monthlyData: [
      { month: "Jan", value: 912000, benchmark: 912000 },
      { month: "Feb", value: 905000, benchmark: 919000 },
      { month: "Mar", value: 892000, benchmark: 924000 },
      { month: "Apr", value: 898000, benchmark: 931000 },
      { month: "May", value: 884000, benchmark: 937000 },
      { month: "Jun", value: 876000, benchmark: 942000 },
      { month: "Jul", value: 882000, benchmark: 948000 },
      { month: "Aug", value: 878000, benchmark: 955000 },
      { month: "Sep", value: 870000, benchmark: 960000 },
      { month: "Oct", value: 875000, benchmark: 966000 },
      { month: "Nov", value: 882000, benchmark: 973000 },
      { month: "Dec", value: 890000, benchmark: 967000 },
    ],
    trades: [
      { id: "t1", date: "Oct 30, 2025", type: "Sell", ticker: "TLT",  name: "iShares 20+ Year Trs Bond", shares: 500, price: 90.20, total: 45100,  note: "Forced to sell to fund RMD and living expenses." },
      { id: "t2", date: "Jul 15, 2025", type: "Buy",  ticker: "KO",   name: "Coca-Cola Co.",              shares: 300, price: 60.10, total: 18030,  note: "Added dividend income; stable consumer staple." },
      { id: "t3", date: "Apr 22, 2025", type: "Sell", ticker: "JNJ",  name: "Johnson & Johnson",          shares: 200, price: 152.00, total: 30400, note: "JNJ continued weakness; took partial loss." },
      { id: "t4", date: "Jan 08, 2025", type: "Sell", ticker: "TLT",  name: "iShares 20+ Year Trs Bond", shares: 300, price: 96.00, total: 28800,  note: "RMD distribution — required withdrawal." },
    ],
    notes: [
      { id: "n1", date: "10 dic 2025", type: "Meeting",       author: "M. Gallardo", content: "REVISIÓN URGENTE: Portafolio en -2,4% YTD vs +6,1% del benchmark. El problema principal es TLT (bonos de larga duración) — pérdidas significativas por el entorno de tasas altas. Hablamos de rebalancear: rotar TLT → menor duración (VCSH, SGOV). Gustavo está muy preocupado. También procesamos la distribución anual requerida (USD 44.500).", followUp: "Preparar plan de rebalanceo: reducir TLT 50%, aumentar VCSH y SGOV. Presentar a Gustavo antes del 20 de dic." },
      { id: "n2", date: "8 sep 2025",  type: "Call",          author: "M. Gallardo", content: "Gustavo llamó por las pérdidas del portafolio. Está frustrado. Expliqué la tesis de los bonos de larga duración y por qué no vendimos antes. En retrospectiva, deberíamos haber rotado antes. Programaré una revisión de emergencia para analizar opciones de rebalanceo.", followUp: "Programar revisión presencial para octubre." },
      { id: "n3", date: "25 jun 2025", type: "Internal Note", author: "M. Gallardo", content: "Gustavo mencionó posibles gastos médicos (reemplazo de rodilla). Separé ARS 4,8M de reserva médica en efectivo. No debería necesitar vender activos si procede la cirugía. Verificando cobertura del PAMI y obra social." },
      { id: "n4", date: "28 feb 2025", type: "Meeting",       author: "M. Gallardo", content: "Revisión anual. Hablamos de la estrategia de distribuciones para 2025. Gustavo recibe USD 44.500 de distribución requerida del portafolio previsional. El arrastre de TLT continúa. Recomendé reducir duración — Gustavo se resistió a realizar pérdidas." },
    ],
    riskAnswers: [
      { question: "How would you react if your portfolio dropped 20% in a month?", answer: "I cannot afford losses — I'm fully dependent on this portfolio.", score: 1 },
      { question: "What is your primary investment goal?", answer: "Capital preservation and income.", score: 1 },
      { question: "What is your investment horizon?", answer: "5–10 years; focused on current income needs.", score: 2 },
      { question: "How much income do you need from this portfolio annually?", answer: "~$45k/year plus RMD distributions.", score: 1 },
      { question: "How familiar are you with investment products?", answer: "I understand basics — prefer simple instruments.", score: 2 },
    ],
    volatility: 6.8,
    maxDrawdown: -9.6,
    sharpe: -0.42,
    beta: 0.28,
    loyalty: 45,
    satisfaction: 38,
    potential: 30,
  },

  {
    id: "DP008",
    name: "Carolina Herrera",
    initials: "CH",
    email: "carolina.herrera@email.com",
    phone: "+54 9 11 5555-0627",
    dob: "1978-12-03",
    age: 47,
    location: "Buenos Aires, CABA",
    since: "Abril 2023",
    aum: 720000,
    ytdReturn: 5.2,
    benchmark: 6.1,
    risk: "Conservative",
    riskScore: 3,
    status: "Review Due",
    lastReview: "2 months ago",
    nextReview: "March 20, 2026",
    accountType: "Individual Brokerage + Roth IRA",
    goals: ["Capital preservation (post-divorce settlement)", "Steady income", "Financial independence"],
    positions: [
      { ticker: "VCSH",    name: "Vanguard Short-Term Corp Bond", sector: "Fixed Income", type: "Renta Fija",     shares: 3000, avgCost: 77.50,  currentPrice: 78.40,  value: 235200, gainLossPct: 1.2,  weight: 32.7, tna: 5.1, tea: 5.23, duration: 2.8 },
      { ticker: "VYM",     name: "Vanguard High Div Yield",       sector: "Dividend ETF", type: "Renta Variable", shares: 1400, avgCost: 102.00, currentPrice: 118.40, value: 165760, gainLossPct: 16.1, weight: 23.0 },
      { ticker: "VTI",     name: "Vanguard Total Stock",          sector: "Blend ETF",    type: "Renta Variable", shares: 600,  avgCost: 215.00, currentPrice: 248.30, value: 148980, gainLossPct: 15.5, weight: 20.7 },
      { ticker: "AGG",     name: "iShares Core US Agg Bond",      sector: "Fixed Income", type: "Renta Fija",     shares: 1000, avgCost: 98.50,  currentPrice: 95.10,  value: 95100,  gainLossPct: -3.5, weight: 13.2, tna: 4.2, tea: 4.30, duration: 6.5 },
      { ticker: "FCI-RF2", name: "FCI Balanz Ahorro (RF-CP)",     sector: "Renta Fija",   type: "FCI",            shares: 1,    avgCost: 22400,  currentPrice: 23800,  value: 23800,  gainLossPct: 6.3,  weight: 3.3, fciType: "RF",  return7d: 72.6, return30d: 75.8 },
      { ticker: "FCI-MM-SUR", name: "FCI SurInvest Money Market (MM)", sector: "Money Market", type: "FCI",       shares: 1,    avgCost: 68000,  currentPrice: 72500,  value: 72500,  gainLossPct: 6.6,  weight: 10.1, fciType: "MM", return7d: 91.8, return30d: 89.4 },
      { ticker: "CASH",    name: "Efectivo",                       sector: "Cash",         type: "Efectivo",       shares: 1,    avgCost: 1160,   currentPrice: 1160,   value: 1160,   gainLossPct: 0.0,  weight: 0.2  },
    ],
    monthlyData: [
      { month: "Jan", value: 684000, benchmark: 684000 },
      { month: "Feb", value: 690000, benchmark: 690000 },
      { month: "Mar", value: 686000, benchmark: 688000 },
      { month: "Apr", value: 695000, benchmark: 695000 },
      { month: "May", value: 700000, benchmark: 703000 },
      { month: "Jun", value: 697000, benchmark: 710000 },
      { month: "Jul", value: 705000, benchmark: 715000 },
      { month: "Aug", value: 710000, benchmark: 720000 },
      { month: "Sep", value: 706000, benchmark: 716000 },
      { month: "Oct", value: 714000, benchmark: 723000 },
      { month: "Nov", value: 718000, benchmark: 732000 },
      { month: "Dec", value: 720000, benchmark: 726000 },
    ],
    trades: [
      { id: "t1", date: "Dec 18, 2025", type: "Buy",  ticker: "VYM",  name: "Vanguard High Div Yield",       shares: 200, price: 115.00, total: 23000, note: "Increasing dividend income focus." },
      { id: "t2", date: "Oct 10, 2025", type: "Buy",  ticker: "VCSH", name: "Vanguard Short-Term Corp Bond",  shares: 500, price: 77.80,  total: 38900 },
      { id: "t3", date: "Aug 05, 2025", type: "Sell", ticker: "AGG",  name: "iShares Core US Agg Bond",       shares: 400, price: 95.50,  total: 38200, note: "Reduced long-duration bond exposure." },
      { id: "t4", date: "Jun 12, 2025", type: "Buy",  ticker: "VTI",  name: "Vanguard Total Stock",           shares: 200, price: 238.00, total: 47600, note: "First equity allocation since onboarding — slight risk increase per revised IPS." },
      { id: "t5", date: "Apr 30, 2025", type: "Buy",  ticker: "VCSH", name: "Vanguard Short-Term Corp Bond",  shares: 1000, price:77.20,  total: 77200, note: "Initial portfolio construction post-onboarding." },
    ],
    notes: [
      { id: "n1", date: "8 ene 2026",  type: "Meeting",       author: "M. Gallardo", content: "Portafolio levemente por debajo del benchmark conservador. Analizamos si aumentar ligeramente la exposición a renta variable dado los 47 años de Carolina. Sigue cauta tras el divorcio pero mostró apertura a un incremento moderado. Sugerí pasar de 20% → 30% en renta variable a lo largo de 2026. Quiere pensarlo.", followUp: "Enviar propuesta de IPS revisado con escenario de 30% en RV antes del 1 de febrero." },
      { id: "n2", date: "25 oct 2025", type: "Call",          author: "M. Gallardo", content: "Carolina llamó para hacer un check-in. Está instalada en Buenos Aires luego de la mudanza. Los ingresos son estables (nueva posición en empresa de tecnología). Cómoda con la asignación actual, sin intención de hacer cambios.", followUp: "Revisar asignación en la próxima revisión anual." },
      { id: "n3", date: "20 jul 2025", type: "Meeting",       author: "M. Gallardo", content: "Revisión de onboarding a los seis meses. Carolina aún se está adaptando tras el proceso de divorcio. Hablamos de aumentar la exposición a renta variable ahora que trabaja full-time. Incorporamos primera posición en VTI — paso inicial hacia crecimiento moderado. Valoró ser consultada en cada decisión." },
      { id: "n4", date: "28 abr 2025", type: "Meeting",       author: "M. Gallardo", content: "Reunión de onboarding. Carolina recibió USD 720k como parte del acuerdo de divorcio. La prioridad es preservar el capital — tiene un vínculo emocional fuerte con este dinero. Comenzamos con asignación conservadora: 70% renta fija / 30% renta variable con dividendos. Revisaremos en 6 meses.", followUp: "Agendar seguimiento en 6 meses. Enviar bienvenida y documento IPS." },
    ],
    riskAnswers: [
      { question: "How would you react if your portfolio dropped 20% in a month?", answer: "Very upset — this money represents my financial security.", score: 1 },
      { question: "What is your primary investment goal?", answer: "Preserve capital. Modest growth is a secondary goal.", score: 2 },
      { question: "What is your investment horizon?", answer: "15–20 years, but I want stability now.", score: 3 },
      { question: "How much income do you need from this portfolio annually?", answer: "No income needed — I have a salary.", score: 4 },
      { question: "How familiar are you with investment products?", answer: "Limited — I prefer simple, understandable products.", score: 2 },
    ],
    volatility: 5.4,
    maxDrawdown: -3.2,
    sharpe: 1.12,
    beta: 0.34,
    loyalty: 78,
    satisfaction: 72,
    potential: 88,
  },
];

export function getClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}
