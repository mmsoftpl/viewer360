import * as THREE from 'https://unpkg.com/three@0.123.0/build/three.module.js';
import { IsEmpty } from "./utils.js";

let camera, scene, renderer, texture, onUpdate;

let isUserInteracting = true,
	onPointerDownMouseX = 0, onPointerDownMouseY = 0,
	lon = 0, onPointerDownLon = 0,
	lat = 0, onPointerDownLat = 0;

export function onApply() {
	isUserInteracting = true;

	var targetImage = document.getElementById("textureimage");

	if (targetImage && targetImage.width && targetImage.height) {
		texture.image = targetImage;
		texture.needsUpdate = true;
	}

	return false;
}

function init(containerId) {

	const container = document.getElementById(containerId);

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);

	scene = new THREE.Scene();

	const geometry = new THREE.SphereBufferGeometry(500, 60, 40);
	// invert the geometry on the x-axis so that all of the faces point inward
	geometry.scale(- 1, 1, 1);

	texture = new THREE.Texture();

	const material = new THREE.MeshBasicMaterial({ map: texture });

	const mesh = new THREE.Mesh(geometry, material);

	scene.add(mesh);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	container.style.touchAction = 'none';
	container.addEventListener('pointerdown', onPointerDown, false);

	document.addEventListener('wheel', onDocumentMouseWheel, false);

	document.addEventListener('dragover', function (event) {

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

	}, false);

	document.addEventListener('dragenter', function () {

		document.body.style.opacity = 0.5;

	}, false);

	document.addEventListener('dragleave', function () {

		document.body.style.opacity = 1;

	}, false);

	document.addEventListener('drop', function (event) {

		event.preventDefault();

		const reader = new FileReader();
		reader.addEventListener('load', function (event) {

			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;

		}, false);
		reader.readAsDataURL(event.dataTransfer.files[0]);

		document.body.style.opacity = 1;

	}, false);

	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.lookAt(new THREE.Vector3(1, 1, 1));
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

export function ZoomIn() {
	var fov = camera.fov - 1;
	if (fov < 10)
		fov = 10;
	camera.fov = fov;
	camera.updateProjectionMatrix();

	if (onUpdate)
		onUpdate();
}

export function ZoomOut() {
	var fov = camera.fov + 1;
	if (fov > 75)
		fov = 75;
	camera.fov = fov;
	camera.updateProjectionMatrix();

	if (onUpdate)
		onUpdate();
}


export function MoveUp() {
	lat += 1;
	if (onUpdate)
		onUpdate();
}

export function MoveDown() {
	lat -= 1;
	if (onUpdate)
		onUpdate();
}

export function MoveLeft() {
	lon -= 1;
	if (onUpdate)
		onUpdate();
}

export function MoveRight() {
	lon += 1;
	if (onUpdate)
		onUpdate();
}

function onPointerDown(event) {

	if (event.isPrimary === false) return;

	isUserInteracting = true;

	onPointerDownMouseX = event.clientX;
	onPointerDownMouseY = event.clientY;

	onPointerDownLon = lon;
	onPointerDownLat = lat;

	document.addEventListener('pointermove', onPointerMove, false);
	document.addEventListener('pointerup', onPointerUp, false);


	if (onUpdate)
		onUpdate();

}

function onPointerMove(event) {

	if (event.isPrimary === false) return;

	lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
	lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;

	if (onUpdate)
		onUpdate();
}

function onPointerUp() {

	if (event.isPrimary === false) return;

	//isUserInteracting = false;

	document.removeEventListener('pointermove', onPointerMove);
	document.removeEventListener('pointerup', onPointerUp);


	if (onUpdate)
		onUpdate();

}

function onDocumentMouseWheel(event) {

	const fov = camera.fov + event.deltaY * 0.05;

	camera.fov = THREE.MathUtils.clamp(fov, 10, 75);

	camera.updateProjectionMatrix();

	if (onUpdate)
		onUpdate();
}

export const setCameraProps = (cameraProps) => {

	if (!IsEmpty(cameraProps)) {
		if (!IsEmpty(cameraProps.fov)) camera.fov = cameraProps.fov;
		if (!IsEmpty(cameraProps.lat)) lat = cameraProps.lat;
		if (!IsEmpty(cameraProps.lon)) lon = cameraProps.lon;

		camera.updateProjectionMatrix();

		if (onUpdate)
			onUpdate();
	}
}

export const getCameraProps = () => {
	var ret = {};

	if (camera) {

		ret.fov = camera.fov;
		ret.lat = lat;
		ret.lon = lon;
	}
	return ret;
};

function animate() {

	requestAnimationFrame(animate);
	update();

}

function update() {

	if (isUserInteracting === false) {

		lon += 0.1;

	}

	lat = Math.max(- 85, Math.min(85, lat));
	const phi = THREE.MathUtils.degToRad(90 - lat);
	const theta = THREE.MathUtils.degToRad(lon);

	const x = 500 * Math.sin(phi) * Math.cos(theta);
	const y = 500 * Math.cos(phi);
	const z = 500 * Math.sin(phi) * Math.sin(theta);

	camera.lookAt(x, y, z);

	renderer.render(scene, camera);
}


const InitRenderer = (containerId, updateCalback) => {

	onUpdate = updateCalback;

	init(containerId);

	animate();
}

export default InitRenderer;