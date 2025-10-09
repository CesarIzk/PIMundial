// netlify/functions/update-news.js
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
const newsApiKey = process.env.NEWS_API_KEY;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

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
  try {
    // 1. Llama a la API de noticias
    const query = 'Mundial 2026 OR "Copa del Mundo"';
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=es&sortBy=publishedAt&pageSize=5`;
    const newsResponse = await fetch(url, { headers: { 'X-Api-Key': newsApiKey } });
    if (!newsResponse.ok) throw new Error(`Falló la llamada a NewsAPI con estado: ${newsResponse.status}`);
    const newsData = await newsResponse.json();
    const articles = newsData.articles;

    // 2. Borra las noticias viejas de Firestore
    await deleteCollection('noticias', 10);

    // 3. Inserta las noticias nuevas (CON LOS CAMPOS CORREGIDOS)
    const batch = db.batch();
    articles.forEach(article => {
      const docRef = db.collection('noticias').doc();
      batch.set(docRef, {
        titulo: article.title,
        resumen: article.description || 'No hay resumen.',
        enlace: article.url,
        source: article.source, // <-- CAMBIO: Guardamos el objeto source completo
        urlToImage: article.urlToImage, // <-- CAMBIO: Guardamos la URL de la imagen
        publishedAt: article.publishedAt, // <-- CAMBIO: Guardamos la fecha de publicación
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();

    return { statusCode: 200, body: `Se actualizaron ${articles.length} noticias.` };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: error.toString() };
  }
};