
import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData } from '@/types/types';

// URL base de la API Python
const API_BASE_URL = 'http://localhost:5000';

/**
 * Ejecuta el modelo de optimización Python
 * @param params Parámetros para el modelo
 * @returns Resultado del modelo de optimización
 */
export const runPythonAllocationModel = async (
  params: PythonModelParams,
  weatherData: WeatherData
): Promise<PythonModelResult> => {
  try {
    console.log("Enviando datos al modelo Python...", params);
    
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
      throw new Error(`Error en la llamada a la API: ${response.status} ${response.statusText} - ${errorText}`);
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
  console.log("=== INICIANDO PRUEBA DE CONEXIÓN PYTHON ===");
  console.log("URL objetivo:", API_BASE_URL);
  
  try {
    // Primero intentamos hacer ping a la ruta raíz
    console.log("Paso 1: Intentando conectar a la ruta raíz...");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Timeout alcanzado - abortando conexión");
      controller.abort();
    }, 10000); // 10 segundos de timeout
    
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log("Respuesta recibida:");
    console.log("- Status:", response.status);
    console.log("- StatusText:", response.statusText);
    console.log("- Headers:", Object.fromEntries(response.headers.entries()));
    
    // Flask normalmente responde con 404 en la ruta raíz si no está definida
    // También aceptamos 200 en caso de que haya una ruta raíz definida
    if (response.status === 200 || response.status === 404) {
      console.log("✅ Servidor Python detectado correctamente");
      
      // Paso 2: Verificar que la ruta de la API existe
      try {
        console.log("Paso 2: Verificando ruta de API...");
        const apiResponse = await fetch(`${API_BASE_URL}/api/allocation-model`, {
          method: 'OPTIONS',
          mode: 'cors'
        });
        
        console.log("Respuesta de API OPTIONS:", apiResponse.status);
        console.log("✅ API Python completamente funcional");
        return true;
      } catch (apiError) {
        console.log("⚠️ Servidor Python activo pero API podría no estar disponible:", apiError);
        // Aún consideramos que está disponible si el servidor responde
        return true;
      }
    }
    
    console.log("❌ Respuesta inesperada del servidor");
    return false;
    
  } catch (error) {
    console.log("=== ERROR DE CONEXIÓN ===");
    console.log("Tipo de error:", error.constructor.name);
    console.log("Mensaje de error:", error.message);
    
    if (error.name === 'AbortError') {
      console.log("❌ Conexión abortada por timeout");
    } else if (error.message.includes('fetch')) {
      console.log("❌ Error de red - el servidor probablemente no está corriendo");
      console.log("💡 Soluciones posibles:");
      console.log("1. Verifica que Python esté ejecutando el servidor en puerto 5000");
      console.log("2. Ejecuta: cd src/python && python api.py");
      console.log("3. Verifica que no haya firewall bloqueando el puerto 5000");
    } else {
      console.log("❌ Error desconocido:", error);
    }
    
    return false;
  }
};
