import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls";
import { mergeBufferGeometries } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/utils/BufferGeometryUtils.js";
import { GUI } from "https://cdn.skypack.dev/lil-gui@0.16.1";

const container = document.querySelector(".container");
const boxCanvas = document.querySelector("#box-canvas");

let box = {
	params: {
		width: 42,
		widthLimits: [15, 70],
		length: 70,
		lengthLimits: [70, 120],
		depth: 46,
		depthLimits: [15, 70],
		thickness: 1,
		thicknessLimits: [0.1, 1],
		fluteFreq: 7,
		fluteFreqLimits: [3, 7],
		flapGap: 1,
		
	},
	els: {
		group: new THREE.Group(),
		backHalf: {
			width: {
				top: new THREE.Mesh(),
				side: new THREE.Mesh(),
				bottom: new THREE.Mesh()
			},
			length: {
				top: new THREE.Mesh(),
				side: new THREE.Mesh(),
				bottom: new THREE.Mesh()
			}
		},
		frontHalf: {
			width: {
				top: new THREE.Mesh(),
				side: new THREE.Mesh(),
				bottom: new THREE.Mesh()
			},
			length: {
				top: new THREE.Mesh(),
				side: new THREE.Mesh(),
				bottom: new THREE.Mesh()
			}
		}
	},
	animated: {
		openingAngle: 0.5 * Math.PI,
		flapAngles: {
			backHalf: {
				width: {
					top:  0.6 * Math.PI,
					bottom: 0.6 * Math.PI
				},
				length: {
					top: 0.5 * Math.PI,
					bottom: 0.5 * Math.PI
				}
			},
			frontHalf: {
				width: {
					top: 0.6 * Math.PI,
					bottom: 0.6 * Math.PI
				},
				length: {
					top: 0.49 * Math.PI,
					bottom: 0.49 * Math.PI
				}
			}
		}
	}
};

// Globals
let renderer, scene, camera, orbit, lightHolder, rayCaster, mouse;

// Run the app
initScene();
createControls();
window.addEventListener("resize", updateSceneSize);

// run the animation automatically on start
// window.onbeforeunload = function () {
// 	window.scrollTo(0, 0);
// };
// gsap.to(window, {
// 	duration: 1.2,
// 	scrollTo: window.innerHeight,
// 	ease: "power1.inOut"
// });

// --------------------------------------------------
// Three.js scene




function initScene() {
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
		canvas: boxCanvas
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		45,
		container.clientWidth / container.clientHeight,
		10,
		1000
	);
	camera.position.set(-110, 70, 110);

	rayCaster = new THREE.Raycaster();
	mouse = new THREE.Vector2(0, 0);

	updateSceneSize();

	scene.add(box.els.group);
	setGeometryHierarchy();






	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);
	lightHolder = new THREE.Group();
	const topLight = new THREE.PointLight(0xffffff, 0.5);
	topLight.position.set(-30, 300, 0);
	lightHolder.add(topLight);
	const sideLight = new THREE.PointLight(0xffffff, 0.7);
	sideLight.position.set(50, 0, 150);
	lightHolder.add(sideLight);
	scene.add(lightHolder);

	scene.add(box.els.group);
	setGeometryHierarchy();
 

	const material = new THREE.MeshStandardMaterial({
		color: new THREE.Color("rgb(198,150,112)"),
		side: THREE.DoubleSide
	});
	box.els.group.traverse((c) => {
		if (c.isMesh) c.material = material;
	});

	orbit = new OrbitControls(camera, boxCanvas);
	orbit.enableZoom = false;
	orbit.enablePan = false;
	orbit.enableDamping = false;
	orbit.autoRotate = false;
	orbit.autoRotateSpeed = 0.75;


	createBoxElements();
	
	createZooming();

	applyLeftSideTexture();
	applyFrontSideTexture();
	render();
	
}

function render() {
	orbit.update();
	lightHolder.quaternion.copy(camera.quaternion);
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

function updateSceneSize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.clientWidth, container.clientHeight);
}

// End of Three.js scene
// --------------------------------------------------

// --------------------------------------------------
// Box geometries

function setGeometryHierarchy() {
	box.els.group.add(
		box.els.frontHalf.width.side,
		box.els.frontHalf.length.side,
		box.els.backHalf.width.side,
		box.els.backHalf.length.side
	);
	box.els.frontHalf.width.side.add(
		box.els.frontHalf.width.top,
		box.els.frontHalf.width.bottom
	);
	box.els.frontHalf.length.side.add(
		box.els.frontHalf.length.top,
		box.els.frontHalf.length.bottom
	);
	box.els.backHalf.width.side.add(
		box.els.backHalf.width.top,
		box.els.backHalf.width.bottom
	);
	box.els.backHalf.length.side.add(
		box.els.backHalf.length.top,
		box.els.backHalf.length.bottom
	);
}

function createBoxElements() {
	for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
		for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
			const half = halfIdx ? "frontHalf" : "backHalf";
			const side = sideIdx ? "width" : "length";

			const sideWidth = side === "width" ? box.params.width : box.params.length;
			const flapWidth = sideWidth - 2 * box.params.flapGap;
			const flapHeight = 0.508 * box.params.width - 0.75 * box.params.flapGap;

			const sidePlaneGeometry = new THREE.PlaneGeometry(
				sideWidth,
				box.params.depth,
				Math.floor(5 * sideWidth),
				Math.floor(0.2 * box.params.depth)
			);
			const flapPlaneGeometry = new THREE.PlaneGeometry(
				flapWidth,
				flapHeight,
				Math.floor(5 * flapWidth),
				Math.floor(0.2 * flapHeight)
			);

			const sideGeometry = createSideGeometry(
				sidePlaneGeometry,
				[sideWidth, box.params.depth],
				[true, true, true, true],
				false
			);
			const topGeometry = createSideGeometry(
				flapPlaneGeometry,
				[flapWidth, flapHeight],
				[false, false, true, false],
				true
			);
			const bottomGeometry = createSideGeometry(
				flapPlaneGeometry,
				[flapWidth, flapHeight],
				[true, false, false, false],
				true
			);

			topGeometry.translate(0, 0.5 * flapHeight, 0);
			bottomGeometry.translate(0, -0.5 * flapHeight, 0);

			box.els[half][side].top.geometry = topGeometry;
			box.els[half][side].side.geometry = sideGeometry;
			box.els[half][side].bottom.geometry = bottomGeometry;

			box.els[half][side].top.position.y = 0.5 * box.params.depth;
			box.els[half][side].bottom.position.y = -0.5 * box.params.depth;
		}
	}

	updatePanelsTransform();
}

function createSideGeometry(baseGeometry, size, folds, hasMiddleLayer) {
	const geometriesToMerge = [];
	geometriesToMerge.push(
		getLayerGeometry(
			(v) =>
				-0.5 * box.params.thickness + 0.01 * Math.sin(box.params.fluteFreq * v)
		)
	);
	geometriesToMerge.push(
		getLayerGeometry(
			(v) => 0.5 * box.params.thickness + 0.01 * Math.sin(box.params.fluteFreq * v)
		)
	);
	if (hasMiddleLayer) {
		geometriesToMerge.push(
			getLayerGeometry(
				(v) => 0.5 * box.params.thickness * Math.sin(box.params.fluteFreq * v)
			)
		);
	}

	function getLayerGeometry(offset) {
		const layerGeometry = baseGeometry.clone();
		const positionAttr = layerGeometry.attributes.position;
		for (let i = 0; i < positionAttr.count; i++) {
			const x = positionAttr.getX(i);
			const y = positionAttr.getY(i);
			let z = positionAttr.getZ(i) + offset(x);
			z = applyFolds(x, y, z);
			positionAttr.setXYZ(i, x, y, z);
		}
		return layerGeometry;
	}

	function applyFolds(x, y, z) {
		let modifier = (c, s) => 1 - Math.pow(c / (0.5 * s), 10);
		if ((x > 0 && folds[1]) || (x < 0 && folds[3])) {
			z *= modifier(x, size[0]);
		}
		if ((y > 0 && folds[0]) || (y < 0 && folds[2])) {
			z *= modifier(y, size[1]);
		}
		return z;
	}

	const mergedGeometry = new mergeBufferGeometries(geometriesToMerge, false);
	mergedGeometry.computeVertexNormals();

	return mergedGeometry;
}

// End of box geometries
// --------------------------------------------------

// --------------------------------------------------


// 加载并设置图片纹理到盒子的左面
function applyLeftSideTexture() {
    const textureLoader = new THREE.TextureLoader();

    // 加载 PNG 图片
    textureLoader.load('1.png', function(texture) {
        // 创建左面材质并应用纹理
		const img = texture.image;
        const aspectRatio = img.width / img.height;

        // 根据图像的宽高比调整平面尺寸
        const planeWidth = box.params.width -12 ;
        const planeHeight = planeWidth / aspectRatio;


        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true // 允许透明部分
        });

        // 创建平面几何体，大小与盒子的左面一致
		const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        // 创建网格并设置材质
        const plane = new THREE.Mesh(planeGeometry, material);

        // 设置平面的旋转，确保它贴合到盒子的左面
        plane.rotation.y = -Math.PI / 2; // 逆时针旋转 90 度使其垂直于 X 轴
		// plane.rotation.z = -20 * Math.PI / 180;
        plane.position.x = -0.5076 * box.params.length; // 将平面移动到盒子的左侧
        plane.position.z = 0; // 调整 Z 轴位置以确保它在盒子中心

        // 将平面添加到盒子元素组中
        box.els.group.add(plane);
    });
}


function applyFrontSideTexture() {
    const textureLoader = new THREE.TextureLoader();

    // 加载 PNG 图片
    textureLoader.load('2.png', function(texture) {
        // 创建正面材质并应用纹理

		const img = texture.image;
        const aspectRatio = img.width / img.height;

        // 根据图像的宽高比调整平面尺寸
        const planeWidth = box.params.length;
        const planeHeight = planeWidth / aspectRatio;
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true // 允许透明部分
        });

        // 创建平面几何体，大小与盒子的正面一致
		const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        // 创建网格并设置材质
        const plane = new THREE.Mesh(planeGeometry, material);

        // 设置平面的位置，确保它贴合到盒子的正面
        plane.position.z = 0.309 * box.params.length; // 将平面移动到盒子的前侧
        plane.position.x = 0; // 调整 X 轴位置以确保它在盒子中心
        plane.position.y = 0; // 调整 Y 轴位置以确保它在盒子垂直居中

        // 将平面添加到盒子元素组中
        box.els.group.add(plane);
    });
}




// --------------------------------------------------
// Animation

function createFoldingAnimation() {
	gsap
		.timeline({
			onUpdate: () => {
				updatePanelsTransform();
			
			}
		})
		.to(box.animated, {
			duration: 1,
			openingAngle: 0.5 * Math.PI,
			ease: "power1.inOut"
		})
		.to(
			[
				box.animated.flapAngles.backHalf.width,
				box.animated.flapAngles.frontHalf.width
			],
			{
				duration: 0.6,
				bottom: 0.6 * Math.PI,
				ease: "back.in(3)"
			},
			0.9
		)
		.to(
			box.animated.flapAngles.backHalf.length,
			{
				duration: 0.7,
				bottom: 0.5 * Math.PI,
				ease: "back.in(2)"
			},
			1.1
		)
		.to(
			box.animated.flapAngles.frontHalf.length,
			{
				duration: 0.8,
				bottom: 0.49 * Math.PI,
				ease: "back.in(3)"
			},
			1.4
		)
		
		.to(
			[box.animated.flapAngles.backHalf.length,
			box.animated.flapAngles.frontHalf.length],
			{
				duration: 1,
				top: -0.49 * Math.PI,
				ease: "back.in(3)"
			},
			1.4
		)
		.to(
			[
				box.animated.flapAngles.backHalf.width,
				box.animated.flapAngles.frontHalf.width
			],
			{
				duration: 1,
				top: -0.6 * Math.PI,
				ease: "back.in(3)"
			},
			1.7
		)
		// .to(
		// 	,
		// 	{
		// 		duration: 1,
		// 		top: -0.49 * Math.PI,
		// 		ease: "back.in(4)"
		// 	},
		// 	1.8
		// );
}

document.addEventListener("DOMContentLoaded", function() {
    const squareMini = document.querySelector('.square-mini');

    let isBoxOpen = false; // 盒子初始是关闭的

    squareMini.addEventListener('click', function() {
        console.log('square-mini clicked');

        if (!isBoxOpen) {
            createFoldingAnimation();  // 播放打开动画
            playOpeningAnimation();   // 播放音效
        } else {
            createClosingAnimation(); // 播放关闭动画
        }

        isBoxOpen = !isBoxOpen; // 切换盒子状态
    });



 function playOpeningAnimation() {
    if (!box.els.frontHalf.width.top || !box.els.frontHalf.length.top) {
        console.error('Animation target is not available.');
        return;
    }
	setTimeout(() => {
        const openAudio = new Audio('open.wav');
        openAudio.play().catch(error => console.error("open.mp3 play failed:", error));
        
   
        openAudio.addEventListener('ended', () => {
            const hiAudio = new Audio('hi.wav');
            hiAudio.play().catch(error => console.error("hi.wav play failed:", error));
        });
    }, 1200);

}
});

 function createClosingAnimation() {
	gsap
	.timeline({
		onUpdate: () => {
			updatePanelsTransform();
		
		}
	})
	.to(box.animated, {
		duration: 1,
		openingAngle: 0.5 * Math.PI,
		ease: "power1.inOut"
	})
	.to(
		[
			box.animated.flapAngles.backHalf.width,
			box.animated.flapAngles.frontHalf.width
		],
		{
			duration: 0.6,
			bottom: 0.6 * Math.PI,
			ease: "back.in(3)"
		},
		0.9
	)
	.to(
		box.animated.flapAngles.backHalf.length,
		{
			duration: 0.7,
			bottom: 0.5 * Math.PI,
			ease: "back.in(2)"
		},
		1.1
	)
	.to(
		box.animated.flapAngles.frontHalf.length,
		{
			duration: 0.8,
			bottom: 0.49 * Math.PI,
			ease: "back.in(3)"
		},
		1.4
	)
	
	
	.to(
		[
			box.animated.flapAngles.backHalf.width,
			box.animated.flapAngles.frontHalf.width
		],
		{
			duration: 1,
			top: 0.6 * Math.PI,
			ease: "back.in(3)"
		},
		1.4
	)
	.to(
		[box.animated.flapAngles.backHalf.length,
		box.animated.flapAngles.frontHalf.length],
		{
			duration: 1,
			top: 0.49 * Math.PI,
			ease: "back.in(3)"
		},
		1.7
	)

        // 播放关闭音效
        setTimeout(() => {
            const closeAudio = new Audio('open.wav');
            closeAudio.play().catch(error => console.error("close.wav play failed:", error));
        }, 500);
    }



function updatePanelsTransform() {
	 console.log('Camera Position:', camera.position);
    console.log('Mesh Global Position:', new THREE.Vector3().setFromMatrixPosition(box.els.frontHalf.width.top.matrixWorld));
	// place width-sides aside of length-sides (not animated)
	box.els.frontHalf.width.side.position.x = 0.5 * box.params.length;
	box.els.backHalf.width.side.position.x = -0.5 * box.params.length;
  
	// rotate width-sides from 0 to 90 deg
	box.els.frontHalf.width.side.rotation.y = box.animated.openingAngle;
	box.els.backHalf.width.side.rotation.y = box.animated.openingAngle;
  
	// move length-sides to keep the box centered
	const cos = Math.cos(box.animated.openingAngle); // animates from 1 to 0
	box.els.frontHalf.length.side.position.x = -0.5 * cos * box.params.width;
	box.els.backHalf.length.side.position.x = 0.5 * cos * box.params.width;
  
	// move length-sides to define box inner space
	const sin = Math.sin(box.animated.openingAngle); // animates from 0 to 1
	box.els.frontHalf.length.side.position.z = 0.5 * sin * box.params.width;
	box.els.backHalf.length.side.position.z = -0.5 * sin * box.params.width;
  
	box.els.frontHalf.width.top.rotation.x = -box.animated.flapAngles.frontHalf
	  .width.top;
	box.els.frontHalf.length.top.rotation.x = -box.animated.flapAngles.frontHalf
	  .length.top;
	  
	box.els.frontHalf.width.bottom.rotation.x =
	  box.animated.flapAngles.frontHalf.width.bottom;
	box.els.frontHalf.length.bottom.rotation.x =
	  box.animated.flapAngles.frontHalf.length.bottom;
  
	box.els.backHalf.width.top.rotation.x =
	  box.animated.flapAngles.backHalf.width.top;
	box.els.backHalf.length.top.rotation.x =
	  box.animated.flapAngles.backHalf.length.top;

	box.els.backHalf.width.bottom.rotation.x = -box.animated.flapAngles.backHalf
	  .width.bottom;
	box.els.backHalf.length.bottom.rotation.x = -box.animated.flapAngles.backHalf
	  .length.bottom;
  
	 renderer.render(scene, camera);
  }
  

// End of animation
// --------------------------------------------------

// --------------------------------------------------
// Manual zoom (buttons only since the scroll is used
// by folding animation)

function createZooming() {
	const zoomInBtn = document.querySelector("#zoom-in");
	const zoomOutBtn = document.querySelector("#zoom-out");

	let zoomLevel = 1;
	const limits = [0.4, 2];

	zoomInBtn.addEventListener("click", () => {
		zoomLevel *= 1.3;
		applyZoomLimits();
	});
	zoomOutBtn.addEventListener("click", () => {
		zoomLevel *= 0.75;
		applyZoomLimits();
	});

	function applyZoomLimits() {
		if (zoomLevel > limits[1]) {
			zoomLevel = limits[1];
			zoomInBtn.classList.add("disabled");
		} else if (zoomLevel < limits[0]) {
			zoomLevel = limits[0];
			zoomOutBtn.classList.add("disabled");
		} else {
			zoomInBtn.classList.remove("disabled");
			zoomOutBtn.classList.remove("disabled");
		}
		gsap.to(camera, {
			duration: 0.2,
			zoom: zoomLevel,
			onUpdate: () => {
				camera.updateProjectionMatrix();
			}
		});
	}
}

// End of Manual zoom
// --------------------------------------------------

// --------------------------------------------------
// Range sliders for box parameters

function createControls() {
	const gui = new GUI();
	
gui.domElement.style.display = 'none';
	gui
		.add(
			box.params,
			"width",
			box.params.widthLimits[0],
			box.params.widthLimits[1]
		)
		.step(1)
		.onChange(() => {
			createBoxElements();
			updatePanelsTransform();
		});
	gui
		.add(
			box.params,
			"length",
			box.params.lengthLimits[0],
			box.params.lengthLimits[1]
		)
		.step(1)
		.onChange(() => {
			createBoxElements();
			updatePanelsTransform();
		});
	gui
		.add(
			box.params,
			"depth",
			box.params.depthLimits[0],
			box.params.depthLimits[1]
		)
		.step(1)
		.onChange(() => {
			createBoxElements();
			updatePanelsTransform();
		});
	gui
		.add(
			box.params,
			"fluteFreq",
			box.params.fluteFreqLimits[0],
			box.params.fluteFreqLimits[1]
		)
		.step(1)
		.onChange(() => {
			createBoxElements();
		})
		.name("flute");
	gui
		.add(
			box.params,
			"thickness",
			box.params.thicknessLimits[0],
			box.params.thicknessLimits[1]
		)
		.step(0.05)
		.onChange(() => {
			createBoxElements();
		});
}

// End Range sliders for box parameters
// --------------------------------------------------
