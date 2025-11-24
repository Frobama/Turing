import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'

// Símbolos de la cinta
const BLANK = 'B'  // Blanco (vacío)
const ZERO = '0'   // 1 raya negra
const ONE = '1'    // 2 rayas negras

// Tablas de transición para SUMA
const SUMA_TRANSITIONS = {
  'q0': {
    '1': { write: '1', move: 'R', next: 'q0' },
    '0': { write: '1', move: 'R', next: 'q1' },
  },
  'q1': {
    '1': { write: '1', move: 'R', next: 'q1' },
    'B': { write: 'B', move: 'L', next: 'q2' },
  },
  'q2': {
    '1': { write: 'B', move: '~', next: 'qe' },
  }
}

// Tablas de transición para RESTA
const RESTA_TRANSITIONS = {
  'q0': {
    '1': { write: '1', move: 'R', next: 'q0' },
    '0': { write: '0', move: 'R', next: 'q1' },
    'B': { write: 'B', move: '~', next: 'qf' },
  },
  'q1': {
    '1': { write: '1', move: 'R', next: 'q1' },
    '0': { write: '0', move: '~', next: 'qf' },
    'B': { write: 'B', move: 'L', next: 'q2' },
  },
  'q2': {
    '1': { write: 'B', move: 'L', next: 'q3' },
    '0': { write: 'B', move: '~', next: 'qf' },
    'B': { write: 'B', move: '~', next: 'qf' },
  },
  'q3': {
    '1': { write: '1', move: 'L', next: 'q3' },
    '0': { write: '0', move: 'L', next: 'q3' },
    'B': { write: 'B', move: 'R', next: 'q4' },
  },
  'q4': {
    '1': { write: 'B', move: 'R', next: 'q0' },
    '0': { write: 'B', move: '~', next: 'qf' },
    'B': { write: 'B', move: '~', next: 'qf' },
  }
}


class TuringMachine {
  constructor(scene) {
    this.scene = scene
    this.tape = []
    this.headPosition = 0
    this.currentState = 'q0'
    this.transitions = null
    this.isRunning = false
    this.tapeObjects = []
    this.head = null
    this.cellsGroup = null
    this.tapeSize = 50
    this.animationSpeed = 300 // ms

    // --- Valores Geométricos ---
    this.straightLength = 40
    this.curveRadius = 4
    this.tapeWidth = 0.1
    this.tapeThickness = 2
    this.outerRadius = this.curveRadius + this.tapeWidth / 2
    this.halfStraight = this.straightLength / 2
    this.perimeter = 2 * this.straightLength + 2 * Math.PI * this.outerRadius

    this.createTape()
    this.createHead()
  }

  createTape() {
    const tapeGroup = new THREE.Group()
    const shape = new THREE.Shape()

    // Contorno exterior (en el plano XY)
    shape.moveTo(-this.halfStraight, this.outerRadius)
    shape.lineTo(this.halfStraight, this.outerRadius)
    shape.absarc(this.halfStraight, 0, this.outerRadius, Math.PI / 2, -Math.PI / 2, true)
    shape.lineTo(-this.halfStraight, -this.outerRadius)
    shape.absarc(-this.halfStraight, 0, this.outerRadius, -Math.PI / 2, Math.PI / 2, true)

    // Agujero interior
    const innerRadius = this.curveRadius - this.tapeWidth / 2
    const hole = new THREE.Path()
    hole.moveTo(-this.halfStraight, innerRadius)
    hole.lineTo(this.halfStraight, innerRadius)
    hole.absarc(this.halfStraight, 0, innerRadius, Math.PI / 2, -Math.PI / 2, true)
    hole.lineTo(-this.halfStraight, -innerRadius)
    hole.absarc(-this.halfStraight, 0, innerRadius, -Math.PI / 2, Math.PI / 2, true)
    shape.holes.push(hole)

    // Extruir a lo largo de Z para darle grosor
    const extrudeSettings = { depth: this.tapeThickness, bevelEnabled: false }
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 30, side: THREE.DoubleSide })
    
    const tapeMesh = new THREE.Mesh(geometry, material)
    // Centrar la cinta en el origen Z
    tapeMesh.position.z = -this.tapeThickness / 2

    tapeGroup.add(tapeMesh)
    this.scene.add(tapeGroup)

    this.cellsGroup = new THREE.Group()
    this.scene.add(this.cellsGroup)

    for (let i = 0; i < this.tapeSize; i++) {
        const cell = this.createCell(i)
        this.tapeObjects.push(cell)
        this.cellsGroup.add(cell.group)
    }

    // Crear servomotores con carretes
    this.createMotors()

    this.updateTapePosition()

    this.createBase()
  }

  createBase() {
    const baseGroup = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(40, 2, 15),
      new THREE.MeshPhongMaterial({ color: 0x654321 })      
    )
    base.position.z = 9.16
    base.position.y = 2.5
    baseGroup.add(base)

    const writerSupport = new THREE.Mesh(
      new THREE.BoxGeometry(1, 8, 3),
      new THREE.MeshPhongMaterial({ color: 0x654321 })      
    )
    writerSupport.position.set(-1.5, 6, 3.16)
    baseGroup.add(writerSupport)

    const positionsX = [19, -19]
    const positionsZ = [2.65, 15.65]
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
          const baseSupport = new THREE.Mesh(
          new THREE.BoxGeometry(2,10,2),
          new THREE.MeshPhongMaterial({ color: 0x654321 })     
        )
        baseSupport.position.set(positionsX[i], -3.5, positionsZ[j])
        baseGroup.add(baseSupport)
      }
    }

    const servo1 = this.createServoMotor();
    servo1.rotation.y = Math.PI ;
    servo1.rotation.x = - Math.PI / 2;
    servo1.position.set(21,0,2.65);
    baseGroup.add(servo1);
    const servo2 = this.createServoMotor();
    servo2.rotation.y = Math.PI ;
    servo2.rotation.x = - Math.PI / 2;
    servo2.position.set(-21,0,2.65);
    baseGroup.add(servo2);

    // --- Protoboard (placa) detrás sobre la mesa ---
    // Rectángulo bajo, no muy alto; colocado hacia la parte trasera (z mayor)
    const protoboard = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.6, 6), 
      new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 30 }) 
    )
    // Posicionar centrado en X, ligeramente por encima de la superficie de la mesa en Y,
    // y hacia atrás en Z (detrás del soporte central). Ajusta valores si quieres moverla.
    protoboard.position.set(-7, 3.8, 11.5)
    baseGroup.add(protoboard)
    // Guardar referencia para etiquetas/interacción
    this.protoboard = protoboard

    this.scene.add(baseGroup)

    // Arduino UNO
    const arduinoGroup = new THREE.Group()
    
    // PCB principal (placa azul característica del Arduino UNO)
    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.2, 5.3),
      new THREE.MeshPhongMaterial({ color: 0x006699, shininess: 30 })
    )
    arduinoGroup.add(pcb)
    
    // Puerto USB (conector plateado) - movido cerca del power jack
    const usb = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.6, 1.2),
      new THREE.MeshPhongMaterial({ color: 0xc0c0c0 })
    )
    usb.position.set(-3.2, 0.4, 0)
    arduinoGroup.add(usb)
    
    // Conector de alimentación (cilindro negro) - junto al USB
    const powerJack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16),
      new THREE.MeshPhongMaterial({ color: 0x000000 })
    )
    powerJack.rotation.z = Math.PI / 2
    powerJack.position.set(-3, 0.4, 1.2)
    arduinoGroup.add(powerJack)
    
    // Microcontrolador ATmega328 (chip negro cuadrado grande)
    const atmega = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.3, 0.8),
      new THREE.MeshPhongMaterial({ color: 0x1a1a1a })
    )
    atmega.position.set(0.5, 0.25, 0.5)
    arduinoGroup.add(atmega)
    
    // Pines header (filas de conectores) - en la orilla opuesta (z positivo)
    const pinMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
    
    // Fila de pines izquierda
    const leftPins = new THREE.Mesh(
      new THREE.BoxGeometry(6,0.3, 0.4),
      pinMaterial
    )
    leftPins.position.set(0, 0.3, -2.0)
    arduinoGroup.add(leftPins)
    
    // Fila de pines derecha
    const rightPins = new THREE.Mesh(
      new THREE.BoxGeometry(6,0.3, 0.4),
      pinMaterial
    )
    rightPins.position.set(0, 0.3, 2.0)
    arduinoGroup.add(rightPins)
    
    // LED de encendido (verde)
    const powerLED = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.15, 1),
      new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x003300 })
    )
    powerLED.position.set(-1.5, 0.2, -1.8)
    arduinoGroup.add(powerLED)
    
    arduinoGroup.position.set(-7, 3.8, 5.5)
    baseGroup.add(arduinoGroup)
    this.arduino = arduinoGroup
  }

  createServoMotor() {
    // Crear un modelo de servomotor estilo SG90 o similar
    const servoGroup = new THREE.Group()
    
    // Cuerpo principal del servo (caja azul característica)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 1.2, 2.2),
      new THREE.MeshPhongMaterial({ color: 0x1a5490, shininess: 40 })
    )
    servoGroup.add(body)
    
    // Tapa superior con tornillos (parte gris/plateada)
    const topCap = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.2, 2.4),
      new THREE.MeshPhongMaterial({ color: 0xa0a0a0 })
    )
    topCap.position.y = 0.7
    servoGroup.add(topCap)
    
    // Orejetas de montaje (laterales con agujeros)
    const mountingEar1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 2.4),
      new THREE.MeshPhongMaterial({ color: 0xa0a0a0 })
    )
    mountingEar1.position.set(-1.3, 0, 0)
    servoGroup.add(mountingEar1)
    
    const mountingEar2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 2.4),
      new THREE.MeshPhongMaterial({ color: 0xa0a0a0 })
    )
    mountingEar2.position.set(1.3, 0, 0)
    servoGroup.add(mountingEar2)
    
    // Eje de salida (cilindro blanco que sobresale)
    const outputShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.6, 16),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    )
    outputShaft.position.y = 0.9
    servoGroup.add(outputShaft)
    
    // Cables de conexión (3 cables pequeños)
    const cableColors = [0xff6600, 0xff0000, 0x8b4513] // Naranja, Rojo, Marrón
    for (let i = 0; i < 3; i++) {
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8),
        new THREE.MeshPhongMaterial({ color: cableColors[i] })
      )
      cable.rotation.x = Math.PI / 2
      cable.position.set(-0.4 + i * 0.4, -0.3, -1.8)
      servoGroup.add(cable)
    }
    
    // Etiqueta/sticker en el frente
    const label = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.6, 0.05),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    )
    label.position.set(0, 0.2, 1.125)
    servoGroup.add(label)
    
    return servoGroup
  }
  
  createMotors() {
    // SERVOMOTOR Y CARRETE IZQUIERDO (centro en -halfStraight, 0)
    const leftMotorGroup = new THREE.Group()
    
    // Crear carrete con forma de bobina (eje central + discos en los extremos)
    const leftReelGroup = new THREE.Group()
    
    // Eje central del carrete (donde va enrollada la cinta)
    const leftCentralAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(this.curveRadius - 0.25, this.curveRadius - 0.25, 3, 32),
      new THREE.MeshPhongMaterial({ color: 0x303030 })
    )
    leftReelGroup.add(leftCentralAxis)
    
    // Disco superior (borde del carrete)
    const leftTopDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(this.curveRadius + 1.3, this.curveRadius + 1.3, 0.3, 32),
      new THREE.MeshPhongMaterial({ color: 0xBC9E82 })
    )
    leftTopDisc.position.y = 1.5
    leftReelGroup.add(leftTopDisc)
    
    // Disco inferior (borde del carrete)
    const leftBottomDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(this.curveRadius + 1.3, this.curveRadius + 1.3, 0.3, 32),
      new THREE.MeshPhongMaterial({ color: 0xBC9E82 })
    )
    leftBottomDisc.position.y = -1.5
    leftReelGroup.add(leftBottomDisc)
    
    leftReelGroup.rotation.x = Math.PI / 2 // Rotar para que el eje quede en Z
    leftMotorGroup.add(leftReelGroup)
    
    // Servo motor (caja conectada al carrete)
    const leftServo = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 1.5),
      new THREE.MeshPhongMaterial({ color: 0x1a5490 }) // Azul típico de servos
    )
    leftServo.position.z = -2
    leftMotorGroup.add(leftServo)
    
    leftMotorGroup.position.set(-this.halfStraight, 0, 0)
    this.scene.add(leftMotorGroup)
    this.leftMotor = leftMotorGroup
    
    // SERVOMOTOR Y CARRETE DERECHO (centro en halfStraight, 0)
    const rightMotorGroup = new THREE.Group()
    
    // Crear carrete con forma de bobina
    const rightReelGroup = new THREE.Group()
    
    // Eje central del carrete
    const rightCentralAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(this.curveRadius - 0.25, this.curveRadius - 0.25, 3, 32),
      new THREE.MeshPhongMaterial({ color: 0x303030 })
    )
    rightReelGroup.add(rightCentralAxis)
    
    // Disco superior
    const rightTopDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(this.curveRadius + 1.3, this.curveRadius + 1.3, 0.3, 32),
      new THREE.MeshPhongMaterial({ color: 0xBC9E82 })
    )
    rightTopDisc.position.y = 1.5
    rightReelGroup.add(rightTopDisc)
    
    // Disco inferior
    const rightBottomDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(this.curveRadius + 1.3, this.curveRadius + 1.3, 0.3, 32),
      new THREE.MeshPhongMaterial({ color: 0xBC9E82 })
    )
    rightBottomDisc.position.y = -1.5
    rightReelGroup.add(rightBottomDisc)
    
    rightReelGroup.rotation.x = Math.PI / 2
    rightMotorGroup.add(rightReelGroup)
    
    // Servo motor
    const rightServo = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 1.5),
      new THREE.MeshPhongMaterial({ color: 0x1a5490 })
    )
    rightServo.position.z = -2
    rightMotorGroup.add(rightServo)
    
    rightMotorGroup.position.set(this.halfStraight, 0, 0)
    this.scene.add(rightMotorGroup)
    this.rightMotor = rightMotorGroup
  }

  // CAMBIO: Ahora devuelve Y en lugar de Z para trabajar en el plano XY
  getPositionAndOrientationOnOval(distance) {
    const sideLength = this.straightLength
    const curveLength = Math.PI * this.outerRadius
    
    let x, y, angle = 0

    while (distance < 0) distance += this.perimeter
    distance = distance % this.perimeter

    if (distance < sideLength) {
      // Lado superior
      x = -this.halfStraight + distance
      y = this.outerRadius
      angle = 0
    } else if (distance < sideLength + curveLength) {
      // Curva derecha
      const curveProgress = (distance - sideLength) / curveLength
      const currentAngle = Math.PI / 2 - curveProgress * Math.PI
      x = this.halfStraight + this.outerRadius * Math.cos(currentAngle)
      y = this.outerRadius * Math.sin(currentAngle)
      angle = -curveProgress * Math.PI
    } else if (distance < 2 * sideLength + curveLength) {
      // Lado inferior
      x = this.halfStraight - (distance - sideLength - curveLength)
      y = -this.outerRadius
      angle = -Math.PI
    } else {
      // Curva izquierda
      const curveProgress = (distance - 2 * sideLength - curveLength) / curveLength
      const currentAngle = -Math.PI / 2 - curveProgress * Math.PI
      x = -this.halfStraight + this.outerRadius * Math.cos(currentAngle)
      y = this.outerRadius * Math.sin(currentAngle)
      angle = -Math.PI - curveProgress * Math.PI
    }
    
    return { position: { x, y }, angle }
  }

  createCell(index) {
    return { group: new THREE.Group(), symbol: BLANK, marks: [] }
  }

  // CAMBIO: Posicionar el cabezal para la cinta vertical
  createHead() {
    // Sensor RGB principal
    const geometry = new THREE.BoxGeometry(2, 1.5, 1.5)
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x330000, shininess: 100 })
    this.head = new THREE.Mesh(geometry, material)
    this.head.position.set(0, this.outerRadius, this.tapeThickness)
    this.scene.add(this.head)

    // BRAZO DE ESCRITURA (servo con plumón)
    const armGroup = new THREE.Group()
    
    // Base del servo (pequeño cubo gris) - en el origen del grupo (pivote)
    const servoBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.6),
      new THREE.MeshPhongMaterial({ color: 0x404040 })
    )
    servoBase.position.set(0, 0, 0)
    armGroup.add(servoBase)
    
    // Brazo articulado - extendiéndose hacia abajo desde el pivote (más largo)
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 5.8, 0.2),
      new THREE.MeshPhongMaterial({ color: 0x606060 })
    )
    arm.position.set(0, -2.4, 0)
    armGroup.add(arm)
    
    // Plumón negro en la punta - al final del brazo
    const marker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.4),
      new THREE.MeshPhongMaterial({ color: 0x000000 })
    )
    marker.position.set(0, -5.4, 0)
    armGroup.add(marker)
    
    // Posicionar el grupo más arriba
    armGroup.position.set(-1.5, this.outerRadius + 5.5, this.tapeThickness-0.5)
    armGroup.rotation.x = Math.PI * 3 / 8
    this.scene.add(armGroup)
    this.writerArm = armGroup

    // PISTÓN DE BORRADO (con esponjita)
    const eraserGroup = new THREE.Group()
    
    // Cilindro del pistón
    const piston = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 3),
      new THREE.MeshPhongMaterial({ color: 0x808080 })
    )
    piston.position.set(0, 1, 0)
    eraserGroup.add(piston)
    
    const servo = new THREE.Mesh(
      new THREE.BoxGeometry(1,1.3,1),
      new THREE.MeshPhongMaterial({ color: 0x4292c6 })
    )
    servo.position.set(0, 3, 0)
    eraserGroup.add(servo)

    // Esponjita amarilla en la punta
    const sponge = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.5),
      new THREE.MeshPhongMaterial({ color: 0xffff00 })
    )
    sponge.position.set(0, -0.6, 0)
    eraserGroup.add(sponge)
    
    eraserGroup.position.set(1.5, this.outerRadius+0.2, this.tapeThickness)
    eraserGroup.rotation.x = Math.PI / 2
    this.scene.add(eraserGroup)
    this.eraserPiston = eraserGroup
  }

  async drawSymbol(cellIndex, symbol) {
    const cell = this.tapeObjects[cellIndex]
    const oldSymbol = cell.symbol
    
    // Solo animar si hay cambio real en la cinta
    if (oldSymbol === symbol) {
      return // No hay cambio, no hacer nada
    }
    
    // Si está borrando (escribiendo BLANK sobre algo que no es BLANK)
    if (symbol === BLANK && oldSymbol !== BLANK) {
      await this.animateEraser()
    }
    // Si está escribiendo (símbolo nuevo que no es BLANK y diferente del anterior)
    else if (symbol !== BLANK && oldSymbol !== symbol) {
      await this.animateWriter()
    }
    
    // Limpiar marcas anteriores
    cell.marks.forEach(mark => cell.group.remove(mark))
    cell.marks = []
    cell.symbol = symbol

    // Agregar nuevas marcas si corresponde
    if (symbol === ZERO) {
      const mark = this.createMark()
      mark.position.x = 0 // Centrar la marca única
      cell.group.add(mark)
      cell.marks.push(mark)
    } else if (symbol === ONE) {
      const mark1 = this.createMark()
      mark1.position.x = -0.2 // Separar en X
      const mark2 = this.createMark()
      mark2.position.x = 0.2
      cell.group.add(mark1, mark2)
      cell.marks.push(mark1, mark2)
    }
  }

  async animateWriter() {
    // Rotar el brazo del plumón hacia la cinta
    const originalRotation = this.writerArm.rotation.x
    const targetRotation = originalRotation - Math.PI / 3 // Rotar 60 grados
    
    // Animación de rotación hacia la cinta
    for (let i = 0; i <= 10; i++) {
      this.writerArm.rotation.x = originalRotation + (targetRotation - originalRotation) * (i / 10)
      await this.sleep(20)
    }
    
    // Pequeña pausa mientras dibuja
    await this.sleep(100)
    
    // Animación de rotación de regreso
    for (let i = 0; i <= 10; i++) {
      this.writerArm.rotation.x = targetRotation + (originalRotation - targetRotation) * (i / 10)
      await this.sleep(20)
    }
  }

  async animateEraser() {
    // Bajar el pistón con la esponjita
    const originalZ = this.eraserPiston.position.z
    const targetZ = originalZ - 2.5
    
    // Animación de bajada
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i <= 10; i++) {
          this.eraserPiston.position.z = originalZ + (targetZ - originalZ) * (i / 10)
          await this.sleep(20)
        }
        
        // Pequeña pausa mientras borra
        await this.sleep(100)
        
        // Animación de subida
        for (let i = 0; i <= 10; i++) {
          this.eraserPiston.position.z = targetZ + (originalZ - targetZ) * (i / 10)
          await this.sleep(20)
        }
    }
    
  }

  // CAMBIO: Geometría de la marca para que sea una línea vertical
  createMark() {
    // Geometría: ancho, alto, profundidad. Una línea alta y delgada.
    const geometry = new THREE.BoxGeometry(0.15, 0.05, 1.5) 
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
    return new THREE.Mesh(geometry, material)
  }

  async initializeTape(num1, num2, operation) {
    this.reset()
    let pos = Math.floor(this.tapeSize / 2) - 10
    
    // Dibujar los números iniciales sin animación (solo en setup)
    for (let i = 0; i < num1; i++) {
      const cell = this.tapeObjects[pos]
      cell.symbol = ONE
      const mark1 = this.createMark()
      mark1.position.x = -0.2
      const mark2 = this.createMark()
      mark2.position.x = 0.2
      cell.group.add(mark1, mark2)
      cell.marks.push(mark1, mark2)
      pos++
    }
    
    // Separador
    const cell = this.tapeObjects[pos]
    cell.symbol = ZERO
    const mark = this.createMark()
    mark.position.x = 0
    cell.group.add(mark)
    cell.marks.push(mark)
    pos++
    
    for (let i = 0; i < num2; i++) {
      const cell = this.tapeObjects[pos]
      cell.symbol = ONE
      const mark1 = this.createMark()
      mark1.position.x = -0.2
      const mark2 = this.createMark()
      mark2.position.x = 0.2
      cell.group.add(mark1, mark2)
      cell.marks.push(mark1, mark2)
      pos++
    }
    
    this.headPosition = Math.floor(this.tapeSize / 2) - 10
    this.transitions = operation === 'suma' ? SUMA_TRANSITIONS : RESTA_TRANSITIONS
    this.currentState = 'q0'
    
    this.updateHeadLook()
    this.updateTapePosition()
  }

  updateHeadLook() {
    const symbol = this.tapeObjects[this.headPosition].symbol
    const color = symbol === BLANK ? 0xffffff : (symbol === ZERO ? 0xff0000 : 0x00ff00);
    this.head.material.color.setHex(color)
  }

  // CAMBIO CRÍTICO: Posicionar en XY y rotar en Z
  updateTapePosition() {
    // El cabezal está en (0, outerRadius), que corresponde al centro del lado superior
    // La distancia en el perímetro para x=0, y=outerRadius es straightLength/2
    const headReadDistance = this.straightLength / 2;
    const targetCellNaturalDistance = (this.headPosition / this.tapeSize) * this.perimeter;
    const shiftDistance = headReadDistance - targetCellNaturalDistance;

    for (let i = 0; i < this.tapeSize; i++) {
        const cell = this.tapeObjects[i];
        const naturalDistance = (i / this.tapeSize) * this.perimeter;
        const finalDistance = naturalDistance + shiftDistance;

        const { position, angle } = this.getPositionAndOrientationOnOval(finalDistance);
        
        // Posicionar en el plano XY, sobre la cara frontal de la cinta
        cell.group.position.set(position.x, position.y, 0);
        
        // La rotación correcta es alrededor del eje Z
        cell.group.rotation.z = angle;

        const rotationAngle = -(shiftDistance / this.perimeter) * Math.PI * 2;
        this.leftMotor.rotation.z = rotationAngle;
        this.rightMotor.rotation.z = rotationAngle;
    }
  }

  async step() {
    if (this.currentState === 'qe' || this.currentState === 'qf') {
      this.isRunning = false
      return false
    }

    const currentSymbol = this.tapeObjects[this.headPosition].symbol
    const transition = this.transitions[this.currentState]?.[currentSymbol]
    
    if (!transition) {
      console.error(`No hay transición para estado ${this.currentState} con símbolo ${currentSymbol}`)
      this.isRunning = false
      return false
    }

    // Esperar a que termine la animación de escritura/borrado
    await this.drawSymbol(this.headPosition, transition.write)
    
    if (transition.move === 'R') this.headPosition++
    else if (transition.move === 'L') this.headPosition--
    
    this.headPosition = (this.headPosition + this.tapeSize) % this.tapeSize
    this.currentState = transition.next
    
    this.updateTapePosition()
    this.updateHeadLook()
    
    updateStateDisplay(this.currentState)
    await this.sleep(this.animationSpeed)
    
    return true
  }

  async run() {
    this.isRunning = true
    while (this.isRunning && await this.step()) {}
    
    if (!this.isRunning) {
      // Contar solo los UNOs contiguos desde el inicio
      const tapeString = this.tapeObjects.map(c => c.symbol).join('')
      console.log('Cinta final:', tapeString)
      
      const result = this.tapeObjects.filter(cell => cell.symbol === ONE).length
      console.log('Total de 1s en la cinta:', result)
      
      updateStateDisplay(`Finalizado: ${this.currentState}. Resultado: ${result}`)
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  reset() {
    this.isRunning = false
    this.currentState = 'q0'
    this.headPosition = Math.floor(this.tapeSize / 2) - 10
    for (let i = 0; i < this.tapeSize; i++) {
      this.drawSymbol(i, BLANK)
    }
    this.updateTapePosition()
    this.updateHeadLook()
    updateStateDisplay('Listo')
  }
}

// Configurar Three.js
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// CAMBIO: Posición de cámara para ver la cinta de frente
camera.position.set(0, 0, 30)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.querySelector('#app').appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4)
directionalLight.position.set(10, 20, 10)
scene.add(directionalLight)

const turingMachine = new TuringMachine(scene)

// --- Etiquetas 2D (HTML) y hover ---
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none' // que no bloquee los eventos del canvas
document.querySelector('#app').appendChild(labelRenderer.domElement)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let currentHover = null

function createLabel(targetObject, text, yOffset = 1.5) {
  const div = document.createElement('div')
  div.className = 'label'
  div.textContent = text
  div.style.display = 'none' // oculto por defecto

  const labelObj = new CSS2DObject(div)
  labelObj.position.set(0, yOffset, 0)
  targetObject.add(labelObj)
  return { div, labelObj }
}

// Crear etiquetas para objetos clave (si existen)
const labels = {}
if (turingMachine.protoboard) labels.protoboard = createLabel(turingMachine.protoboard, 'Protoboard')
if (turingMachine.leftMotor) labels.leftMotor = createLabel(turingMachine.leftMotor, 'Motor izquierdo')
if (turingMachine.rightMotor) labels.rightMotor = createLabel(turingMachine.rightMotor, 'Motor derecho')
if (turingMachine.head) labels.head = createLabel(turingMachine.head, 'Cabezal \n TCS35725', 2.2)
if (turingMachine.writerArm) labels.writerArm = createLabel(turingMachine.writerArm, 'Brazo de escritura', 2.2)
if (turingMachine.eraserPiston) labels.eraserPiston = createLabel(turingMachine.eraserPiston, 'Pistón de borrado', 2.2)
if (turingMachine.arduino) labels.arduino = createLabel(turingMachine.arduino, 'Arduino', 1.5)

// 
function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const interactive = []
  if (turingMachine.protoboard) interactive.push(turingMachine.protoboard)
  if (turingMachine.leftMotor) interactive.push(turingMachine.leftMotor)
  if (turingMachine.rightMotor) interactive.push(turingMachine.rightMotor)
  if (turingMachine.head) interactive.push(turingMachine.head)

  const intersects = raycaster.intersectObjects(interactive, true)
  if (intersects.length > 0) {
    const found = intersects[0].object // mesh intersectado
    // encontrar cuál de los objetos principales contiene el mesh intersectado
    let owner = null
    if (turingMachine.head && (found === turingMachine.head || turingMachine.head.children.includes(found))) owner = 'head'
    else if (turingMachine.leftMotor && (found === turingMachine.leftMotor || turingMachine.leftMotor.children.includes(found))) owner = 'leftMotor'
    else if (turingMachine.rightMotor && (found === turingMachine.rightMotor || turingMachine.rightMotor.children.includes(found))) owner = 'rightMotor'
    else if (turingMachine.protoboard && (found === turingMachine.protoboard || turingMachine.protoboard.children.includes(found))) owner = 'protoboard'

    if (owner && currentHover !== owner) {
      // ocultar anterior
      if (currentHover && labels[currentHover]) labels[currentHover].div.style.display = 'none'
      currentHover = owner
      if (labels[owner]) labels[owner].div.style.display = 'block'
    }
  } else {
    if (currentHover && labels[currentHover]) labels[currentHover].div.style.display = 'none'
    currentHover = null
  }
}

window.addEventListener('pointermove', onPointerMove)

// Event Listeners
document.getElementById('suma').addEventListener('click', async () => {
  const num1 = parseInt(document.getElementById('num1').value) || 0
  const num2 = parseInt(document.getElementById('num2').value) || 0
  await turingMachine.initializeTape(num1, num2, 'suma')
  turingMachine.run()
})

document.getElementById('resta').addEventListener('click', async () => {
  const num1 = parseInt(document.getElementById('num1').value) || 0
  const num2 = parseInt(document.getElementById('num2').value) || 0
  await turingMachine.initializeTape(num1, num2, 'resta')
  turingMachine.run()
})

document.getElementById('reset').addEventListener('click', () => {
  turingMachine.reset()
})

function updateStateDisplay(text) {
  document.getElementById('estado').textContent = `Estado: ${text}`
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
  // Renderizar etiquetas HTML 2D
  if (typeof labelRenderer !== 'undefined') labelRenderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})