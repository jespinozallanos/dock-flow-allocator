
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
    console.log("🚀 Enviando datos al modelo Python...", params);
    
    // Crear el cuerpo de la solicitud
    const requestBody = {
      ...params,
      weatherData
    };
    
    console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));
    console.log("🌐 URL destino:", `${API_BASE_URL}/api/allocation-model`);
    
    // Llamar a la API Python directamente
    const response = await fetch(`${API_BASE_URL}/api/allocation-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log("📥 Respuesta recibida - Status:", response.status);
    console.log("📥 Respuesta recibida - StatusText:", response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error en respuesta:", errorText);
      throw new Error(`Error en la llamada a la API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Convertir respuesta a JSON
    const result: PythonModelResult = await response.json();
    console.log("✅ Resultado del modelo Python:", result);
    
    // Verificar y corregir el formato de los resultados
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
    
    // Mejorar el mensaje de error para el usuario
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error(`No se puede conectar al servidor Python en ${API_BASE_URL}. 
        
Asegúrate de que:
1. El servidor Python esté ejecutándose: cd src/python && python api.py
2. El servidor muestre: "Running on http://127.0.0.1:5000"
3. No hay firewall bloqueando el puerto 5000

Error original: ${error.message}`);
      }
    }
    
    throw error;
  }
};

/**
 * Test simplificado de conexión al servidor Python
 */
export const testPythonApiConnection = async (): Promise<boolean> => {
  console.log("🔍 PROBANDO CONEXIÓN AL SERVIDOR PYTHON");
  console.log("🌐 URL objetivo:", API_BASE_URL);
  
  try {
    // Test directo al endpoint de la API
    console.log("📡 Enviando solicitud de prueba...");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout de 5 segundos alcanzado");
      controller.abort();
    }, 5000);
    
    // Hacer una solicitud POST de prueba al endpoint principal
    const testData = {
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
    };
    
    const response = await fetch(`${API_BASE_URL}/api/allocation-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("📊 Respuesta del servidor:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    
    // Si obtenemos cualquier respuesta del servidor (incluso errores), significa que está corriendo
    if (response.status >= 200 && response.status < 600) {
      console.log("✅ SERVIDOR PYTHON DETECTADO Y FUNCIONANDO");
      
      try {
        const responseText = await response.text();
        console.log("📄 Respuesta del servidor:", responseText.substring(0, 200) + "...");
      } catch (e) {
        console.log("📄 No se pudo leer la respuesta, pero el servidor responde");
      }
      
      return true;
    }
    
    console.log("❌ Respuesta inesperada del servidor");
    return false;
    
  } catch (error) {
    console.log("❌ ERROR AL CONECTAR CON PYTHON:");
    console.log("Tipo:", error?.constructor?.name);
    console.log("Mensaje:", error?.message);
    
    if (error?.name === 'AbortError') {
      console.log("💥 Conexión cancelada por timeout");
      console.log("🔧 SOLUCIÓN: El servidor Python no responde en 5 segundos");
    } else if (error?.message?.includes('fetch') || error?.message?.includes('Failed to fetch')) {
      console.log("💥 Error de red - Servidor Python no disponible");
      console.log("🔧 INSTRUCCIONES PARA EJECUTAR PYTHON:");
      console.log("   1. Abre terminal");
      console.log("   2. cd src/python/");
      console.log("   3. pip install -r requirements.txt");
      console.log("   4. python api.py");
      console.log("   5. Debe mostrar: 'Running on http://127.0.0.1:5000'");
    } else {
      console.log("💥 Error desconocido:", error);
    }
    
    return false;
  }
};
