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

      // Buscamos la URL de la imagen. NewsAPI la llama 'urlToImage'.
      // Si no existe, usamos una imagen de placeholder que debes crear.
      const imageUrl = item.urlToImage || 'images/placeholder-news.jpg';

      const articleHTML = `
        <article class="news-item">
            <div class="news-image-container">
                <img src="${imageUrl}" alt="${item.titulo || 'Imagen de noticia'}" class="news-thumbnail">
            </div>
            <div class="news-content">
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