import * as THREE from "three";

import { Menu } from "menu";
import { ViewHelper } from "compass";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Picker } from "picker";
import { Heliostat, Terrain } from "objects";

let editorInstance = null;

export class Editor {
  constructor() {
    // singleton
    if (editorInstance) return editorInstance;
    editorInstance = this;

    this.menu = new Menu();
    this.canvas = document.getElementById("canvas");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );

    this.camera.position.set(-7.5, 2.5, 0.75);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // since we render multiple times (scene and compass), we need to clear the renderer manually
    this.renderer.autoClear = false;
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.canvas.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.compass = new ViewHelper(
      this.camera,
      this.renderer.domElement,
      200,
      "circles"
    );

    //scene background
    this.skyboxLoader = new THREE.CubeTextureLoader();
    this.skybox = this.skyboxLoader.load([
      "/static/img/skybox/px.png",
      "/static/img/skybox/nx.png",
      "/static/img/skybox/py.png",
      "/static/img/skybox/ny.png",
      "/static/img/skybox/pz.png",
      "/static/img/skybox/nz.png",
    ]);
    this.scene.background = this.skybox;

    this.HemisphereLight = new THREE.HemisphereLight();
    this.scene.add(this.HemisphereLight);

    this.terrain = new Terrain(200);
    this.scene.add(this.terrain);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    this.directionalLight.position.set(50, 50, 100);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.directionalLight.shadow.camera.left = 200;
    this.directionalLight.shadow.camera.right = -200;

    const cameraHelper = new THREE.CameraHelper(
      this.directionalLight.shadow.camera
    );
    this.scene.add(cameraHelper);

    for (let i = 0; i < 41; i++) {
      for (let j = 0; j < 41; j++) {
        const a = new Heliostat();
        a.translateX(-100 + i * 5);
        a.translateZ(-100 + j * 5);

        this.scene.add(a);
      }
    }

    this.picker = new Picker();
    window.addEventListener("resize", () => this.onWindowResize());

    // prevent looking around from deselecting
    this.mouseDownTime;
    this.clickDuration;

    this.canvas.addEventListener("mousedown", (event) => {
      this.mouseDownTime = new Date().getTime();
    });

    this.canvas.addEventListener("mouseup", (event) => {
      const mouseUpTime = new Date().getTime();
      this.clickDuration = mouseUpTime - this.mouseDownTime;
    });

    this.canvas.addEventListener("click", (event) => {
      if (this.clickDuration < 150)
        this.pick({ x: event.clientX, y: event.clientY });
    });

    this.animate();
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }

  render() {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.compass.render(this.renderer);
  }

  updateAspectRatio() {
    this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    this.updateAspectRatio();
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.render();
  }

  pick(pickPosition) {
    // calculate the relative pick position (to canvas)
    const canvasPos = this.canvas.getBoundingClientRect();
    const relX = pickPosition.x - canvasPos.left;
    const relY = pickPosition.y - canvasPos.top;

    // normalize the postions (relative to center)
    const normX = (relX / canvasPos.width) * 2 - 1;
    const normY = (relY / canvasPos.height) * -2 + 1;

    this.picker.pick({ x: normX, y: normY }, this.scene, this.camera);
  }
}
