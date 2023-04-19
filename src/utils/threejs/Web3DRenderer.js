import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'

// import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import Stats from 'three/examples/jsm/libs/stats.module'
export const THREE = require('three')
// export const TWEEN = require('three/examples/jsm/libs/tween.module.min.js')
const VERSION = '0.0.3'

// Perspective camera  setting
const PERSPECTIVE_CAMERA_POSITION_X = 1500
const PERSPECTIVE_CAMERA_POSITION_Y = 1500
const PERSPECTIVE_CAMERA_POSITION_Z = 1500
const PERSPECTIVE_CAMERA_FOV = 45
const PERSPECTIVE_CAMERA_NEAR = 50
const PERSPECTIVE_CAMERA_FAR = 20000

// Orthographic Camera settting
// const ORTHOGRAPHIC_CAMERA_POSITION_X = 0
// const ORTHOGRAPHIC_CAMERA_POSITION_Y = 3500
// const ORTHOGRAPHIC_CAMERA_POSITION_Z = 0
const ORTHOGRAPHIC_CAMERA_LEFT = window.innerWidth / -2
const ORTHOGRAPHIC_CAMERA_RIGHT = window.innerWidth / 2
const ORTHOGRAPHIC_CAMERA_TOP = window.innerHeight / 2
const ORTHOGRAPHIC_CAMERA_BOTTOM = window.innerHeight / -2
const ORTHOGRAPHIC_CAMERA_NEAR = -200
const ORTHOGRAPHIC_CAMERA_FAR = 20000

// ambient light setting
const AMBIENT_LIGHT_COLOR = 0xffffff
const AMBIENT_LIGHT_INTENSITY = 0.8 // 0~1

// directional light setting
const DIRECTIONAL_LIGHT_COLOR = 0xffffff
const DIRECTIONAL_LIGHT_INTENSITY = 0.8 // 0~1
const DIRECTIONAL_POSITION_X = 50
const DIRECTIONAL_POSITION_Y = 1500
const DIRECTIONAL_POSITION_Z = 50
const DIRECTIONAL_CAST_SHADOW = true

// point light setting
const POINT_LIGHT_COLOR = 0xffffff
const POINT_LIGHT_POSITION_X = 0
const POINT_LIGHT_POSITION_Y = 3000
const POINT_LIGHT_POSITION_Z = 3000

// renderer setting  //0c1e2a
const RENDERER_BACKGROUND_COLOR = 0x161718
const RENDERER_ALPHA = 1 // 0~1

// orbitControls

const MIN_DISTANCE = 500
const MAX_DISTANCE = 10000

let timer = null

// 场景
function createScene() {
  return new THREE.Scene()
}

// 透视相机
function createPerspectiveCamera(w, h, x, y, z) {
  const camera = new THREE.PerspectiveCamera(
    PERSPECTIVE_CAMERA_FOV,
    w / h,
    PERSPECTIVE_CAMERA_NEAR,
    PERSPECTIVE_CAMERA_FAR
  )
  camera.position.set(x, y, z)
  return camera
}

// 正交相机
// eslint-disable-next-line no-unused-vars
function createOrthographicCamera(x, y, z) {
  const camera = new THREE.OrthographicCamera(
    ORTHOGRAPHIC_CAMERA_LEFT,
    ORTHOGRAPHIC_CAMERA_RIGHT,
    ORTHOGRAPHIC_CAMERA_TOP,
    ORTHOGRAPHIC_CAMERA_BOTTOM,
    ORTHOGRAPHIC_CAMERA_NEAR,
    ORTHOGRAPHIC_CAMERA_FAR
  )
  camera.position.set(x, y, z)
  camera.lookAt(0, 0, 0)
  return camera
}

// 基础光
function createAmbientLight() {
  return new THREE.AmbientLight(AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY)
}

// 平行光
function createDirectionalLight() {
  const directionalLight = new THREE.DirectionalLight(DIRECTIONAL_LIGHT_COLOR, DIRECTIONAL_LIGHT_INTENSITY)
  directionalLight.position.set(DIRECTIONAL_POSITION_X, DIRECTIONAL_POSITION_Y, DIRECTIONAL_POSITION_Z)
  directionalLight.castShadow = DIRECTIONAL_CAST_SHADOW
  directionalLight.shadow.camera.far = 1000
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.left = 1000
  directionalLight.shadow.camera.right = -1000
  directionalLight.shadow.camera.top = 1000
  directionalLight.shadow.camera.bottom = -1000
  return directionalLight
}

// 平行光投影辅助线
// eslint-disable-next-line no-unused-vars
function createDirectionalLightHelper(directionalLight) {
  return new THREE.CameraHelper(directionalLight.shadow.camera)
}

// 点光源
function createPointLight() {
  const pointLight = new THREE.PointLight(POINT_LIGHT_COLOR)
  pointLight.position.set(POINT_LIGHT_POSITION_X, POINT_LIGHT_POSITION_Y, POINT_LIGHT_POSITION_Z)
  return pointLight
}

// 环境光
function createEnvironment(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer)

  return pmremGenerator.fromScene(new RoomEnvironment()).texture
}

// 渲染器
function createWebGLRenderer(element, w, h) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(w, h)
  renderer.setClearColor(RENDERER_BACKGROUND_COLOR, RENDERER_ALPHA)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.domElement.className = 'renderer'
  element.appendChild(renderer.domElement)
  return renderer
}

// 坐标轴
function createAxes() {
  return new THREE.AxesHelper(150)
}

// 鼠标视角控制
function createOrbitControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  // 上下翻转的最大角度
  controls.maxPolarAngle = Math.PI / 2
  // 上下翻转的最小角度
  controls.minPolarAngle = 0

  controls.minDistance = MIN_DISTANCE
  controls.maxDistance = MAX_DISTANCE

  controls.update()
  return controls
}

function resize(element, camera, renderer, composer, effectFXAA) {
  if (timer) {
    clearTimeout(timer)
  }

  timer = setTimeout(() => {
    const w = element.clientWidth
    const h = element.clientHeight

    camera.aspect = w / h
    camera.updateProjectionMatrix()

    renderer.setSize(w, h)
    composer.setSize(w, h)

    effectFXAA.uniforms.resolution.value.set(1 / w, 1 / h)
  }, 80)
}

function createComposer(renderer) {
  return new EffectComposer(renderer)
}

function createRenderPass(scene, camera) {
  return new RenderPass(scene, camera)
}

function createOutlinePass(width, height, scene, camera) {
  return new OutlinePass(new THREE.Vector2(width, height), scene, camera)
}

function createFXAA() {
  return new ShaderPass(FXAAShader)
}

/**
 * 初始化threejs
 * @param element canvas对象
 * @param config 自选参数 （自己根据需求改动）
 * @constructor
 */
export function Web3DRenderer(element, config) {
  if (!element) {
    throw new Error('Three need element container')
  }

  this._version = VERSION

  this.THREE = THREE
  // this.TWEEN = TWEEN

  this.perspective = 'perspective'

  this.width = element.clientWidth
  this.height = element.clientHeight

  if (this.width === 0 || this.height === 0) {
    console.warn('The width or the height of canvas container is not available')
  }

  // 初始化场景
  this.scene = createScene()

  // 初始化相机
  this.camera = createPerspectiveCamera(
    this.width,
    this.height,
    PERSPECTIVE_CAMERA_POSITION_X,
    PERSPECTIVE_CAMERA_POSITION_Y,
    PERSPECTIVE_CAMERA_POSITION_Z
  )
  this.camera.name = 'camera'
  this.camera.lookAt(0, 0, 0)
  // 初始化灯光
  this.ambientLight = createAmbientLight()
  this.ambientLight.name = 'ambientLight'
  this.scene.add(this.ambientLight)

  this.directionalLight = createDirectionalLight()
  this.directionalLight.name = 'directionalLight'
  this.scene.add(this.directionalLight)

  this.pointLight = createPointLight()
  // this.scene.add(this.pointLight)

  // 初始化渲染器
  this.renderer = createWebGLRenderer(element, this.width, this.height)
  this.renderer.render(this.scene, this.camera)

  // 添加环境
  this.scene.environment = createEnvironment(this.renderer)

  // 初始化视角控制器
  this.orbitControls = createOrbitControls(this.camera, this.renderer)
  this.orbitControls.update()

  // fbx loader
  this.fbxLoader = new FBXLoader()

  this.scene.add(createAxes())

  // 后期
  // 组合器composer
  this.composer = createComposer(this.renderer)
  // 渲染通道
  this.renderPass = createRenderPass(this.scene, this.camera)
  this.composer.addPass(this.renderPass)
  // 轮廓
  this.outline = createOutlinePass(this.width, this.height, this.scene, this.camera)
  this.outline.edgeStrength = 3.0
  this.outline.edgeGlow = 1.0
  this.outline.edgeThickness = 1.0
  this.outline.pulsePeriod = 3
  this.outline.visibleEdgeColor.set('#fbf85b')
  this.outline.hiddenEdgeColor.set('#a49a35')
  this.composer.addPass(this.outline)
  // 抗锯齿
  this.effectFXAA = createFXAA()
  this.effectFXAA.uniforms.resolution.value.set(1 / this.width, 1 / this.height)
  this.composer.addPass(this.effectFXAA)

  window.addEventListener('resize', () => {
    resize(element, this.camera, this.renderer, this.composer, this.effectFXAA)
  })
}

/**
 * 切换透视相机 正交相机
 */
Web3DRenderer.prototype.switchCamera = function () {
  const { x, y, z } = this.camera.position
  console.log(this.camera instanceof THREE.PerspectiveCamera)
  if (this.camera instanceof THREE.PerspectiveCamera) {
    this.camera = createOrthographicCamera(x, y, z)
    this.orbitControls = createOrbitControls(this.camera, this.renderer)
    this.perspective = 'orthographic'
  } else {
    this.camera = createPerspectiveCamera(this.width, this.height, x, y, z)
    this.orbitControls = createOrbitControls(this.camera, this.renderer)
    this.perspective = 'perspective'
  }
}

/**
 * 设置相机位置
 * @param {object} position {x: 0, y:0, z:0}
 */
Web3DRenderer.prototype.setCameraPosition = function (position) {
  const { x, y, z } = position

  if (x !== undefined) {
    this.camera.position.x = x
  }

  if (y !== undefined) {
    this.camera.position.y = y
  }

  if (z !== undefined) {
    this.camera.position.z = z
  }

  this.orbitControls.update()
}

Web3DRenderer.prototype.showStatus = function () {
  this.stats = new Stats()

  this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(this.stats.dom)
  return this
}

// module.exports = Web3DRenderer
// export default Web3DRenderer
