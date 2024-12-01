import * as THREE from "three";

/**
 * Test
 */
export class Picker {
  constructor(camera, group) {
    this.raycaster = new THREE.Raycaster();
    this.selectedObject = null;
    this.group = group;
    this.camera = camera;
  }
  pick(normalizedPosition) {
    // cast a ray from camera
    this.raycaster.setFromCamera(normalizedPosition, this.camera);

    if (this.selectedObject) {
      this.selectedObject.traverse((child) => {
        if (child.type == "Mesh") {
          child.material.emissive.set(0x000000);
        }
      });
    }
    this.selectedObject = null;
    const intersectedObjects = this.raycaster.intersectObjects(
      this.group.children
    );
    if (intersectedObjects.length) {
      for (let i = 0; i < intersectedObjects.length; i++) {
        if (intersectedObjects[i].object.type == "Mesh") {
          // bubble up to parent -> only two times (mesh -> group -> parent)
          this.selectedObject = intersectedObjects[i].object.parent.parent;
          this.selectedObject.traverse((child) => {
            if (child.type == "Mesh") {
              child.material.emissive.set(0xff0000);
            }
          });
          break;
        }
      }
    }
    const event = new CustomEvent("itemSelected", {
      detail: { object: this.selectedObject },
    });
    document.getElementById("inspector").dispatchEvent(event);
  }

  getSelectedObject() {
    return this.selectedObject;
  }
}
