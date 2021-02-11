import React from 'react'
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl'
import { Renderer, loadAsync } from 'expo-three'
import { Animated, PanResponder, StyleSheet, View } from 'react-native'
import { Mesh, PerspectiveCamera, Scene, SphereBufferGeometry, MeshBasicMaterial } from 'three'

const SPHERE_BACKGROUND_IMAGE = require('./Images/picture-colored.jpg')

// Constants
const SPHERE_GEOMETRY = {
  radius: 1,
  widthSegments: 36,
  heightSegments: 36,
  rotationX: 0.01,
  rotationY: 0.01
}

const CAMERA_Z_POSITION = 2
const CAMERA_FOV_PERSPECTIVE = 75

const App = () => {

  // refs
  const pan = React.useRef(new Animated.ValueXY()).current

  // Pan Responder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y, }], { useNativeDriver: false }),
    onPanResponderRelease: () => { Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start() }
  })

  // Create & Renders
  const createScene = (gl: ExpoWebGLRenderingContext) => {
    return new Scene()
  }

  const createRenderer = (gl: ExpoWebGLRenderingContext) => {
    const renderer = new Renderer({ gl })
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight)
    return renderer
  }

  const createSphere = async (gl: ExpoWebGLRenderingContext) => {
    const texture = await loadAsync(SPHERE_BACKGROUND_IMAGE)
    const material = new MeshBasicMaterial({ map: texture })
    const geometry = new SphereBufferGeometry(SPHERE_GEOMETRY.radius, SPHERE_GEOMETRY.widthSegments, SPHERE_GEOMETRY.heightSegments)
    const sphere = new Mesh(geometry, material)
    return sphere
  }

  const createCamera = async (gl: ExpoWebGLRenderingContext) => {
    const camera = new PerspectiveCamera(CAMERA_FOV_PERSPECTIVE, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000)
    camera.position.z = CAMERA_Z_POSITION
    return camera
  }

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    //create
    const scene = createScene(gl)
    const renderer = createRenderer(gl)
    const camera = await createCamera(gl)
    const sphere = await createSphere(gl)

    // additionals
    scene.add(sphere)

    // render
    const render = () => {
      requestAnimationFrame(render)
      renderer.render(scene, camera)
      sphere.rotation.x += SPHERE_GEOMETRY.rotationX
      sphere.rotation.y += SPHERE_GEOMETRY.rotationY
      gl.endFrameEXP()
    };
    render()
  }

  return (
    <View style={styles.container}>
      <Animated.View  {...panResponder.panHandlers} style={[pan.getLayout(), styles.box]}>
        <GLView style={styles.glViewStyle} onContextCreate={onContextCreate} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 80,
    height: 80,
    alignSelf: 'center'
  },
  glViewStyle: {
    flex: 1
  }
})

export default App