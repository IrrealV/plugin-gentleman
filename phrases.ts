// Motivational phrases for busy/loading state
// Add new phrases here to expand the library

import type { DetectedStack } from "./detection"

export const busyPhrases = [
  // Original classics
  "Ponete las pilas, hermano...",
  "Dale que va, dale que va...",
  "Ya casi, ya casi...",
  "Ahí vamos, loco...",
  "Un toque más y listo...",
  "Aguantá que estoy pensando...",
  "Momento, momento...",
  "Ya te lo traigo, tranqui...",
  
  // New additions for variety
  "Dame un segundo, campeón...",
  "Trabajando en eso, maestro...",
  "Ya salimos, paciencia...",
  "Dejame terminar esto...",
  "Casi listo, bancame...",
  "Estoy en eso, tranquilo...",
  "Un cachito más, hermano...",
  "Procesando, no desesperes...",
  "Ya falta poco, dale...",
  "Lo estoy cocinando...",
  "Mirá que estoy pensando...",
  "Tranqui, ya lo tengo...",
  "Un ratito más, loco...",
  "Dejame concentrar...",
  "Vamos vamos, sin apuro...",
  "Que no se note el esfuerzo...",
  "Ahí va, ahí va...",
  "Procesando con elegancia...",
  "Un toque más de paciencia...",
  "Ya te resuelvo esto...",
  "Estoy en la zona, esperá...",
  "Dale tiempo al tiempo...",
  "Tranquilo, todo bajo control...",
  "Un segundo de concentración...",
  "Mirá cómo se hace esto...",

  // Meme mode (clásicos + modernos, tono friendly)
  "Aw shit, here we go again...",
  "Shimi shimi ay, shimi ay, shimi ya...",
  "Never gonna darte por vencido...",
  "Esto es cine, papá...",
  "God-level timing, esperá un toque...",
  "Se viene el desarrollo de personaje...",
  "POV: el deploy todavía no terminó...",
  "Plot twist: ahora sí está quedando bien...",
  "No era un bug, era lore...",
  "Meme chequeado por profesionales...",
  "Sigue cargando, pero con estilo...",
  "Me lo contó un pajarito azul...",
  "Tranqui, no cunda el pánico...",
  "Respirá hondo, esto está under control...",
  "Modo paciencia premium activado...",
  "El plan va impecable (por ahora)...",
  "Esta línea temporal sí funciona...",
  "Viene cocinadito en baja...",
  "Un mate y sale...",
  "Banco fuerte esta espera...",
  "Data incoming, no te me vayas...",
  "Estamos en speedrun, pero legal...",
  "Esto está más calculado que pick de fantasy...",
  "Todo parte del guion...",
  "Se está cargando la cinemática...",
  "No skips, full experiencia...",
  "Aguantá el arco narrativo...",
  "Falta poquito para el boss final...",
  "NPCs alineados, seguimos...",
  "Misión secundaria: optimizar esto...",
  "Lo manda la patronal del código...",
  "Estamos en la cocina del dato...",
  "No es delay, es build-up emocional...",
  "Este proceso tiene after credits...",
  "Pará un cachito, ya entra el drop...",
  "Se viene la parte satisfactoria...",
  "Keep calm y tomá agüita...",
  "Modo detective del bug: ON...",
  "El algoritmo está estirando antes de correr...",
  "Estamos girando la ruedita con dignidad...",
  "Mirá, va tomando color...",
  "Esto quedó en visto, pero ya responde...",
  "Cargando contexto interdimensional...",
  "Espera táctica, no improvisada...",
  "La nave está entrando en órbita...",
  "Sin drama, con glamour...",
  "Sutil, elegante y efectivo...",
  "No toques nada, está saliendo perfecto...",
  "Se alinearon los planetas del backend...",
  "Modo sigilo: trabajando sin hacer ruido...",
  "Más fino que CSS en viernes...",
  "Estamos maridando datos con endpoints...",
  "De una nube a otra, ya vuelve...",
  "Ping va, pong viene...",
  "Con fe y semicolons...",
  "Powered by memes y buenas prácticas...",
  "Esto lo resuelve hasta el perro de la oficina...",
  "Pausa técnica con onda...",
  "Se está horneando sin quemarse...",
  "Nada puede malir sal...",
  "Concentración de monje y Wi-Fi estable...",
  "Un refresh mental y seguimos...",
  "Estamos en el universo donde sí compila...",
  "La data viene en camino, con balizas...",
  "Lo importante es que avanza...",
  "La magia tarda, pero cumple...",
  "Nivel de facha del output: en ascenso...",
  "Si pestañeás, te lo perdés...",
  "Todo chill por acá...",
  "Full foco, cero humo...",
  "Metiéndole cariño al resultado...",
  "Se viene clean output del bueno...",
  "Sin pánico escénico, ya sale...",
  "Que fluya, que ya está...",
  
  // Dev jokes (Argentina + Spain friendly)
  "¿Qué le dice un bit a otro? Nos vemos en el bus",
  "Hay 10 tipos de personas: las que entienden binario y las que no",
  "¿Por qué los programadores confunden Halloween con Navidad? Porque Oct 31 = Dec 25",
  "Mi código no tiene bugs, desarrolla características inesperadas",
  "Un SQL entra a un bar, ve dos tablas y pregunta: ¿Puedo unirme?",
  "¿Cuál es el animal favorito de un programador? El bug",
  "No es un bug, es una funcionalidad no documentada",
  "Hay dos cosas difíciles en programación: naming y cache invalidation",
  "¿Qué hace un programador en la playa? Hace surf... por la web",
  "Código que funciona en mi máquina™",
  "99 little bugs in the code, 99 bugs to fix... take one down, patch it around, 127 little bugs in the code",
  "¿Por qué los programadores prefieren el modo oscuro? Porque la luz atrae bugs",
  "Debugging: ser el detective en una novela de crimen donde también sos el asesino",
  "¡Todo compila! (pero no hace lo que debería)",
  "Si depurar es quitar bugs, programar debe ser ponerlos",
  "Esto va más lento que tortuga con asma, pero va",
  "¿Qué hace una abeja en el gimnasio? Zum-ba",
  "Estoy más ocupado que mozo en Día de la Madre",
  "¿Qué le dice una pared a otra? Nos vemos en la esquina",
  "Más despacio que caracol con resaca... pero seguro",
  "¿Cómo se despiden los químicos? Ácido un placer",
  "Va tomando forma, como puré instantáneo",
  "¿Qué hace un pez? Nada",
  "No es lentitud, es suspenso de alta calidad",
  "¿Cuál es el colmo de un jardinero? Que siempre lo dejen plantado",
  "Estoy acomodando los patitos en fila",
  "¿Qué le dice el 0 al 8? Lindo cinturón",
  "Esto sale calentito, como medialuna de panadería",
  "¿Cómo maldice un pollito a otro? Caldito seas",
  "Un cachito más y queda pipí cucú",
  "¿Cuál es el café más peligroso? El ex-preso",
  "Más firme que televisor de bar en la final",
  "¿Qué le dijo una impresora a otra? ¿Esa hoja es tuya o es impresión mía?",
  "Estoy cerrando con moñito, bancame un toque",
  "¿Cuál es el colmo de un electricista? No encontrar su corriente de trabajo",
]

export const frameworkBusyPhrases: Partial<Record<DetectedStack, string[]>> = {
  react: [
    "Ajustando hooks y estado...",
    "Renderizando componentes con onda...",
    "Sincronizando props y efectos...",
    "React dice: keep calm and re-render...",
  ],
  angular: [
    "Ordenando módulos y providers...",
    "Inyectando dependencias como relojito...",
    "Acomodando el template de Angular...",
    "Angular está en modo this is fine...",
  ],
  vue: [
    "Ajustando refs y reactividad...",
    "Cocinando un composable fino...",
    "Vue está pensando en voz baja...",
    "Vue lo vio y dijo: c'est magnifique...",
  ],
  node: [
    "Encolando eventos del loop...",
    "Levantando handlers de Node...",
    "Conectando rutas del backend...",
    "Node en modo no duermo, pero respondo...",
  ],
  go: [
    "Compilando goroutines con paciencia...",
    "Ajustando canales y concurrencia...",
    "Go está afilando la respuesta...",
    "Go: simple, rápido y sin chamuyo...",
  ],
  python: [
    "Ordenando imports y scripts...",
    "Entrenando al snake para correr más...",
    "Ajustando funciones con estilo Python...",
    "Python susurra: explícito es mejor que raro...",
  ],
  dotnet: [
    "Alineando servicios de .NET...",
    "Puliendo capas con C#...",
    "Ensamblando pipeline de ASP.NET...",
    ".NET en modo enterprise, pero piola...",
  ],
  svelte: [
    "Svelte está reaccionando en silencio...",
    "Ajustando stores y transiciones...",
    "Compilando magia liviana...",
    "Svelte: menos ruido, más magia...",
  ],
  nextjs: [
    "Pre-renderizando rutas de Next...",
    "Ajustando server components...",
    "Hidratando la app con elegancia...",
    "Next.js activó el multiverso SSR...",
  ],
  rust: [
    "Prestando atención al borrow checker...",
    "Afinando ownership sin piedad...",
    "Oxidando bugs, una línea a la vez...",
    "Rust te cuida, aunque te rete...",
  ],
}

const hashSeed = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export const pickBusyPhrase = (input: {
  framework?: DetectedStack
  cycle: number
  previous?: string
}): string => {
  const frameworkPool = input.framework ? frameworkBusyPhrases[input.framework] : undefined
  const pool = frameworkPool && frameworkPool.length > 0 ? [...frameworkPool, ...busyPhrases] : busyPhrases

  if (!pool.length) return ""

  const seed = hashSeed(input.framework || "generic")
  let index = Math.abs(seed + input.cycle * 7) % pool.length

  if (pool.length > 1 && input.previous && pool[index] === input.previous) {
    index = (index + 1) % pool.length
  }

  return pool[index]
}
