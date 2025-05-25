
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
  
  // 3. Entorno local (localhost o 127.0.0.1 con puerto 5173 o sin puerto)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const pythonUrl = `http://${hostname}:5000`;
    console.log(`✅ Entorno LOCAL detectado (Visual Studio Code)`);
    console.log(`📡 URL de la API Python: ${pythonUrl}`);
    console.log(`🚀 INSTRUCCIONES PARA ENTORNO LOCAL:`);
    console.log(`   1. Abre una terminal y ejecuta: cd src/python`);
    console.log(`   2. Instala dependencias: pip install -r requirements.txt`);
    console.log(`   3. Ejecuta la API Python: python api.py`);
    console.log(`   4. En otra terminal ejecuta el frontend: npm run dev`);
    console.log(`   5. Asegúrate de que ambos estén ejecutándose simultáneamente`);
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
    console.log("🌐 Información del entorno:");
    console.log("  - hostname:", window.location.hostname);
    console.log("  - port:", window.location.port);
    console.log("  - protocol:", window.location.protocol);
    console.log("  - full URL:", window.location.href);
    
    // Detectar si estamos en Lovable (entorno remoto)
    if (window.location.hostname.includes('lovableproject.com')) {
      console.log("❌ API Python no disponible en entorno Lovable (remoto)");
      console.log("💡 Para usar la API Python:");
      console.log("   • Ejecuta en GitHub Codespaces, o");
      console.log("   • Clona y ejecuta localmente");
      return false;
    }
    
    // Intentamos hacer una petición simple para ver si la API está disponible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout de conexión alcanzado (10 segundos)");
      controller.abort();
    }, 10000); // 10 segundos de timeout
    
    console.log("📡 Enviando petición de health check...");
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors' // Asegurar que las peticiones CORS funcionen
    });
    
    clearTimeout(timeoutId);
    const isAvailable = response.ok;
    
    if (isAvailable) {
      const healthData = await response.json();
      console.log("✅ API Python DISPONIBLE en", API_BASE_URL);
      console.log("📊 Información del servidor Python:", healthData);
    } else {
      console.log("❌ API Python NO DISPONIBLE en", API_BASE_URL);
      console.log("📄 Response status:", response.status);
      console.log("📄 Response statusText:", response.statusText);
      
      // Dar instrucciones específicas para entorno local
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log("🔧 SOLUCIÓN PARA ENTORNO LOCAL (Visual Studio Code):");
        console.log("   1. Abre una terminal en Visual Studio Code");
        console.log("   2. Navega a la carpeta Python: cd src/python");
        console.log("   3. Instala las dependencias: pip install -r requirements.txt");
        console.log("   4. Ejecuta la API Python: python api.py");
        console.log("   5. Espera a ver: 'Running on http://0.0.0.0:5000'");
        console.log("   6. En OTRA terminal ejecuta: npm run dev");
        console.log("   7. Mantén ambos procesos ejecutándose");
      }
    }
    
    return isAvailable;
  } catch (error) {
    console.error("❌ Error al conectar con API Python:", error);
    
    // Proporcionar información más detallada del error para entorno local
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log("⏰ La conexión fue cancelada por timeout");
      } else if (error.message.includes('Failed to fetch')) {
        console.log("🔗 Error de red - no se puede conectar con el servidor");
        console.log("🔧 Posibles causas:");
        console.log("   1. El servidor Python NO está ejecutándose");
        console.log("   2. El servidor Python está en un puerto diferente");
        console.log("   3. Firewall o antivirus bloqueando la conexión");
        console.log("   4. CORS no configurado correctamente");
        
        // Instrucciones específicas para el entorno actual
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log("");
          console.log("🚀 PASOS PARA EJECUTAR EN VISUAL STUDIO CODE (LOCAL):");
          console.log("   TERMINAL 1 (API Python):");
          console.log("   1. cd src/python");
          console.log("   2. pip install -r requirements.txt");
          console.log("   3. python api.py");
          console.log("   4. Verifica que aparezca: 'Running on http://0.0.0.0:5000'");
          console.log("");
          console.log("   TERMINAL 2 (Frontend):");
          console.log("   1. npm run dev");
          console.log("   2. Abre el navegador en la URL que aparece");
          console.log("");
          console.log("   ⚠️ IMPORTANTE: Ambos deben estar ejecutándose simultáneamente");
        }
      }
    }
    
    return false;
  }
};
