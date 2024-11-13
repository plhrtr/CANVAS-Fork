import * as THREE from "three";
import { Terrain } from "objects";

export class LoginBackground {
  constructor() {
    // the is the html element where the scene is going to be rendered
    this.canvas = document.getElementById("loginBg");

    // scene were everything is placed
    this.scene = new THREE.Scene();

    // camera for rednering the scene
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );

    // if nothing is visible at big gridhelper to see if scene is even rendering
    this.camera.position.set(0, 5, 100);
    this.camera.translateY(10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;

    this.canvas.appendChild(this.renderer.domElement);

    // add a donut
    this.geometry = new THREE.TorusGeometry(10, 5, 100);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xff6347,
    });
    this.torus = new THREE.Mesh(this.geometry, this.material);
    this.torus.translateY(15);
    this.torus.castShadow = true;
    this.scene.add(this.torus);

    // add a cube
    this.geometryCube = new THREE.BoxGeometry(5, 5, 5);
    this.materialCube = new THREE.MeshStandardMaterial({
      color: 0x3f9502,
    });
    this.cube = new THREE.Mesh(this.geometryCube, this.materialCube);
    this.cube.translateX(25);
    this.cube.translateY(7);
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    //sun light
    this.sun = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);
    this.scene.add(this.sun);

    this.light = new THREE.DirectionalLight(0xffffbb, 3);
    this.light.position.set(10, 20, 50);
    this.light.target.lookAt(this.cube);
    this.light.castShadow = true;
    this.scene.add(this.light);
    this.light.shadow.camera.top = 100;
    this.light.shadow.camera.bottom = -100;
    this.light.shadow.camera.right = 100;
    this.light.shadow.camera.left = -100;

    this.terrain = new Terrain(200);
    this.scene.add(this.terrain);

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

    window.addEventListener("resize", () => this.onWindowResize());
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.camera.position.x = 50 * Math.sin(Date.now() * 0.00005);
    this.camera.position.z = 50 * Math.cos(Date.now() * 0.00005);
    this.camera.lookAt(this.torus.position);
    this.renderer.render(this.scene, this.camera);
  }

  updateAspectRatio() {
    this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    this.updateAspectRatio();
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
  }
}
