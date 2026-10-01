// Mensagens da página "Programa Esportivo" (os quatro projetos do IDEX).
import { definirMensagens } from "../mensagens";

export const programaEsportivo = definirMensagens(
  {
    seo: {
      titulo: "Programa Esportivo — Instituto IDEX",
      descricao:
        "Programas de futebol de campo do IDEX: Talento em Campo, Festival de Talentos, Draft Day e Talento Brasil — da iniciação à qualificação esportiva.",
    },
    hero: {
      selo: "Programa esportivo",
      titulo: "Programas de Futebol de Campo IDEX",
      descricao: "Uma jornada de formação esportiva, integração, avaliação e qualificação de talentos.",
    },
    introducao: {
      titulo: "Do primeiro contato com a bola às novas oportunidades",
      paragrafos: [
        "O IDEX desenvolve programas de futebol de campo que acompanham diferentes momentos da formação esportiva, desde o primeiro contato com a modalidade até a qualificação de jovens que demonstram condições de avançar no esporte.",
        "As iniciativas são estruturadas para viabilização por diferentes fontes de financiamento, como a Lei de Incentivo ao Esporte Federal, a Lei Paulista de Incentivo ao Esporte, emendas parlamentares, editais públicos e privados e parcerias institucionais.",
        "A metodologia do Instituto integra acesso ao esporte, formação, convivência, desenvolvimento técnico e oportunidades de continuidade, utilizando o futebol como instrumento de transformação social e desenvolvimento humano.",
      ],
    },
    jornada: {
      titulo: "Os projetos do IDEX",
      ampliarLogo: (nome: string) => `Ampliar logo do projeto ${nome}`,
    },
    detalhe: {
      projeto: (numero: string, etapa: string) => `Projeto ${numero} · ${etapa}`,
    },
    chamadaFinal: {
      texto: "IDEX. Formação que transforma. Oportunidades que ampliam caminhos.",
      cta: "Apoie os programas",
    },
    programas: [
      {
        nome: "Talento em Campo",
        lema: "O esporte começa aqui.",
        etapa: "Iniciação esportiva e formação de base",
        textos: [
          "Programa de iniciação esportiva que leva o futebol de campo estruturado a crianças e adolescentes, especialmente em territórios de maior vulnerabilidade social.",
          "Por meio de atividades regulares e orientadas, o programa amplia o acesso à modalidade e trabalha valores que fazem parte da essência do IDEX, como disciplina, respeito, cooperação, responsabilidade e convivência.",
        ],
      },
      {
        nome: "Festival de Talentos",
        lema: "Onde o aprendizado entra em campo.",
        etapa: "Integração, competição e desenvolvimento",
        textos: [
          "Programa de integração esportiva que reúne jovens e equipes em etapas organizadas de futebol de campo, transformando o jogo em uma experiência de formação, convivência e desenvolvimento.",
          "Com orientação técnica, regras, arbitragem e estrutura adequada, os festivais proporcionam aos participantes a oportunidade de colocar em prática o que aprenderam, vivenciar o ambiente esportivo e fortalecer sua relação com a modalidade.",
        ],
      },
      {
        nome: "Draft Day",
        lema: "Onde o talento encontra oportunidade.",
        etapa: "Avaliação, evolução e visibilidade esportiva",
        textos: [
          "O Draft Day é o programa do IDEX voltado à avaliação esportiva e à visibilidade de jovens jogadores em estágio avançado de desenvolvimento.",
          "Por meio de partidas organizadas e monitoradas por profissionais especializados, os atletas têm a oportunidade de demonstrar seu desempenho em situação real de jogo, sendo observados em aspectos técnicos, táticos, físicos, comportamentais e de inteligência de jogo.",
          "A proposta é transformar a vivência competitiva em uma verdadeira vitrine esportiva e instrumento de acompanhamento técnico, aproximando formação, avaliação e novas possibilidades de continuidade no futebol. A avaliação realizada pelos scouts gera um registro qualificado do desempenho do jogador, contribuindo para a construção de seu histórico de evolução ao longo do processo de formação esportiva.",
          "O Draft Day representa, dentro da metodologia do Instituto, o momento em que o jogador pode colocar em campo tudo o que desenvolveu ao longo de sua trajetória, permitindo que sua evolução técnica, tática, física e comportamental seja observada e registrada. Esse acompanhamento fortalece o processo formativo do atleta e amplia as referências para sua continuidade e futuras oportunidades no esporte.",
        ],
      },
      {
        nome: "Talento Brasil",
        lema: "Da formação para novas oportunidades.",
        etapa: "Qualificação e preparação para novas oportunidades",
        textos: [
          "O Talento Brasil representa o estágio mais avançado da trajetória esportiva desenvolvida pelo IDEX.",
          "Voltado à qualificação esportiva de jovens que passaram pelo processo de formação e apresentam potencial para avançar na modalidade, o programa amplia o desenvolvimento técnico e prepara esses jogadores para oportunidades reais de continuidade no futebol.",
          "É quando o trabalho iniciado na formação começa a transformar talento, dedicação e trajetória esportiva em possibilidade concreta de futuro.",
        ],
      },
    ],
  },
  {
    "en-US": {
      seo: {
        titulo: "Sports Program — Instituto IDEX",
        descricao:
          "Instituto IDEX's football programs: Talento em Campo, Festival de Talentos, Draft Day and Talento Brasil — from initiation to sports qualification.",
      },
      hero: {
        selo: "Sports program",
        titulo: "Instituto IDEX Football Programs",
        descricao: "A journey of sports formation, integration, evaluation and talent qualification.",
      },
      introducao: {
        titulo: "From the first touch of the ball to new opportunities",
        paragrafos: [
          "IDEX develops football programs that follow different moments of sports formation, from the first contact with the sport to the qualification of young people who show conditions to advance in it.",
          "The initiatives are structured to be enabled by different funding sources, such as the Federal Sports Incentive Law, the São Paulo State Sports Incentive Law, parliamentary amendments, public and private calls for proposals and institutional partnerships.",
          "The Institute's methodology integrates access to sport, formation, social connection, technical development and opportunities for continuity, using football as an instrument of social transformation and human development.",
        ],
      },
      jornada: {
        titulo: "IDEX's projects",
        ampliarLogo: (nome: string) => `Enlarge the ${nome} project logo`,
      },
      detalhe: {
        projeto: (numero: string, etapa: string) => `Project ${numero} · ${etapa}`,
      },
      chamadaFinal: {
        texto: "IDEX. Formation that transforms. Opportunities that broaden paths.",
        cta: "Support the programs",
      },
      programas: [
        {
          nome: "Talento em Campo",
          lema: "Sport starts here.",
          etapa: "Sports initiation and foundational formation",
          textos: [
            "A sports initiation program that brings structured field football to children and adolescents, especially in areas of greater social vulnerability.",
            "Through regular, guided activities, the program expands access to the sport and works on values that are part of IDEX's essence, such as discipline, respect, cooperation, responsibility and social connection.",
          ],
        },
        {
          nome: "Festival de Talentos",
          lema: "Where learning comes into play.",
          etapa: "Integration, competition and development",
          textos: [
            "A sports integration program that brings together young people and teams in organized stages of field football, turning the game into an experience of formation, social connection and development.",
            "With technical guidance, rules, refereeing and proper structure, the festivals give participants the chance to put what they've learned into practice, experience the sporting environment and strengthen their relationship with the sport.",
          ],
        },
        {
          nome: "Draft Day",
          lema: "Where talent meets opportunity.",
          etapa: "Evaluation, growth and sporting visibility",
          textos: [
            "Draft Day is IDEX's program focused on sports evaluation and visibility for young players at an advanced stage of development.",
            "Through matches organized and monitored by specialized professionals, athletes have the opportunity to show their performance in real game situations, being observed in technical, tactical, physical, behavioral and game-intelligence aspects.",
            "The idea is to turn the competitive experience into a genuine sporting showcase and a technical follow-up tool, bringing formation, evaluation and new possibilities of continuing in football closer together. The scouts' evaluation generates a qualified record of the player's performance, contributing to building their track record of growth throughout the sports formation process.",
            "Within the Institute's methodology, Draft Day represents the moment when the player can bring onto the field everything they have developed throughout their journey, allowing their technical, tactical, physical and behavioral growth to be observed and recorded. This follow-up strengthens the athlete's formative process and broadens the references for their continuity and future opportunities in the sport.",
          ],
        },
        {
          nome: "Talento Brasil",
          lema: "From formation to new opportunities.",
          etapa: "Qualification and preparation for new opportunities",
          textos: [
            "Talento Brasil represents the most advanced stage of the sporting journey developed by IDEX.",
            "Focused on the sports qualification of young people who went through the formation process and show potential to advance in the sport, the program expands technical development and prepares these players for real opportunities to continue in football.",
            "This is when the work begun in formation starts to turn talent, dedication and sporting journey into a concrete future possibility.",
          ],
        },
      ],
    },
    "es-ES": {
      seo: {
        titulo: "Programa Deportivo — Instituto IDEX",
        descricao:
          "Programas de fútbol del IDEX: Talento em Campo, Festival de Talentos, Draft Day y Talento Brasil — desde la iniciación hasta la cualificación deportiva.",
      },
      hero: {
        selo: "Programa deportivo",
        titulo: "Programas de Fútbol IDEX",
        descricao: "Una jornada de formación deportiva, integración, evaluación y cualificación de talentos.",
      },
      introducao: {
        titulo: "Del primer contacto con el balón a las nuevas oportunidades",
        paragrafos: [
          "El IDEX desarrolla programas de fútbol que acompañan diferentes momentos de la formación deportiva, desde el primer contacto con la modalidad hasta la cualificación de jóvenes que muestran condiciones para avanzar en el deporte.",
          "Las iniciativas están estructuradas para viabilizarse mediante diferentes fuentes de financiación, como la Ley de Incentivo al Deporte Federal, la Ley Paulista de Incentivo al Deporte, enmiendas parlamentarias, convocatorias públicas y privadas y alianzas institucionales.",
          "La metodología del Instituto integra acceso al deporte, formación, convivencia, desarrollo técnico y oportunidades de continuidad, utilizando el fútbol como instrumento de transformación social y desarrollo humano.",
        ],
      },
      jornada: {
        titulo: "Los proyectos del IDEX",
        ampliarLogo: (nome: string) => `Ampliar el logo del proyecto ${nome}`,
      },
      detalhe: {
        projeto: (numero: string, etapa: string) => `Proyecto ${numero} · ${etapa}`,
      },
      chamadaFinal: {
        texto: "IDEX. Formación que transforma. Oportunidades que amplían caminos.",
        cta: "Apoya los programas",
      },
      programas: [
        {
          nome: "Talento em Campo",
          lema: "El deporte empieza aquí.",
          etapa: "Iniciación deportiva y formación de base",
          textos: [
            "Programa de iniciación deportiva que lleva el fútbol estructurado a niños y adolescentes, especialmente en territorios de mayor vulnerabilidad social.",
            "Mediante actividades regulares y orientadas, el programa amplía el acceso a la modalidad y trabaja valores que forman parte de la esencia del IDEX, como disciplina, respeto, cooperación, responsabilidad y convivencia.",
          ],
        },
        {
          nome: "Festival de Talentos",
          lema: "Donde el aprendizaje entra en juego.",
          etapa: "Integración, competición y desarrollo",
          textos: [
            "Programa de integración deportiva que reúne a jóvenes y equipos en etapas organizadas de fútbol, convirtiendo el juego en una experiencia de formación, convivencia y desarrollo.",
            "Con orientación técnica, reglas, arbitraje y estructura adecuada, los festivales ofrecen a los participantes la oportunidad de poner en práctica lo aprendido, vivir el ambiente deportivo y fortalecer su relación con la modalidad.",
          ],
        },
        {
          nome: "Draft Day",
          lema: "Donde el talento encuentra oportunidad.",
          etapa: "Evaluación, evolución y visibilidad deportiva",
          textos: [
            "El Draft Day es el programa del IDEX dedicado a la evaluación deportiva y a la visibilidad de jóvenes jugadores en una etapa avanzada de desarrollo.",
            "Mediante partidos organizados y monitoreados por profesionales especializados, los atletas tienen la oportunidad de demostrar su rendimiento en una situación real de juego, siendo observados en aspectos técnicos, tácticos, físicos, conductuales y de inteligencia de juego.",
            "La propuesta es transformar la vivencia competitiva en una verdadera vitrina deportiva e instrumento de seguimiento técnico, acercando formación, evaluación y nuevas posibilidades de continuidad en el fútbol. La evaluación realizada por los ojeadores genera un registro cualificado del rendimiento del jugador, contribuyendo a construir su historial de evolución a lo largo del proceso de formación deportiva.",
            "El Draft Day representa, dentro de la metodología del Instituto, el momento en que el jugador puede poner en la cancha todo lo que desarrolló a lo largo de su trayectoria, permitiendo que su evolución técnica, táctica, física y conductual sea observada y registrada. Ese seguimiento fortalece el proceso formativo del atleta y amplía las referencias para su continuidad y futuras oportunidades en el deporte.",
          ],
        },
        {
          nome: "Talento Brasil",
          lema: "De la formación a nuevas oportunidades.",
          etapa: "Cualificación y preparación para nuevas oportunidades",
          textos: [
            "El Talento Brasil representa la etapa más avanzada de la trayectoria deportiva desarrollada por el IDEX.",
            "Dirigido a la cualificación deportiva de jóvenes que pasaron por el proceso de formación y presentan potencial para avanzar en la modalidad, el programa amplía el desarrollo técnico y prepara a esos jugadores para oportunidades reales de continuidad en el fútbol.",
            "Es cuando el trabajo iniciado en la formación empieza a transformar talento, dedicación y trayectoria deportiva en una posibilidad concreta de futuro.",
          ],
        },
      ],
    },
  },
);
