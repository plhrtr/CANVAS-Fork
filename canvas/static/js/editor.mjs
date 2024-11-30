import * as THREE from "three";

import { Menu } from "menu";
import { ViewHelper } from "compass";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Picker } from "picker";
import { Heliostat, Terrain, Receiver } from "objects";
import { TransformControls } from "./three/examples/jsm/controls/TransformControls.js";

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
      2000
    );

    this.camera.position.set(-7.5, 2.5, 0.75);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // since we render multiple times (scene and compass), we need to clear the renderer manually
    this.renderer.autoClear = false;
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.canvas.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.screenSpacePanning = false;
    this.controls.maxDistance = 500;
    this.controls.minDistance = 10;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;

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
    this.scene.fog = new THREE.Fog(0xdde0e0, 100, 2200);

    this.HemisphereLight = new THREE.HemisphereLight();
    this.scene.add(this.HemisphereLight);

    this.terrain = new Terrain(3000);
    this.scene.add(this.terrain);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    this.directionalLight.position.set(200, 100, 200);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    this.directionalLight.shadow.mapSize.set(2048, 2048);
    this.directionalLight.shadow.radius = 4;
    this.directionalLight.shadow.blurSamples = 75;
    this.directionalLight.shadow.camera.top = 200;
    this.directionalLight.shadow.camera.bottom = -200;
    this.directionalLight.shadow.camera.left = 400;
    this.directionalLight.shadow.camera.right = -400;
    this.directionalLight.shadow.camera.far = 1000;

    this.selectableGroup = new THREE.Group();
    this.scene.add(this.selectableGroup);
    this.receiver = new Receiver();
    this.selectableGroup.add(this.receiver);

    this.transformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControls.addEventListener("dragging-changed", (event) => {
      this.controls.enabled = !event.value;
    });
    this.scene.add(this.transformControls.getHelper());
    this.transformControls.size = 0.7;

    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "Shift":
          this.transformControls.setTranslationSnap(2);
          this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
          this.transformControls.setScaleSnap(0.25);
          break;
        case "r":
          this.transformControls.mode = "rotate";
          break;
        case "m":
          this.transformControls.mode = "translate";
      }
    });

    window.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "Shift":
          this.transformControls.setTranslationSnap(null);
          this.transformControls.setRotationSnap(null);
          this.transformControls.setScaleSnap(null);
          break;
      }
    });

    for (let i = 1; i <= 12; i++) {
      for (let j = 0; j < 5 + i * 10; j++) {
        const a = new Heliostat();
        a.position.set(
          (20 + i * 10) * Math.sin((j / (5 + i * 10)) * 2 * Math.PI),
          0,
          (20 + i * 10) * Math.cos((j / (5 + i * 10)) * 2 * Math.PI)
        );
        this.selectableGroup.add(a);
      }
    }
    this.picker = new Picker(this.camera, this.selectableGroup);
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
      if (event.target.nodeName == "CANVAS" && this.clickDuration < 150)
        this.pick({ x: event.clientX, y: event.clientY });
    });

    console.log(this.scene);
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
    if (this.picker.getSelectedObject()) {
      this.transformControls.attach(this.picker.getSelectedObject());
    } else {
      this.transformControls.detach();
    }
  }
}
