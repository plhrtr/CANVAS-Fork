import * as THREE from "three";

import { Menu } from "menu";
import { ViewHelper } from "compass";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Picker } from "picker";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { Heliostat } from "objects";

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
    this.canvas.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(this.gridHelper);

    this.compass = new ViewHelper(
      this.camera,
      this.renderer.domElement,
      200,
      "circles"
    );

    this.HemisphereLight = new THREE.HemisphereLight();
    this.scene.add(this.HemisphereLight);

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
      console.log(event);
      if (this.clickDuration < 150)
        this.pick({ x: event.clientX, y: event.clientY });
    });

    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 100; j++) {
        const a = new Heliostat();
        a.translateX(-25 + i * 5);
        a.translateZ(-25 + j * 5);
        this.scene.add(a);
      }
    }
    console.log(this.scene);
    this.animate();
  }
  py;

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
