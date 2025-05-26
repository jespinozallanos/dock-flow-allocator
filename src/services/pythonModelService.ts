
import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData } from '@/types/types';

// Función para detectar la URL base del API Python según el entorno
const getPythonApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('Detectando entorno - hostname:', hostname, 'protocol:', protocol);
  
  // Si estamos en GitHub Codespaces
  if (hostname.includes('github.dev') || 
      hostname.includes('githubpreview.dev') || 
      hostname.includes('codespaces.githubusercontent.com') ||
      hostname.includes('app.github.dev')) {
    
    // En Codespaces, construir la URL del puerto 5000
    const codespaceBaseUrl = hostname.replace(/^[^-]+-/, ''); // Remover el primer segmento antes del primer -
    const pythonUrl = `${protocol}//5000-${codespaceBaseUrl}`;
    console.log('URL Python en Codespaces:', pythonUrl);
    return pythonUrl;
  }
  
  // Si estamos en Lovable
  if (hostname.includes('lovableproject.com')) {
    console.log('Entorno Lovable detectado - usando localhost');
    return 'http://localhost:5000';
  }
  
  // Si estamos en localhost (desarrollo local)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const pythonUrl = 'http://localhost:5000';
    console.log('URL Python en localhost:', pythonUrl);
    return pythonUrl;
  }
  
  // Para cualquier otro entorno, asumir localhost
  console.log('Entorno desconocido, usando localhost');
  return 'http://localhost:5000';
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
      console.error("❌ Error en respuesta del servidor Python:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`Error en la llamada a la API Python: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Convertir respuesta a JSON
    const result: PythonModelResult = await response.json();
    console.log("✅ Resultado del modelo Python:", result);
    
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
    console.error("💥 Error al ejecutar el modelo Python:", error);
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
    
    // Intentamos hacer una petición simple para ver si la API está disponible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos para Codespaces
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors' // Asegurar que las peticiones CORS funcionen
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const healthData = await response.json();
      console.log("✅ API Python DISPONIBLE:", healthData);
      return true;
    } else {
      console.log("❌ API Python respondió con error:", response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    console.error("💥 Error al conectar con API Python:", error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log("⏰ Timeout: La conexión tardó más de 15 segundos");
      } else if (error.message.includes('fetch')) {
        console.log("🌐 Error de red: Verificar que el servidor Python esté ejecutándose");
      }
    }
    
    console.log("📋 Instrucciones de solución:");
    console.log("1. Para localhost: cd src/python && python api.py");
    console.log("2. Para Codespaces: python src/python/api.py");
    console.log("3. Verifica que Flask esté instalado: pip install -r src/python/requirements.txt");
    console.log("4. Para Codespaces: Asegúrate de que el puerto 5000 esté visible públicamente");
    
    return false;
  }
};
