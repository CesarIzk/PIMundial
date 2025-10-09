// netlify/functions/test-firebase.js

exports.handler = async function(event, context) {
  try {
    console.log('Iniciando prueba de importación...');
    
    // El momento de la verdad: intentar importar firebase-admin
    const admin = require('firebase-admin');
    
    // Si la línea de arriba no falló, significa que el módulo SÍ se encontró.
    const message = `¡Éxito! El módulo 'firebase-admin' fue importado correctamente.`;
    console.log(message);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: message, sdkVersion: admin.SDK_VERSION }),
    };

  } catch (error) {
    // Si 'require' falla, el error se capturará aquí.
    console.error('FALLO LA IMPORTACIÓN:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "El módulo 'firebase-admin' no se pudo encontrar.",
        details: error.message
      }),
    };
  }
};