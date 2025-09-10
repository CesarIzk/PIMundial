document.addEventListener("DOMContentLoaded", () => {
  // Cargar el navbar en el contenedor
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;

      // Funcionalidad del hamburger
      const hamburger = document.getElementById('hamburger');
      const navLinks = document.getElementById('nav-links');

      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });

      // Cerrar menú al hacer clic en un enlace
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
      });
    });
});
