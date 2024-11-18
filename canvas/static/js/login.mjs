import * as THREE from "three";
import { Terrain, Heliostat, Receiver } from "objects";

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
      2000
    );

    // if nothing is visible at big gridhelper to see if scene is even rendering
    this.camera.translateY(30);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;

    this.canvas.appendChild(this.renderer.domElement);

    this.selectableGroup = new THREE.Group();
    this.scene.add(this.selectableGroup);
    this.selectableGroup.add(new Receiver());

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

    //sun light
    this.sun = new THREE.HemisphereLight();
    this.scene.add(this.sun);

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

    this.terrain = new Terrain(3000);
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
    this.scene.fog = new THREE.Fog(0xdde0e0, 100, 2200);

    window.addEventListener("resize", () => this.onWindowResize());
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.camera.position.x = 100 * Math.sin(Date.now() * 0.00005);
    this.camera.position.z = 100 * Math.cos(Date.now() * 0.00005);
    this.camera.lookAt(0, 10, 0);
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
