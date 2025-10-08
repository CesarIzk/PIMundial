// js/news-loader.js

async function loadNews() {
  const container = document.getElementById('news-container-dynamic');
  try {
    // Llama a la función serverless que lee las noticias desde Supabase
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
      const articleHTML = `
        <article class="news-item">
            <h3>${item.titulo}</h3>
            <p>${item.resumen}</p>
            ${item.enlace ? `<a href="${item.enlace}" target="_blank" rel="noopener noreferrer">Leer más</a>` : ''}
        </article>
      `;
      container.innerHTML += articleHTML;
    });
  } catch (error) {
    container.innerHTML = `<p>${error.message}</p>`;
  }
}

// Ejecuta la función cuando el contenido de la página se haya cargado
document.addEventListener('DOMContentLoaded', loadNews);