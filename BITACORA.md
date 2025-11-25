# Bitácora de Trabajo — Proyecto: <Máquina de Turing>
**Autor:** <Benjamín Rojas y Benjamín Torres>  
**Periodo:** <31-08-2025> — <24-11-2025 >  
**Versión:** 0.1

---

## Índice
- [Entradas diarias](#entradas-diarias)
- [Decisiones clave](#decisiones-clave)
- [Incidencias y soluciones](#incidencias-y-soluciones)
- [Recursos y referencias](#recursos-y-referencias)

---

## Entradas Diarias

### 07-09-2025 — Creación de la lógica de la máquina

- **Duración:** 1h
- **Autor:** Benjamín Torres.
- **Objetivo del día:** Crear la tabla de estados para la máquina.
- **Actividades realizadas:**
  - Diseño de la lógica de estados para las transiciones de la máquina.
- **Resultados/artefactos:** Se consolidaron las arquitecturas de estado de la máquina.

### 21-09-2025 — Selección de materiales para la máquina

- **Duración:** 1h
- **Autor:** Benjamín Rojas.
- **Objetivo del día:** Seleccionar los materiales más asequibles y propicios para la creación de la máquina.
- **Actividades realizadas:**
  - Discución sobre los materiales y el ensamblado de la máquina. 
- **Resultados/artefactos:** Se eligió la madera como principal material, un arduino como componente lógico y el uso de un sensor TCS34725 RGB para la lectura de la cinta.

### 25-10-2025 — Inicio de la construcción física de la máquina de Turing

- **Duración:** 7h
- **Autor:** Benjamín Rojas y Benjamín Torres.
- **Objetivo del día:** Realizar la base del modelo en base al diagrama ilustrado en entregas anteriores y el código inicial.
- **Actividades realizadas:**
  - Se creo la placa base en la que estaría la máquina de Turing.
  - Se ensambló la torre con el brazo que sostendría el plumón para dibujar las líneas que representarían los 1s y 0s.
  - Se generó el código prototipo que utilizaría la máquina.
  - Se armó el pistón que sostendría el borrador.
  - Se realizaron pruebas de movimiento conectando los componentes antedichos a un joystick. 
- **Resultados/artefactos:** Brazo y Pistón funcionales.

### 29-10-2025 - Adquisición del sensor TCS34725 RGB
- **Duración:** 3h
- **Autor:** Benjamín Torres.
- **Objetivo del día:** Lograr manipular el sensor para mostrar el valor colorimétrico del ambiente y que este fuera imprimido por termnal.
- **Actividades realizadas:**
  - Investigación e instalación de librerías para el uso del sensor.
  - Conexión a Arduino
  - Creación del código para imprimir la colorimetría del ambiente por medio del sensor. 
- **Resultados/artefactos:** Se logró hacer que el sensor detectara la colorimetría del ambiente parcialmente.

### 5-11-2025 - Soporte de la máquina
- **Duración:** 2h
- **Autor:** Benjamín Rojas y Benjamín Torres.
- **Objetivo del día:** Añadir estabilidad a la máquina añadiéndole soportes de apoyo y crear la cinta.
- **Actividades realizadas:**
  - Creación y ensamblaje de los apoyos.
  - Medición y fabricación de la cinta.
- **Resultados/artefactos:** Se logró otorgar estabilidad y altura a la máquina por medio de los apoyos y se ideó la cinta que portaría los 

### 12-11-2025 - Ensamblaje de los servos para la cinta
- **Duración:** 3h
- **Autor:** Benjamín Rojas y Benjamín Torres.
- **Objetivo del día:** Lograr hacer que dos servos muevan la cinta de manera precisa y contínua.
- **Actividades realizadas:**
  - Ensamblaje de los servos para el movimiento horizontal de la cinta.
  - Recubrimiento de las perillas de los servos con lija para metales para dar mayor fricción al momento de mover la cinta.
  - Creación y montaje de carretes para limitar el movimiento lateral de la cinta.
- **Resultados/artefactos:** Se logró hacer que la cinta se moviera de manera precisa y contínua.

### 22-11-2025 - 23-11-2025 Finalización de la máquina de Turing
- **Duración:** 14h
- **Autor:** Benjamín Rojas y Benjamín Torres.
- **Objetivo del día:** Retocar componentes, implementar el sensor y finalizar la máquina de Turing
- **Actividades realizadas:**
  - Ensamblaje de todos los componentes en la máquina.
  - Conexión a Arduino de todos los componentes.
  - Testeo de materiales para implementar un borrador efectivo.
  - Ensamblaje del soporte para la escritura y el borrador en la cinta.
  - Testeo del código para sincronización de todos los componentes.
  - Implementación del sensor TCS34725 RGB
- **Resultados/artefactos:** Se logró finalizar todo exceptuando el sensor, debido a que este experimentó un fallo interno que impidió el curso del proyecto de manera física, por lo que el equipo optó por finalizar la máquina de Turing de manera digital utilizando Three JS

### 24-11-2025 Ajustes visuales y de lógica
- **Duración:** 2h
- **Autor:** Benjamín Rojas y Benjamín Torres.
- **Objetivo del día:** Mejorar la interfaz gráfica de la simulación
- **Actividades realizadas:**
  - Adición de etiquetas con nombres a componentes
  - Adición de modelos 3D de componentes de Arduino
  - Mejora visual de ciertos componentes
  - Ajuste a la lógica de reset de los botones
- **Resultados/artefactos:** Se mejoró el aspecto visual de la simulación, y se arregló un problema con la lógica de los botones de suma y resta.


---


## Decisiones Clave

- **10-09-2025:** Diseño de las tablas de estados.
 - **Razonamiento:** Obtener la resolución más optimizada para el proyecto.

- **22-11-2025:** Continuar el proyecto de manera digital.
 - **Razonamiento:** Opción más viable en vista de la demora en la adquisición de un sensor nuevo.

---

## Incidencias y Soluciones

- **Incidencia:** La cinta se mueve lateralmente debido al relieve de las perillas circulares del servo.
- **Fecha:** 12-11-2025
- **Impacto:** Dificultad en la rotación de la cinta.
- **Acción tomada:** Se cambiaron la perillas por unas planas.
- **Estado:** Resuelta


- **Incidencia:** El sensor no responde a la llamada de la placa.
- **Fecha:** 22-11-2025
- **Impacto:** Imposibilitación en la continuidad física del proyecto.
- **Acción tomada:** Pasar los cambios a formato digital.
- **Estado:** Resuelta

---