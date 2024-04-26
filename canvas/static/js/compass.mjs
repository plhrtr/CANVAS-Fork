/**
 * Adapted from three@0.163.0/examples/jsm/helpers/ViewHelper.js, Copyright 2010-2024 Three.js Authors, MIT License
 */

import {
    BoxGeometry,
    CanvasTexture,
    Color,
    Euler,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    OrthographicCamera,
    Quaternion,
    Raycaster,
    Sprite,
    SpriteMaterial,
    Vector2,
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

    getInteractiveObjects() {
        return [this.posAxisHelper, this.negAxisHelper];
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

        this.isViewHelper = true;

        this.animating = false;
        this.center = new Vector3();

        const color1 = new Color('#ff3653');
        const color2 = new Color('#8adb00');
        const color3 = new Color('#2c8fff');

        this.raycaster = new Raycaster();
        this.mouse = new Vector2();
        this.dummy = new Object3D();

        this.orthoCamera = new OrthographicCamera(- 2, 2, 2, - 2, 0, 4);
        this.orthoCamera.position.set(0, 0, 2);

        this.geometry = new BoxGeometry(0.8, 0.05, 0.05).translate(0.4, 0, 0);

        this.xAxis = new CompassAxis(this, 'x', color1, 'N');
        this.yAxis = new CompassAxis(this, 'y', color2, 'U');
        this.zAxis = new CompassAxis(this, 'z', color3, 'E');

        this.interactiveObjects = [].concat(this.xAxis.getInteractiveObjects(), this.yAxis.getInteractiveObjects(), this.yAxis.getInteractiveObjects());

        this.point = new Vector3();
        this.dim = 128;
        this.turnRate = 2 * Math.PI; // turn rate in angles per second

        this.targetPosition = new Vector3();
        this.targetQuaternion = new Quaternion();

        this.q1 = new Quaternion();
        this.q2 = new Quaternion();
        this.viewport = new Vector4();
        this.radius = 0;
    }

    render(renderer) {
        this.quaternion.copy(this.camera.quaternion).invert();
        this.updateMatrixWorld();

        this.point.set(0, 0, 1);
        this.point.applyQuaternion(this.camera.quaternion);

        this.xAxis.setOpacity(this.point);
        this.yAxis.setOpacity(this.point);
        this.zAxis.setOpacity(this.point);

        const x = this.domElement.offsetWidth - this.dim;

        renderer.clearDepth();

        renderer.getViewport(this.viewport);
        renderer.setViewport(x, 0, this.dim, this.dim);

        renderer.render(this, this.orthoCamera);

        renderer.setViewport(this.viewport.x, this.viewport.y, this.viewport.z, this.viewport.w);
    }

    handleClick(event) {
        if (this.animating === true) return false;

        const rect = this.domElement.getBoundingClientRect();
        const offsetX = rect.left + (this.domElement.offsetWidth - this.dim);
        const offsetY = rect.top + (this.domElement.offsetHeight - this.dim);
        this.mouse.x = ((event.clientX - offsetX) / (rect.right - offsetX)) * 2 - 1;
        this.mouse.y = - ((event.clientY - offsetY) / (rect.bottom - offsetY)) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.orthoCamera);

        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

        if (intersects.length > 0) {
            const intersection = intersects[0];
            const object = intersection.object;

            this.prepareAnimationData(object, this.center);

            this.animating = true;
            return true;
        } else {
            return false;
        }
    }

    update(delta) {
        const step = delta * this.turnRate;

        // animate position by doing a slerp and then scaling the position on the unit sphere
        this.q1.rotateTowards(this.q2, this.step);
        this.camera.position.set(0, 0, 1).applyQuaternion(this.q1).multiplyScalar(this.radius).add(this.center);

        // animate orientation
        this.camera.quaternion.rotateTowards(this.targetQuaternion, step);

        if (this.q1.angleTo(this.q2) === 0) {
            this.animating = false;
        }
    }

    dispose() {
        this.geometry.dispose();

        this.xAxis.dispose();
        this.yAxis.dispose();
        this.zAxis.dispose();
    }

    prepareAnimationData(object, focusPoint) {
        switch (object.userData.type) {
            case 'posX':
                this.targetPosition.set(1, 0, 0);
                this.targetQuaternion.setFromEuler(new Euler(0, Math.PI * 0.5, 0));
                break;

            case 'posY':
                this.targetPosition.set(0, 1, 0);
                this.targetQuaternion.setFromEuler(new Euler(- Math.PI * 0.5, 0, 0));
                break;

            case 'posZ':
                this.targetPosition.set(0, 0, 1);
                this.targetQuaternion.setFromEuler(new Euler());
                break;

            case 'negX':
                this.targetPosition.set(- 1, 0, 0);
                this.targetQuaternion.setFromEuler(new Euler(0, - Math.PI * 0.5, 0));
                break;

            case 'negY':
                targetPosition.set(0, - 1, 0);
                targetQuaternion.setFromEuler(new Euler(Math.PI * 0.5, 0, 0));
                break;

            case 'negZ':
                this.targetPosition.set(0, 0, - 1);
                this.targetQuaternion.setFromEuler(new Euler(0, Math.PI, 0));
                break;

            default:
                console.error('ViewHelper: Invalid axis.');
        }

        radius = this.camera.position.distanceTo(focusPoint);
        targetPosition.multiplyScalar(this.radius).add(focusPoint);

        this.dummy.position.copy(focusPoint);

        this.dummy.lookAt(this.camera.position);
        q1.copy(this.dummy.quaternion);

        this.dummy.lookAt(this.targetPosition);
        q2.copy(this.dummy.quaternion);
    }
}

export { ViewHelper };
