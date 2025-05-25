
import { Ship, Dock, Allocation } from '@/types/types';

const API_URL = 'http://localhost:3001';

export const testConnection = async (): Promise<boolean> => {
  try {
    console.log("🔍 Probando conexión con API simple...");
    const response = await fetch(`${API_URL}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Conexión exitosa:", data);
      return true;
    } else {
      console.log("❌ Error de respuesta:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    return false;
  }
};

export const runSimpleAllocation = async (ships: Ship[], docks: Dock[]): Promise<Allocation[]> => {
  try {
    console.log("🚀 Ejecutando modelo simple...");
    
    const response = await fetch(`${API_URL}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ships,
        docks
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Resultado recibido:", result);
    
    return result.allocations || [];
  } catch (error) {
    console.error("❌ Error en modelo:", error);
    throw error;
  }
};
