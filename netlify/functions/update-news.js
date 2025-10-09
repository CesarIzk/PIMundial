// netlify/functions/update-news.js

console.log('Cargando la función update-news.js...'); // LOG #1

const admin = require('firebase-admin');

// --- PUNTO CRÍTICO DE DIAGNÓSTICO ---
// Vamos a verificar las variables de entorno de forma segura
let serviceAccount;
try {
  if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error('La variable de entorno FIREBASE_CREDENTIALS no está definida.');
  }
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  console.log('Credenciales de Firebase parseadas correctamente.'); // LOG #2
} catch (e) {
  console.error('ERROR FATAL AL INICIALIZAR:', e.message);
  // Si esto falla, la función no puede continuar.
  // Devolvemos el error para que sea visible.
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Fallo al inicializar: Revisa la variable FIREBASE_CREDENTIALS en Netlify.' })
  };
}
// --- FIN DEL PUNTO CRÍTICO ---

const newsApiKey = process.env.NEWS_API_KEY;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ... (El resto de tu código, como deleteCollection, se queda igual) ...
async function deleteCollection(collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);
  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}
async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();
  if (snapshot.size === 0) return resolve();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

exports.handler = async function(event, context) {
  console.log('Iniciando el handler de update-news...'); // LOG #3
  
  if (!newsApiKey) {
    console.error('ERROR: La variable de entorno NEWS_API_KEY no está definida.');
    return { statusCode: 500, body: JSON.stringify({ error: 'NEWS_API_KEY no configurada.' }) };
  }

  try {
    // 1. Llama a la API de noticias
    console.log('Llamando a NewsAPI...'); // LOG #4
    const query = 'Mundial 2026 OR "Copa del Mundo"';
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=es&sortBy=publishedAt&pageSize=5`;
    const newsResponse = await fetch(url, { headers: { 'X-Api-Key': newsApiKey } });
    if (!newsResponse.ok) throw new Error(`Falló la llamada a NewsAPI con estado: ${newsResponse.status}`);
    const newsData = await newsResponse.json();
    const articles = newsData.articles;
    console.log(`Se obtuvieron ${articles.length} artículos.`); // LOG #5

    // 2. Borra las noticias viejas de Firestore
    console.log('Borrando noticias viejas de Firestore...'); // LOG #6
    await deleteCollection('noticias', 10);
    
    // 3. Inserta las noticias nuevas
    console.log('Insertando noticias nuevas...'); // LOG #7
    const batch = db.batch();
    articles.forEach(article => {
      const docRef = db.collection('noticias').doc();
      batch.set(docRef, {
        titulo: article.title,
        resumen: article.description || 'No hay resumen.',
        enlace: article.url,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();

    console.log('¡Proceso completado exitosamente!'); // LOG #8
    return { statusCode: 200, body: `Se actualizaron ${articles.length} noticias.` };

  } catch (error) {
    console.error('ERROR DENTRO DEL HANDLER:', error);
    return { statusCode: 500, body: error.toString() };
  }
};