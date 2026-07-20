import { PrismaClient, QuestionStatus } from '@prisma/client';

/**
 * Seed de PREGUNTAS de arranque (contenido). Separado del seed de catálogos
 * (seed.ts) a propósito: los catálogos son estructura, esto es contenido y
 * crecerá con scripts propios (v1 no tiene panel de administración).
 *
 * Idempotente: si ya existe una pregunta con el mismo texto, se salta.
 * Ejecutar: `npm run prisma:seed:questions`
 *
 * Formato: q(categoría, dificultad 1-5, texto, explicación, correcta, ...incorrectas)
 *          tf(categoría, dificultad 1-5, afirmación, explicación, esVerdadera)
 */
const prisma = new PrismaClient();

type Item = {
  category: string;
  difficultyOrder: number;
  typeCode: string;
  text: string;
  explanation: string;
  answers: { text: string; isCorrect: boolean }[];
};

const items: Item[] = [];

function q(category: string, diff: number, text: string, explanation: string, correct: string, ...wrong: string[]): void {
  const options = [{ text: correct, isCorrect: true }, ...wrong.map((w) => ({ text: w, isCorrect: false }))];
  // Mezcla determinística simple para que la correcta no sea siempre la primera.
  const shuffled = options
    .map((o, i) => ({ o, k: (text.length * 7 + i * 13) % options.length }))
    .sort((a, b) => a.k - b.k || a.o.text.localeCompare(b.o.text))
    .map((x) => x.o);
  items.push({ category, difficultyOrder: diff, typeCode: 'multiple_choice', text, explanation, answers: shuffled });
}

function tf(category: string, diff: number, text: string, explanation: string, isTrue: boolean): void {
  items.push({
    category,
    difficultyOrder: diff,
    typeCode: 'true_false',
    text,
    explanation,
    answers: [
      { text: 'Verdadero', isCorrect: isTrue },
      { text: 'Falso', isCorrect: !isTrue },
    ],
  });
}

// ============================== HISTORIA ==============================
q('Historia', 1, '¿Quién fue el primer presidente de los Estados Unidos?', 'George Washington gobernó de 1789 a 1797 tras liderar la independencia.', 'George Washington', 'Abraham Lincoln', 'Thomas Jefferson', 'Benjamin Franklin');
q('Historia', 2, '¿En qué año cayó el Muro de Berlín?', 'El muro cayó el 9 de noviembre de 1989 y marcó el fin de la Guerra Fría.', '1989', '1991', '1985', '1979');
q('Historia', 3, '¿Qué civilización construyó Machu Picchu?', 'Machu Picchu fue construida por los incas en el siglo XV, en el actual Perú.', 'Inca', 'Azteca', 'Maya', 'Olmeca');
q('Historia', 4, '¿Qué tratado puso fin a la Primera Guerra Mundial?', 'El Tratado de Versalles (1919) impuso duras condiciones a Alemania.', 'Tratado de Versalles', 'Tratado de Tordesillas', 'Paz de Westfalia', 'Tratado de Utrecht');
q('Historia', 5, '¿Quién fue el último emperador del Imperio romano de Occidente?', 'Rómulo Augústulo fue depuesto en 476 d.C., fecha tradicional del fin de Roma occidental.', 'Rómulo Augústulo', 'Julio Nepote', 'Honorio', 'Constantino XI');

// ============================== GEOGRAFÍA ==============================
q('Geografía', 1, '¿Cuál es el río más largo de Sudamérica?', 'El Amazonas recorre unos 6.800 km y es también el más caudaloso del mundo.', 'Amazonas', 'Paraná', 'Orinoco', 'Magdalena');
q('Geografía', 2, '¿Cuál es la capital de Australia?', 'Aunque Sídney es más grande, la capital es Canberra desde 1913.', 'Canberra', 'Sídney', 'Melbourne', 'Brisbane');
q('Geografía', 3, '¿Qué país tiene más husos horarios?', 'Francia tiene 12 husos horarios gracias a sus territorios de ultramar.', 'Francia', 'Rusia', 'Estados Unidos', 'China');
q('Geografía', 4, '¿Cuál es el desierto más grande del mundo?', 'La Antártida es técnicamente un desierto (polar) y supera al Sahara en superficie.', 'La Antártida', 'El Sahara', 'El Gobi', 'El Atacama');
tf('Geografía', 2, 'El monte Everest es la montaña más alta del mundo sobre el nivel del mar.', 'Con 8.849 m, el Everest es la cima más alta sobre el nivel del mar.', true);

// ============================== MATEMÁTICAS ==============================
q('Matemáticas', 1, '¿Cuánto es 9 × 7?', 'Nueve por siete es 63.', '63', '56', '72', '54');
q('Matemáticas', 2, '¿Cuál es el valor aproximado de π (pi)?', 'Pi es la razón entre la circunferencia y el diámetro: ≈ 3,1416.', '3,1416', '2,7182', '1,6180', '4,3429');
q('Matemáticas', 3, '¿Cómo se llama un polígono de 12 lados?', 'Dodecágono viene del griego dódeka (doce) y gonía (ángulo).', 'Dodecágono', 'Decágono', 'Endecágono', 'Icoságono');
q('Matemáticas', 4, '¿Cuál es la derivada de x²?', 'Por la regla de la potencia, d/dx(x²) = 2x.', '2x', 'x', 'x²/2', '2x²');
q('Matemáticas', 5, '¿Qué matemático demostró el Último Teorema de Fermat en 1994?', 'Andrew Wiles lo demostró tras más de 350 años abierto.', 'Andrew Wiles', 'Grigori Perelman', 'Terence Tao', 'Paul Erdős');

// ============================== DEPORTES ==============================
q('Deportes', 1, '¿Cuántos jugadores tiene un equipo de fútbol en cancha?', 'Cada equipo juega con 11 jugadores, incluido el arquero.', '11', '10', '12', '9');
q('Deportes', 2, '¿Qué selección ganó el primer Mundial de fútbol en 1930?', 'Uruguay fue anfitrión y campeón del primer Mundial.', 'Uruguay', 'Brasil', 'Argentina', 'Italia');
q('Deportes', 3, '¿En qué deporte se usa el término "smash"?', 'El smash es el remate por encima de la cabeza en tenis, bádminton y vóley.', 'Tenis', 'Golf', 'Rugby', 'Béisbol');
q('Deportes', 4, '¿Cuántos anillos tiene la bandera olímpica?', 'Cinco anillos entrelazados representan los cinco continentes.', '5', '4', '6', '7');
q('Deportes', 5, '¿Qué maratonista corrió descalzo y ganó el oro olímpico en Roma 1960?', 'El etíope Abebe Bikila ganó descalzo y repitió oro en 1964.', 'Abebe Bikila', 'Emil Zátopek', 'Haile Gebrselassie', 'Eliud Kipchoge');

// ============================== TECNOLOGÍA ==============================
q('Tecnología', 1, '¿Qué significa "www" en una dirección web?', 'World Wide Web: el sistema de documentos enlazados creado por Tim Berners-Lee.', 'World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide');
q('Tecnología', 2, '¿Qué empresa creó el iPhone?', 'Apple presentó el primer iPhone en 2007.', 'Apple', 'Samsung', 'Microsoft', 'Google');
q('Tecnología', 3, '¿Qué significa la sigla "CPU"?', 'Central Processing Unit: la unidad central de procesamiento.', 'Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Union');
q('Tecnología', 4, '¿En qué década se envió el primer correo electrónico?', 'Ray Tomlinson envió el primer email en 1971, en la década de 1970.', 'Década de 1970', 'Década de 1980', 'Década de 1990', 'Década de 1960');

// ============================== INFORMÁTICA ==============================
q('Informática', 2, '¿Qué lenguaje se usa principalmente para dar estilo a páginas web?', 'CSS (Cascading Style Sheets) define la presentación visual.', 'CSS', 'HTML', 'Python', 'SQL');
q('Informática', 3, '¿Cuántos bits tiene un byte?', 'Un byte se compone de 8 bits.', '8', '4', '16', '32');
q('Informática', 4, '¿Quién es considerado el padre de la computación teórica?', 'Alan Turing formalizó los conceptos de algoritmo y computación con la máquina de Turing.', 'Alan Turing', 'Bill Gates', 'John von Neumann', 'Charles Babbage');
q('Informática', 5, '¿Qué estructura de datos funciona con el principio LIFO?', 'La pila (stack): el último en entrar es el primero en salir (Last In, First Out).', 'Pila (stack)', 'Cola (queue)', 'Lista enlazada', 'Árbol binario');

// ============================== FÍSICA ==============================
q('Física', 2, '¿Cuál es la unidad de fuerza en el Sistema Internacional?', 'El newton (N), en honor a Isaac Newton.', 'Newton', 'Joule', 'Watt', 'Pascal');
q('Física', 3, '¿A qué velocidad viaja la luz en el vacío?', 'La luz viaja a unos 300.000 km/s (299.792 km/s exactos).', '300.000 km/s', '150.000 km/s', '1.000.000 km/s', '30.000 km/s');
q('Física', 4, '¿Quién formuló la teoría de la relatividad general?', 'Albert Einstein la publicó en 1915.', 'Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Stephen Hawking');
tf('Física', 3, 'El sonido viaja más rápido en el agua que en el aire.', 'En el agua viaja a ~1.480 m/s, unas 4 veces más rápido que en el aire.', true);

// ============================== QUÍMICA ==============================
q('Química', 1, '¿Cuál es la fórmula química del agua?', 'Dos átomos de hidrógeno y uno de oxígeno: H₂O.', 'H2O', 'CO2', 'O2', 'H2O2');
q('Química', 3, '¿Qué elemento tiene el símbolo "Au"?', 'Au viene del latín aurum: oro.', 'Oro', 'Plata', 'Aluminio', 'Argón');
q('Química', 4, '¿Cuál es el elemento más abundante del universo?', 'El hidrógeno constituye cerca del 75% de la materia bariónica.', 'Hidrógeno', 'Oxígeno', 'Helio', 'Carbono');

// ============================== BIOLOGÍA ==============================
q('Biología', 1, '¿Qué órgano bombea la sangre en el cuerpo humano?', 'El corazón late unas 100.000 veces por día impulsando la sangre.', 'El corazón', 'El hígado', 'Los pulmones', 'El cerebro');
q('Biología', 3, '¿Cuál es la molécula que porta la información genética?', 'El ADN (ácido desoxirribonucleico) guarda las instrucciones de la vida.', 'ADN', 'ARN mensajero solamente', 'Proteína', 'Glucosa');
q('Biología', 4, '¿Cómo se llama el proceso por el que las plantas producen su alimento?', 'La fotosíntesis convierte luz, agua y CO₂ en glucosa y oxígeno.', 'Fotosíntesis', 'Respiración celular', 'Fermentación', 'Ósmosis');
tf('Biología', 2, 'Los delfines son peces.', 'Los delfines son mamíferos: respiran aire y amamantan a sus crías.', false);

// ============================== ASTRONOMÍA ==============================
q('Astronomía', 1, '¿Cuál es el planeta más grande del Sistema Solar?', 'Júpiter tiene más masa que todos los demás planetas juntos.', 'Júpiter', 'Saturno', 'Neptuno', 'La Tierra');
q('Astronomía', 2, '¿Qué planeta es conocido como el "planeta rojo"?', 'Marte debe su color al óxido de hierro de su superficie.', 'Marte', 'Venus', 'Mercurio', 'Júpiter');
q('Astronomía', 4, '¿Cómo se llama la galaxia en la que vivimos?', 'La Vía Láctea, una galaxia espiral de más de 100.000 millones de estrellas.', 'Vía Láctea', 'Andrómeda', 'Triángulo', 'Sombrero');
q('Astronomía', 5, '¿Qué fenómeno ocurre cuando una estrella masiva colapsa al final de su vida?', 'Puede formar una supernova y dejar una estrella de neutrones o un agujero negro.', 'Supernova', 'Eclipse', 'Lluvia de meteoros', 'Aurora boreal');

// ============================== LITERATURA ==============================
q('Literatura', 2, '¿Quién escribió "Cien años de soledad"?', 'Gabriel García Márquez la publicó en 1967; es la obra cumbre del realismo mágico.', 'Gabriel García Márquez', 'Mario Vargas Llosa', 'Julio Cortázar', 'Jorge Luis Borges');
q('Literatura', 3, '¿Quién escribió "Don Quijote de la Mancha"?', 'Miguel de Cervantes publicó la primera parte en 1605.', 'Miguel de Cervantes', 'Lope de Vega', 'Francisco de Quevedo', 'Garcilaso de la Vega');
q('Literatura', 4, '¿Qué escritor creó al detective Sherlock Holmes?', 'Arthur Conan Doyle lo presentó en "Estudio en escarlata" (1887).', 'Arthur Conan Doyle', 'Agatha Christie', 'Edgar Allan Poe', 'Raymond Chandler');

// ============================== ARTE ==============================
q('Arte', 2, '¿Quién pintó la Mona Lisa?', 'Leonardo da Vinci la pintó a principios del siglo XVI; hoy está en el Louvre.', 'Leonardo da Vinci', 'Miguel Ángel', 'Rafael', 'Botticelli');
q('Arte', 3, '¿Qué pintor se cortó parte de una oreja?', 'Vincent van Gogh, en 1888, durante una crisis en Arlés.', 'Vincent van Gogh', 'Pablo Picasso', 'Claude Monet', 'Salvador Dalí');
q('Arte', 4, '¿A qué movimiento artístico pertenece "La persistencia de la memoria" de Dalí?', 'Los relojes blandos son un ícono del surrealismo.', 'Surrealismo', 'Cubismo', 'Impresionismo', 'Expresionismo');

// ============================== MÚSICA ==============================
q('Música', 1, '¿Cuántas cuerdas tiene una guitarra clásica?', 'La guitarra clásica tiene 6 cuerdas.', '6', '4', '5', '7');
q('Música', 3, '¿Qué compositor quedó sordo y siguió componiendo obras maestras?', 'Beethoven compuso su Novena Sinfonía prácticamente sordo.', 'Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Franz Schubert');
q('Música', 4, '¿Qué banda británica grabó el álbum "The Dark Side of the Moon"?', 'Pink Floyd lo lanzó en 1973; estuvo 741 semanas en el ranking de Billboard.', 'Pink Floyd', 'The Beatles', 'Led Zeppelin', 'Queen');

// ============================== CINE ==============================
q('Cine', 2, '¿Qué película ganó el primer Óscar a Mejor Película?', '"Wings" (Alas, 1927) ganó en la primera ceremonia de 1929.', 'Wings (Alas)', 'Lo que el viento se llevó', 'Casablanca', 'El cantante de jazz');
q('Cine', 3, '¿Quién dirigió "Titanic" y "Avatar"?', 'James Cameron dirigió ambas, las dos más taquilleras de su época.', 'James Cameron', 'Steven Spielberg', 'Christopher Nolan', 'Ridley Scott');
q('Cine', 4, '¿Qué actor interpretó al Joker en "El caballero de la noche" (2008)?', 'Heath Ledger ganó el Óscar póstumo por ese papel.', 'Heath Ledger', 'Joaquin Phoenix', 'Jack Nicholson', 'Jared Leto');

// ============================== VIDEOJUEGOS ==============================
q('Videojuegos', 1, '¿Cómo se llama el hermano de Mario en los juegos de Nintendo?', 'Luigi debutó en 1983 y es el hermano menor (y más alto) de Mario.', 'Luigi', 'Wario', 'Yoshi', 'Toad');
q('Videojuegos', 3, '¿En qué juego aparece el mundo de Hyrule?', 'Hyrule es el reino de la saga The Legend of Zelda.', 'The Legend of Zelda', 'Final Fantasy', 'Dark Souls', 'Elden Ring');
q('Videojuegos', 4, '¿Cuál fue la primera consola de Sony?', 'La PlayStation original salió en 1994 en Japón.', 'PlayStation', 'PlayStation 2', 'PSP', 'Dreamcast');

// ============================== GASTRONOMÍA ==============================
q('Gastronomía', 1, '¿De qué país es originaria la pizza?', 'La pizza moderna nació en Nápoles, Italia.', 'Italia', 'Francia', 'Grecia', 'España');
q('Gastronomía', 3, '¿Cuál es el ingrediente principal del guacamole?', 'El guacamole se prepara con palta (aguacate) molida.', 'Palta (aguacate)', 'Tomate', 'Pimiento', 'Maíz');
q('Gastronomía', 4, '¿Qué especia es la más cara del mundo por peso?', 'El azafrán: se necesitan unas 150.000 flores para un kilo.', 'Azafrán', 'Vainilla', 'Cardamomo', 'Pimienta rosa');

// ============================== ANIMALES ==============================
q('Animales', 1, '¿Cuál es el animal terrestre más rápido?', 'El guepardo alcanza los 110 km/h en distancias cortas.', 'El guepardo', 'El león', 'La gacela', 'El caballo');
q('Animales', 2, '¿Cuántas patas tiene una araña?', 'Los arácnidos tienen 8 patas, a diferencia de los insectos (6).', '8', '6', '10', '12');
q('Animales', 4, '¿Cuál es el único mamífero capaz de volar de verdad?', 'El murciélago vuela activamente; otros mamíferos solo planean.', 'El murciélago', 'La ardilla voladora', 'El colugo', 'El petauro');

// ============================== NATURALEZA ==============================
q('Naturaleza', 2, '¿Cómo se llama el proceso por el que el agua pasa de líquido a gas?', 'La evaporación es parte del ciclo del agua.', 'Evaporación', 'Condensación', 'Precipitación', 'Sublimación');
q('Naturaleza', 3, '¿Cuál es el bosque tropical más grande del mundo?', 'La selva amazónica cubre más de 5,5 millones de km².', 'La selva amazónica', 'El Congo', 'Borneo', 'Daintree');
tf('Naturaleza', 3, 'Los rayos nunca caen dos veces en el mismo lugar.', 'Es un mito: el Empire State recibe unos 20-25 rayos por año.', false);

// ============================== CULTURA GENERAL ==============================
q('Cultura General', 1, '¿Cuántos días tiene un año bisiesto?', 'Los años bisiestos tienen 366 días, con el 29 de febrero extra.', '366', '365', '364', '367');
q('Cultura General', 2, '¿Cuántos colores tiene el arcoíris?', 'Tradicionalmente se cuentan 7: rojo, naranja, amarillo, verde, azul, índigo y violeta.', '7', '6', '8', '5');
q('Cultura General', 3, '¿En qué país se encuentra la Torre Eiffel?', 'Está en París, Francia; se construyó para la Exposición Universal de 1889.', 'Francia', 'Italia', 'Bélgica', 'Suiza');
q('Cultura General', 5, '¿Cuál es el idioma con más hablantes nativos del mundo?', 'El chino mandarín supera los 900 millones de hablantes nativos.', 'Chino mandarín', 'Inglés', 'Español', 'Hindi');

// ======================================================================

async function main(): Promise<void> {
  const [categories, difficulties, types] = await Promise.all([
    prisma.category.findMany(),
    prisma.difficultyLevel.findMany(),
    prisma.questionType.findMany(),
  ]);

  const categoryByName = new Map(categories.map((c) => [c.name, c.id]));
  const difficultyByOrder = new Map(difficulties.map((d) => [d.order, d.id]));
  const typeByCode = new Map(types.map((t) => [t.code, t.id]));

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const categoryId = categoryByName.get(item.category);
    const difficultyLevelId = difficultyByOrder.get(item.difficultyOrder);
    const questionTypeId = typeByCode.get(item.typeCode);

    if (!categoryId || !difficultyLevelId || !questionTypeId) {
      console.warn(`Saltando "${item.text}": falta catálogo (¿corriste primero prisma:seed?).`);
      skipped++;
      continue;
    }

    const exists = await prisma.question.findFirst({ where: { text: item.text }, select: { id: true } });
    if (exists) {
      skipped++;
      continue;
    }

    await prisma.question.create({
      data: {
        categoryId,
        difficultyLevelId,
        questionTypeId,
        text: item.text,
        educationalExplanation: item.explanation,
        status: QuestionStatus.PUBLISHED,
        answers: {
          create: item.answers.map((a, i) => ({ text: a.text, isCorrect: a.isCorrect, order: i })),
        },
      },
    });
    created++;
  }

  console.log(`Preguntas: ${created} creadas, ${skipped} ya existentes u omitidas. Total en script: ${items.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
