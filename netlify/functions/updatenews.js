// netlify/functions/update-news.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const newsApiKey = process.env.NEWS_API_KEY;

exports.handler = async function(event, context) {
  console.log('Ejecutando actualización de noticias...');
  try {
    // 1. Llama a la API de noticias
    const query = 'Mundial 2026 OR "Copa del Mundo"';
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=es&sortBy=publishedAt&pageSize=5`;

    const newsResponse = await fetch(url, { headers: { 'X-Api-Key': newsApiKey } });
    if (!newsResponse.ok) throw new Error('Falló la llamada a NewsAPI');
    const newsData = await newsResponse.json();
    const articles = newsData.articles;

    // 2. Prepara los datos para Supabase
    const newsToInsert = articles.map(article => ({
      titulo: article.title,
      resumen: article.description || 'No hay resumen.',
      enlace: article.url,
    }));

    // 3. Borra las noticias viejas de nuestra tabla
    await supabase.from('noticias').delete().neq('id', 0); // Borra todas las filas

    // 4. Inserta las noticias nuevas
    const { error } = await supabase.from('noticias').insert(newsToInsert);
    if (error) throw error;
    
    console.log(`¡Éxito! Se actualizaron ${newsToInsert.length} noticias.`);
    return { statusCode: 200, body: 'Noticias actualizadas exitosamente.' };

  } catch (error) {
    console.error('Error durante la actualización de noticias:', error);
    return { statusCode: 500, body: error.toString() };
  }
};