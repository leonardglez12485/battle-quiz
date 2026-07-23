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

// ===================== LOTE 2: más preguntas =====================

// -------- Historia --------
q('Historia', 1, '¿En qué continente se originó el Antiguo Egipto?', 'El Antiguo Egipto se desarrolló a orillas del río Nilo, en el noreste de África.', 'África', 'Asia', 'Europa', 'Oceanía');
q('Historia', 2, '¿Qué muro dividió una ciudad alemana durante la Guerra Fría?', 'El Muro de Berlín dividió la ciudad entre 1961 y 1989.', 'El Muro de Berlín', 'La Línea Maginot', 'El Muro de Adriano', 'La Gran Muralla');
q('Historia', 2, '¿Quién lideró la Revolución cubana que triunfó en 1959?', 'Fidel Castro encabezó la revolución que derrocó a Fulgencio Batista.', 'Fidel Castro', 'Ernesto Che Guevara', 'Camilo Cienfuegos', 'José Martí');
q('Historia', 3, '¿En qué año comenzó la Segunda Guerra Mundial?', 'Comenzó en 1939 con la invasión alemana a Polonia.', '1939', '1941', '1936', '1945');
q('Historia', 3, '¿Qué imperio construyó el Coliseo?', 'El Coliseo romano se inauguró hacia el año 80 d.C.', 'Imperio romano', 'Imperio griego', 'Imperio persa', 'Imperio bizantino');
q('Historia', 4, '¿Qué revolución comenzó en 1789 con la toma de la Bastilla?', 'La Revolución Francesa transformó Europa a fines del siglo XVIII.', 'La Revolución Francesa', 'La Revolución Rusa', 'La Revolución Industrial', 'La Revolución de Mayo');
q('Historia', 4, '¿Quién escribió "El Príncipe" en el siglo XVI?', 'Nicolás Maquiavelo escribió este tratado político en 1513.', 'Nicolás Maquiavelo', 'Tomás Moro', 'Voltaire', 'John Locke');
q('Historia', 5, '¿Qué faraón mandó construir los templos de Abu Simbel?', 'Ramsés II los ordenó erigir en el siglo XIII a.C.', 'Ramsés II', 'Tutankamón', 'Keops', 'Akenatón');
tf('Historia', 2, 'Cristóbal Colón llegó a América en 1492.', 'Colón arribó el 12 de octubre de 1492.', true);
tf('Historia', 3, 'La independencia de Estados Unidos se declaró en 1776.', 'La Declaración de Independencia se firmó el 4 de julio de 1776.', true);

// -------- Geografía --------
q('Geografía', 1, '¿Cuál es el océano más grande del mundo?', 'El océano Pacífico es el más extenso y profundo.', 'Pacífico', 'Atlántico', 'Índico', 'Ártico');
q('Geografía', 2, '¿Cuál es el país más grande del mundo por superficie?', 'Rusia es el país más extenso y abarca dos continentes.', 'Rusia', 'Canadá', 'China', 'Estados Unidos');
q('Geografía', 2, '¿Cuál es la capital de Japón?', 'Tokio es la capital y la ciudad más poblada de Japón.', 'Tokio', 'Kioto', 'Osaka', 'Nagoya');
q('Geografía', 3, '¿Cuál es la montaña más alta de América?', 'El Aconcagua, en Argentina, mide 6.961 m.', 'Aconcagua', 'Everest', 'Kilimanjaro', 'Mont Blanc');
q('Geografía', 3, '¿Qué línea imaginaria divide la Tierra en hemisferio norte y sur?', 'El ecuador está a 0° de latitud.', 'El ecuador', 'El meridiano de Greenwich', 'El trópico de Cáncer', 'La eclíptica');
q('Geografía', 4, '¿Cuál es el país más pequeño del mundo?', 'La Ciudad del Vaticano, con apenas 0,44 km².', 'La Ciudad del Vaticano', 'Mónaco', 'San Marino', 'Nauru');
q('Geografía', 4, '¿Qué mar separa Europa de África?', 'El mar Mediterráneo separa el sur de Europa del norte de África.', 'Mar Mediterráneo', 'Mar Rojo', 'Mar Negro', 'Mar Báltico');
q('Geografía', 5, '¿Cuál es el lago más profundo del mundo?', 'El lago Baikal, en Siberia, supera los 1.600 m de profundidad.', 'Lago Baikal', 'Lago Titicaca', 'Mar Caspio', 'Lago Victoria');
tf('Geografía', 2, 'Australia es a la vez un país y un continente.', 'Australia ocupa todo el continente homónimo.', true);
tf('Geografía', 1, 'El Sahara es un desierto ubicado en África.', 'El Sahara es el mayor desierto cálido y está en el norte de África.', true);

// -------- Matemáticas --------
q('Matemáticas', 1, '¿Cuánto es 15 + 27?', 'Quince más veintisiete es 42.', '42', '32', '41', '52');
q('Matemáticas', 1, '¿Cuántos lados tiene un triángulo?', 'Un triángulo tiene 3 lados.', '3', '4', '5', '2');
q('Matemáticas', 2, '¿Cuál es el resultado de 12 al cuadrado?', 'Doce por doce es 144.', '144', '124', '122', '156');
q('Matemáticas', 2, '¿Cuánto es la mitad de 150?', 'La mitad de 150 es 75.', '75', '70', '80', '65');
q('Matemáticas', 3, '¿Cuánto es la raíz cuadrada de 81?', 'La raíz cuadrada de 81 es 9.', '9', '8', '7', '18');
q('Matemáticas', 3, '¿Cuántos grados suman los ángulos internos de un triángulo?', 'Siempre suman 180 grados.', '180', '360', '90', '270');
q('Matemáticas', 4, '¿Cómo se llama un número divisible solo por 1 y por sí mismo?', 'Se llama número primo.', 'Número primo', 'Número par', 'Número compuesto', 'Número racional');
q('Matemáticas', 4, '¿Cuál es el valor aproximado del número "e"?', 'La base del logaritmo natural vale unos 2,718.', '2,718', '3,141', '1,618', '1,414');
q('Matemáticas', 5, '¿Qué teorema relaciona los lados de un triángulo rectángulo?', 'El de Pitágoras: a² + b² = c².', 'Teorema de Pitágoras', 'Teorema de Tales', 'Teorema de Fermat', 'Teorema de Euclides');
tf('Matemáticas', 2, 'El número cero es par.', 'El cero es divisible por 2 sin resto, así que es par.', true);

// -------- Deportes --------
q('Deportes', 1, '¿Con qué parte del cuerpo NO puede tocar la pelota un jugador de campo en fútbol?', 'No puede usar las manos ni los brazos; solo el arquero puede.', 'Las manos', 'Los pies', 'La cabeza', 'El pecho');
q('Deportes', 2, '¿Cada cuántos años se celebran los Juegos Olímpicos de verano?', 'Se celebran cada 4 años.', '4 años', '2 años', '3 años', '5 años');
q('Deportes', 2, '¿En qué deporte destaca Rafael Nadal?', 'Nadal es una leyenda del tenis, rey de la tierra batida.', 'Tenis', 'Fútbol', 'Baloncesto', 'Golf');
q('Deportes', 3, '¿Cuántos jugadores tiene un equipo de baloncesto en cancha?', 'Cinco jugadores por equipo.', '5', '6', '7', '4');
q('Deportes', 3, '¿Qué país ganó más Mundiales de fútbol?', 'Brasil, con 5 títulos.', 'Brasil', 'Alemania', 'Italia', 'Argentina');
q('Deportes', 4, '¿En qué ciudad se celebraron los primeros Juegos Olímpicos modernos, en 1896?', 'Se realizaron en Atenas, Grecia.', 'Atenas', 'París', 'Londres', 'Roma');
q('Deportes', 4, '¿Cuántos puntos vale un touchdown en el fútbol americano?', 'Un touchdown vale 6 puntos.', '6', '7', '3', '5');
q('Deportes', 5, '¿Quién tiene el récord de más medallas olímpicas de la historia?', 'El nadador Michael Phelps, con 28 medallas.', 'Michael Phelps', 'Usain Bolt', 'Carl Lewis', 'Larisa Latínina');
tf('Deportes', 2, 'Un partido de fútbol dura 90 minutos en dos tiempos de 45.', 'Son dos tiempos de 45 minutos más descuentos.', true);
tf('Deportes', 3, 'El maratón olímpico mide 42,195 kilómetros.', 'Esa es la distancia oficial del maratón.', true);

// -------- Tecnología --------
q('Tecnología', 2, '¿Qué empresa desarrolla el sistema operativo Windows?', 'Windows es de Microsoft.', 'Microsoft', 'Apple', 'Google', 'IBM');
q('Tecnología', 2, '¿Qué significan las siglas "GPS"?', 'Global Positioning System, o Sistema de Posicionamiento Global.', 'Global Positioning System', 'General Position Service', 'Global Personal System', 'Geo Positioning Sensor');
q('Tecnología', 3, '¿Quién fundó Microsoft junto a Paul Allen?', 'Bill Gates cofundó Microsoft en 1975.', 'Bill Gates', 'Steve Jobs', 'Elon Musk', 'Mark Zuckerberg');
q('Tecnología', 3, '¿Qué red social fundó Mark Zuckerberg en 2004?', 'Fundó Facebook mientras estudiaba en Harvard.', 'Facebook', 'Twitter', 'Instagram', 'TikTok');
q('Tecnología', 4, '¿En qué año se fundó Google?', 'Google nació en 1998.', '1998', '2004', '1995', '2001');
q('Tecnología', 4, '¿Qué tecnología conecta dispositivos sin cables a corta distancia?', 'El Bluetooth permite conexiones inalámbricas cercanas.', 'Bluetooth', 'Ethernet', 'HDMI', 'USB');
q('Tecnología', 5, '¿Qué significan las siglas "IA" en tecnología?', 'Inteligencia Artificial.', 'Inteligencia Artificial', 'Internet Avanzado', 'Interfaz Automática', 'Información Analítica');
tf('Tecnología', 2, 'Un kilobyte es más grande que un byte.', 'Un kilobyte equivale a 1024 bytes.', true);

// -------- Informática --------
q('Informática', 2, '¿Qué lenguaje estructura el contenido de una página web?', 'HTML define la estructura del contenido.', 'HTML', 'CSS', 'Java', 'SQL');
q('Informática', 2, '¿Qué componente almacena datos de forma permanente en una PC?', 'El disco duro o SSD guarda los datos aunque se apague.', 'El disco duro', 'La memoria RAM', 'El procesador', 'La fuente');
q('Informática', 3, '¿Qué significan las siglas "RAM"?', 'Random Access Memory, la memoria de acceso aleatorio.', 'Random Access Memory', 'Read Access Memory', 'Rapid Available Memory', 'Random Available Module');
q('Informática', 3, '¿En qué sistema de numeración trabajan internamente las computadoras?', 'En binario, base 2 (ceros y unos).', 'Binario', 'Decimal', 'Hexadecimal', 'Octal');
q('Informática', 4, '¿Qué lenguaje de programación creó Guido van Rossum?', 'Creó Python a inicios de los años 90.', 'Python', 'Java', 'C++', 'Ruby');
q('Informática', 4, '¿Qué significan las siglas "URL"?', 'Uniform Resource Locator: la dirección de un recurso web.', 'Uniform Resource Locator', 'Universal Reference Link', 'Unified Routing Language', 'User Resource Locator');
q('Informática', 5, '¿Qué algoritmo de ordenamiento usa "divide y vencerás" con complejidad O(n log n)?', 'El Merge Sort divide, ordena y mezcla.', 'Merge Sort', 'Bubble Sort', 'Insertion Sort', 'Selection Sort');
tf('Informática', 3, 'HTML es un lenguaje de programación.', 'Falso: HTML es un lenguaje de marcado, no de programación.', false);

// -------- Física --------
q('Física', 1, '¿Qué fuerza nos mantiene pegados al suelo?', 'La gravedad atrae los cuerpos hacia la Tierra.', 'La gravedad', 'El magnetismo', 'La fricción', 'La electricidad');
q('Física', 2, '¿Qué instrumento mide la temperatura?', 'El termómetro mide la temperatura.', 'El termómetro', 'El barómetro', 'El higrómetro', 'El velocímetro');
q('Física', 3, '¿Cuál es la unidad de energía en el Sistema Internacional?', 'El joule (J) es la unidad de energía.', 'Joule', 'Newton', 'Vatio', 'Amperio');
q('Física', 3, '¿Qué científico formuló las tres leyes del movimiento?', 'Isaac Newton las publicó en 1687.', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla', 'Michael Faraday');
q('Física', 4, '¿Qué partícula subatómica tiene carga negativa?', 'El electrón tiene carga negativa.', 'El electrón', 'El protón', 'El neutrón', 'El fotón');
q('Física', 4, '¿Cómo se llama la energía asociada al movimiento?', 'La energía cinética depende de la masa y la velocidad.', 'Energía cinética', 'Energía potencial', 'Energía térmica', 'Energía nuclear');
q('Física', 5, '¿Qué ecuación de Einstein relaciona masa y energía?', 'E = mc² expresa la equivalencia entre masa y energía.', 'E = mc²', 'F = ma', 'V = IR', 'PV = nRT');
tf('Física', 2, 'La luz viaja más rápido que el sonido.', 'La luz (300.000 km/s) es muchísimo más veloz que el sonido.', true);

// -------- Química --------
q('Química', 1, '¿Qué gas necesitamos para respirar?', 'El oxígeno es esencial para la respiración.', 'Oxígeno', 'Nitrógeno', 'Dióxido de carbono', 'Helio');
q('Química', 2, '¿Cuál es el símbolo químico del oxígeno?', 'El oxígeno se representa con la letra O.', 'O', 'Ox', 'Og', 'Ox2');
q('Química', 3, '¿Cuál es el único metal líquido a temperatura ambiente?', 'El mercurio es líquido a temperatura ambiente.', 'Mercurio', 'Plomo', 'Hierro', 'Estaño');
q('Química', 3, '¿Qué mide la escala de pH?', 'Mide la acidez o alcalinidad de una sustancia.', 'La acidez o alcalinidad', 'La temperatura', 'La densidad', 'La presión');
q('Química', 4, '¿Qué elemento es la base de la química orgánica y de la vida?', 'El carbono forma las moléculas de la vida.', 'Carbono', 'Oxígeno', 'Silicio', 'Nitrógeno');
q('Química', 5, '¿Quién organizó la primera tabla periódica moderna?', 'Dmitri Mendeléyev, en 1869.', 'Dmitri Mendeléyev', 'Antoine Lavoisier', 'Marie Curie', 'John Dalton');
tf('Química', 2, 'El diamante y el grafito están hechos del mismo elemento.', 'Ambos son carbono puro con distinta estructura.', true);

// -------- Biología --------
q('Biología', 1, '¿Cuántos pulmones tiene el ser humano?', 'Tenemos dos pulmones.', '2', '1', '3', '4');
q('Biología', 2, '¿Cuál es el órgano más grande del cuerpo humano?', 'La piel es el órgano más extenso.', 'La piel', 'El hígado', 'El intestino', 'El corazón');
q('Biología', 2, '¿Qué parte de la planta realiza principalmente la fotosíntesis?', 'Las hojas captan la luz para la fotosíntesis.', 'Las hojas', 'Las raíces', 'El tallo', 'Las flores');
q('Biología', 3, '¿Cuántos huesos tiene aproximadamente un adulto humano?', 'El cuerpo adulto tiene unos 206 huesos.', '206', '300', '150', '250');
q('Biología', 3, '¿Cómo se llaman los animales que comen solo plantas?', 'Se los llama herbívoros.', 'Herbívoros', 'Carnívoros', 'Omnívoros', 'Insectívoros');
q('Biología', 4, '¿Qué científico propuso la evolución por selección natural?', 'Charles Darwin, en "El origen de las especies" (1859).', 'Charles Darwin', 'Gregor Mendel', 'Louis Pasteur', 'Alexander Fleming');
q('Biología', 4, '¿Cuál es la unidad básica de la vida?', 'La célula es la unidad básica de todo ser vivo.', 'La célula', 'El átomo', 'El tejido', 'El órgano');
q('Biología', 5, '¿En qué orgánulo se produce la mayor parte de la energía celular (ATP)?', 'Las mitocondrias son la "central energética" de la célula.', 'Las mitocondrias', 'El núcleo', 'Los ribosomas', 'El aparato de Golgi');
tf('Biología', 2, 'El corazón humano tiene cuatro cavidades.', 'Dos aurículas y dos ventrículos.', true);

// -------- Astronomía --------
q('Astronomía', 1, '¿Alrededor de qué gira la Tierra?', 'La Tierra orbita alrededor del Sol.', 'El Sol', 'La Luna', 'Marte', 'La Vía Láctea');
q('Astronomía', 1, '¿Cuál es el satélite natural de la Tierra?', 'La Luna es el único satélite natural de la Tierra.', 'La Luna', 'Fobos', 'Titán', 'Europa');
q('Astronomía', 2, '¿Cuál es el planeta más cercano al Sol?', 'Mercurio es el planeta más próximo al Sol.', 'Mercurio', 'Venus', 'La Tierra', 'Marte');
q('Astronomía', 3, '¿Cuántos planetas tiene el Sistema Solar?', 'Ocho, desde que Plutón pasó a planeta enano en 2006.', '8', '9', '7', '10');
q('Astronomía', 3, '¿Qué planeta tiene los anillos más visibles?', 'Saturno es famoso por sus anillos.', 'Saturno', 'Júpiter', 'Urano', 'Neptuno');
q('Astronomía', 4, '¿Quién fue la primera persona en pisar la Luna?', 'Neil Armstrong, el 20 de julio de 1969.', 'Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins');
q('Astronomía', 5, '¿Qué telescopio espacial, lanzado en 2021, sucedió al Hubble como el más potente?', 'El telescopio James Webb observa en infrarrojo.', 'James Webb', 'Kepler', 'Spitzer', 'Chandra');
tf('Astronomía', 2, 'El Sol es una estrella.', 'El Sol es una estrella enana amarilla.', true);

// -------- Literatura --------
q('Literatura', 1, '¿Quién escribió "Romeo y Julieta"?', 'La tragedia es de William Shakespeare.', 'William Shakespeare', 'Charles Dickens', 'Oscar Wilde', 'Edgar Allan Poe');
q('Literatura', 2, '¿Quién escribió "La Odisea"?', 'Se atribuye a Homero, poeta de la antigua Grecia.', 'Homero', 'Virgilio', 'Sófocles', 'Platón');
q('Literatura', 3, '¿Qué autor argentino escribió "Ficciones"?', 'Jorge Luis Borges publicó "Ficciones" en 1944.', 'Jorge Luis Borges', 'Julio Cortázar', 'Ernesto Sabato', 'Adolfo Bioy Casares');
q('Literatura', 3, '¿Cómo se llama el mago protagonista de la saga de J. K. Rowling?', 'Harry Potter es el joven mago de la saga.', 'Harry Potter', 'Frodo Bolsón', 'Gandalf', 'Percy Jackson');
q('Literatura', 4, '¿Quién escribió "La Divina Comedia"?', 'Dante Alighieri la escribió en el siglo XIV.', 'Dante Alighieri', 'Petrarca', 'Boccaccio', 'Maquiavelo');
q('Literatura', 4, '¿Qué poeta chileno ganó el Nobel de Literatura en 1971?', 'Pablo Neruda recibió el Nobel en 1971.', 'Pablo Neruda', 'Gabriela Mistral', 'Octavio Paz', 'César Vallejo');
q('Literatura', 5, '¿Quién escribió "En busca del tiempo perdido"?', 'Marcel Proust, en siete volúmenes.', 'Marcel Proust', 'James Joyce', 'Franz Kafka', 'Fiódor Dostoyevski');
tf('Literatura', 3, 'Gabriel García Márquez era colombiano.', 'Nació en Aracataca, Colombia, en 1927.', true);

// -------- Arte --------
q('Arte', 2, '¿Quién esculpió el "David" de mármol?', 'Miguel Ángel lo esculpió entre 1501 y 1504.', 'Miguel Ángel', 'Donatello', 'Bernini', 'Rodin');
q('Arte', 2, '¿Qué color resulta de mezclar azul y amarillo?', 'La mezcla de azul y amarillo da verde.', 'Verde', 'Naranja', 'Violeta', 'Marrón');
q('Arte', 3, '¿Qué artista español cofundó el cubismo?', 'Pablo Picasso, junto a Georges Braque.', 'Pablo Picasso', 'Salvador Dalí', 'Joan Miró', 'Francisco Goya');
q('Arte', 3, '¿En qué museo de París se exhibe la Mona Lisa?', 'La Mona Lisa está en el Museo del Louvre.', 'El Louvre', 'El Prado', 'El Reina Sofía', 'El MoMA');
q('Arte', 4, '¿Qué pintor neerlandés pintó "La joven de la perla"?', 'Johannes Vermeer la pintó hacia 1665.', 'Johannes Vermeer', 'Rembrandt', 'Van Gogh', 'Rubens');
q('Arte', 4, '¿A qué corriente artística pertenece Claude Monet?', 'Monet fue un maestro del impresionismo.', 'Impresionismo', 'Cubismo', 'Surrealismo', 'Barroco');
q('Arte', 5, '¿Quién pintó el techo de la Capilla Sixtina?', 'Miguel Ángel, entre 1508 y 1512.', 'Miguel Ángel', 'Rafael', 'Leonardo da Vinci', 'Botticelli');
tf('Arte', 2, 'Vincent van Gogh vendió muy pocos cuadros mientras vivió.', 'Su fama llegó tras su muerte; en vida vendió muy poco.', true);

// -------- Música --------
q('Música', 1, '¿Qué instrumento tiene teclas blancas y negras?', 'El piano combina teclas blancas y negras.', 'El piano', 'La guitarra', 'El violín', 'La flauta');
q('Música', 2, '¿Cuántas cuerdas tiene un violín?', 'El violín tiene cuatro cuerdas.', '4', '6', '5', '3');
q('Música', 3, '¿De qué país eran los Beatles?', 'Eran de Liverpool, Reino Unido.', 'Reino Unido', 'Estados Unidos', 'Australia', 'Irlanda');
q('Música', 3, '¿Cómo se llama la voz masculina más aguda?', 'La voz de tenor es la más aguda entre las masculinas.', 'Tenor', 'Bajo', 'Barítono', 'Contralto');
q('Música', 4, '¿Qué compositor austríaco escribió "La flauta mágica"?', 'Wolfgang Amadeus Mozart la estrenó en 1791.', 'Mozart', 'Beethoven', 'Haydn', 'Strauss');
q('Música', 4, '¿Qué cantante es conocido como el "Rey del Pop"?', 'Michael Jackson recibió ese apodo.', 'Michael Jackson', 'Elvis Presley', 'Prince', 'Freddie Mercury');
q('Música', 5, '¿Cuántas sinfonías completó Beethoven?', 'Beethoven completó nueve sinfonías.', '9', '5', '7', '12');
tf('Música', 2, 'La guitarra eléctrica necesita un amplificador para sonar fuerte.', 'Sus pastillas requieren amplificación para proyectar el sonido.', true);

// -------- Cine --------
q('Cine', 1, '¿Cómo se llama el ratón más famoso de Disney?', 'Mickey Mouse debutó en 1928.', 'Mickey Mouse', 'Jerry', 'Stuart Little', 'Speedy González');
q('Cine', 2, '¿En qué saga aparece el personaje Darth Vader?', 'Darth Vader es de Star Wars.', 'Star Wars', 'Star Trek', 'Matrix', 'Dune');
q('Cine', 2, '¿Qué estudio de animación creó "Toy Story"?', 'Pixar la estrenó en 1995.', 'Pixar', 'DreamWorks', 'Warner', 'Universal');
q('Cine', 3, '¿Quién dirigió "Pulp Fiction"?', 'Quentin Tarantino la dirigió en 1994.', 'Quentin Tarantino', 'Martin Scorsese', 'Steven Spielberg', 'Los hermanos Coen');
q('Cine', 3, '¿En qué saga aparece el personaje Jack Sparrow?', 'Jack Sparrow es de "Piratas del Caribe".', 'Piratas del Caribe', 'El señor de los anillos', 'Indiana Jones', 'Mad Max');
q('Cine', 4, '¿Quién dirigió "El Padrino"?', 'Francis Ford Coppola la dirigió en 1972.', 'Francis Ford Coppola', 'Martin Scorsese', 'Brian De Palma', 'Sergio Leone');
q('Cine', 5, '¿Qué película surcoreana ganó el Óscar a Mejor Película en 2020?', '"Parásitos", de Bong Joon-ho, fue la primera en habla no inglesa en lograrlo.', 'Parásitos', '1917', 'Joker', 'Roma');
tf('Cine', 2, '"El Rey León" es una película animada de Disney.', 'Se estrenó en 1994 y es un clásico de Disney.', true);

// -------- Videojuegos --------
q('Videojuegos', 2, '¿Qué compañía creó la consola PlayStation?', 'PlayStation es de Sony.', 'Sony', 'Microsoft', 'Nintendo', 'Sega');
q('Videojuegos', 2, '¿Cómo se llama el erizo azul mascota de Sega?', 'Sonic es la mascota de Sega.', 'Sonic', 'Tails', 'Knuckles', 'Crash');
q('Videojuegos', 3, '¿En qué juego construís y explorás mundos hechos de bloques?', 'Minecraft es el famoso juego de bloques.', 'Minecraft', 'Fortnite', 'Roblox', 'Terraria');
q('Videojuegos', 3, '¿Qué compañía creó la consola Xbox?', 'Xbox es de Microsoft.', 'Microsoft', 'Sony', 'Nintendo', 'Atari');
q('Videojuegos', 4, '¿Cómo se llama la princesa que suele rescatar Mario?', 'La princesa Peach del Reino Champiñón.', 'La princesa Peach', 'Zelda', 'Daisy', 'Rosalina');
q('Videojuegos', 4, '¿Qué juego de battle royale lanzó Epic Games en 2017?', 'Fortnite popularizó el género battle royale.', 'Fortnite', 'PUBG', 'Apex Legends', 'Warzone');
q('Videojuegos', 5, '¿Qué videojuego arcade de comer puntos se lanzó en 1980?', 'Pac-Man se convirtió en un ícono de los arcades.', 'Pac-Man', 'Space Invaders', 'Donkey Kong', 'Tetris');
tf('Videojuegos', 2, 'Tetris fue creado por un programador soviético.', 'Alekséi Pázhitnov lo creó en 1984 en la URSS.', true);

// -------- Gastronomía --------
q('Gastronomía', 2, '¿De qué país es originario el sushi?', 'El sushi proviene de Japón.', 'Japón', 'China', 'Corea', 'Tailandia');
q('Gastronomía', 2, '¿Cuál es el ingrediente principal del pan?', 'El pan se hace principalmente con harina.', 'La harina', 'El azúcar', 'El arroz', 'La papa');
q('Gastronomía', 3, '¿Qué fruta se usa para elaborar el vino?', 'El vino se hace fermentando uvas.', 'La uva', 'La manzana', 'La pera', 'La ciruela');
q('Gastronomía', 3, '¿De qué país es originario el croissant tal como lo conocemos?', 'Se popularizó en Francia, inspirado en el kipferl austríaco.', 'Francia', 'Italia', 'España', 'Alemania');
q('Gastronomía', 4, '¿De qué país es típico el plato "paella"?', 'La paella es originaria de Valencia, España.', 'España', 'México', 'Portugal', 'Italia');
q('Gastronomía', 4, '¿Qué bebida se obtiene tostando y moliendo granos para luego infusionarlos?', 'El café se prepara con granos tostados y molidos.', 'El café', 'El té', 'El mate', 'El cacao');
q('Gastronomía', 5, '¿Qué hongo comestible es de los más caros y se busca con cerdos o perros?', 'La trufa es un hongo subterráneo muy cotizado.', 'La trufa', 'El champiñón', 'El shiitake', 'El portobello');
tf('Gastronomía', 2, 'El tomate es botánicamente una fruta.', 'Al provenir de la flor y tener semillas, es una fruta.', true);

// -------- Animales --------
q('Animales', 1, '¿Cuál es el animal más grande del mundo?', 'La ballena azul puede superar los 30 metros.', 'La ballena azul', 'El elefante', 'La jirafa', 'El tiburón blanco');
q('Animales', 2, '¿Qué insecto produce miel?', 'Las abejas producen miel.', 'La abeja', 'La avispa', 'La hormiga', 'La mosca');
q('Animales', 2, '¿Cuántas patas tiene un insecto?', 'Los insectos tienen seis patas.', '6', '8', '4', '10');
q('Animales', 3, '¿Cuál es el mamífero terrestre más alto?', 'La jirafa alcanza casi 6 metros de altura.', 'La jirafa', 'El elefante', 'El oso polar', 'El camello');
q('Animales', 3, '¿Qué ave no vuela pero corre a gran velocidad?', 'El avestruz corre hasta 70 km/h.', 'El avestruz', 'El águila', 'El colibrí', 'El halcón');
q('Animales', 4, '¿Cómo se llama un grupo de leones?', 'Un grupo de leones se llama manada.', 'Manada', 'Bandada', 'Cardumen', 'Enjambre');
q('Animales', 5, '¿Cuál es el único mamífero capaz de volar realmente?', 'El murciélago vuela de forma activa; otros solo planean.', 'El murciélago', 'La ardilla voladora', 'El colugo', 'El petauro');
tf('Animales', 2, 'Los murciélagos son ciegos.', 'Falso: ven y además se orientan por ecolocalización.', false);

// -------- Naturaleza --------
q('Naturaleza', 1, '¿Qué necesitan las plantas, además de agua y aire, para crecer?', 'Necesitan luz solar para la fotosíntesis.', 'Luz solar', 'Oscuridad', 'Sal', 'Plástico');
q('Naturaleza', 2, '¿Qué capa de la atmósfera nos protege de los rayos ultravioleta?', 'La capa de ozono filtra la radiación UV.', 'La capa de ozono', 'La troposfera', 'La ionosfera', 'La mesosfera');
q('Naturaleza', 3, '¿Cómo se llama un temblor de la corteza terrestre?', 'Un terremoto o sismo.', 'Terremoto', 'Tsunami', 'Huracán', 'Tornado');
q('Naturaleza', 3, '¿Qué gas absorben las plantas del aire para la fotosíntesis?', 'Absorben dióxido de carbono (CO₂).', 'Dióxido de carbono', 'Oxígeno', 'Nitrógeno', 'Hidrógeno');
q('Naturaleza', 4, '¿Qué escala mide la magnitud de los terremotos?', 'La escala de Richter (y la de magnitud de momento).', 'Escala de Richter', 'Escala Celsius', 'Escala Beaufort', 'Escala Kelvin');
q('Naturaleza', 5, '¿Cuál es la mayor barrera de coral del mundo?', 'La Gran Barrera de Coral, en Australia.', 'La Gran Barrera de Coral', 'El arrecife de Belice', 'Las Maldivas', 'El Mar Rojo');
tf('Naturaleza', 2, 'Un año luz es una unidad de distancia.', 'Mide la distancia que recorre la luz en un año, no tiempo.', true);

// -------- Cultura General --------
q('Cultura General', 1, '¿Cuántos minutos tiene una hora?', 'Una hora tiene 60 minutos.', '60', '100', '30', '90');
q('Cultura General', 1, '¿De qué color es el cielo despejado durante el día?', 'El cielo diurno despejado se ve azul.', 'Azul', 'Verde', 'Rojo', 'Amarillo');
q('Cultura General', 2, '¿En qué planeta vivimos?', 'Vivimos en el planeta Tierra.', 'La Tierra', 'Marte', 'Venus', 'Júpiter');
q('Cultura General', 2, '¿Cuántos lados tiene un hexágono?', 'El hexágono tiene seis lados.', '6', '5', '7', '8');
q('Cultura General', 3, '¿En qué país están las pirámides de Giza?', 'Las pirámides de Giza están en Egipto.', 'Egipto', 'México', 'Perú', 'India');
q('Cultura General', 3, '¿Cuál es el metal precioso cuyo símbolo es "Ag"?', 'Ag corresponde a la plata (del latín argentum).', 'La plata', 'El oro', 'El platino', 'El cobre');
q('Cultura General', 4, '¿Cuántos colores tiene la bandera de Francia?', 'La bandera francesa es tricolor: azul, blanco y rojo.', '3', '2', '4', '5');
q('Cultura General', 5, '¿En qué año llegó el ser humano a la Luna por primera vez?', 'En 1969, con la misión Apolo 11.', '1969', '1959', '1972', '1981');
tf('Cultura General', 2, 'Un triángulo equilátero tiene sus tres lados iguales.', 'También tiene sus tres ángulos iguales, de 60°.', true);

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
