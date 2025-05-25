
import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData } from '@/types/types';

// Función para detectar la URL base del API Python según el entorno
const getPythonApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  console.log(`Detectando entorno - hostname: ${hostname}, port: ${port}`);
  
  // Si estamos en GitHub Codespaces
  if (hostname.includes('github.dev') || hostname.includes('githubpreview.dev') || hostname.includes('codespaces')) {
    const pythonUrl = `https://${hostname.replace('-5173', '-5000')}`;
    console.log(`Entorno Codespaces detectado - URL Python: ${pythonUrl}`);
    return pythonUrl;
  }
  
  // Si estamos en Lovable (para pruebas)
  if (hostname.includes('lovableproject.com')) {
    console.log('Entorno Lovable detectado - usando localhost:5000');
    return 'http://localhost:5000';
  }
  
  // Si estamos en un entorno de desarrollo local (localhost o 127.0.0.1)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const pythonUrl = `http://${hostname}:5000`;
    console.log(`Entorno local detectado - URL Python: ${pythonUrl}`);
    return pythonUrl;
  }
  
  // Para cualquier otro entorno, asumir localhost
  const defaultUrl = 'http://localhost:5000';
  console.log(`Entorno desconocido (${hostname}) - usando URL por defecto: ${defaultUrl}`);
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
    console.log("Enviando datos al modelo Python en:", API_BASE_URL);
    console.log("Parámetros del modelo:", params);
    
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
    console.log("Resultado del modelo Python:", result);
    
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
    console.error("Error al ejecutar el modelo Python:", error);
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
    
    // Intentamos hacer una petición simple para ver si la API está disponible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout de conexión alcanzado (10 segundos)");
      controller.abort();
    }, 10000); // 10 segundos de timeout para localhost
    
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
    }
    
    return isAvailable;
  } catch (error) {
    console.error("❌ Error al conectar con API Python:", error);
    
    // Proporcionar información más detallada del error
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
      }
    }
    
    console.log("🚀 Para ejecutar el servidor Python:");
    console.log("   1. Abre una terminal en VS Code");
    console.log("   2. Navega a la carpeta: cd src/python");
    console.log("   3. Instala dependencias: pip install -r requirements.txt");
    console.log("   4. Ejecuta el servidor: python api.py");
    console.log("   5. Verifica que aparezca: 'Running on http://0.0.0.0:5000'");
    
    return false;
  }
};
