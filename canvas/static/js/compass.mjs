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

class ViewHelper extends Object3D {

	constructor( camera, domElement ) {

		super();
		this.camera = camera
		this.domElement = domElement

		this.isViewHelper = true;

		this.animating = false;
		this.center = new Vector3();

		const color1 = new Color( '#ff3653' );
		const color2 = new Color( '#8adb00' );
		const color3 = new Color( '#2c8fff' );

		this.interactiveObjects = [];
		this.raycaster = new Raycaster();
		this.mouse = new Vector2();
		this.dummy = new Object3D();

		this.orthoCamera = new OrthographicCamera( - 2, 2, 2, - 2, 0, 4 );
		this.orthoCamera.position.set( 0, 0, 2 );

		this.geometry = new BoxGeometry( 0.8, 0.05, 0.05 ).translate( 0.4, 0, 0 );

		this.xAxis = new Mesh( this.geometry, this.getAxisMaterial( color1 ) );
		this.yAxis = new Mesh( this.geometry, this.getAxisMaterial( color2 ) );
		this.zAxis = new Mesh( this.geometry, this.getAxisMaterial( color3 ) );

		this.yAxis.rotation.z = Math.PI / 2;
		this.zAxis.rotation.y = - Math.PI / 2;

		this.add( this.xAxis );
		this.add( this.zAxis );
		this.add( this.yAxis );

		this.posXAxisHelper = new Sprite( this.getSpriteMaterial( color1, 'X' ) );
		this.posXAxisHelper.userData.type = 'posX';
		this.posYAxisHelper = new Sprite( this.getSpriteMaterial( color2, 'Y' ) );
		this.posYAxisHelper.userData.type = 'posY';
		this.posZAxisHelper = new Sprite( this.getSpriteMaterial( color3, 'Z' ) );
		this.posZAxisHelper.userData.type = 'posZ';
		this.negXAxisHelper = new Sprite( this.getSpriteMaterial( color1 ) );
		this.negXAxisHelper.userData.type = 'negX';
		this.negYAxisHelper = new Sprite( this.getSpriteMaterial( color2 ) );
		this.negYAxisHelper.userData.type = 'negY';
		this.negZAxisHelper = new Sprite( this.getSpriteMaterial( color3 ) );
		this.negZAxisHelper.userData.type = 'negZ';

		this.posXAxisHelper.position.x = 1;
		this.posYAxisHelper.position.y = 1;
		this.posZAxisHelper.position.z = 1;
		this.negXAxisHelper.position.x = - 1;
		this.negXAxisHelper.scale.setScalar( 0.8 );
		this.negYAxisHelper.position.y = - 1;
		this.negYAxisHelper.scale.setScalar( 0.8 );
		this.negZAxisHelper.position.z = - 1;
		this.negZAxisHelper.scale.setScalar( 0.8 );

		this.add( this.posXAxisHelper );
		this.add( this.posYAxisHelper );
		this.add( this.posZAxisHelper );
		this.add( this.negXAxisHelper );
		this.add( this.negYAxisHelper );
		this.add( this.negZAxisHelper );

		this.interactiveObjects.push( this.posXAxisHelper );
		this.interactiveObjects.push( this.posYAxisHelper );
		this.interactiveObjects.push( this.posZAxisHelper );
		this.interactiveObjects.push( this.negXAxisHelper );
		this.interactiveObjects.push( this.negYAxisHelper );
		this.interactiveObjects.push( this.negZAxisHelper );

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

	render( renderer ) {
        this.quaternion.copy( this.camera.quaternion ).invert();
        this.updateMatrixWorld();

        this.point.set( 0, 0, 1 );
        this.point.applyQuaternion( this.camera.quaternion );

        if ( this.point.x >= 0 ) {

            this.posXAxisHelper.material.opacity = 1;
            this.negXAxisHelper.material.opacity = 0.5;

        } else {

            this.posXAxisHelper.material.opacity = 0.5;
            this.negXAxisHelper.material.opacity = 1;

        }

        if ( this.point.y >= 0 ) {

            this.posYAxisHelper.material.opacity = 1;
            this.negYAxisHelper.material.opacity = 0.5;

        } else {

            this.posYAxisHelper.material.opacity = 0.5;
            this.negYAxisHelper.material.opacity = 1;

        }

        if ( this.point.z >= 0 ) {

            this.posZAxisHelper.material.opacity = 1;
            this.negZAxisHelper.material.opacity = 0.5;

        } else {

            this.posZAxisHelper.material.opacity = 0.5;
            this.negZAxisHelper.material.opacity = 1;

        }

        //

        const x = this.domElement.offsetWidth - this.dim;

        renderer.clearDepth();

        renderer.getViewport( this.viewport );
        renderer.setViewport( x, 0, this.dim, this.dim );

        renderer.render( this, this.orthoCamera );

        renderer.setViewport( this.viewport.x, this.viewport.y, this.viewport.z, this.viewport.w );

    }

	handleClick( event ) {

        if ( this.animating === true ) return false;

        const rect = this.domElement.getBoundingClientRect();
        const offsetX = rect.left + ( this.domElement.offsetWidth - this.dim );
        const offsetY = rect.top + ( this.domElement.offsetHeight - this.dim );
        this.mouse.x = ( ( event.clientX - offsetX ) / ( rect.right - offsetX ) ) * 2 - 1;
        this.mouse.y = - ( ( event.clientY - offsetY ) / ( rect.bottom - offsetY ) ) * 2 + 1;

        this.raycaster.setFromCamera( this.mouse, this.orthoCamera );

        const intersects = this.raycaster.intersectObjects( this.interactiveObjects );

        if ( intersects.length > 0 ) {

            const intersection = intersects[ 0 ];
            const object = intersection.object;

            this.prepareAnimationData( object, this.center );

            this.animating = true;

            return true;

        } else {

            return false;

        }

    }

	update( delta ) {
        const step = delta * this.turnRate;

        // animate position by doing a slerp and then scaling the position on the unit sphere

        this.q1.rotateTowards( this.q2, this.step );
        this.camera.position.set( 0, 0, 1 ).applyQuaternion( this.q1 ).multiplyScalar( this.radius ).add( this.center );

        // animate orientation

        this.camera.quaternion.rotateTowards( this.targetQuaternion, step );

        if ( this.q1.angleTo( this.q2 ) === 0 ) {

            this.animating = false;

        }
    }

	dispose() {
        this.geometry.dispose();

        this.xAxis.material.dispose();
        this.yAxis.material.dispose();
        this.zAxis.material.dispose();

        this.posXAxisHelper.material.map.dispose();
        this.posYAxisHelper.material.map.dispose();
        this.posZAxisHelper.material.map.dispose();
        this.negXAxisHelper.material.map.dispose();
        this.negYAxisHelper.material.map.dispose();
        this.negZAxisHelper.material.map.dispose();

        this.posXAxisHelper.material.dispose();
        this.posYAxisHelper.material.dispose();
        this.posZAxisHelper.material.dispose();
        this.negXAxisHelper.material.dispose();
        this.negYAxisHelper.material.dispose();
        this.negZAxisHelper.material.dispose();

    }

    prepareAnimationData( object, focusPoint ) {
        switch ( object.userData.type ) {

            case 'posX':
                this.targetPosition.set( 1, 0, 0 );
                this.targetQuaternion.setFromEuler( new Euler( 0, Math.PI * 0.5, 0 ) );
                break;

            case 'posY':
                this.targetPosition.set( 0, 1, 0 );
                this.targetQuaternion.setFromEuler( new Euler( - Math.PI * 0.5, 0, 0 ) );
                break;

            case 'posZ':
                this.targetPosition.set( 0, 0, 1 );
                this.targetQuaternion.setFromEuler( new Euler() );
                break;

            case 'negX':
                this.targetPosition.set( - 1, 0, 0 );
                this.targetQuaternion.setFromEuler( new Euler( 0, - Math.PI * 0.5, 0 ) );
                break;

            case 'negY':
                targetPosition.set( 0, - 1, 0 );
                targetQuaternion.setFromEuler( new Euler( Math.PI * 0.5, 0, 0 ) );
                break;

            case 'negZ':
                this.targetPosition.set( 0, 0, - 1 );
                this.targetQuaternion.setFromEuler( new Euler( 0, Math.PI, 0 ) );
                break;

            default:
                console.error( 'ViewHelper: Invalid axis.' );

        }

        //

        radius = this.camera.position.distanceTo( focusPoint );
        targetPosition.multiplyScalar( this.radius ).add( focusPoint );

        this.dummy.position.copy( focusPoint );

        this.dummy.lookAt( this.camera.position );
        q1.copy( this.dummy.quaternion );

        this.dummy.lookAt( this.targetPosition );
        q2.copy( this.dummy.quaternion );
    }

    getAxisMaterial( color ) {
        return new MeshBasicMaterial( { color: color, toneMapped: false } );
    }

    getSpriteMaterial( color, text = null ) {
        const canvas = document.createElement( 'canvas' );
        canvas.width = 64;
        canvas.height = 64;

        const context = canvas.getContext( '2d' );
        context.beginPath();
        context.arc( 32, 32, 16, 0, 2 * Math.PI );
        context.closePath();
        context.fillStyle = color.getStyle();
        context.fill();

        if ( text !== null ) {

            context.font = '24px Arial';
            context.textAlign = 'center';
            context.fillStyle = '#000000';
            context.fillText( text, 32, 41 );

        }

        const texture = new CanvasTexture( canvas );

        return new SpriteMaterial( { map: texture, toneMapped: false } );
    }

}

export { ViewHelper };
