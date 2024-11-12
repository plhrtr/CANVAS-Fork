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
      this.add(this.mesh);
    });
  }
}
