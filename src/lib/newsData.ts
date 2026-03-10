export type NewsSentiment = "positive" | "negative" | "neutral";
export type NewsCategory  = "macro" | "earnings" | "sector" | "argentina" | "rates";

export interface NewsItem {
  id: string;
  source: string;
  time: string;
  headline: string;
  summary: string;
  tickers: string[];
  sentiment: NewsSentiment;
  category: NewsCategory;
  importance: "high" | "medium" | "low";
}

export const NEWS: NewsItem[] = [
  {
    id: "n1", source: "Reuters", time: "Hace 38 min",
    headline: "NVIDIA supera expectativas de ganancias; guía para Q1 FY2027 por encima del consenso",
    summary: "NVIDIA reportó ingresos de $39.3B (+78% YoY) para Q4 FY2026, superando las estimaciones de $37.4B. La guía de $43B para Q1 FY2027 también supera el consenso de $41.5B, impulsada por la demanda continua de chips Blackwell para centros de datos de IA.",
    tickers: ["NVDA"], sentiment: "positive", category: "earnings", importance: "high",
  },
  {
    id: "n2", source: "Bloomberg", time: "Hace 1h 12min",
    headline: "Apple lanza nuevas MacBook con chip M5; analistas ven impacto moderado en ventas",
    summary: "Apple presentó la nueva línea de MacBook Pro con chip M5, prometiendo hasta un 40% de mejora en rendimiento de CPU. Los analistas mantienen perspectiva neutral sobre el impacto en ingresos del trimestre, ya que la línea Pro representa solo el 12% de las ventas de Mac.",
    tickers: ["AAPL"], sentiment: "neutral", category: "sector", importance: "medium",
  },
  {
    id: "n3", source: "WSJ", time: "Hace 2h 05min",
    headline: "Fed mantiene tasas sin cambios; actas sugieren dos recortes para H2 2026",
    summary: "La Reserva Federal mantuvo la tasa de fondos federales en 4.25%-4.50% en su reunión de marzo. Las minutas publicadas hoy sugieren que la mayoría de los miembros del FOMC ven condiciones para dos recortes de 25bps en la segunda mitad de 2026, condicionados a que la inflación continúe moderándose.",
    tickers: ["AGG", "T4.25N27", "T4.50N29", "VCSH", "CAUC-7D"], sentiment: "positive", category: "rates", importance: "high",
  },
  {
    id: "n4", source: "Infobae", time: "Hace 2h 48min",
    headline: "Argentina: BCRA sube tasa de política monetaria a 40% TNA ante presión inflacionaria",
    summary: "El Banco Central de la República Argentina elevó la tasa de referencia de pases pasivos 300bps a 40% TNA, buscando contener la inflación que aceleró a 4.8% mensual en febrero. La medida presiona al alza los rendimientos de LECAPs y cauciones, y podría generar oportunidades de arbitraje para los portafolios con exposición en pesos.",
    tickers: ["LECAP-S16A5", "LECAP-S31O5", "LECAP-S16J5", "CAUC-7D", "AL30", "GD35"], sentiment: "negative", category: "argentina", importance: "high",
  },
  {
    id: "n5", source: "Financial Times", time: "Hace 3h 20min",
    headline: "Microsoft cierra acuerdo de $14B con el Pentágono para servicios de IA en la nube",
    summary: "Microsoft anunció un contrato de $14B con el Departamento de Defensa de EE.UU. para implementar capacidades de IA generativa en infraestructura de nube segura. El acuerdo refuerza la posición de Azure como líder en cloud gubernamental y eleva las estimaciones de ingresos de servicios de nube para FY2027.",
    tickers: ["MSFT"], sentiment: "positive", category: "sector", importance: "high",
  },
  {
    id: "n6", source: "El Cronista", time: "Hace 4h 01min",
    headline: "Bonos soberanos argentinos recuperan terreno tras señales de avance con el FMI",
    summary: "Los bonos globales argentinos GD35 y AL30 registraron subas de 1.8% y 2.1% respectivamente, impulsados por declaraciones del equipo económico sobre el avance de negociaciones con el FMI. El riesgo país cedió 85 puntos a 620bps.",
    tickers: ["AL30", "GD35"], sentiment: "positive", category: "argentina", importance: "medium",
  },
  {
    id: "n7", source: "CNBC", time: "Hace 4h 55min",
    headline: "JPMorgan eleva estimaciones de ganancias para 2026 ante mejor ambiente de tasas",
    summary: "JPMorgan Chase revisó al alza su guidance para 2026, proyectando ingresos por intereses netos de $95B (+7% vs. guía anterior). Los analistas de Wall Street elevan el precio objetivo promedio a $270.",
    tickers: ["JPM"], sentiment: "positive", category: "earnings", importance: "medium",
  },
  {
    id: "n8", source: "Bloomberg", time: "Hace 5h 30min",
    headline: "Berkshire Hathaway acumula posición record en efectivo: $334B al cierre de 2025",
    summary: "El reporte anual de Berkshire Hathaway reveló que la compañía acumuló $334B en efectivo y equivalentes al 31 de diciembre, un nuevo record. Buffett señaló en su carta anual que las valuaciones actuales del mercado ofrecen pocas oportunidades atractivas.",
    tickers: ["BRK.B"], sentiment: "neutral", category: "sector", importance: "medium",
  },
  {
    id: "n9", source: "Reuters", time: "Hace 6h 15min",
    headline: "Tesla suspende producción en Fremont por 3 semanas para reconfiguración de línea del Model Y",
    summary: "Tesla anunció una pausa en su planta de Fremont (California) para adaptar las líneas de producción al rediseñado Model Y 'Juniper'. La interrupción podría impactar la entrega de ~25.000 vehículos en Q1.",
    tickers: ["TSLA"], sentiment: "negative", category: "sector", importance: "medium",
  },
  {
    id: "n10", source: "Ámbito Financiero", time: "Hace 7h 42min",
    headline: "YPF coloca ON por USD 500M al 7.25%; demanda superó 3x la oferta",
    summary: "YPF realizó una exitosa colocación de Obligaciones Negociables por USD 500M a 5 años con una tasa de 7.25%, inferior al 8.5% de la emisión anterior. La sobredemanda de 3x la oferta refleja el renovado apetito inversor por activos corporativos argentinos.",
    tickers: ["ON-YPF"], sentiment: "positive", category: "argentina", importance: "medium",
  },
  {
    id: "n11", source: "Morningstar", time: "Hace 9h 00min",
    headline: "Palantir gana contrato de $480M con la OTAN para plataforma de inteligencia artificial de combate",
    summary: "Palantir Technologies firmó un contrato plurianual con la OTAN para desplegar su plataforma AIP. El contrato incrementa el backlog del segmento gubernamental en un 18% y eleva las proyecciones de ingresos recurrentes.",
    tickers: ["PLTR"], sentiment: "positive", category: "sector", importance: "low",
  },
  {
    id: "n12", source: "WSJ", time: "Hace 10h 20min",
    headline: "Amazon refuerza inversión en IA con $8B adicionales en Anthropic",
    summary: "Amazon Web Services anunció una inversión adicional de $8B en Anthropic, elevando su compromiso total a $12B. La alianza incluye acuerdos para que AWS sea el proveedor de nube preferido de Anthropic y para integrar los modelos Claude en servicios de Amazon.",
    tickers: ["AMZN"], sentiment: "positive", category: "sector", importance: "medium",
  },
];
