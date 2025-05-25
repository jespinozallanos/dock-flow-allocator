
import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData } from '@/types/types';

// Función para detectar la URL base del API Python según el entorno
const getPythonApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  
  // Si estamos en GitHub Codespaces
  if (hostname.includes('github.dev') || hostname.includes('githubpreview.dev') || hostname.includes('codespaces')) {
    // Reemplazar el puerto 5173 (Vite) por 5000 (Python) manteniendo el mismo hostname
    return `https://${hostname.replace('-5173', '-5000')}`;
  }
  
  // Si estamos en Lovable (para pruebas)
  if (hostname.includes('lovableproject.com')) {
    return 'http://localhost:5000';
  }
  
  // Si estamos en un entorno de desarrollo local (localhost o 127.0.0.1)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Para cualquier otro entorno, asumir localhost
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
    console.log("Probando conexión con API Python en:", API_BASE_URL);
    
    // Intentamos hacer una petición simple para ver si la API está disponible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout para entornos locales
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors' // Asegurar que las peticiones CORS funcionen
    });
    
    clearTimeout(timeoutId);
    const isAvailable = response.ok;
    
    console.log(`API Python ${isAvailable ? 'DISPONIBLE' : 'NO DISPONIBLE'} en ${API_BASE_URL}`);
    return isAvailable;
  } catch (error) {
    console.error("Error al conectar con API Python:", error);
    console.log("Asegúrate de que el servidor Python esté ejecutándose en el puerto 5000");
    console.log("Para ejecutar el servidor Python, usa: cd src/python && python api.py");
    return false;
  }
};
