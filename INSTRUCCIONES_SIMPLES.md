
# Configuración Simple - Dock Flow Allocator

## 1. Terminal 1 - API Python (Puerto 3001)
```bash
cd src/python
python simple_api.py
```

## 2. Terminal 2 - Frontend React (Puerto 3000)
```bash
npm run dev
```

## 3. Verificar
- Frontend: http://localhost:3000
- API Python: http://localhost:3001/health

## 4. Puertos utilizados
- Frontend: 3000
- API Python: 3001

## 5. Si hay problemas
1. Verificar que los puertos 3000 y 3001 estén libres
2. Revisar la consola del navegador
3. Verificar que ambos servicios estén ejecutándose
