// --- 1. CONFIGURACIÓN DE LA FECHA OBJETIVO ---
// Establece la fecha y hora del partido inaugural del Mundial 2026.
// Formato: "Mes día, año hh:mm:ss"
// Puedes ajustar esta fecha a la que necesites.
const countdownDate = new Date("June 11, 2026 12:00:00").getTime();

// --- 2. ELEMENTOS DEL HTML ---
// Obtenemos los 'span' donde mostraremos los números.
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const countdownContainer = document.getElementById("countdown-timer");

// --- 3. FUNCIÓN DE ACTUALIZACIÓN ---
// Actualizamos el contador cada segundo.
const interval = setInterval(function() {

  // Obtenemos la fecha y hora actual.
  const now = new Date().getTime();

  // Calculamos la distancia entre la fecha objetivo y la actual.
  const distance = countdownDate - now;

  // Si el tiempo ya se cumplió...
  if (distance < 0) {
    clearInterval(interval); // Detenemos el intervalo.
    countdownContainer.innerHTML = "¡EL MUNDIAL HA COMENZADO!"; // Mostramos un mensaje.
    return; // Salimos de la función.
  }

  // Calculamos los días, horas, minutos y segundos restantes.
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Mostramos los resultados en el HTML.
  // Usamos 'padStart' para asegurarnos de que siempre tengan dos dígitos (ej. 09, 08, 07...).
  daysEl.innerHTML = days;
  hoursEl.innerHTML = String(hours).padStart(2, '0');
  minutesEl.innerHTML = String(minutes).padStart(2, '0');
  secondsEl.innerHTML = String(seconds).padStart(2, '0');

}, 1000); // 1000 milisegundos = 1 segundo.