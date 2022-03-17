const listaImagenes = [
  "aubergine",
  "banana",
  "carrots",
  "cherries",
  "dollar",
  "lemon",
  "orange",
  "peach",
  "potato",
  "tomato",
];

// obtenemos las referencias a los elementos del DOM
const inputMonedas = document.getElementById("inputMonedas");
const formMonedas = document.getElementById("formMonedas");
const indicadorNumeroMonedas = document.getElementById(
  "indicadorNumeroMonedas"
);
const botonIntroducir = document.getElementById("botonIntroducir");
const botonSalir = document.getElementById("botonSalir");
const slot0 = document.getElementById("slot0");
const slot1 = document.getElementById("slot1");
const slot2 = document.getElementById("slot2");
const palanca = document.getElementById("palanca");
const imgPalanca = document.getElementById("imgPalanca");
const movimientos = document.getElementById("movimientos");

// variable donde almacenaremos el número de monedas en nuestro saldo
var numMonedas = 0;
console.log(numMonedas);
// en la casilla para introcucir monedas reflejaremos el valor anterior
inputMonedas.value = numMonedas;
// la palanca de juego está inicialmente hacia arriba
imgPalanca.src = "img/palancaUP.png";

console.log("indicadorNumeroMonedasInicial", numMonedas);
// este indicador refleja nuestro saldo actual
indicadorNumeroMonedas.textContent = numMonedas;

// añadimos listener a cada uno de los elementos con los que se puede
// interactuar que estarán ligados a sus funciones correspondientes
formMonedas.addEventListener("submit", addMonedas);
palanca.addEventListener("click", jugar);
botonSalir.addEventListener("click", salir);

function addMonedas(event) {
  // solo añadimos si el valor es positivo
  if (parseInt(inputMonedas.value) > 0) {
    numMonedas += parseInt(inputMonedas.value);
    console.log("Añadimos monedas", numMonedas);
    indicadorNumeroMonedas.textContent = numMonedas;
    // desabilitamos la posibilidad de introcir más monedas
    inputMonedas.value = 0;
    inputMonedas.disabled = true;
    botonIntroducir.disabled = true;
    // lo reflejamos en el historial
    addMovimiento("Has introducido monedas.");
  } else {
    console.log("valor 0 o nulo al introducir monedas");
  }
  event.preventDefault();
}

// utlizamos una funcion async para animar los slots
// se mostraran las imagenes hasta la que obtengamos
// como ganadora de forma aleatoria
async function slotAnimation(slot, listaImagenes) {
  // determinamos el elemento ganador
  const winner = (Math.random() * listaImagenes.length) | 0;

  // recorremos el array hasta llegar al winner estableciendo
  // un timeout para dar la sensacion de animacion
  for (let i = 0; i <= winner; i++) {
    console.log(listaImagenes[i], `img/${listaImagenes[i]}.png`);
    slot.src = `img/${listaImagenes[i]}.png`;
    // esperamos 0.2 segundos para dar la sensación de rotación
    await new Promise((r) => {
      setTimeout(r, 200);
    });
  }

  // devolvemos el elemento ganador
  return listaImagenes[winner];
}

function jugar(event) {
  // en primer lugar "movemos" la palanca hacia abajo y la deshabilitamos
  palanca.disabled = true;
  imgPalanca.src = "img/palancaDOWN.png";

  if (numMonedas < 1) {
    // si no tenemos saldo alertamos
    alert("Por favor, introduce monedas");
    // y volvemos a subir la palanca
    palanca.disabled = false;
    imgPalanca.src = "img/palancaUP.png";

    event.preventDefault();
    return;
  }

  // restamos una moneda y lo reflejamos
  numMonedas -= 1;
  indicadorNumeroMonedas.textContent = numMonedas;
  addMovimiento("Gastas una moneda.");

  // Construimos un array de tres elementos donde se habrán añadido
  // aleatoriamente las imagenes a cada uno de los slots devueltas
  // por la función async, para ello "esperamos la ejecución" de las
  // tres promesas, una vez que se han completado seguimos con la
  // ejecución del resto de la función a partir del "then"
  Promise.all([
    slotAnimation(slot0, listaImagenes),
    slotAnimation(slot1, listaImagenes),
    slotAnimation(slot2, listaImagenes),
  ]).then((tirada) => {
    console.log("tirada ====>", tirada);
    palanca.disabled = false;
    imgPalanca.src = "img/palancaUP.png";

    // El siguiente paso es crear un algoritmo que analice la tirada en
    // base a las siguientes reglas:
    //
    // Si sale una moneda ("dollar"), se gana una moneda.
    // Si salen dos monedas, se ganan cuatro monedas.
    // Si salen tres monedas, se ganan diez monedas.
    // Si salen dos hortalizas o frutas iguales, se ganan dos monedas.
    // Si salen tres hortalizas o frutas iguales, se ganan cinco monedas.
    // Si sale una moneda y dos hortalizas o frutas iguales, se ganan tres monedas

    // en primer creamos un objeto en el que cada una de las propiedas o keys
    // tenga como valor el numero de veces que aparece en el array
    // Ejem. Object { dollar: 2, orange: 1 }
    const slots = {};
    tirada.forEach(function (x) {
      slots[x] = (slots[x] || 0) + 1;
    });

    console.log(Object.entries(slots));

    // con esta variable mantendremos el valor de el resultado
    // obtenido con la tirada
    var monedasTirada = 0;

    // recorremos el objeto anterior descomponiendolo en key / value
    for (const [slot, repeticiones] of Object.entries(slots)) {
      // los unicos casos problematicos se procucen cuando una moneda se
      // repite una sola vez o cuando encontramos otros dos elementos que
      // no sean dollar repetidos 2 veces, ya que tendremos que contemplar
      // la posibilidad de que aparezcan conjuntamente.
      // para ello basta con añadir a la variable monedasTirada
      if (slot === "dollar") {
        if (repeticiones === 3) {
          monedasTirada = 10;
        } else if (repeticiones === 2) {
          monedasTirada = 4;
        } else {
          monedasTirada += 1;
        }
      } else {
        if (repeticiones === 3) {
          monedasTirada = 5;
        } else if (repeticiones === 2) {
          monedasTirada += 2;
        }
      }
      console.log(`------> [${slot}]: ${repeticiones}`);
    }

    console.log(`monedasTirada: ${monedasTirada}`);

    // Por ultimo montamos un switch para que quede mas limpio la
    // operación de añadir el movimiento
    // teniendo en cuenta que llegados ha este punto cada valor
    // solo puede llevar aparejado un mensaje.
    switch (monedasTirada) {
      case 1:
        addMovimiento("¡Una MONEDA! Ganas 1 moneda.");
        break;
      case 2:
        addMovimiento("¡Dos IGUALES! Ganas 2 monedas.");
        break;
      case 3:
        addMovimiento("¡Dos IGUALES y una MONEDA! Ganas 3 monedas.");
        break;
      case 4:
        addMovimiento("¡Dos MONEDAS! Ganas 4 monedas.");
        break;
      case 5:
        addMovimiento("¡Tres IGUALES! Ganas 5 monedas.");
        break;
      case 10:
        addMovimiento("¡Tres MONEDAS! Ganas 10 monedas.");
        break;
    }

    // finalmente sumamos las monedas obenidas a nuestra variable
    // que ontrola sel saldo y lo reflejamos
    numMonedas += monedasTirada;
    indicadorNumeroMonedas.textContent = numMonedas;

    // en caso de quedarnos sin monedas habilitamos el monedero
    if (numMonedas === 0) {
      inputMonedas.disabled = false;
      botonIntroducir.disabled = false;
    }
  });

  event.preventDefault();
}

function salir(event) {
  // añadimos el movimiento al historial y alertamos de nuestro premio
  console.log(`Has conseguido un total de ${numMonedas} monedas.`);
  alert(`Has conseguido un total de ${numMonedas} monedas.`);
  addMovimiento("Sacas todas monedas.");

  // nuestros saldo lo metemos en el input para introducir
  inputMonedas.value = numMonedas;
  // icinializamos el entorno
  numMonedas = 0;
  indicadorNumeroMonedas.textContent = numMonedas;
  inputMonedas.disabled = false;
  botonIntroducir.disabled = false;

  event.preventDefault();
}

// añadimos el moviento a la lista que contiene el hsitorial
function addMovimiento(movimiento) {
  movimientos
    .appendChild(document.createElement("li"))
    .appendChild(document.createTextNode(movimiento));
}
