# Máquina de Turing con Three.js y Vite

## Descripción General

Este proyecto es una **visualización interactiva 3D de una Máquina de Turing** usando Three.js y Vite. La máquina simula operaciones matemáticas (suma y resta) y muestra de forma visual cómo funciona el algoritmo de Turing con una cinta infinita, un cabezal de lectura/escritura, y actuadores mecánicos (brazo de escritura y pistón de borrado).

## Características Principales

### 1. **Máquina de Turing Simulada**
   - Implementa dos operaciones: **Suma** y **Resta**
   - Maneja estados (q0, q1, q2, q3, q4, qe, qf)
   - Transiciones de estado automáticas basadas en el símbolo leído
   - Movimiento de cabezal izquierda/derecha

### 2. **Representación Visual 3D**
   - **Cinta**: Forma ovalada que gira con motores servos
   - **Cabezal RGB**: Lee y cambia de color según el símbolo (blanco, rojo, verde)
   - **Brazo de Escritura**: Rota hacia la cinta para escribir marcas
   - **Pistón de Borrado**: Baja con esponjita amarilla para borrar marcas
   - **Motores Servos**: Controlan la rotación de la cinta
   - **Base Mecánica**: Estructura que sostiene todo el sistema

### 3. **Interactividad**
   - Controles de órbita para rotar la cámara
   - Etiquetas flotantes al pasar el ratón sobre componentes
   - Botones para ejecutar operaciones
   - Contador de estado en tiempo real

## Estructura del Proyecto

```
vite-project/
├── index.html              # Página principal con controles HTML
├── package.json            # Dependencias del proyecto
├── src/
│   ├── main.js            # Código principal (Three.js + Máquina de Turing)
│   ├── counter.js         # Archivo auxiliar (si existe)
│   └── style.css          # Estilos CSS
└── public/                # Archivos estáticos
```

## Instalación y Configuración

### Requisitos
- Node.js (v14 o superior)
- npm o yarn

### Pasos de Instalación

1. **Navegar al directorio del proyecto:**
```bash
cd vite-project
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

4. **Abrir en navegador:**
   - Acceder a `http://localhost:5173` (o la URL que muestre la terminal)

## Cómo Funciona

### Entrada de Datos
1. Ingresa dos números en los campos de entrada (`num1` y `num2`)
2. Selecciona la operación: **Suma** o **Resta**
3. La máquina se reinicia automáticamente antes de ejecutar

### Proceso de Ejecución

#### **Suma:**
- Escribe rayas negras para representar el primer número
- Añade un separador (raya única)
- Escribe rayas negras para el segundo número
- El algoritmo desplaza el cabezal hacia la derecha, reemplazando la última raya del separador con una raya
- Resultado: rayas del primer número + rayas del segundo número

#### **Resta:**
- Similar a suma, pero elimina una raya del segundo número
- El algoritmo borra (deja en blanco) una raya por cada unidad de resta
- Resultado: rayas del primer número menos rayas del segundo número

### Representación de Símbolos
- **BLANK (B)**: Celda vacía (blanca)
- **ZERO (0)**: Una raya negra (separador)
- **ONE (1)**: Dos rayas negras (número)

## Componentes 3D

### Cinta
- Forma ovalada que contiene 50 celdas
- Gira mediante motores servos en los extremos
- Cada celda puede contener un símbolo (marcas)

### Cabezal (Head)
- Cubo rojo que lee la celda actual
- Cambia de color:
  - Blanco: BLANK
  - Rojo: ZERO
  - Verde: ONE
- Posicionado en el centro superior de la cinta

### Brazo de Escritura
- Servo motor con brazo articulado y plumón
- Rota hacia la cinta para escribir marcas
- Se reinicia a su posición inicial después de cada escritura

### Pistón de Borrado
- Servo motor vertical con esponjita amarilla
- Baja para borrar marcas en la cinta
- Se reinicia a su posición inicial después de cada borrado

### Base Mecánica
- Estructura de madera que soporta toda la máquina
- Incluye protoboard (circuitería simulada)
- Arduino UNO visualizado en la parte trasera
- Motores servos en ambos extremos

## Controles de Interfaz

### Botones Principales
- **Botón Suma**: Ejecuta la operación de suma
- **Botón Resta**: Ejecuta la operación de resta
- **Botón Reset**: Reinicia la máquina a su estado inicial

### Campos de Entrada
- **num1**: Primer número operando
- **num2**: Segundo número operando

### Visualización de Estado
- Muestra el estado actual de la máquina de Turing (q0, q1, etc.)
- Muestra el resultado final de la operación

## Funciones Clave del Código

### Clase `TuringMachine`

#### **Constructor**
- Inicializa la cinta, cabezal, actuadores y motores
- Define parámetros geométricos de la máquina

#### **createTape()**
- Genera la cinta ovalada con geometría 3D
- Crea las 50 celdas y las posiciona en el perímetro

#### **createHead()**
- Crea el cabezal RGB
- Genera el brazo de escritura
- Genera el pistón de borrado

#### **createMotors()**
- Crea los servomotores izquierdo y derecho
- Genera carretes para enrollar la cinta

#### **initializeTape(num1, num2, operation)**
- Reinicia la máquina
- Escribe los números iniciales en la cinta sin animaciones

#### **step()**
- Ejecuta un paso de la máquina de Turing
- Lee símbolo actual
- Busca transición en la tabla de estados
- Escribe nuevo símbolo (con animaciones)
- Mueve cabezal izquierda o derecha
- Actualiza visualización

#### **run()**
- Ejecuta pasos consecutivamente hasta alcanzar estado final
- Cuenta el resultado final

#### **drawSymbol(cellIndex, symbol)**
- Borra símbolo anterior
- Anima el brazo de escritura o pistón según corresponda
- Escribe nuevo símbolo

#### **animateWriter() y animateEraser()**
- Rotan brazo hacia la cinta (escritura)
- Bajan pistón (borrado)
- Retornan a posición inicial automáticamente

#### **resetWriterArm() y resetEraserPiston()**
- Reinician los actuadores a sus posiciones iniciales
- Se llaman antes y después de cada animación

#### **reset()**
- Reinicia estado de la máquina (q0)
- Limpia todas las marcas de la cinta
- Reinicia actuadores y motores
- Repositiciona el cabezal

#### **updateTapePosition()**
- Recalcula posición de cada celda en el perímetro
- Rota los motores para sincronizar la cinta visual

### Tablas de Transición

#### **SUMA_TRANSITIONS**
Mapea estados y símbolos a acciones (escribir, mover, siguiente estado)

#### **RESTA_TRANSITIONS**
Similar a suma pero con lógica para restar

## Event Listeners

### Botones
- **suma**: Reinicia → Inicializa números → Ejecuta suma
- **resta**: Reinicia → Inicializa números → Ejecuta resta (con validación)
- **reset**: Limpia la cinta y reinicia la máquina

### Interacción con Ratón
- **pointermove**: Detecta objetos 3D bajo el cursor y muestra etiquetas

## Animaciones

### Velocidades
- **Paso de máquina**: 300ms por defecto
- **Rotación de actuadores**: 20ms entre frames
- **Pausa de escritura/borrado**: 100ms

### Reinicio Automático
Cada vez que se presiona "Suma" o "Resta", la máquina se reinicia automáticamente con `turingMachine.reset()` antes de inicializar nuevos números

## Dependencias

- **three**: Motor 3D principal
- **three/examples/jsm**: Módulos adicionales (OrbitControls, CSS2DRenderer)
- **vite**: Bundler y servidor de desarrollo

## Instalación de Dependencias

```bash
npm install three
npm install --save-dev vite
```

## Comandos de NPM

```bash
npm run dev       # Inicia servidor de desarrollo
npm run build     # Compila para producción
npm run preview   # Vista previa de compilación
```

## Limitaciones y Consideraciones

- La cinta es finita (50 celdas), no infinita como la máquina teórica
- Las animaciones están sincronizadas pero pueden ralentizar la ejecución
- El peso computacional aumenta si se incrementa el tamaño de la cinta

## Mejoras Futuras

- Agregar más operaciones (multiplicación, división, etc.)
- Permitir editar velocidad de ejecución
- Exportar logs de ejecución
- Agregar sonidos a las animaciones
- Modo automático con pausa/step manual
- Representación gráfica de transiciones de estado

## Autor

Proyecto desarrollado para la asignatura de Fundamentos de la Computación en la UCN.

## Licencia

Este proyecto es de código abierto para fines educativos.
