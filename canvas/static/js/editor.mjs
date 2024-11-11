import * as THREE from "three";

import { Menu } from "menu";
import { ViewHelper } from "compass";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Picker } from "picker";

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

    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(this.geometry, this.material);

    this.material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube2 = new THREE.Mesh(this.geometry, this.material2);
    this.cube2.translateX(5);

    this.material3 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube3 = new THREE.Mesh(this.geometry, this.material3);
    this.cube3.translateX(-5);

    this.scene.add(this.cube);
    this.scene.add(this.cube2);
    this.scene.add(this.cube3);
    this.cube.name = "cube1";
    this.cube3.name = "cube3";
    this.cube2.name = "cube2";

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(this.gridHelper);

    this.compass = new ViewHelper(
      this.camera,
      this.renderer.domElement,
      200,
      "circles"
    );

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
