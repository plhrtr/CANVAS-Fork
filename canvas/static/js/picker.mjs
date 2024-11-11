import * as THREE from "three";

/**
 * Test
 */
export class Picker {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.selectedObject = null;
    this.lastColor = null;
  }
  pick(normalizedPosition, scene, camera) {
    // cast a ray from camera
    this.raycaster.setFromCamera(normalizedPosition, camera);

    // get list of intersected objects
    if (this.selectedObject) {
      this.selectedObject.material.color.set(this.lastColor);
    }
    this.selectedObject = null;
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      for (let i = 0; i < intersectedObjects.length; i++) {
        if (intersectedObjects[i].object.type != "GridHelper") {
          this.selectedObject = intersectedObjects[i].object;
          this.lastColor = this.selectedObject.material.color.getHex();
          this.selectedObject.material.color.set(0xff0000);
          break;
        }
      }
    }
    const event = new CustomEvent("itemSelected", {
      detail: { object: this.selectedObject },
    });
    document.getElementById("inspector").dispatchEvent(event);
  }
}
