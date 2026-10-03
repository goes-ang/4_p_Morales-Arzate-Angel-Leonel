/**
 * =============================================================================
 * SCRIPT: js/app.js
 * CONSULTA DE RAZAS DE PERROS - THE DOG API - JAVASCRIPT NATIVO
 *
 * Copyright (c) [2025] [René Peña Martínez].
 * Licensed under CC BY 4.0.
 *
 * CORRECCIONES PRINCIPALES:
 * 1. La URL base tenía un espacio al inicio y apuntaba a /images/search;
 *    al concatenar "/breeds/search" quedaba una ruta inexistente (error 404).
 *    Ahora se usa https://api.thedogapi.com/v1 + /breeds.
 * 2. /breeds/search NO devuelve la imagen de la raza. /breeds sí la incluye
 *    (image.url), además de temperamento, altura y peso.
 * 3. Se descarga el catálogo una sola vez y se filtra en el navegador,
 *    lo que permite clasificar por TAMAÑO y TEMPERAMENTO sin más peticiones.
 * =============================================================================
 */


/* ==========================================================================
   1. CONFIGURACIÓN DE THE DOG API
   ========================================================================== */

const DOG_API_BASE_URL = 'https://api.thedogapi.com/v1';

const DOG_API_KEY =
  'live_3lhZeLlfxBjTcdjXWLXdm0D18lEeoTIEZvseADovc7GbmaqJXkkXS5NxFGtohAgE';

const BREEDS_ENDPOINT = `${DOG_API_BASE_URL}/breeds`;


/* ==========================================================================
   2. REFERENCIAS A LOS ELEMENTOS DE LA INTERFAZ
   ========================================================================== */

const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const queryPreviewText = document.getElementById('queryPreviewText');
const apiEndpointUrl = document.getElementById('apiEndpointUrl');
const statusContainer = document.getElementById('statusContainer');
const statusMessage = document.getElementById('statusMessage');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const quickOptions = document.getElementById('quickOptions');

const sizeFilter = document.getElementById('sizeFilter');
const temperamentFilter = document.getElementById('temperamentFilter');

const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalTemperament = document.getElementById('modalTemperament');
const modalSize = document.getElementById('modalSize');
const modalHeight = document.getElementById('modalHeight');
const modalWeight = document.getElementById('modalWeight');
const modalOrigin = document.getElementById('modalOrigin');
const modalGroup = document.getElementById('modalGroup');
const closeModalBtn = document.getElementById('closeModalBtn');


/* ==========================================================================
   3. ESTADO
   ========================================================================== */

let allBreeds = [];        // catálogo completo descargado de la API
let currentResults = [];   // resultados visibles (después de filtrar)


/* ==========================================================================
   4. TRADUCCIONES (temperamentos y nombres comunes en español)
   ========================================================================== */

const TEMPERAMENTOS_ES = {
  'active': 'Activo', 'adaptable': 'Adaptable', 'adventurous': 'Aventurero',
  'affectionate': 'Cariñoso', 'agile': 'Ágil', 'aggressive': 'Agresivo',
  'alert': 'Alerta', 'aloof': 'Distante', 'amiable': 'Amable',
  'assertive': 'Asertivo', 'attentive': 'Atento', 'bold': 'Audaz',
  'boisterous': 'Bullicioso', 'brave': 'Valiente', 'bright': 'Brillante',
  'calm': 'Tranquilo', 'charming': 'Encantador', 'cheerful': 'Alegre',
  'clever': 'Astuto', 'clownish': 'Payaso', 'companionable': 'Compañero',
  'confident': 'Seguro', 'cooperative': 'Cooperativo', 'courageous': 'Valeroso',
  'cunning': 'Astuto', 'curious': 'Curioso', 'deliberate': 'Deliberado',
  'determined': 'Determinado', 'devoted': 'Devoto', 'dignified': 'Digno',
  'docile': 'Dócil', 'dominant': 'Dominante', 'easygoing': 'Relajado',
  'eager': 'Entusiasta', 'energetic': 'Enérgico', 'even tempered': 'Equilibrado',
  'excitable': 'Excitable', 'faithful': 'Fiel', 'fearless': 'Intrépido',
  'fierce': 'Feroz', 'friendly': 'Amistoso', 'fun-loving': 'Divertido',
  'gentle': 'Gentil', 'good-natured': 'De buen carácter', 'happy': 'Feliz',
  'hardworking': 'Trabajador', 'hardy': 'Resistente', 'independent': 'Independiente',
  'intelligent': 'Inteligente', 'kind': 'Bondadoso', 'lively': 'Vivaz',
  'loving': 'Amoroso', 'loyal': 'Leal', 'merry': 'Jovial',
  'mischievous': 'Travieso', 'noble': 'Noble', 'obedient': 'Obediente',
  'outgoing': 'Extrovertido', 'patient': 'Paciente', 'peaceful': 'Pacífico',
  'playful': 'Juguetón', 'powerful': 'Poderoso', 'protective': 'Protector',
  'proud': 'Orgulloso', 'quick': 'Rápido', 'quiet': 'Callado',
  'receptive': 'Receptivo', 'reserved': 'Reservado', 'responsive': 'Receptivo',
  'rugged': 'Robusto', 'self-confident': 'Autoconfiado', 'sensitive': 'Sensible',
  'smart': 'Listo', 'sociable': 'Sociable', 'spirited': 'Animoso',
  'stable': 'Estable', 'steady': 'Constante', 'strong willed': 'Voluntarioso',
  'stubborn': 'Terco', 'sweet': 'Dulce', 'tenacious': 'Tenaz',
  'territorial': 'Territorial', 'tolerant': 'Tolerante', 'trainable': 'Entrenable',
  'trusting': 'Confiado', 'vivacious': 'Vivaz', 'watchful': 'Vigilante',
  'wild': 'Salvaje', 'willful': 'Obstinado', 'wilful': 'Obstinado',
  'reliable': 'Confiable', 'composed': 'Sereno', 'dutiful': 'Cumplidor',
  'refined': 'Refinado', 'inquisitive': 'Inquisitivo', 'thoughtful': 'Reflexivo',
  'spunky': 'Brioso', 'rowdy': 'Alborotador', 'opinionated': 'Opinionado',
  'self-assured': 'Seguro de sí', 'cautious': 'Cauteloso', 'keen': 'Perspicaz',
  'joyful': 'Alegre', 'fun': 'Divertido', 'excellent': 'Excelente',
  'vocal': 'Vocal', 'familial': 'Familiar'
};

/* Nombres en español -> nombre en inglés que usa la API. */
const ALIAS_RAZAS = {
  'pastor aleman': 'german shepherd',
  'pastor alemán': 'german shepherd',
  'caniche': 'poodle',
  'salchicha': 'dachshund',
  'dalmata': 'dalmatian',
  'dálmata': 'dalmatian',
  'pug': 'pug',
  'perro lobo': 'wolf',
  'mastin': 'mastiff',
  'mastín': 'mastiff'
};

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function traducirTemperamento(t) {
  const clave = t.trim().toLowerCase();
  return TEMPERAMENTOS_ES[clave] || t.trim();
}

function obtenerTemperamentos(dog) {
  if (!dog.temperament) {
    return [];
  }
  return dog.temperament
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}


/* ==========================================================================
   5. ACTUALIZAR VISTA PREVIA
   ========================================================================== */

function actualizarVistaPreviaQuery(query) {
  const cleanQuery = query.trim() || 'todas las razas';
  queryPreviewText.textContent = `"${cleanQuery}"`;
  apiEndpointUrl.textContent = BREEDS_ENDPOINT;
}


/* ==========================================================================
   6. DESCARGAR EL CATÁLOGO DE RAZAS (UNA SOLA VEZ)
   ========================================================================== */

async function cargarRazas() {

  if (allBreeds.length > 0) {
    return allBreeds;
  }

  mostrarCargando(true, 'Conectando con The Dog API...');

  console.log('Endpoint:', BREEDS_ENDPOINT);

  const response = await fetch(BREEDS_ENDPOINT, {
    method: 'GET',
    headers: {
      'x-api-key': DOG_API_KEY,
      'Accept': 'application/json'
    }
  });

  console.log('Código HTTP:', response.status);

  if (!response.ok) {
    let detalle = '';
    try {
      detalle = await response.text();
    } catch (e) {
      detalle = 'No se recibió información adicional.';
    }
    throw new Error(`HTTP ${response.status}: ${detalle}`);
  }

  const json = await response.json();

  if (!Array.isArray(json)) {
    throw new Error('La API devolvió un formato inesperado.');
  }

  allBreeds = json;
  llenarFiltroTemperamento(allBreeds);

  console.log(`Razas recibidas: ${allBreeds.length}`);

  return allBreeds;
}


/* ==========================================================================
   7. LLENAR EL FILTRO DE TEMPERAMENTO CON LOS DATOS REALES
   ========================================================================== */

function llenarFiltroTemperamento(breeds) {

  const mapa = new Map(); // clave inglés -> etiqueta español

  breeds.forEach(dog => {
    obtenerTemperamentos(dog).forEach(t => {
      mapa.set(t.toLowerCase(), traducirTemperamento(t));
    });
  });

  const ordenados = [...mapa.entries()].sort(
    (a, b) => a[1].localeCompare(b[1], 'es')
  );

  temperamentFilter.innerHTML =
    '<option value="">Todos los temperamentos</option>';

  ordenados.forEach(([clave, etiqueta]) => {
    const option = document.createElement('option');
    option.value = clave;
    option.textContent = etiqueta;
    temperamentFilter.appendChild(option);
  });
}


/* ==========================================================================
   8. CLASIFICACIÓN POR TAMAÑO
   ========================================================================== */

function extraerMaximo(texto) {
  if (!texto) {
    return null;
  }
  const numeros = String(texto).match(/\d+(\.\d+)?/g);
  if (!numeros) {
    return null;
  }
  return Math.max(...numeros.map(Number));
}

/*
 * Se clasifica por PESO máximo (más confiable en esta API).
 * Si no hay peso, se usa la altura máxima.
 *   Pequeño: hasta 10 kg   | Mediano: hasta 25 kg
 *   Grande:  hasta 40 kg   | Gigante: más de 40 kg
 */
function calcularTamano(dog) {

  const peso = extraerMaximo(dog.weight && dog.weight.metric);

  if (peso !== null) {
    if (peso <= 10) return 'Pequeño';
    if (peso <= 25) return 'Mediano';
    if (peso <= 40) return 'Grande';
    return 'Gigante';
  }

  const altura = extraerMaximo(dog.height && dog.height.metric);

  if (altura !== null) {
    if (altura <= 30) return 'Pequeño';
    if (altura <= 50) return 'Mediano';
    if (altura <= 65) return 'Grande';
    return 'Gigante';
  }

  return 'No especificado';
}

function claseTamano(size) {
  const mapa = {
    'Pequeño': 'size-pequeno',
    'Mediano': 'size-mediano',
    'Grande': 'size-grande',
    'Gigante': 'size-gigante'
  };
  return mapa[size] || 'size-na';
}


/* ==========================================================================
   9. APLICAR BÚSQUEDA + FILTROS
   ========================================================================== */

function aplicarFiltros() {

  let texto = normalizar(queryInput.value);

  if (ALIAS_RAZAS[texto]) {
    texto = ALIAS_RAZAS[texto];
  }

  const tamanoElegido = sizeFilter.value;
  const temperamentoElegido = temperamentFilter.value;

  const palabras = texto.split(/\s+/).filter(Boolean);

  const filtrados = allBreeds.filter(dog => {

    const nombre = normalizar(dog.name);

    const coincideNombre =
      palabras.every(p => nombre.includes(p));

    const coincideTamano =
      !tamanoElegido || calcularTamano(dog) === tamanoElegido;

    const coincideTemperamento =
      !temperamentoElegido ||
      obtenerTemperamentos(dog).some(
        t => t.toLowerCase() === temperamentoElegido
      );

    return coincideNombre && coincideTamano && coincideTemperamento;
  });

  filtrados.sort((a, b) => a.name.localeCompare(b.name));

  currentResults = filtrados;
  mostrarResultados(filtrados, queryInput.value.trim());
}


/* ==========================================================================
   10. CONSULTAR THE DOG API
   ========================================================================== */

async function consultarDogApi() {

  resultsGrid.innerHTML = '';
  resultsCount.textContent = 'Conectando...';

  try {

    await cargarRazas();
    aplicarFiltros();

  } catch (error) {

    console.error('ERROR EN LA CONEXIÓN:', error);

    mostrarError(
      `No fue posible conectarse con The Dog API. ${error.message}`
    );

  } finally {

    mostrarCargando(false);

  }
}


/* ==========================================================================
   11. MOSTRAR RESULTADOS
   ========================================================================== */

function mostrarResultados(items, query) {

  resultsGrid.innerHTML = '';

  resultsCount.textContent =
    `${items.length} ${items.length === 1 ? 'perro encontrado' : 'perros encontrados'}`;

  if (items.length === 0) {

    const filtrosActivos =
      sizeFilter.value || temperamentFilter.value;

    resultsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px;
                  color: #4b5563; background: #f9fafb;
                  border: 1px solid #e5e7eb; border-radius: 4px;">
        <p>
          <strong>
            No se encontraron resultados${query ? ` para "${escaparHtml(query)}"` : ''}
          </strong>
        </p>
        <p style="margin-top: 6px; font-size: 13px;">
          ${filtrosActivos
            ? 'Pruebe quitando el nombre de la raza o alguno de los filtros.'
            : 'Intente con: Labrador, Husky, Poodle, Bulldog, Chihuahua o Golden Retriever.'}
        </p>
      </div>
    `;
    return;
  }

  items.forEach((dog, index) => crearTarjetaPerro(dog, index));
}


/* ==========================================================================
   12. URL DE LA IMAGEN
   ========================================================================== */

function obtenerImagen(dog) {

  if (dog.image && dog.image.url) {
    return dog.image.url;
  }

  if (dog.reference_image_id) {
    return `https://cdn2.thedogapi.com/images/${dog.reference_image_id}.jpg`;
  }

  return '';
}


/* ==========================================================================
   13. CREAR TARJETA DEL PERRO
   ========================================================================== */

function crearTarjetaPerro(dog, index) {

  const name = dog.name || 'Raza desconocida';
  const size = calcularTamano(dog);
  const imageUrl = obtenerImagen(dog);

  const height =
    dog.height && dog.height.metric
      ? `${dog.height.metric} cm`
      : 'No especificada';

  const weight =
    dog.weight && dog.weight.metric
      ? `${dog.weight.metric} kg`
      : 'No especificado';

  const temperamentos = obtenerTemperamentos(dog);

  const chipsHtml = temperamentos.length
    ? temperamentos
        .slice(0, 6)
        .map(t => `<span class="chip">${escaparHtml(traducirTemperamento(t))}</span>`)
        .join('')
    : '<span class="chip">No especificado</span>';

  const card = document.createElement('article');
  card.className = 'card-item';

  card.innerHTML = `
    <div class="card-image-box">
      ${imageUrl
        ? `<img src="${escaparHtml(imageUrl)}" alt="${escaparHtml(name)}" loading="lazy">`
        : '<div class="card-noimg">Sin imagen disponible</div>'}
      <span class="size-badge ${claseTamano(size)}">${escaparHtml(size)}</span>
    </div>

    <div class="card-body">
      <h3 class="card-title">${escaparHtml(name)}</h3>

      <div class="dog-info"><strong>Tamaño:</strong> ${escaparHtml(size)}</div>
      <div class="dog-info"><strong>Altura:</strong> ${escaparHtml(height)}</div>
      <div class="dog-info"><strong>Peso:</strong> ${escaparHtml(weight)}</div>

      <div class="temperament">
        <strong>Temperamento:</strong>
        <div class="chips">${chipsHtml}</div>
      </div>

      <div class="card-footer">
        <button type="button" class="btn-detail">Ver detalle completo</button>
      </div>
    </div>
  `;

  card.querySelector('.btn-detail')
    .addEventListener('click', () => abrirModal(index));

  const image = card.querySelector('img');

  if (image) {
    image.addEventListener('click', () => abrirModal(index));

    // Si la imagen falla (por ejemplo .jpg vs .png), se intenta con .png
    image.addEventListener('error', () => {
      if (!image.dataset.retry && dog.reference_image_id) {
        image.dataset.retry = '1';
        image.src =
          `https://cdn2.thedogapi.com/images/${dog.reference_image_id}.png`;
      } else {
        image.replaceWith(
          Object.assign(document.createElement('div'), {
            className: 'card-noimg',
            textContent: 'Sin imagen disponible'
          })
        );
      }
    }, { once: false });
  }

  resultsGrid.appendChild(card);
}


/* ==========================================================================
   14. MODAL
   ========================================================================== */

function abrirModal(index) {

  const dog = currentResults[index];

  if (!dog) {
    return;
  }

  modalTitle.textContent = dog.name || 'Raza de perro';

  const temps = obtenerTemperamentos(dog).map(traducirTemperamento);
  modalTemperament.textContent =
    temps.length ? temps.join(', ') : 'No especificado';

  modalSize.textContent = calcularTamano(dog);

  modalHeight.textContent =
    dog.height && dog.height.metric
      ? `${dog.height.metric} cm`
      : 'No especificada';

  modalWeight.textContent =
    dog.weight && dog.weight.metric
      ? `${dog.weight.metric} kg`
      : 'No especificado';

  modalOrigin.textContent = dog.origin || 'No especificado';

  modalGroup.textContent =
    dog.breed_group || dog.bred_for || 'No especificado';

  const imageUrl = obtenerImagen(dog);

  if (imageUrl) {
    modalImage.src = imageUrl;
  } else {
    modalImage.removeAttribute('src');
  }

  modalImage.alt = dog.name || 'Imagen del perro';

  if (typeof imageModal.showModal === 'function') {
    imageModal.showModal();
  } else {
    imageModal.setAttribute('open', 'true');
  }
}

closeModalBtn.addEventListener('click', () => {
  if (typeof imageModal.close === 'function') {
    imageModal.close();
  } else {
    imageModal.removeAttribute('open');
  }
});

imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal && typeof imageModal.close === 'function') {
    imageModal.close();
  }
});


/* ==========================================================================
   15. EVENTOS
   ========================================================================== */

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  actualizarVistaPreviaQuery(queryInput.value);
  consultarDogApi();
});

queryInput.addEventListener('input', () => {
  actualizarVistaPreviaQuery(queryInput.value);
});

// Los filtros actúan al instante, sin volver a pedir datos a la API.
// Al cambiar un filtro se limpia el nombre de la raza; si no, la búsqueda
// seguiría exigiendo ese nombre (por ejemplo "labrador") y no saldría nada.
function alCambiarFiltro() {

  if (!allBreeds.length) {
    return;
  }

  queryInput.value = '';

  document.querySelectorAll('.btn-category')
    .forEach(btn => btn.classList.remove('active'));

  actualizarVistaPreviaQuery('');
  aplicarFiltros();
}

sizeFilter.addEventListener('change', alCambiarFiltro);
temperamentFilter.addEventListener('change', alCambiarFiltro);

quickOptions.addEventListener('click', (event) => {

  const button = event.target.closest('.btn-category');

  if (!button) {
    return;
  }

  document.querySelectorAll('.btn-category')
    .forEach(btn => btn.classList.remove('active'));

  button.classList.add('active');

  const selectedQuery = button.getAttribute('data-query');

  queryInput.value = selectedQuery;

  // Al elegir una raza rápida se limpian los filtros para ver esa raza.
  sizeFilter.value = '';
  temperamentFilter.value = '';

  actualizarVistaPreviaQuery(selectedQuery);
  consultarDogApi();
});


/* ==========================================================================
   16. CARGANDO Y ERRORES
   ========================================================================== */

function mostrarCargando(isLoading, message = '') {

  statusContainer.style.display = isLoading ? 'block' : 'none';

  if (isLoading) {
    statusMessage.textContent = message;
  }
}

function mostrarError(errorMessage) {

  resultsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; background: #fef2f2;
                border: 1px solid #f87171; color: #991b1b;
                padding: 16px; border-radius: 4px; text-align: center;">
      <p><strong>Error en la conexión</strong></p>
      <p style="margin-top: 6px; font-size: 13px;">
        ${escaparHtml(errorMessage)}
      </p>
      <p style="margin-top: 10px; font-size: 12px;">
        Revise su API Key y la conexión a Internet.
      </p>
    </div>
  `;

  resultsCount.textContent = 'Error';
}


/* ==========================================================================
   17. ESCAPAR HTML
   ========================================================================== */

function escaparHtml(text) {

  if (!text) {
    return '';
  }

  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ==========================================================================
   18. INICIALIZACIÓN
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  actualizarVistaPreviaQuery(queryInput.value);
  consultarDogApi();
});