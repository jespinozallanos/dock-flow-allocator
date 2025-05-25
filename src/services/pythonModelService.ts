
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
  
  // 1. GitHub Codespaces
  if (hostname.includes('github.dev') || hostname.includes('githubpreview.dev') || hostname.includes('codespaces.githubusercontent.com')) {
    const pythonUrl = `https://${hostname.replace('-8080', '-5000')}`;
    console.log(`✅ Entorno GitHub Codespaces detectado`);
    console.log(`📡 URL de la API Python: ${pythonUrl}`);
    return pythonUrl;
  }
  
  // 2. Lovable (entorno remoto - Python no disponible)
  if (hostname.includes('lovableproject.com')) {
    console.log(`❌ Entorno Lovable (remoto) detectado`);
    console.log(`❌ API Python no disponible en entorno Lovable (remoto)`);
    return 'http://localhost:5000'; // Fallback que fallará intencionalmente
  }
  
  // 3. Entorno local - SIEMPRE usar localhost:5000 para Python
  const pythonUrl = `http://localhost:5000`;
  console.log(`✅ ENTORNO LOCAL DETECTADO`);
  console.log(`📍 Frontend corriendo en: ${hostname}:${port}`);
  console.log(`📍 API Python configurada para: ${pythonUrl}`);
  console.log(`🔧 CONFIGURACIÓN DETECTADA:`);
  console.log(`   • Frontend: ${window.location.href}`);
  console.log(`   • Python API: ${pythonUrl}`);
  console.log(`   • Protocolo frontend: ${protocol}`);
  console.log(`   • Puerto frontend: ${port}`);
  return pythonUrl;
};

/**
 * Ejecuta el modelo de optimización Python
 */
export const runPythonAllocationModel = async (
  params: PythonModelParams,
  weatherData: WeatherData
): Promise<PythonModelResult> => {
  const API_BASE_URL = getPythonApiBaseUrl();
  
  try {
    console.log("🚀 Enviando datos al modelo Python en:", API_BASE_URL);
    console.log("📊 Parámetros del modelo:", params);
    
    const requestBody = {
      ...params,
      weatherData
    };
    
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
    
    const result: PythonModelResult = await response.json();
    console.log("✅ Resultado del modelo Python recibido:", result);
    
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
 * Función mejorada para probar la conexión a la API Python
 */
export const testPythonApiConnection = async (): Promise<boolean> => {
  const API_BASE_URL = getPythonApiBaseUrl();
  
  try {
    console.log("🔍 PROBANDO CONEXIÓN CON API PYTHON");
    console.log(`📡 URL objetivo: ${API_BASE_URL}/api/health`);
    console.log(`🌐 Entorno actual: ${window.location.href}`);
    
    // Detectar si estamos en Lovable (entorno remoto)
    if (window.location.hostname.includes('lovableproject.com')) {
      console.log("❌ API Python no disponible en entorno Lovable (remoto)");
      return false;
    }
    
    console.log("📡 Enviando petición de health check...");
    const startTime = Date.now();
    
    // Configurar timeout más largo y mejores headers para entorno local
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout de conexión (20 segundos)");
      console.log("💡 El servidor Python podría no estar respondiendo");
      controller.abort();
    }, 20000);
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    clearTimeout(timeoutId);
    
    console.log(`⏱️ Tiempo de respuesta: ${responseTime}ms`);
    console.log(`📄 Status de respuesta: ${response.status}`);
    
    if (response.ok) {
      const healthData = await response.json();
      console.log("✅ ¡API PYTHON CONECTADA EXITOSAMENTE!");
      console.log("📊 Datos del servidor:", healthData);
      console.log("🎉 Conexión establecida correctamente");
      return true;
    } else {
      console.log("❌ API Python respondió con error");
      console.log(`📄 Status: ${response.status} ${response.statusText}`);
      
      try {
        const responseText = await response.text();
        console.log("📄 Respuesta:", responseText);
      } catch (e) {
        console.log("📄 No se pudo leer la respuesta");
      }
      
      return false;
    }
    
  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN CON API PYTHON:", error);
    
    if (error instanceof Error) {
      console.log("🔍 ANÁLISIS DEL ERROR:");
      console.log(`   • Tipo: ${error.name}`);
      console.log(`   • Mensaje: ${error.message}`);
      
      if (error.name === 'AbortError') {
        console.log("⏰ TIMEOUT - El servidor no respondió a tiempo");
        console.log("💡 SOLUCIÓN:");
        console.log("   1. Verifica que el servidor Python esté ejecutándose");
        console.log("   2. Revisa que esté en puerto 5000");
        console.log("   3. Accede manualmente a: http://localhost:5000/api/health");
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log("🔗 ERROR DE RED - No se puede conectar");
        console.log("💡 CAUSAS POSIBLES:");
        console.log("   1. ❌ Servidor Python NO ejecutándose");
        console.log("   2. ❌ Puerto 5000 bloqueado o ocupado");
        console.log("   3. ❌ Problema de CORS");
        console.log("   4. ❌ Firewall bloqueando conexión");
        
        console.log("");
        console.log("🚀 VERIFICACIÓN PASO A PASO:");
        console.log("   1. En PowerShell: cd src/python && python api.py");
        console.log("   2. Debe mostrar: 'Running on http://127.0.0.1:5000'");
        console.log("   3. En navegador: http://localhost:5000/api/health");
        console.log("   4. Debe responder con JSON de estado");
        console.log("   5. Si funciona manualmente, recarga esta página");
      }
    }
    
    return false;
  }
};
