
import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData } from '@/types/types';

// Función para detectar la URL base del API Python según el entorno
const getPythonApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  
  console.log(`🔍 Detectando entorno de ejecución:`);
  console.log(`  - hostname: "${hostname}"`);
  console.log(`  - port: "${port}"`);
  console.log(`  - protocol: "${protocol}"`);
  console.log(`  - full URL: "${window.location.href}"`);
  
  // Detección mejorada para diferentes entornos
  
  // 1. GitHub Codespaces
  if (hostname.includes('github.dev') || hostname.includes('githubpreview.dev') || hostname.includes('codespaces.githubusercontent.com')) {
    const pythonUrl = `https://${hostname.replace('-5173', '-5000')}`;
    console.log(`✅ Entorno GitHub Codespaces detectado`);
    console.log(`📡 URL de la API Python: ${pythonUrl}`);
    return pythonUrl;
  }
  
  // 2. Lovable (entorno remoto - Python no disponible)
  if (hostname.includes('lovableproject.com')) {
    console.log(`❌ Entorno Lovable (remoto) detectado`);
    console.log(`❌ API Python no disponible en entorno Lovable (remoto)`);
    console.log(`💡 Para usar la API Python:`);
    console.log(`   • Ejecuta en GitHub Codespaces, o`);
    console.log(`   • Clona y ejecuta localmente`);
    return 'http://localhost:5000'; // Fallback que fallará intencionalmente
  }
  
  // 3. Entorno local mejorado (localhost o 127.0.0.1 con cualquier puerto o sin puerto)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const pythonUrl = `http://${hostname}:5000`;
    console.log(`✅ Entorno LOCAL detectado (Visual Studio Code)`);
    console.log(`📡 URL de la API Python: ${pythonUrl}`);
    console.log(`🚀 VERIFICACIÓN PARA ENTORNO LOCAL:`);
    console.log(`   📍 Frontend corriendo en: ${window.location.href}`);
    console.log(`   📍 API Python debería estar en: ${pythonUrl}`);
    console.log(`   📍 Puerto frontend detectado: ${port || 'sin puerto específico'}`);
    console.log(`   📍 Hostname detectado: ${hostname}`);
    console.log(``);
    console.log(`🔧 INSTRUCCIONES PARA ENTORNO LOCAL:`);
    console.log(`   TERMINAL 1 (API Python):`);
    console.log(`   1. cd src/python`);
    console.log(`   2. pip install -r requirements.txt`);
    console.log(`   3. python api.py`);
    console.log(`   4. Verifica que aparezca: 'Running on http://127.0.0.1:5000'`);
    console.log(``);
    console.log(`   TERMINAL 2 (Frontend):`);
    console.log(`   1. npm run dev`);
    console.log(`   2. Accede a la URL que muestre Vite`);
    console.log(``);
    console.log(`   ⚠️ IMPORTANTE: Ambos deben estar ejecutándose simultáneamente`);
    console.log(`   ⚠️ Si usas puerto ${port}, asegúrate que Python esté en puerto 5000`);
    return pythonUrl;
  }
  
  // 4. Cualquier otro entorno - asumir local
  console.log(`⚠️ Entorno desconocido detectado (${hostname})`);
  console.log(`🔧 Asumiendo entorno local - usando localhost:5000`);
  const defaultUrl = 'http://localhost:5000';
  console.log(`📡 URL de la API Python: ${defaultUrl}`);
  return defaultUrl;
};

/**
 * Ejecuta el modelo de optimización Python
 * @param params Parámetros para el modelo
 * @returns Resultado del modelo de optimización
 */
export const runPythonAllocationModel = async (
  params: PythonModelParams,
  weatherData: WeatherData
): Promise<PythonModelResult> => {
  const API_BASE_URL = getPythonApiBaseUrl();
  
  try {
    console.log("🚀 Enviando datos al modelo Python en:", API_BASE_URL);
    console.log("📊 Parámetros del modelo:", params);
    
    // Crear el cuerpo de la solicitud
    const requestBody = {
      ...params,
      weatherData
    };
    
    // Llamar a la API Python
    const response = await fetch(`${API_BASE_URL}/api/allocation-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la llamada a la API Python: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Convertir respuesta a JSON
    const result: PythonModelResult = await response.json();
    console.log("✅ Resultado del modelo Python recibido:", result);
    
    // Verificar y corregir el formato de los resultados
    // Asegurarse de que todas las fechas estén en formato ISO
    if (result.allocations) {
      result.allocations = result.allocations.map(allocation => ({
        ...allocation,
        startTime: new Date(allocation.startTime).toISOString(),
        endTime: new Date(allocation.endTime).toISOString(),
        created: new Date(allocation.created).toISOString(),
      }));
    }
    
    return result;
  } catch (error) {
    console.error("❌ Error al ejecutar el modelo Python:", error);
    throw error;
  }
};

/**
 * Función de utilidad que permite probar la conexión a la API Python
 */
export const testPythonApiConnection = async (): Promise<boolean> => {
  const API_BASE_URL = getPythonApiBaseUrl();
  
  try {
    console.log("🔍 Probando conexión con API Python en:", API_BASE_URL);
    console.log("🌐 Información detallada del entorno:");
    console.log("  - hostname:", window.location.hostname);
    console.log("  - port:", window.location.port);
    console.log("  - protocol:", window.location.protocol);
    console.log("  - full URL:", window.location.href);
    console.log("  - user agent:", navigator.userAgent);
    
    // Detectar si estamos en Lovable (entorno remoto)
    if (window.location.hostname.includes('lovableproject.com')) {
      console.log("❌ API Python no disponible en entorno Lovable (remoto)");
      console.log("💡 Para usar la API Python:");
      console.log("   • Ejecuta en GitHub Codespaces, o");
      console.log("   • Clona y ejecuta localmente");
      return false;
    }
    
    // Log adicional para debugging en entorno local
    console.log("🧪 Intentando conectar con API Python...");
    console.log("📡 URL objetivo:", `${API_BASE_URL}/api/health`);
    
    // Intentamos hacer una petición simple para ver si la API está disponible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout de conexión alcanzado (15 segundos)");
      console.log("💡 Esto puede indicar que el servidor Python no está ejecutándose");
      controller.abort();
    }, 15000); // 15 segundos de timeout (aumentado para entorno local)
    
    console.log("📡 Enviando petición de health check...");
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors', // Asegurar que las peticiones CORS funcionen
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    clearTimeout(timeoutId);
    console.log(`⏱️ Tiempo de respuesta: ${responseTime}ms`);
    
    const isAvailable = response.ok;
    
    if (isAvailable) {
      const healthData = await response.json();
      console.log("✅ API Python DISPONIBLE en", API_BASE_URL);
      console.log("📊 Información del servidor Python:", healthData);
      console.log("🎉 Conexión exitosa establecida!");
    } else {
      console.log("❌ API Python NO DISPONIBLE en", API_BASE_URL);
      console.log("📄 Response status:", response.status);
      console.log("📄 Response statusText:", response.statusText);
      
      // Intentar leer el body de la respuesta para más información
      try {
        const responseText = await response.text();
        console.log("📄 Response body:", responseText);
      } catch (e) {
        console.log("📄 No se pudo leer el body de la respuesta");
      }
      
      // Dar instrucciones específicas para entorno local
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log("🔧 SOLUCIÓN PARA ENTORNO LOCAL (Visual Studio Code):");
        console.log("   🚨 PROBLEMA DETECTADO: El servidor Python NO está respondiendo");
        console.log("   📋 PASOS PARA SOLUCIONAR:");
        console.log("   ");
        console.log("   TERMINAL 1 (API Python):");
        console.log("   1. Abre una nueva terminal en Visual Studio Code");
        console.log("   2. Navega a: cd src/python");
        console.log("   3. Instala dependencias: pip install -r requirements.txt");
        console.log("   4. Ejecuta: python api.py");
        console.log("   5. Espera a ver: '* Running on http://127.0.0.1:5000'");
        console.log("   6. NO cierres esta terminal");
        console.log("   ");
        console.log("   TERMINAL 2 (Frontend):");
        console.log("   1. En otra terminal ejecuta: npm run dev");
        console.log("   2. Accede a la URL que muestre (ej: localhost:8081)");
        console.log("   ");
        console.log("   ⚠️ VERIFICACIONES:");
        console.log("   • Ambos procesos deben estar ejecutándose al mismo tiempo");
        console.log("   • El Python debe mostrar: 'Running on http://127.0.0.1:5000'");
        console.log("   • Si ves puerto 5001, para el proceso y vuelve a ejecutar");
        console.log("   • Revisa si hay firewall bloqueando el puerto 5000");
      }
    }
    
    return isAvailable;
  } catch (error) {
    console.error("❌ Error al conectar con API Python:", error);
    
    // Proporcionar información más detallada del error para entorno local
    if (error instanceof Error) {
      console.log("🔍 Análisis del error:");
      console.log("   • Tipo de error:", error.name);
      console.log("   • Mensaje:", error.message);
      
      if (error.name === 'AbortError') {
        console.log("⏰ TIMEOUT: La conexión fue cancelada por timeout");
        console.log("💡 CAUSA PROBABLE: El servidor Python NO está ejecutándose");
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log("🔗 ERROR DE RED: No se puede conectar con el servidor");
        console.log("🔧 CAUSAS POSIBLES:");
        console.log("   1. ❌ El servidor Python NO está ejecutándose");
        console.log("   2. ❌ El servidor Python está en un puerto diferente");
        console.log("   3. ❌ Firewall bloqueando el puerto 5000");
        console.log("   4. ❌ CORS no configurado correctamente");
        
        // Instrucciones específicas para el entorno actual
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log("");
          console.log("🚀 SOLUCIÓN PASO A PASO (Visual Studio Code):");
          console.log("   ");
          console.log("   🔴 PASO 1: Verificar que Python esté ejecutándose");
          console.log("   • Abre una terminal nueva");
          console.log("   • Ejecuta: cd src/python");
          console.log("   • Ejecuta: python api.py");
          console.log("   • Debe mostrar: '* Running on http://127.0.0.1:5000'");
          console.log("   ");
          console.log("   🔴 PASO 2: Mantener ambos procesos ejecutándose");
          console.log("   • Terminal 1: python api.py (NO cerrar)");
          console.log("   • Terminal 2: npm run dev (en la raíz del proyecto)");
          console.log("   ");
          console.log("   🔴 PASO 3: Verificar en el navegador");
          console.log("   • Abre el frontend en la URL que muestre npm run dev");
          console.log("   • Deberías ver 'Modelo Matemático Python Conectado'");
          console.log("   ");
          console.log("   ⚠️ SI SIGUE FALLANDO:");
          console.log("   • Verifica que no tengas antivirus bloqueando");
          console.log("   • Intenta acceder a: http://localhost:5000/api/health");
          console.log("   • Si no funciona, el problema es con el servidor Python");
        }
      } else if (error.message.includes('CORS')) {
        console.log("🔒 ERROR CORS: Problema de política de origen cruzado");
        console.log("💡 SOLUCIÓN: Asegúrate de que el servidor Python esté configurado correctamente");
      }
    }
    
    return false;
  }
};
