
import { Ship, Dock, Allocation, PythonModelParams, PythonModelResult, WeatherData } from '@/types/types';

// URL base de la API Python - configurada para desarrollo local
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Ejecuta el modelo de optimización Python
 */
export const runPythonAllocationModel = async (
  params: PythonModelParams,
  weatherData: WeatherData
): Promise<PythonModelResult> => {
  try {
    console.log("🚀 Enviando datos al modelo Python...", params);
    
    const requestBody = {
      ...params,
      weatherData
    };
    
    console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));
    console.log("🌐 URL destino:", `${API_BASE_URL}/api/allocation-model`);
    
    const response = await fetch(`${API_BASE_URL}/api/allocation-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log("📥 Respuesta recibida - Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error en respuesta:", errorText);
      throw new Error(`Error en la llamada a la API: ${response.status} ${response.statusText}`);
    }
    
    const result: PythonModelResult = await response.json();
    console.log("✅ Resultado del modelo Python:", result);
    
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
    throw new Error(`No se puede conectar al servidor Python en ${API_BASE_URL}. 

INSTRUCCIONES PARA EJECUTAR EL SERVIDOR PYTHON:

1. Abre una terminal/cmd
2. Navega a la carpeta del proyecto: cd ruta/a/tu/proyecto
3. Entra a la carpeta python: cd src/python
4. Instala las dependencias: pip install -r requirements.txt
5. Ejecuta el servidor: python api.py
6. Verifica que aparezca: "Running on http://127.0.0.1:5000"
7. Deja la terminal abierta mientras usas la aplicación

Error técnico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Test de conexión al servidor Python
 */
export const testPythonApiConnection = async (): Promise<boolean> => {
  console.log("🔍 PROBANDO CONEXIÓN AL SERVIDOR PYTHON");
  console.log("🌐 URL objetivo:", API_BASE_URL);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}/api/allocation-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ships: [],
        docks: [],
        existingAllocations: [],
        optimizationCriteria: 'balanced',
        weatherData: {
          location: "Test",
          timestamp: new Date().toISOString(),
          tide: { current: 3.5, unit: "metros", minimum: 3.0, windows: [] },
          wind: { speed: 5.0, direction: "N", unit: "nudos", maximum: 8.0 },
          settings: { maxWindSpeed: 8.0, minTideLevel: 3.0 }
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("📊 Respuesta del servidor:", response.status);
    
    // Si obtenemos cualquier respuesta del servidor, significa que está funcionando
    return response.status >= 200 && response.status < 600;
    
  } catch (error) {
    console.log("❌ ERROR AL CONECTAR CON PYTHON:");
    console.log("Mensaje:", error?.message);
    
    if (error?.name === 'AbortError') {
      console.log("💥 Timeout: El servidor Python no responde");
    } else if (error?.message?.includes('fetch') || error?.message?.includes('Failed to fetch')) {
      console.log("💥 Error de red - Servidor Python no disponible");
    }
    
    return false;
  }
};
