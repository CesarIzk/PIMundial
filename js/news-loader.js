// js/news-loader.js

async function loadNews() {
  const container = document.getElementById('news-container-dynamic');
  try {
    // Llama a la función serverless que lee las noticias desde Firebase
    const response = await fetch('/.netlify/functions/get-news');
    if (!response.ok) throw new Error('No se pudieron cargar las noticias.');
    
    const newsItems = await response.json();
    
    if (newsItems.length === 0) {
      container.innerHTML = '<p>No hay noticias por el momento.</p>';
      return;
    }

    // Limpia el mensaje de "Cargando..."
    container.innerHTML = ''; 

    // Crea el HTML para cada noticia y lo añade al contenedor
    newsItems.forEach(item => {
      // --- INICIO DE LA MODIFICACIÓN ---

     const imageUrl = item.urlToImage || 'images/placeholder-news.jpg';
const sourceName = item.source.name || 'Fuente Desconocida';
// Formateamos la fecha para que sea más legible
const articleDate = new Date(item.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

const articleHTML = `
  <article class="news-item">
      <div class="news-image-container">
          <img src="${imageUrl}" alt="${item.titulo || 'Imagen de noticia'}" class="news-thumbnail">
      </div>
      <div class="news-content">
          <div class="news-meta"> <span>${sourceName}</span>
              <span>•</span>
              <time datetime="${item.publishedAt}">${articleDate}</time>
          </div>
          <h3>${item.titulo}</h3>
          <p>${item.resumen}</p>
          ${item.enlace ? `<a href="${item.enlace}" target="_blank" rel="noopener noreferrer">Leer más</a>` : ''}
      </div>
  </article>
      `;
      // --- FIN DE LA MODIFICACIÓN ---

      container.innerHTML += articleHTML;
    });
  } catch (error) {
    container.innerHTML = `<p>${error.message}</p>`;
  }
}

// Ejecuta la función cuando el contenido de la página se haya cargado
document.addEventListener('DOMContentLoaded', loadNews);