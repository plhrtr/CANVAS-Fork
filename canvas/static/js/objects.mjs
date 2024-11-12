import * as THREE from "three";
import { Object3D } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Heliostat extends Object3D {
  constructor() {
    super();
    this.loader = new GLTFLoader();
    this.mesh;
    this.loader.load("/static/models/heliostat.glb", (gltf) => {
      this.mesh = gltf.scene;
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });
      this.add(this.mesh);
    });
  }
}

export class Terrain extends Object3D {
  constructor(size) {
    super();
    this.loader = new THREE.TextureLoader();
    this.terrainTexture = this.loader.load("/static/img/texture.png");
    this.terrainTexture.wrapS = THREE.RepeatWrapping;
    this.terrainTexture.wrapT = THREE.RepeatWrapping;
    this.terrainTexture.repeat.set(100, 100);
    this.terrain = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshStandardMaterial({
        map: this.terrainTexture,
      })
    );
    this.terrain.receiveShadow = true;
    this.terrain.rotateX((3 * Math.PI) / 2);
    this.add(this.terrain);
  }
}
