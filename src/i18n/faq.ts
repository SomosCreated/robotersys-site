/**
 * faq.ts — FAQ content per page, per locale.
 *
 * Kept as a type-safe table (Record<Locale, Record<FaqKey, QA[]>>) so TypeScript
 * forces every locale to provide every page's FAQ — missing translations fail the
 * build, not silently ship. Rendered + emitted as FAQPage JSON-LD by FAQ.astro.
 *
 * NOTE: content drafted from facts already on the site, PENDING CLIENT VALIDATION
 * (see docs/reference/faq-validacao-cliente.md). The two soft items — controller
 * retrofit and parts delivery time — use conservative wording until confirmed.
 */
import type { Locale } from './types';

export interface QA {
  q: string;
  a: string;
}
export type FaqKey = 'servicos' | 'pecas' | 'sistemas' | 'pushcorp';

/** Localized section label + heading for the FAQ block. */
export const FAQ_LABELS: Record<Locale, { label: string; heading: string }> = {
  pt: { label: 'Dúvidas frequentes', heading: 'Perguntas frequentes' },
  en: { label: 'FAQ', heading: 'Frequently asked questions' },
  es: { label: 'Preguntas frecuentes', heading: 'Preguntas frecuentes' },
  de: { label: 'FAQ', heading: 'Häufige Fragen' }, // REVISÃO
};

export const FAQ: Record<Locale, Record<FaqKey, QA[]>> = {
  // ── Português ──────────────────────────────────────────────────────────────
  pt: {
    servicos: [
      { q: 'Quais serviços a RoboterSys oferece para robôs KUKA?', a: 'Instalação, programação, manutenção preventiva e corretiva, reparo de componentes mecânicos e eletrônicos, peças de reposição originais, suporte remoto e atualização/retrofit de controladoras (KRC1, KRC2, KRC4 e KRC5).' },
      { q: 'A RoboterSys atende em todo o Brasil?', a: 'Sim — atende indústrias em todo o território nacional a partir da sede em Joinville (SC), com suporte remoto 24 horas para reduzir paradas de produção.' },
      { q: 'Vocês trabalham com outras marcas de robôs além da KUKA?', a: 'Não. A RoboterSys é especializada exclusivamente em robôs KUKA — o que a torna a maior especializada nessa marca no Brasil.' },
      { q: 'A RoboterSys oferece suporte de emergência?', a: 'Sim. Há suporte remoto 24 horas e atendimento de emergência, além de entrega express de peças.' },
      { q: 'Vocês fazem retrofit/atualização de controladoras antigas?', a: 'Sim — a RoboterSys realiza retrofit e atualização de gerações de controladoras KUKA (por exemplo, de KRC2 para KRC4/KRC5), modernizando células já existentes.' },
    ],
    pecas: [
      { q: 'Quais peças de reposição KUKA a RoboterSys fornece?', a: 'Peças originais KUKA — KCP (KCP1, KCP2), placas MFC, motores, cabos, baterias e correias, entre outros componentes mecânicos, elétricos e eletrônicos.' },
      { q: 'As peças servem para quais gerações de controladora?', a: 'Para KRC1, KRC2, KRC4 e KRC5, incluindo variações como KRC2 ed05 e KRC4 Standard, Compact e Extended.' },
      { q: 'As peças são originais?', a: 'Sim — peças originais KUKA, testadas no laboratório próprio da RoboterSys antes da entrega.' },
      { q: 'Vocês consertam componentes, além de vender peças novas?', a: 'Sim — a RoboterSys também repara componentes mecânicos e eletrônicos de robôs KUKA.' },
      { q: 'Qual o prazo de entrega das peças?', a: 'A RoboterSys mantém amplo estoque, com entrega express e atendimento de emergência. Informe o modelo do robô e a controladora para agilizar o orçamento.' },
    ],
    sistemas: [
      { q: 'O que é uma célula robotizada turn key?', a: 'É uma solução "chave na mão": a RoboterSys projeta, fabrica, instala e programa a célula (robô, periféricos e segurança) e a entrega pronta para operar.' },
      { q: 'Qual a diferença entre turn key e semi turn key?', a: 'No turn key a entrega é completa; no semi turn key, a RoboterSys integra robôs a processos e equipamentos já existentes na sua fábrica.' },
      { q: 'Que aplicações a RoboterSys automatiza?', a: 'Paletização, manipulação (handling), rebarbação e acabamento, além de adequações e retrofit de células existentes.' },
      { q: 'É possível simular a célula antes de fabricar?', a: 'Sim — a RoboterSys faz simulação 3D e estudo de tempo de ciclo, prevendo o desempenho antes da montagem física.' },
      { q: 'A RoboterSys atende projetos de todos os portes?', a: 'Sim — desenvolve soluções para indústrias de todos os portes.' },
    ],
    pushcorp: [
      { q: 'O que é a PushCorp?', a: 'A PushCorp é líder global em soluções robotizadas para remoção de material, rebarbação e acabamento industrial desde 1993. A RoboterSys é a integradora parceira PushCorp.' },
      { q: 'O que é o Compliance Device?', a: 'É um dispositivo que permite ao robô manter contato com força controlada sobre a peça, garantindo precisão e repetibilidade em rebarbação e acabamento.' },
      { q: 'Para que aplicações o PushCorp é indicado?', a: 'Rebarbação, lixamento e acabamento de superfícies e remoção de material — onde a consistência da força aplicada é crítica.' },
      { q: 'A RoboterSys integra a PushCorp aos robôs KUKA?', a: 'Sim — como integradora parceira, a RoboterSys projeta e implanta células KUKA com ferramentas PushCorp.' },
    ],
  },

  // ── English ────────────────────────────────────────────────────────────────
  en: {
    servicos: [
      { q: 'What services does RoboterSys offer for KUKA robots?', a: 'Installation, programming, preventive and corrective maintenance, repair of mechanical and electronic components, original spare parts, remote support, and controller retrofit/upgrade (KRC1, KRC2, KRC4 and KRC5).' },
      { q: 'Where does RoboterSys operate?', a: 'RoboterSys is headquartered in Joinville, Brazil, with a presence in the United States (Ocoee, FL). It supports industrial clients with on-site service and 24-hour remote support to reduce production downtime.' },
      { q: 'Do you work with robot brands other than KUKA?', a: 'No. RoboterSys specializes exclusively in KUKA robots — which makes it the largest KUKA specialist in Brazil.' },
      { q: 'Does RoboterSys offer emergency support?', a: 'Yes. There is 24-hour remote support and emergency service, plus express delivery of parts.' },
      { q: 'Do you perform retrofit/upgrade of older controllers?', a: 'Yes — RoboterSys performs retrofit and upgrade of KUKA controller generations (for example, from KRC2 to KRC4/KRC5), modernizing existing cells.' },
    ],
    pecas: [
      { q: 'Which KUKA spare parts does RoboterSys supply?', a: 'Original KUKA parts — KCP (KCP1, KCP2), MFC boards, motors, cables, batteries and belts, among other mechanical, electrical and electronic components.' },
      { q: 'Which controller generations do the parts fit?', a: 'KRC1, KRC2, KRC4 and KRC5, including variants such as KRC2 ed05 and KRC4 Standard, Compact and Extended.' },
      { q: 'Are the parts original?', a: 'Yes — original KUKA parts, tested in RoboterSys’s own lab before delivery.' },
      { q: 'Do you repair components, or only sell new parts?', a: 'Yes — RoboterSys also repairs mechanical and electronic components of KUKA robots.' },
      { q: 'What is the delivery time for parts?', a: 'RoboterSys keeps a large stock, with express delivery and emergency service. Share your robot model and controller to speed up the quote.' },
    ],
    sistemas: [
      { q: 'What is a turnkey robotic cell?', a: 'A complete, ready-to-run solution: RoboterSys designs, builds, installs and programs the cell (robot, peripherals and safety) and delivers it ready to operate.' },
      { q: 'What is the difference between turnkey and semi-turnkey?', a: 'Turnkey is a complete delivery; in semi-turnkey, RoboterSys integrates robots into your plant’s existing processes and equipment.' },
      { q: 'Which applications does RoboterSys automate?', a: 'Palletizing, handling, deburring and finishing, plus upgrades and retrofits of existing cells.' },
      { q: 'Can the cell be simulated before it is built?', a: 'Yes — RoboterSys runs 3D simulation and cycle-time studies, predicting performance before physical assembly.' },
      { q: 'Does RoboterSys handle projects of all sizes?', a: 'Yes — it develops solutions for industries of every size.' },
    ],
    pushcorp: [
      { q: 'What is PushCorp?', a: 'PushCorp is a global leader in robotic solutions for material removal, deburring and industrial finishing since 1993. RoboterSys is its integration partner.' },
      { q: 'What is the Compliance Device?', a: 'A device that lets the robot keep force-controlled contact with the part, ensuring precision and repeatability in deburring and finishing.' },
      { q: 'What applications is PushCorp suited for?', a: 'Deburring, sanding and surface finishing, and material removal — where consistency of applied force is critical.' },
      { q: 'Does RoboterSys integrate PushCorp with KUKA robots?', a: 'Yes — as an integration partner, RoboterSys designs and deploys KUKA cells with PushCorp tooling.' },
    ],
  },

  // ── Español ────────────────────────────────────────────────────────────────
  es: {
    servicos: [
      { q: '¿Qué servicios ofrece RoboterSys para robots KUKA?', a: 'Instalación, programación, mantenimiento preventivo y correctivo, reparación de componentes mecánicos y electrónicos, repuestos originales, soporte remoto y retrofit/actualización de controladoras (KRC1, KRC2, KRC4 y KRC5).' },
      { q: '¿Dónde opera RoboterSys?', a: 'RoboterSys tiene su sede en Joinville (Brasil) y atiende a clientes industriales en Brasil y América Latina, con servicio en sitio y soporte remoto 24 horas para reducir paradas de producción.' },
      { q: '¿Trabajan con otras marcas de robots además de KUKA?', a: 'No. RoboterSys se especializa exclusivamente en robots KUKA, lo que la convierte en la mayor especialista en esta marca en Brasil.' },
      { q: '¿RoboterSys ofrece soporte de emergencia?', a: 'Sí. Hay soporte remoto 24 horas y atención de emergencia, además de entrega express de repuestos.' },
      { q: '¿Realizan retrofit/actualización de controladoras antiguas?', a: 'Sí — RoboterSys realiza retrofit y actualización de generaciones de controladoras KUKA (por ejemplo, de KRC2 a KRC4/KRC5), modernizando celdas existentes.' },
    ],
    pecas: [
      { q: '¿Qué repuestos KUKA suministra RoboterSys?', a: 'Repuestos originales KUKA — KCP (KCP1, KCP2), placas MFC, motores, cables, baterías y correas, entre otros componentes mecánicos, eléctricos y electrónicos.' },
      { q: '¿Para qué generaciones de controladora sirven los repuestos?', a: 'Para KRC1, KRC2, KRC4 y KRC5, incluidas variantes como KRC2 ed05 y KRC4 Standard, Compact y Extended.' },
      { q: '¿Los repuestos son originales?', a: 'Sí — repuestos originales KUKA, probados en el laboratorio propio de RoboterSys antes de la entrega.' },
      { q: '¿Reparan componentes, además de vender repuestos nuevos?', a: 'Sí — RoboterSys también repara componentes mecánicos y electrónicos de robots KUKA.' },
      { q: '¿Cuál es el plazo de entrega de los repuestos?', a: 'RoboterSys mantiene un amplio stock, con entrega express y atención de emergencia. Indique el modelo del robot y la controladora para agilizar la cotización.' },
    ],
    sistemas: [
      { q: '¿Qué es una celda robotizada llave en mano (turn key)?', a: 'Una solución completa lista para operar: RoboterSys diseña, fabrica, instala y programa la celda (robot, periféricos y seguridad) y la entrega lista para funcionar.' },
      { q: '¿Cuál es la diferencia entre turn key y semi turn key?', a: 'El turn key es una entrega completa; en el semi turn key, RoboterSys integra robots a los procesos y equipos ya existentes en su planta.' },
      { q: '¿Qué aplicaciones automatiza RoboterSys?', a: 'Paletizado, manipulación (handling), rebabado y acabado, además de adecuaciones y retrofit de celdas existentes.' },
      { q: '¿Se puede simular la celda antes de fabricarla?', a: 'Sí — RoboterSys realiza simulación 3D y estudio de tiempo de ciclo, previendo el desempeño antes del montaje físico.' },
      { q: '¿RoboterSys atiende proyectos de todos los tamaños?', a: 'Sí — desarrolla soluciones para industrias de todos los tamaños.' },
    ],
    pushcorp: [
      { q: '¿Qué es PushCorp?', a: 'PushCorp es líder global en soluciones robotizadas para remoción de material, rebabado y acabado industrial desde 1993. RoboterSys es su integrador asociado.' },
      { q: '¿Qué es el Compliance Device?', a: 'Un dispositivo que permite al robot mantener contacto con fuerza controlada sobre la pieza, garantizando precisión y repetibilidad en rebabado y acabado.' },
      { q: '¿Para qué aplicaciones es indicado PushCorp?', a: 'Rebabado, lijado y acabado de superficies y remoción de material — donde la consistencia de la fuerza aplicada es crítica.' },
      { q: '¿RoboterSys integra PushCorp a los robots KUKA?', a: 'Sí — como integrador asociado, RoboterSys diseña e implanta celdas KUKA con herramientas PushCorp.' },
    ],
  },

  // ── Deutsch ──────────────────────────────────────────────── // REVISÃO ──────
  de: {
    servicos: [
      { q: 'Welche Leistungen bietet RoboterSys für KUKA-Roboter?', a: 'Installation, Programmierung, vorbeugende und korrektive Wartung, Reparatur mechanischer und elektronischer Komponenten, Original-Ersatzteile, Fernwartung sowie Retrofit/Upgrade von Steuerungen (KRC1, KRC2, KRC4 und KRC5).' },
      { q: 'Wo ist RoboterSys tätig?', a: 'RoboterSys hat seinen Sitz in Joinville (Brasilien) und betreut Industriekunden mit Vor-Ort-Service und 24-Stunden-Fernwartung, um Produktionsausfälle zu reduzieren.' },
      { q: 'Arbeiten Sie auch mit anderen Robotermarken als KUKA?', a: 'Nein. RoboterSys ist ausschließlich auf KUKA-Roboter spezialisiert — und damit der größte KUKA-Spezialist Brasiliens.' },
      { q: 'Bietet RoboterSys Notfall-Support?', a: 'Ja. Es gibt 24-Stunden-Fernwartung und Notfallservice sowie Express-Lieferung von Teilen.' },
      { q: 'Führen Sie Retrofit/Upgrade älterer Steuerungen durch?', a: 'Ja — RoboterSys führt Retrofit und Upgrade von KUKA-Steuerungsgenerationen durch (z. B. von KRC2 auf KRC4/KRC5) und modernisiert bestehende Zellen.' },
    ],
    pecas: [
      { q: 'Welche KUKA-Ersatzteile liefert RoboterSys?', a: 'Original-KUKA-Teile — KCP (KCP1, KCP2), MFC-Platinen, Motoren, Kabel, Batterien und Riemen sowie weitere mechanische, elektrische und elektronische Komponenten.' },
      { q: 'Für welche Steuerungsgenerationen passen die Teile?', a: 'Für KRC1, KRC2, KRC4 und KRC5, einschließlich Varianten wie KRC2 ed05 und KRC4 Standard, Compact und Extended.' },
      { q: 'Sind die Teile original?', a: 'Ja — Original-KUKA-Teile, vor der Lieferung im eigenen Labor von RoboterSys getestet.' },
      { q: 'Reparieren Sie Komponenten oder verkaufen Sie nur neue Teile?', a: 'Ja — RoboterSys repariert auch mechanische und elektronische Komponenten von KUKA-Robotern.' },
      { q: 'Wie lange dauert die Lieferung der Teile?', a: 'RoboterSys hält ein großes Lager vor, mit Express-Lieferung und Notfallservice. Nennen Sie Robotermodell und Steuerung, um das Angebot zu beschleunigen.' },
    ],
    sistemas: [
      { q: 'Was ist eine schlüsselfertige (Turnkey-)Roboterzelle?', a: 'Eine komplette, betriebsbereite Lösung: RoboterSys plant, fertigt, installiert und programmiert die Zelle (Roboter, Peripherie und Sicherheit) und liefert sie betriebsbereit.' },
      { q: 'Was ist der Unterschied zwischen Turnkey und Semi-Turnkey?', a: 'Turnkey ist eine Komplettlieferung; bei Semi-Turnkey integriert RoboterSys Roboter in die bestehenden Prozesse und Anlagen Ihres Werks.' },
      { q: 'Welche Anwendungen automatisiert RoboterSys?', a: 'Palettieren, Handling, Entgraten und Finishing sowie Anpassungen und Retrofit bestehender Zellen.' },
      { q: 'Kann die Zelle vor dem Bau simuliert werden?', a: 'Ja — RoboterSys führt 3D-Simulationen und Taktzeitstudien durch und prognostiziert die Leistung vor dem physischen Aufbau.' },
      { q: 'Betreut RoboterSys Projekte jeder Größe?', a: 'Ja — es entwickelt Lösungen für Industrien jeder Größe.' },
    ],
    pushcorp: [
      { q: 'Was ist PushCorp?', a: 'PushCorp ist seit 1993 weltweit führend bei Roboterlösungen für Materialabtrag, Entgraten und industrielles Finishing. RoboterSys ist Integrationspartner.' },
      { q: 'Was ist das Compliance Device?', a: 'Ein Gerät, mit dem der Roboter kraftgeregelten Kontakt zum Werkstück hält und so Präzision und Wiederholgenauigkeit beim Entgraten und Finishing sichert.' },
      { q: 'Für welche Anwendungen eignet sich PushCorp?', a: 'Entgraten, Schleifen und Oberflächen-Finishing sowie Materialabtrag — überall dort, wo die Konstanz der aufgebrachten Kraft entscheidend ist.' },
      { q: 'Integriert RoboterSys PushCorp in KUKA-Roboter?', a: 'Ja — als Integrationspartner plant und implementiert RoboterSys KUKA-Zellen mit PushCorp-Werkzeugen.' },
    ],
  },
};
