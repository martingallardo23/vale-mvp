export type ActionUrgency = "high" | "medium" | "low";
export type NewsSentiment = "positive" | "negative" | "neutral";

export interface AIAction {
  id: string;
  title: string;
  rationale: string;
  urgency: ActionUrgency;
  tradeDetails?: string;
}

export interface AINewsItem {
  id: string;
  headline: string;
  source: string;
  date: string;
  summary: string;
  tickers: string[];
  sentiment: NewsSentiment;
}

export interface AIClientInsights {
  summary: string;
  actions: AIAction[];
  news: AINewsItem[];
}

export const aiInsights: Record<string, AIClientInsights> = {
  TC001: {
    summary:
      "El portafolio de Santiago supera a su referencia en +3,5% YTD, impulsado por ganancias sólidas en MSFT y AAPL. La asignación sigue bien diversificada para un perfil de riesgo moderado, aunque BRK.B ha escalado al 23,4%, acercándose al límite de concentración del 25% establecido en el IPS. Con un horizonte de inversión de 10 años y dos hijos próximos a la edad universitaria, es oportuno comenzar una reducción gradual de posiciones concentradas y revisar el nivel de aportes a los FCIs educativos. La posición en letra del Tesoro (T4.25N27) recientemente incorporada aporta un buen equilibrio de duración. Los documentos de planificación patrimonial aún están pendientes y deberían priorizarse este trimestre.",
    actions: [
      {
        id: "a1",
        title: "Reducir BRK.B — cerca del límite de concentración",
        rationale:
          "BRK.B representa el 23,4% del portafolio, acercándose al tope del 25% del IPS. Una venta moderada de 100 acciones reduciría la concentración a aproximadamente el 21% mientras se aseguran ganancias.",
        urgency: "medium",
        tradeDetails: "Vender 100 BRK.B @ mercado",
      },
      {
        id: "a2",
        title: "Incrementar aportación al plan 529 para fondos universitarios",
        rationale:
          "Ambos dependientes están a 6–8 años de la universidad. Maximizar la aportación 2026 al 529 ($18.000/año/beneficiario) mientras el mercado es favorable es recomendable.",
        urgency: "low",
        tradeDetails: "Aportación $36.000 a planes 529",
      },
      {
        id: "a3",
        title: "Iniciar análisis de conversión Roth IRA",
        rationale:
          "Santiago se encuentra en un tramo impositivo moderado este año con ingresos menores a los habituales. Una conversión parcial de USD 50.000–80.000 a instrumentos más eficientes fiscalmente podría ser conveniente antes de fin de año.",
        urgency: "low",
        tradeDetails: "Conversión Roth $65.000",
      },
    ],
    news: [
      {
        id: "n1",
        headline: "JPMorgan eleva su guía anual de BPA tras un primer trimestre récord",
        source: "Bloomberg",
        date: "6 mar 2026",
        summary:
          "JPMorgan Chase superó las estimaciones de beneficios y elevó su guía 2026, citando crédito al consumo robusto y recuperación de la banca de inversión. La noticia es directamente relevante para BRK.B dado la exposición significativa de Berkshire a JPM.",
        tickers: ["BRK.B", "JPM"],
        sentiment: "positive",
      },
      {
        id: "n2",
        headline: "Microsoft gana contrato de infraestructura IA del ejército de EE.UU. por $8.500M",
        source: "Reuters",
        date: "5 mar 2026",
        summary:
          "Microsoft aseguró un contrato de ocho años para la nube e infraestructura de IA del Departamento de Defensa, reforzando su posición en el sector gubernamental de IA. Santiago mantiene MSFT con un peso del 11,8% en su portafolio.",
        tickers: ["MSFT"],
        sentiment: "positive",
      },
      {
        id: "n3",
        headline: "La Fed señala pausa prolongada en recortes de tasas hasta el T3",
        source: "WSJ",
        date: "4 mar 2026",
        summary:
          "Las actas de la Reserva Federal indican que no se esperan recortes antes del T4 2026, lo que podría presionar la posición en AGG (7,2% del portafolio de Santiago) en el corto plazo.",
        tickers: ["AGG"],
        sentiment: "negative",
      },
    ],
  },

  ER002: {
    summary:
      "El portafolio de crecimiento agresivo de Valentina sube +22,7% YTD — casi el doble de su referencia — impulsado casi en su totalidad por el extraordinario desempeño de NVIDIA. NVDA representa ahora el 49,2% de su portafolio total, peligrosamente cerca del máximo del 55% establecido en el IPS. Las opciones de venta de protección (NVDA-PUT, marzo 2026) están vigentes pero próximas a vencer. Con una compra inmobiliaria planificada para 2028, aproximadamente USD 400.000 deberían moverse gradualmente hacia instrumentos con capital protegido en los próximos 18 meses. Valentina ha demostrado tolerancia a la volatilidad, pero la concentración actual introduce riesgo idiosincrático que no es coherente con sus objetivos de liquidez a mediano plazo.",
    actions: [
      {
        id: "a1",
        title: "Renovar put de protección NVDA antes del vencimiento de marzo",
        rationale:
          "El NVDA-PUT actual vence en 3 semanas. Renovar a un put de junio 2026 al strike 580 mantiene la protección bajista sobre una posición que ahora vale ~$1,02M.",
        urgency: "high",
        tradeDetails: "Comprar NVDA Jun 2026 $580P (10 contratos)",
      },
      {
        id: "a2",
        title: "Iniciar reducción sistemática de NVDA — primer tramo $150.000",
        rationale:
          "NVDA al 49,2% requiere acción. Una venta de $150.000 ahora (primer tramo de tres planificados) reduce la concentración a ~44% y capitaliza la reserva para bienes raíces.",
        urgency: "high",
        tradeDetails: "Vender 120 NVDA @ mercado",
      },
      {
        id: "a3",
        title: "Abrir posición en PLTR — diversificación en infraestructura IA",
        rationale:
          "Valentina ha expresado interés en diversificación dentro del sector IA más allá de NVDA. La expansión gubernamental de Palantir representa una alineación temática con menor riesgo de un solo activo.",
        urgency: "low",
        tradeDetails: "Comprar 300 PLTR @ mercado",
      },
    ],
    news: [
      {
        id: "n1",
        headline: "NVIDIA eleva perspectiva de ingresos de centros de datos para AF2027 en un 35%",
        source: "CNBC",
        date: "7 mar 2026",
        summary:
          "El CEO de NVIDIA, Jensen Huang, confirmó que la demanda de GPUs Blackwell sigue con severas restricciones de suministro hasta 2026, elevando significativamente las perspectivas de ingresos. La posición del 49,2% en NVDA de Valentina hace que esta sea una noticia crítica.",
        tickers: ["NVDA"],
        sentiment: "positive",
      },
      {
        id: "n2",
        headline: "Meta AI Studio alcanza 500 millones de usuarios activos mensuales",
        source: "TechCrunch",
        date: "6 mar 2026",
        summary:
          "La suite de productos de IA de Meta ha superado los 500M de usuarios activos mensuales, superando proyecciones en un 30%. La integración del asistente en WhatsApp está impulsando la monetización antes de lo previsto. Valentina mantiene META con un peso del 12,1%.",
        tickers: ["META"],
        sentiment: "positive",
      },
      {
        id: "n3",
        headline: "Palantir gana contrato de análisis de datos del Departamento de Justicia por $620M",
        source: "Bloomberg",
        date: "5 mar 2026",
        summary:
          "Palantir Technologies aseguró un contrato de cinco años con el Departamento de Justicia para análisis de datos federados, su mayor adjudicación gubernamental hasta la fecha. PLTR sube un 11% en preapertura. Valentina mantiene una posición pequeña en PLTR.",
        tickers: ["PLTR"],
        sentiment: "positive",
      },
    ],
  },

  MA003: {
    summary:
      "Facundo gestiona un portafolio agresivo concentrado con AAPL como posición central (28,5%). El retorno YTD de +19,8% supera significativamente a su referencia. El aporte al SEP-IRA para el ejercicio 2025 aún no se ha realizado — se trata de una optimización fiscal sensible al tiempo. La opción de compra sobre AAPL (Jun 2026, strike USD 250) está actualmente fuera del dinero; si AAPL se acerca a ese nivel, se requerirá una revisión anticipada. La debilidad reciente de TSLA al 9,1% podría representar una oportunidad de compra dada su alta tolerancia al riesgo. La discusión sobre los fondos de la venta de su empresa del trimestre anterior sigue siendo accionable: se debe formalizar un plan de reinversión.",
    actions: [
      {
        id: "a1",
        title: "Maximizar aportación al SEP-IRA antes del plazo fiscal",
        rationale:
          "El plazo del SEP-IRA 2025 es el 15 de abril de 2026. Los ingresos por trabajo independiente de Facundo permiten hasta USD 69.000 en contribuciones, proporcionando un diferimiento fiscal significativo.",
        urgency: "high",
        tradeDetails: "Aportación SEP-IRA $69.000",
      },
      {
        id: "a2",
        title: "Incrementar posición en TSLA ante debilidad reciente",
        rationale:
          "TSLA ha retrocedido un 18% desde su máximo de enero. Dado el perfil agresivo de Facundo y su posición existente, agregar 30 acciones al nivel actual está alineado con su tesis de crecimiento.",
        urgency: "medium",
        tradeDetails: "Comprar 30 TSLA @ mercado",
      },
      {
        id: "a3",
        title: "Formalizar plan de reinversión de fondos de venta empresarial",
        rationale:
          "Los $800.000 anticipados de la venta de la empresa no tienen un plan de inversión formal todavía. Una estrategia de DCA escalonada en 12 meses reduciría el riesgo de timing y se alinearía con la planificación fiscal.",
        urgency: "medium",
        tradeDetails: "Plan DCA: $66.667/mes por 12 meses",
      },
    ],
    news: [
      {
        id: "n1",
        headline: "Tesla FSD recibe aprobación condicional de la NHTSA en 10 estados",
        source: "Reuters",
        date: "7 mar 2026",
        summary:
          "El sistema de conducción autónoma de Tesla recibió aprobación regulatoria condicional en California, Texas y 8 estados adicionales, un hito clave que podría acelerar los ingresos de robotaxi. Facundo mantiene TSLA con un peso del 9,1%.",
        tickers: ["TSLA"],
        sentiment: "positive",
      },
      {
        id: "n2",
        headline: "Ingresos por servicios de Apple alcanzan récord de $27.300M en T1 AF2026",
        source: "Bloomberg",
        date: "5 mar 2026",
        summary:
          "El segmento de servicios de Apple — App Store, iCloud, Apple Pay y suscripciones de Apple Intelligence — publicó un trimestre récord, reduciendo su dependencia del hardware. AAPL, la mayor posición de Facundo, representa el 28,5%.",
        tickers: ["AAPL"],
        sentiment: "positive",
      },
      {
        id: "n3",
        headline: "Amazon AWS supera tasa anual de $120.000M con márgenes en expansión",
        source: "WSJ",
        date: "4 mar 2026",
        summary:
          "Amazon Web Services reportó un crecimiento interanual del 28% y márgenes operativos en expansión a medida que las cargas de trabajo de IA migran a AWS. Facundo mantiene AMZN con un peso del 6,4%.",
        tickers: ["AMZN"],
        sentiment: "positive",
      },
    ],
  },

  SC004: {
    summary:
      "El portafolio orientado al crecimiento de Lucía sube +21,3% YTD, liderado por NVDA y superando a su referencia mixta de salud/tecnología. Sin embargo, UNH ha sido un lastre significativo, cayendo un 14% en medio de un escrutinio regulatorio. Su portafolio incluye un FCI de ahorro educativo, pero con el horizonte 2031 acercándose, se debe realizar una revisión anual de aportes. El perfil agresivo es adecuado ahora, pero debería iniciarse un plan de reducción gradual del riesgo dentro de 2 años. La posición en NVDA del 21,9% representa una concentración relevante en el sector de semiconductores.",
    actions: [
      {
        id: "a1",
        title: "Revisar la tesis de UNH — caída del 14% YTD por riesgo regulatorio",
        rationale:
          "UnitedHealth Group está bajo investigación antimonopolio del DOJ por su división Optum. Con el 15,3% del portafolio de Lucía, la debilidad continuada podría impactar materialmente el rendimiento. Se recomienda considerar una reducción.",
        urgency: "high",
        tradeDetails: "Vender 30 UNH @ mercado",
      },
      {
        id: "a2",
        title: "Realizar aportación 2026 al plan 529",
        rationale:
          "El plan 529 está actualmente por debajo del objetivo para la meta universitaria 2031. Una aportación de $10.000 este trimestre, combinada con el crecimiento esperado, mantiene el plan encaminado hacia $120.000 en la matrícula.",
        urgency: "medium",
        tradeDetails: "Aportación $10.000 al plan 529",
      },
      {
        id: "a3",
        title: "Agregar VHT — ETF sectorial de salud para reducir riesgo individual",
        rationale:
          "Reemplazar la mitad de la posición en UNH con VHT (ETF Vanguard Healthcare) mantiene la exposición sectorial mientras diversifica el riesgo regulatorio de un solo activo.",
        urgency: "medium",
        tradeDetails: "Comprar 20 VHT @ mercado",
      },
    ],
    news: [
      {
        id: "n1",
        headline: "El DOJ amplía la investigación antimonopolio sobre UnitedHealth Group",
        source: "WSJ",
        date: "7 mar 2026",
        summary:
          "El Departamento de Justicia ha ampliado su investigación antimonopolio sobre la división Optum de UnitedHealth para incluir posibles prácticas monopolísticas en atención especializada. Las acciones cayeron un 8% con la noticia.",
        tickers: ["UNH"],
        sentiment: "negative",
      },
      {
        id: "n2",
        headline: "La arquitectura Blackwell de NVIDIA acelera su adopción en IA médica",
        source: "Bloomberg",
        date: "6 mar 2026",
        summary:
          "Grandes sistemas hospitalarios y biotecnológicas están desplegando chips Blackwell de NVIDIA para IA en imágenes médicas y descubrimiento de fármacos, abriendo un nuevo segmento vertical. Lucía mantiene NVDA con un peso del 21,9%.",
        tickers: ["NVDA"],
        sentiment: "positive",
      },
      {
        id: "n3",
        headline: "Decisión de la FDA sobre CRISPR Therapeutics esperada para T2 2026",
        source: "BioPharma Dive",
        date: "3 mar 2026",
        summary:
          "La terapia génica para anemia de células falciformes de CRSP está en revisión final de la FDA, con una decisión esperada para junio de 2026. La aprobación podría revalorar significativamente la acción. Lucía mantiene CRSP con un peso del 4,8%.",
        tickers: ["CRSP"],
        sentiment: "neutral",
      },
    ],
  },

  JW005: {
    summary:
      "Pablo se encuentra en una sólida posición de pre-retiro con un portafolio moderado y equilibrado que genera +11,2% YTD. La asignación está apropiadamente orientada hacia activos generadores de renta (VYM, BRK.B, AGG) con algo de exposición al crecimiento. Con el retiro planificado para 2028, el horizonte de 3 años requiere comenzar un ajuste gradual: reducir la asignación en renta variable VTI y agregar instrumentos de renta fija de corta duración. La posición en letra del Tesoro está bien cronometrada dada la coyuntura actual de tasas. La discusión sobre una reserva de ARS 3M para viajes de la última reunión debe formalizarse. Las oportunidades de optimización fiscal podrían cambiar con la reforma impositiva de 2027.",
    actions: [
      {
        id: "a1",
        title: "Ejecutar conversión Roth IRA — tramo de $70.000",
        rationale:
          "Pablo está en un tramo impositivo moderado este año con ingresos reducidos por la transición a retiro parcial. Una conversión de USD 70.000 a instrumentos más eficientes fiscalmente ahora asegura las condiciones actuales antes de posibles cambios en 2027.",
        urgency: "medium",
        tradeDetails: "Conversión Roth IRA $70.000",
      },
      {
        id: "a2",
        title: "Iniciar trayectoria de reducción de riesgo — reducir VTI un 2%",
        rationale:
          "Con 2 años para la jubilación, los modelos estándar de trayectoria sugieren reducir la exposición en renta variable ~5% anualmente. Reducir VTI en $42.000 y reinvertir en AGG inicia esta transición.",
        urgency: "medium",
        tradeDetails: "Vender 250 VTI, Comprar 40 AGG",
      },
      {
        id: "a3",
        title: "Establecer reserva de viajes de $30.000 en cuenta de alta rentabilidad",
        rationale:
          "Pablo mencionó un viaje a Europa planificado para el T4 2026 y viajes continuos en el retiro. Transferir ARS 3M a un FCI MM ahora mantiene los fondos líquidos generando una TNA del 95%.",
        urgency: "low",
        tradeDetails: "Transferir $30.000 a cuenta de alta rentabilidad",
      },
    ],
    news: [
      {
        id: "n1",
        headline: "ETF de dividendos de Vanguard aumenta su distribución trimestral un 4,2%",
        source: "Vanguard",
        date: "6 mar 2026",
        summary:
          "VYM anunció un aumento del 4,2% en su distribución trimestral de dividendos, reflejando el sólido crecimiento de dividendos en su cartera subyacente. Pablo mantiene VYM con un peso del 16,3%.",
        tickers: ["VYM"],
        sentiment: "positive",
      },
      {
        id: "n2",
        headline: "La carta anual de Berkshire Hathaway destaca estrategia de despliegue de efectivo",
        source: "Berkshire Hathaway",
        date: "1 mar 2026",
        summary:
          "La carta anual de Warren Buffett esboza el plan de Berkshire para desplegar su reserva de efectivo de $165.000M en adquisiciones en el segundo semestre de 2026, una señal históricamente positiva para los accionistas de BRK.B.",
        tickers: ["BRK.B"],
        sentiment: "positive",
      },
      {
        id: "n3",
        headline: "Actas de la Fed: sin recortes antes del T4 2026 — el mercado de bonos se ajusta",
        source: "Bloomberg",
        date: "4 mar 2026",
        summary:
          "La Reserva Federal señaló una pausa extendida en los recortes de tasas, lo que llevó al ETF AGG a repreciarse con un ligero aumento de rentabilidad. Pablo mantiene AGG con un peso del 11,8% y la letra T4.50N29.",
        tickers: ["AGG", "T4.50N29"],
        sentiment: "neutral",
      },
    ],
  },

  PW006: {
    summary:
      "El portafolio conservador orientado a la renta de María genera retornos estables del +5,8% YTD, en línea con su referencia. La asignación es predominantemente de renta fija y FCIs de dividendo, coherente con su perfil conservador y sus necesidades de ingresos en el retiro. La ON YPF es una posición eficiente dada su cobertura en dólares. Una acción prioritaria este trimestre es procesar la distribución requerida de ARS 5,2M — aún no completada y el plazo genera urgencia. La exposición de duración en AGG (promedio de 7–8 años) puede ser un viento en contra moderado si las tasas se mantienen elevadas.",
    actions: [
      {
        id: "a1",
        title: "Procesar RMD 2026 pendiente — se acerca el plazo del IRS",
        rationale:
          "La distribución requerida de María de ARS 5,2M no ha sido tomada para 2026. No retirar antes del 31 de diciembre puede implicar penalidades sobre el importe no distribuido.",
        urgency: "high",
        tradeDetails: "Distribución $52.400 desde IRA",
      },
      {
        id: "a2",
        title: "Reducir riesgo de duración en AGG — rotar a VCSH",
        rationale:
          "Dado el período prolongado de altas tasas de la Fed, los bonos de larga duración enfrentan presión. Rotar el 30% de la posición en AGG hacia VCSH (Bono Corporativo Corto Plazo de Vanguard) reduce la duración de 7,1 a 2,8 años.",
        urgency: "medium",
        tradeDetails: "Vender 120 AGG, Comprar 200 VCSH",
      },
      {
        id: "a3",
        title: "Revisar MUNI38 — considerar VWIUX para diversificación municipal",
        rationale:
          "El bono MUNI38 es una posición de un solo emisor. Agregar el fondo de exención impositiva de plazo intermedio de Vanguard (VWIUX) proporcionaría diversificación en bonos municipales sin cambiar la eficiencia fiscal.",
        urgency: "low",
        tradeDetails: "Comprar $20.000 VWIUX",
      },
    ],
    news: [
      {
        id: "n1",
        headline: "El mercado de bonos municipales se mantiene estable pese a la incertidumbre de tasas",
        source: "Bloomberg",
        date: "7 mar 2026",
        summary:
          "Los bonos de renta fija local han mostrado resiliencia ante la volatilidad de tasas, con calidad crediticia que se mantiene alta. La posición de María en renta fija (6,7% del portafolio) continúa funcionando en línea con las expectativas.",
        tickers: ["MUNI38"],
        sentiment: "neutral",
      },
      {
        id: "n2",
        headline: "ETF de dividendos de Vanguard se acerca a NAV récord — fecha ex-dividendo 15 de marzo",
        source: "Vanguard",
        date: "5 mar 2026",
        summary:
          "La fecha de registro del dividendo de VYM es el 15 de marzo de 2026. Los accionistas registrados recibirán USD 0,82/acción. María mantiene VYM con un peso del 18,4%, su segunda mayor posición.",
        tickers: ["VYM"],
        sentiment: "positive",
      },
      {
        id: "n3",
        headline: "Bonos corporativos de corto plazo superan a los de larga duración en 2026",
        source: "Morningstar",
        date: "3 mar 2026",
        summary:
          "VCSH (Bono Corporativo Corto Plazo de Vanguard) sube un 3,1% YTD frente al 0,9% de AGG, reflejando la preferencia de los inversores por corta duración en un entorno de tasas elevadas prolongadas.",
        tickers: ["VCSH", "AGG"],
        sentiment: "positive",
      },
    ],
  },

  RK007: {
    summary:
      "El portafolio de Gustavo requiere atención inmediata. Es el único cliente de la firma con estado 'Requiere atención', y con razón: TLT (ETF de bonos del Tesoro de larga duración) representa el 29,7% de su portafolio y ha caído un 12,3% YTD mientras las tasas se mantienen elevadas — un lastre significativo para el portafolio de un jubilado conservador. La revisión de la política de inversión de diciembre 2025 recomendó rotar TLT hacia instrumentos de menor duración, pero no se ha ejecutado. La distribución requerida 2026 de USD 44.500 también está pendiente. La reserva de gastos médicos de Gustavo está agotada y debería reconstituirse dado su edad (72 años) y la trayectoria de costos sanitarios.",
    actions: [
      {
        id: "a1",
        title: "Reducir TLT un 50% — riesgo de duración significativo al 29,7%",
        rationale:
          "TLT cae un 12,3% YTD y representa un riesgo desproporcionado para un jubilado conservador. La revisión de diciembre recomendó esta acción. Rotar hacia VCSH y SGOV reduce la duración de 17 años a menos de 3.",
        urgency: "high",
        tradeDetails: "Vender 350 TLT, Comprar 200 VCSH + 150 SGOV",
      },
      {
        id: "a2",
        title: "Procesar RMD 2026 antes del plazo de fin de año",
        rationale:
          "La distribución requerida de Gustavo de USD 44.500 no ha sido procesada. Se aplican penalidades sobre los importes no distribuidos. Debe completarse de inmediato.",
        urgency: "high",
        tradeDetails: "Distribución $44.500 desde IRA",
      },
      {
        id: "a3",
        title: "Establecer reserva médica de $25.000 en SGOV",
        rationale:
          "Los costos sanitarios de Gustavo han aumentado un 18% interanual. Mantener una reserva líquida dedicada en un FCI MM (que genera ~95% TNA) garantiza cobertura de emergencias médicas sin ventas forzadas de activos.",
        urgency: "medium",
        tradeDetails: "Comprar $25.000 SGOV",
      },
    ],
    news: [
      {
        id: "n1",
        headline: "Los bonos de larga duración siguen bajo presión: la tasa a 10 años sube al 4,87%",
        source: "Bloomberg",
        date: "7 mar 2026",
        summary:
          "La rentabilidad del bono del Tesoro a 10 años alcanzó el 4,87%, su nivel más alto desde noviembre de 2025, ejerciendo presión adicional sobre TLT y otros fondos de larga duración. La posición de Gustavo en TLT al 29,7% está en riesgo significativo.",
        tickers: ["TLT"],
        sentiment: "negative",
      },
      {
        id: "n2",
        headline: "Johnson & Johnson alcanza acuerdo por litigios de talco por $6.700M",
        source: "Reuters",
        date: "6 mar 2026",
        summary:
          "J&J alcanzó un acuerdo definitivo en sus demandas relacionadas con el talco, eliminando una incertidumbre legal significativa. Las acciones subieron un 4,2% con la noticia. Gustavo mantiene JNJ con un peso del 8,4%.",
        tickers: ["JNJ"],
        sentiment: "positive",
      },
      {
        id: "n3",
        headline: "Postura 'tasas altas por más tiempo' de la Fed reforzada por sólido informe de empleo",
        source: "WSJ",
        date: "5 mar 2026",
        summary:
          "El informe de nóminas no agrícolas de febrero (+287.000) superó ampliamente las expectativas, reforzando la postura restrictiva de la Fed. Esto es especialmente relevante para las posiciones de Gustavo en TLT y AGG.",
        tickers: ["TLT", "AGG"],
        sentiment: "negative",
      },
    ],
  },

  DP008: {
    summary:
      "Carolina es una cliente nueva (desde 2024) con un perfil conservador que está en transición de tener mucho efectivo a un portafolio de rentas diversificado. Su retorno YTD de +4,1% está ligeramente por debajo de su referencia, pero es apropiado para el ritmo gradual de despliegue acordado en el IPS. El efectivo representa el 24,7% de su portafolio — por encima del objetivo acordado del 15%. La propuesta revisada del IPS con el escenario del 30% en renta variable aún no se ha enviado. El seguimiento semestral vence este mes. Carolina ha expresado una creciente comodidad con la volatilidad del mercado, lo que podría respaldar una revisión de su perfil de riesgo en la próxima revisión.",
    actions: [
      {
        id: "a1",
        title: "Enviar IPS revisado con escenario del 30% en renta variable",
        rationale:
          "Carolina solicitó una declaración de política de inversión revisada explorando una asignación del 30% en renta variable en la reunión de febrero. Enviarla permitirá una discusión productiva y un posible reequilibrio.",
        urgency: "medium",
        tradeDetails: "Documento IPS: enviar para revisión",
      },
      {
        id: "a2",
        title: "Desplegar exceso de efectivo — incrementar asignación en VTI",
        rationale:
          "El efectivo al 24,7% supera el objetivo del IPS del 15%. Desplegar $30.000 en VTI en 3 meses mediante DCA acercaría el efectivo al objetivo y mejoraría el potencial de retorno a largo plazo.",
        urgency: "medium",
        tradeDetails: "Comprar $10.000 VTI por mes durante 3 meses",
      },
      {
        id: "a3",
        title: "Programar revisión semestral del IPS (vencida)",
        rationale:
          "La revisión semestral de Carolina venció en febrero. Programarla a la brevedad permite una reevaluación formal de la tolerancia al riesgo y la revisión de la propuesta con 30% en renta variable.",
        urgency: "low",
        tradeDetails: "Programar reunión: marzo/abril 2026",
      },
    ],
    news: [
      {
        id: "n1",
        headline: "El ETF Vanguard Total Stock Market supera en el volátil mes de febrero",
        source: "Morningstar",
        date: "6 mar 2026",
        summary:
          "VTI mostró un rendimiento relativo sólido en el volátil mercado de febrero, cayendo menos que el S&P 500 gracias a su diversificación más amplia en pequeña capitalización. La posición de Carolina en VTI representa el 20,3% de su portafolio.",
        tickers: ["VTI"],
        sentiment: "positive",
      },
      {
        id: "n2",
        headline: "ETF de dividendos Vanguard con fecha ex-dividendo próxima — distribución de $0,82",
        source: "Vanguard",
        date: "5 mar 2026",
        summary:
          "Se acerca la fecha de registro del dividendo de VYM el 15 de marzo. Carolina mantiene VYM con un peso del 16,9% y recibirá la distribución, apoyando su estrategia orientada a la renta.",
        tickers: ["VYM"],
        sentiment: "positive",
      },
      {
        id: "n3",
        headline: "Los bonos corporativos de corto plazo atraen a inversores conservadores",
        source: "Bloomberg",
        date: "3 mar 2026",
        summary:
          "VCSH registra entradas récord de inversores conservadores que buscan rendimiento sin riesgo de duración significativo. La posición de Carolina en VCSH (13,2%) se beneficia de este entorno.",
        tickers: ["VCSH"],
        sentiment: "positive",
      },
    ],
  },
};
