/**
 * Adapted from three@0.163.0/examples/jsm/helpers/ViewHelper.js, Copyright 2010-2024 Three.js Authors, MIT License
 */

import {
    BoxGeometry,
    CanvasTexture,
    Color,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    OrthographicCamera,
    Sprite,
    SpriteMaterial,
    Vector3,
    Vector4
} from 'three';


class CompassAxis {
    constructor(compass, axisId, color, label) {
        this.axisId = axisId;
        this.axis = new Mesh(compass.geometry, this.getAxisMaterial(color));

        if (this.axisId == 'y') {
            this.axis.rotation.z = Math.PI / 2;
        } else if (this.axisId == 'z') {
            this.axis.rotation.y = - Math.PI / 2;
        }

        compass.add(this.axis);

        this.posAxisHelper = new Sprite(this.getSpriteMaterial(color, label));
        this.posAxisHelper.userData.type = 'pos' + label;

        this.negAxisHelper = new Sprite(this.getSpriteMaterial(color));
        this.negAxisHelper.userData.type = 'neg' + label;

        this.posAxisHelper.position[this.axisId] = 1;
        this.negAxisHelper.position[this.axisId] = - 1;
        this.negAxisHelper.scale.setScalar(0.8);

        compass.add(this.posAxisHelper);
        compass.add(this.negAxisHelper);
    }

    dispose() {
        this.axis.material.dispose();

        this.posAxisHelper.material.map.dispose();
        this.negAxisHelper.material.map.dispose();

        this.posAxisHelper.material.dispose();
        this.negAxisHelper.material.dispose();
    }

    setOpacity(point) {
        if (point[this.axisId] >= 0) {
            this.posAxisHelper.material.opacity = 1;
            this.negAxisHelper.material.opacity = 0.5;
        } else {
            this.posAxisHelper.material.opacity = 0.5;
            this.negAxisHelper.material.opacity = 1;
        }
    }

    getAxisMaterial(color) {
        return new MeshBasicMaterial({ color: color, toneMapped: false });
    }

    getSpriteMaterial(color, text = null) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;

        const context = canvas.getContext('2d');
        context.beginPath();
        context.arc(32, 32, 16, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = color.getStyle();
        context.fill();

        if (text !== null) {
            context.font = '24px Arial';
            context.textAlign = 'center';
            context.fillStyle = '#000000';
            context.fillText(text, 32, 41);
        }

        const texture = new CanvasTexture(canvas);

        return new SpriteMaterial({ map: texture, toneMapped: false });
    }
}

class ViewHelper extends Object3D {

    constructor(camera, domElement) {
        super();
        this.camera = camera
        this.domElement = domElement

        this.orthoCamera = new OrthographicCamera(- 2, 2, 2, - 2, 0, 4);
        this.orthoCamera.position.set(0, 0, 2);

        this.geometry = new BoxGeometry(0.8, 0.05, 0.05).translate(0.4, 0, 0);

        this.xAxis = new CompassAxis(this, 'x', new Color('#ff3653'), 'N');
        this.yAxis = new CompassAxis(this, 'y', new Color('#8adb00'), 'U');
        this.zAxis = new CompassAxis(this, 'z', new Color('#2c8fff'), 'E');

        this.point = new Vector3();
        this.dim = 128;
    }

    render(renderer) {
        this.quaternion.copy(this.camera.quaternion).invert();
        this.updateMatrixWorld();

        this.point.set(0, 0, 1);
        this.point.applyQuaternion(this.camera.quaternion);

        // set opacity so the "hidden" part of each axis is partially transparent
        this.xAxis.setOpacity(this.point);
        this.yAxis.setOpacity(this.point);
        this.zAxis.setOpacity(this.point);

        
        let previousViewport = new Vector4();
        renderer.getViewport(previousViewport); // save current viewport to reset later
        
        // change viewport to dim x dim square in lower right corner
        const x = this.domElement.offsetWidth - this.dim;  // lower left corner of the viewport
        renderer.setViewport(x, 0, this.dim, this.dim);
        
        renderer.clearDepth();
        renderer.render(this, this.orthoCamera);

        renderer.setViewport(previousViewport); // reset to previous viewport
    }

    dispose() {
        this.geometry.dispose();

        this.xAxis.dispose();
        this.yAxis.dispose();
        this.zAxis.dispose();
    }
}

export { ViewHelper };
