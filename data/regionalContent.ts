export const regionalIndustryContent: Record<string, { overview: string; problems: string[]; selection: string[]; productSlugs: string[] }> = {
  "mineria-de-cobre": {
    overview: "En las plantas de cobre de Chile, el hierro trampa puede ingresar durante la extraccion, el transporte y las transferencias. La separacion magnetica se utiliza para proteger chancadores y correas; no sustituye la evaluacion metalurgica de minerales de cobre.",
    problems: ["Piezas ferrosas que amenazan chancadores", "Polvo, altitud y amplitud termica", "Capas variables sobre correas de gran ancho"],
    selection: ["Ancho, velocidad y capa de la cinta", "Altura real de suspension", "Tamano y frecuencia del hierro trampa", "Altitud, temperatura y ciclo de trabajo"],
    productSlugs: ["rcyd-type-permanent-magnet-self-dumping-iron-remover", "rcdd-type-self-cooling-self-dumping-electromagnetic-iron-remover", "rcyb-type-permanent-magnet-manual-iron-remover"]
  },
  "mineria-de-litio-y-minerales-industriales": {
    overview: "Los proyectos de litio y minerales industriales requieren separar contaminacion ferrosa sin atribuir una recuperacion que no haya sido ensayada. La mineralogia, la granulometria, la humedad y la etapa de proceso determinan si corresponde un tambor, un equipo de alta intensidad o un filtro magnetico.",
    problems: ["Contaminacion ferrosa que afecta la pureza", "Material fino, humedad o pulpa", "Exigencia de limpieza y trazabilidad del proceso"],
    selection: ["Mineralogia y susceptibilidad magnetica", "Granulometria y liberacion", "Caudal y humedad o porcentaje de solidos", "Objetivo de pureza confirmado por pruebas"],
    productSlugs: ["belt-high-gradient-magnetic-separator", "wet-drum-magnetic-separator", "dry-drum-magnetic-separator"]
  },
  "aridos-canteras-y-cemento": {
    overview: "Canteras, plantas de aridos y cementeras usan separadores suspendidos y detectores para reducir el riesgo de hierro trampa antes de chancadores, molinos y puntos de transferencia.",
    problems: ["Golpes y atascos por piezas ferrosas", "Polvo abrasivo", "Variacion de granulometria y carga"],
    selection: ["Punto que debe protegerse", "Cinta, capa y capacidad", "Carga esperada de hierro", "Acceso para limpieza y mantenimiento"],
    productSlugs: ["rcyd-type-permanent-magnet-self-dumping-iron-remover", "rcdb-type-self-cooling-plate-electromagnetic-iron-remover", "rcyb-type-permanent-magnet-manual-iron-remover"]
  },
  "reciclaje-y-recuperacion-de-metales": {
    overview: "Una linea de reciclaje puede combinar separacion ferrosa, deteccion y recuperacion de metales no ferrosos. Cada etapa necesita alimentacion estable y una fraccion objetivo claramente definida.",
    problems: ["Mezcla de ferrosos y no ferrosos", "Piezas de tamano y forma variables", "Alimentacion irregular sobre la cinta"],
    selection: ["Composicion y rango granulometrico", "Ancho y velocidad de cinta", "Objetivo de recuperacion", "Secuencia de separacion y calidad requerida"],
    productSlugs: ["rcyd-type-permanent-magnet-self-dumping-iron-remover", "dry-drum-magnetic-separator"]
  },
  "manejo-de-materiales-a-granel-y-puertos": {
    overview: "En terminales y sistemas de graneles, la proteccion magnetica se integra en transferencias y correas sin obstruir el flujo. El ambiente salino, el viento y la continuidad operacional deben formar parte de la especificacion.",
    problems: ["Hierro trampa en corrientes de gran volumen", "Corrosion y exposicion exterior", "Ventanas de mantenimiento limitadas"],
    selection: ["Capacidad y perfil de carga", "Ubicacion de transferencia", "Ambiente marino y proteccion superficial", "Acceso y trayectoria de descarga"],
    productSlugs: ["rcyd-type-permanent-magnet-self-dumping-iron-remover", "rcdd-type-self-cooling-self-dumping-electromagnetic-iron-remover"]
  }
};

export const regionalSolutionContent: Record<string, { problem: string; method: string; selection: string[]; productSlugs: string[] }> = {
  "proteccion-de-chancadores": {
    problem: "Una pieza ferrosa no controlada puede provocar atascos, danos y detenciones antes o dentro del chancador.",
    method: "La solucion combina un separador suspendido correctamente ubicado con deteccion, acceso de descarga y procedimientos operacionales coherentes con el riesgo.",
    selection: ["Hierro objetivo", "Cinta y capa", "Altura disponible", "Frecuencia de contaminacion", "Ambiente y ciclo de trabajo"],
    productSlugs: ["rcyd-type-permanent-magnet-self-dumping-iron-remover", "rcdd-type-self-cooling-self-dumping-electromagnetic-iron-remover"]
  },
  "eliminacion-de-hierro-trampa": {
    problem: "El hierro trampa mezclado con mineral, aridos o graneles puede contaminar el producto y danar equipos aguas abajo.",
    method: "Se define la fuente magnetica, la limpieza y el punto de instalacion a partir del flujo real, no solo del ancho de cinta.",
    selection: ["Material y granulometria", "Capa y velocidad", "Altura", "Carga de hierro", "Limpieza manual o continua"],
    productSlugs: ["rcyb-type-permanent-magnet-manual-iron-remover", "rcyd-type-permanent-magnet-self-dumping-iron-remover", "rcdb-type-self-cooling-plate-electromagnetic-iron-remover"]
  },
  "proteccion-de-cintas-transportadoras": {
    problem: "Las piezas ferrosas y la acumulacion alrededor del equipo pueden danar la cinta o crear puntos inseguros de mantenimiento.",
    method: "La separacion debe coordinarse con la geometria de transferencia, el acceso, la descarga del hierro y la estructura portante.",
    selection: ["Ancho, velocidad y perfil de carga", "Espacio transversal o longitudinal", "Zona segura de descarga", "Acceso de inspeccion"],
    productSlugs: ["rcyd-type-permanent-magnet-self-dumping-iron-remover", "rcyb-type-permanent-magnet-manual-iron-remover"]
  },
  "recuperacion-de-metales-ferrosos-y-no-ferrosos": {
    problem: "Los flujos de reciclaje requieren separar primero las fracciones ferrosas y luego evaluar tecnologias especificas para metales no ferrosos.",
    method: "La linea se diseña por etapas, con alimentacion controlada y pruebas sobre una muestra representativa.",
    selection: ["Composicion", "Granulometria", "Caudal", "Distribucion sobre cinta", "Calidad de producto y rechazo"],
    productSlugs: ["dry-drum-magnetic-separator", "rcyd-type-permanent-magnet-self-dumping-iron-remover"]
  }
};
