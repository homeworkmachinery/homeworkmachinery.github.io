import * as THREE from "three";
import Stats from "stats-gl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { GrassMaterial } from "./GrassMaterial";
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { GUI } from 'dat.gui';



export class Scene1 {
	private isActive: boolean = true;
	private generatedFlowerCount: number = 0;
	private cachedNewFlower: THREE.Object3D | null = null;
	private endMessageCompleted: boolean = false;
	private allPetalsRemoved: boolean = false;
	private clickCounter: number = 0; // 记录点击次数
	private isFirstLoad = true;
	private isFirstClick = true;
	private newFlowerPetals: THREE.Mesh[] = []; // 保存所有花瓣的数组
	private isInteractionEnabled: boolean = true;
	private controlsEnabled: boolean = false;
	private firstPersonControls: FirstPersonControls;
	private loadingManager: THREE.LoadingManager;

	private textures: { [key: string]: THREE.Texture } = {};
	private textureLoader: THREE.TextureLoader;

	private gltfLoader: GLTFLoader;
	private camera: THREE.PerspectiveCamera | null = null;
	private renderer: THREE.WebGLRenderer | null = null;
	private scene: THREE.Scene | null = null;
	private canvas: HTMLCanvasElement;
	private stats: typeof Stats ;
	private lastFlowerPosition: THREE.Vector3 | null = null;

	private existingFlowers: THREE.Object3D[] = []; // 用于存储已生成的花朵

	private sceneProps = {
		fogColor: "#eeeeee",
		terrainColor: "#5e875e",
		fogDensity: 0.02,
	};
	private keyStates: { [key: string]: boolean } = {};

	private flowerMesh: THREE.Object3D = new THREE.Object3D();
	private newFlowerMesh: THREE.Object3D | null = null; // 用于存储新花的模型
	private targetPosition: THREE.Vector3 | null = null;
	private raycaster = new THREE.Raycaster();
	private mouse = new THREE.Vector2();
	private flowerCount = 1; // 花的数量
	private isFlowerSelected = false; // 记录花的选择状态
	private flowerPetals: THREE.Object3D[] = []; // 存储花瓣对象
	private hasReachedTarget: boolean = false; // 跟踪相机是否到达目标位置

	private gui: typeof GUI;
	private sceneGUI: typeof GUI;
	// private gui: dat.GUI;
	// private sceneGUI: dat.GUI;
	private cameraPositionGUI: { x: dat.GUIController; y: dat.GUIController; z: dat.GUIController } = {} as any;
	private cameraRotationGUI: { x: dat.GUIController; y: dat.GUIController; z: dat.GUIController } = {} as any;
	private guiControls: { positionX: number; positionY: number; positionZ: number; rotationX: number; rotationY: number; rotationZ: number; } = {} as any;;

	// private setupCameraControls() {
	// 	// 添加到 dat.GUI 面板
	// 	// const cameraFolder = this.gui.addFolder("Camera Controls");

	// 	// 位置控制项
	// 	// this.cameraPositionGUI = {
	// 	// 	x: cameraFolder.add(this.camera.position, "x", -100, 100, 0.1).name("Position X"),
	// 	// 	y: cameraFolder.add(this.camera.position, "y", -100, 100, 0.1).name("Position Y"),
	// 	// 	z: cameraFolder.add(this.camera.position, "z", -100, 100, 0.1).name("Position Z"),
	// 	// };

	// 	// // 旋转控制项
	// 	// this.cameraRotationGUI = {
	// 	// 	x: cameraFolder.add(this.camera.rotation, "x", -Math.PI, Math.PI, 0.01).name("Rotation X"),
	// 	// 	y: cameraFolder.add(this.camera.rotation, "y", -Math.PI, Math.PI, 0.01).name("Rotation Y"),
	// 	// 	z: cameraFolder.add(this.camera.rotation, "z", -Math.PI, Math.PI, 0.01).name("Rotation Z"),
	// 	// };

	// 	// cameraFolder.open();
	// }



	Uniforms = {
		uTime: { value: 0 },
		color: { value: new THREE.Color("#0000ff") },
	};
	private clock = new THREE.Clock();

	// 移动参数
	private boundary = { xMin: -10, xMax: 10, yMin: 0, yMax: 50, zMin: -10, zMax: 10 };
	private movementSpeed = 5;
	private cameraHeightAboveTerrain = 2.2;
	private terrainMesh: THREE.Mesh;


	private grassMaterial: GrassMaterial;
	private grassGeometry = new THREE.BufferGeometry();
	private grassCount = 5000;

	constructor(_canvas: HTMLCanvasElement) {
		this.textureLoader = new THREE.TextureLoader();
		this.loadTextures();

		this.onNewFlowerClick = this.onNewFlowerClick.bind(this);
		this.onGlobalClick = this.onGlobalClick.bind(this);
		this.terrainMesh = new THREE.Mesh(); // 地形网格初始化
		this.loadingManager = new THREE.LoadingManager();
		this.textureLoader = new THREE.TextureLoader(this.loadingManager);
		this.gltfLoader = new GLTFLoader(this.loadingManager);
		this.canvas = _canvas;
		this.disableControls();
		this.initializeSquareMini();

		this.stats = new Stats({ minimal: true });
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set(7.8, 5, 8.3);
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(this.sceneProps.fogColor);
		this.scene.fog = new THREE.FogExp2(this.sceneProps.fogColor, this.sceneProps.fogDensity);

		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		window.addEventListener("keydown", (event) => (this.keyStates[event.key] = true));
		window.addEventListener("keyup", (event) => (this.keyStates[event.key] = false));

		// 初始化第一人称控制器
		this.firstPersonControls = new FirstPersonControls(this.camera, this.canvas);
		this.firstPersonControls.movementSpeed = this.movementSpeed;
		this.firstPersonControls.lookSpeed = 0.1;
		this.firstPersonControls.activeLook = false;
		this.firstPersonControls.lookVertical = true;
		this.firstPersonControls.constrainVertical = true;
		this.firstPersonControls.verticalMin = 1.0;
		this.firstPersonControls.verticalMax = 2.0;

		this.grassMaterial = new GrassMaterial();
		this.terrainMesh.material = new THREE.MeshPhongMaterial({ color: this.sceneProps.terrainColor });


		this.canvas.addEventListener("mousemove", (event) => this.onMouseMove(event));
		this.canvas.addEventListener("click", this.onGlobalClick.bind(this));




		this.init();
		this.loadTerrain();

	}


	enableControls() {
		this.controlsEnabled = true;
	}

	disableControls() {
		this.controlsEnabled = false;
	}






	private loadModels() {
		this.sceneGUI.addColor(this.sceneProps, "terrainColor").onChange((value: string) => {
			(this.terrainMesh.material as THREE.MeshPhongMaterial).color.set(value);
		});
	
		// 加载地形
		this.loadTerrain(() => {
			// 加载草
			this.loadGrass();
			// 加载花
			this.loadFlowers();
		});
	}
	
	// 单独加载地形
	private loadTerrain(onComplete?: () => void) {
		this.gltfLoader.load("/island.glb", (gltf) => {
			gltf.scene.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.receiveShadow = true;
					child.castShadow = true;
					child.geometry.scale(3, 3, 3);
					this.terrainMesh = child; // 存储地形 Mesh
				}
			});

			this.scene!.add(gltf.scene);
			console.log("Terrain loaded");
	
			if (onComplete) onComplete();
		});
	}
	
	// 单独加载草
	private loadGrass() {
		this.gltfLoader.load("/grassLODs.glb", (gltf) => {
			gltf.scene.traverse((child) => {
				if (child instanceof THREE.Mesh && child.name.includes("LOD00")) {
					child.geometry.scale(5, 5, 5);
					this.grassGeometry = child.geometry;
				}
			});
	
			// 确保地形加载完成后添加草
			if (this.terrainMesh && this.grassGeometry) {
				this.addGrass(this.terrainMesh, this.grassGeometry);
			}
		});
	}



	
	private addGrass(surfaceMesh: THREE.Mesh, grassGeometry: THREE.BufferGeometry) {
		const sampler = new MeshSurfaceSampler(surfaceMesh).setWeightAttribute("color").build();
		const grassInstancedMesh = new THREE.InstancedMesh(grassGeometry, this.grassMaterial.material, this.grassCount);
		grassInstancedMesh.receiveShadow = true;

		const position = new THREE.Vector3();
		const quaternion = new THREE.Quaternion();
		const scale = new THREE.Vector3(1, 1, 1);

		for (let i = 0; i < this.grassCount; i++) {
			sampler.sample(position, new THREE.Vector3());
			quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3());
			quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random() * Math.PI * 2, 0)));
			grassInstancedMesh.setMatrixAt(i, new THREE.Matrix4().compose(position, quaternion, scale));
		}

		this.scene!.add(grassInstancedMesh);
	}



	private loadFlowers() {
	
	
		this.gltfLoader.load("/flower.glb", (gltf) => {
			this.flowerMesh = gltf.scene;

			// 确保花的模型存在
			if (!this.flowerMesh) return;


			// 克隆花模型并设置为相机正前方
			const flower = this.flowerMesh.clone();

			// 使花投射阴影
			flower.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.castShadow = true; // 花的子物体可以投射阴影
					child.receiveShadow = false; // 花也接收阴影
				}
			});

			flower.position.set(7.8, 0, -11.7);
			// const distanceInFront = 20;
			// flower.position.set(this.camera.position.x, 0, this.camera.position.z - distanceInFront);


			// 设置花的缩放大小，使其更显眼
			const scale = 1.5; // 可以根据需要调整
			flower.scale.set(scale, 1.8, scale);

			// 将花的朝向设置为相机方向，使其面向玩家
			flower!.lookAt(this.camera!.position);

			// 增加倾斜效果，调整花的旋转角度
			flower.rotateX(-Math.PI / -8); // 调整花沿 X 轴的倾斜角度
			flower.rotateY(Math.PI / -16); // 调整花沿 Y 轴的倾斜角度


			// 将花添加到场景中
			this.scene!.add(flower);
			this.flowerMesh = flower; // 确保 flowerMesh 引用的是场景中的对象

			// 获取花瓣并存储在 flowerPetals 数组中
			flower.traverse((child) => {
				if (child instanceof THREE.Mesh && child.name.includes("petal")) {
					this.flowerPetals.push(child);
				}
			});
			
		});

	}

	private flowerBasePosition = new THREE.Vector3(7.5, 5.4, -10);
	private flowerTargetPosition = this.flowerBasePosition.clone();

	private onMouseMove(event: MouseEvent) {
		const rect = this.canvas.getBoundingClientRect();
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;


		// 使用鼠标位置更新目标偏移位置，进行细微偏移
		this.flowerTargetPosition.x = this.flowerBasePosition.x + this.mouse.x * 0.2; // 控制偏移幅度
		this.flowerTargetPosition.y = this.flowerBasePosition.y + this.mouse.y * 0.1;
	}




	// 初始的全局点击事件，监听旧花的点击
	private onGlobalClick(event: MouseEvent) {
		
		if (this.newFlowerMesh) return; // 如果新花已加载，则忽略
		if (!this.flowerMesh) return;
		if (!this.controlsEnabled) return;
		if (!this.camera) {
			console.error("Camera is not initialized.");
			return;
		  }
		  console.log('Camera:', this.camera);
		 
		  this.raycaster.setFromCamera(this.mouse, this.camera!);
		const intersects = this.raycaster.intersectObject(this.flowerMesh, true);


		if (this.isFirstClick) {
			if (intersects.length > 0) {
				if (!this.hasReachedTarget) {
					console.log("Old flower clicked, starting camera movement");
					this.controlsEnabled = false;
					this.moveCameraTowardsTarget(() => {
						this.hasReachedTarget = true;
						console.log("Camera reached target position");
						this.showText2();

					});
				} else {
					console.log("Old flower clicked again, loading new flower");
					this.loadNewFlowerAtCenter();	
					this.isFirstClick = false; 
				}
			}
		} else {
			if (intersects.length > 0) {
			this.moveCameraTowardsTarget(() => {
				this.hasReachedTarget = true;
				console.log("Camera reached target position for subsequent clicks.");
			});
			this.loadNewFlowerAtCenter();

		}}
		
	}


	private showText2() {
		const text2 = "It feels so special.\nAs if fate is guiding me to pick it.";

		const messageElement = document.getElementById("message-2"); // 获取显示文字的 DOM 元素
		
		if (messageElement) {
			messageElement.style.opacity = "1"; // 确保文字可见
			const audio = new Audio('./sound/message2.mp3'); // 替换为你的语音文件路径
		audio.play().catch((error) => {
			console.error("Audio playback failed:", error);
		});


		let currentChar = 0;
		const interval = setInterval(() => {
			let displayText = text2.charAt(currentChar);
			if (displayText === '\n') {
				messageElement.innerHTML += "<br>";
			} else {
				messageElement.innerHTML += displayText;
			}

			currentChar++;

			// 判断是否已经显示完整
			if (currentChar >= text2.length) {
				clearInterval(interval);

				// 显示完文字后，设置一个延迟后开始淡出
				setTimeout(() => {
					this.fadeOutText(messageElement);  // 调用淡出方法
				}, 1000); 
				this.enableControls();
			}
		}, 60); // 调整此间隔以控制文字显示速度
		} else {
			console.error("没有找到 message-2 元素");
		}

		

	}

	private fadeOutText(messageElement: HTMLElement) {
		let opacity = 1;
		const fadeOutInterval = setInterval(() => {
			opacity -= 0.08;
			messageElement.style.opacity = opacity.toString();
			if (opacity <= 0) {
				clearInterval(fadeOutInterval);
				messageElement.style.display = "none"; // 隐藏文本
			}
		}, 50);
	}




	// 移动相机到目标位置，接受一个完成时调用的回调函数
	private moveCameraTowardsTarget(onComplete: () => void) {
		this.targetPosition = new THREE.Vector3(7.8, 5, -2.2);

		// 模拟动画移动相机到目标位置
		const interval = setInterval(() => {
			if (this.targetPosition) {
				const direction = new THREE.Vector3().subVectors(this.targetPosition, this.camera!.position).normalize();
				// 继续进行相机移动或其他逻辑

				const distance = this.camera!.position.distanceTo(this.targetPosition!);


				// 如果相机距离目标位置足够近，则停止移动
				if (distance < 0.1) {
					this.camera!.position.copy(this.targetPosition!);
					clearInterval(interval);

					// 调用完成后的回调
					onComplete();
				} else {
					// 每帧移动
					this.camera!.position.addScaledVector(direction, 0.01);
				}
			}
		}, 16); // 模拟每帧更新，约60fps
	}



	private loadNewFlowerAtCenter() {
		


		if (this.flowerMesh) {
			this.scene!.remove(this.flowerMesh); // 清除旧花
			this.flowerMesh!= null;
		}

		if (this.cachedNewFlower) {
			// 如果已有缓存的新花对象，克隆并添加到场景
			const newFlower = this.cachedNewFlower.clone();
			newFlower.position.copy(this.flowerBasePosition);
			
			// 设置初始状态（例如：缩放为 0，隐藏等）
			newFlower.scale.set(0, 0, 0); // 初始化为缩放 0，等待动画展开
			
			// 重新设置动画
			this.setupNewFlower(newFlower);
	
			// 开始动画
			this.animateFlowerAppearance(newFlower, 3); // 3秒动画
			this.disableInteraction(); // 禁用移动和点击其他地
			return;
		}
	
		this.gltfLoader.load("/new-flower.glb", (gltf) => {
			const newFlower = gltf.scene;
			this.cachedNewFlower = newFlower.clone(); // 缓存克隆对象
			newFlower.position.copy(this.flowerBasePosition);
	
			// 设置初始状态（例如：缩放为 0）
			newFlower.scale.set(0, 0, 0); // 初始化为缩放 0
	
			// 添加到场景并设置
			this.setupNewFlower(newFlower);
	
			// 开始动画
			this.animateFlowerAppearance(newFlower, 3); // 3秒动画
			this.disableInteraction(); // 禁用移动和点击其他地
			
		});
		this.canvas.removeEventListener("click", this.onGlobalClick);
			this.canvas.addEventListener("click", this.onNewFlowerClick);
	}
	

	private setupNewFlower(newFlower: THREE.Object3D) {
		newFlower.position.copy(this.flowerBasePosition);
		this.scene!.add(newFlower);
		this.newFlowerMesh = newFlower;

		// 设置花的缩放大小
		const scale = 3;
		newFlower.scale.set(scale, scale, scale);

		// 让新花面向摄像机
		const cameraDirection = new THREE.Vector3();
		this.camera!.getWorldDirection(cameraDirection); // 获取摄像机的朝向
		newFlower.lookAt(newFlower.position.clone().add(cameraDirection)); // 让新花朝向摄像机

		console.log("New flower added to the scene");

		// 遍历新花模型的所有子对象，并将花瓣存储在 `newFlowerPetals` 中
		this.newFlowerPetals = [];
		newFlower.traverse((child) => {
			if (child instanceof THREE.Mesh && child.name.includes("petal")) {
				this.newFlowerPetals.push(child);
			}
		});

		this.hasReachedTarget = false; // 重置状态
		this.isFirstClick = false;

		// 显示相关文字
		this.showNewFlowerText();
	}




	private showNewFlowerText() {
		const newFlowerTextContent = `I WALK STRAIGHT TOWARD IT,\nPLUCKING IT AS IF IN AN ENDLESS CYCLE.`;

		const textElement = document.createElement("div");
		textElement.id = "new-flower-text";
		textElement.style.position = "fixed";
		textElement.style.fontSize = "90px";
		textElement.style.fontWeight = "bold";
		textElement.style.color = "red";
		textElement.style.opacity = "1"; // 初始透明度
		textElement.style.transition = "opacity 0.5s ease";
		document.body.appendChild(textElement);

		const audio = new Audio('./sound/message3.mp3'); // 替换为你的语音文件路径
		audio.play().catch((error) => {
			console.error("Audio playback failed:", error);
		});


		let currentChar = 0;
		const interval = setInterval(() => {
			const displayChar = newFlowerTextContent.charAt(currentChar);
			if (displayChar === "\n") {
				textElement.innerHTML += "<br>"; // 如果是换行符，插入换行
			} else {
				textElement.innerHTML += displayChar; // 添加字符
			}
			currentChar++;

			// 如果显示完成
			if (currentChar >= newFlowerTextContent.length) {
				clearInterval(interval); // 停止逐字显示
				setTimeout(() => fadeOutNewFlowerText(), 1000); // 停留 2 秒后淡出消失
			}
		}, 65); // 每 100 毫秒显示一个字符

		const fadeOutNewFlowerText = () => {
			textElement.style.opacity = "0"; // 设置透明度为 0，触发淡出效果
			setTimeout(() => {
				document.body.removeChild(textElement); // 从 DOM 中移除文本
				this.enableInteraction(); // 重新启用交互
			}, 500); // 等待过渡效果完成后移除文本
		};
	}



	private onNewFlowerClick(event: MouseEvent) {
		if (!this.newFlowerMesh) return;

		this.canvas.addEventListener("click", this.onNewFlowerClick);

		this.raycaster.setFromCamera(this.mouse, this.camera!);
		const intersects = this.raycaster.intersectObject(this.newFlowerMesh, true);

		// 检查是否点击到某个花瓣
		if (intersects.length > 0) {
			const clickedPetal = intersects[0].object as THREE.Mesh;

			console.log("Petal clicked:", clickedPetal.name);

			if (clickedPetal.name.includes("petal")) {

				// 切换显示文本
				const message = this.clickCounter % 2 === 0 ? "LOVES ME" : "LOVES ME NOT...";
				const color = this.clickCounter % 2 === 0 ? "red" : " rgba(0, 0, 0, 0.3)";
				const audioSrc = this.clickCounter % 2 === 0 ? "./sound/lovesme.mp3" : "./sound/lovesmenot.mp3";
				this.showMessage(message, color, audioSrc);
				this.clickCounter++;

				// 使用其父对象从场景中移除被点击的花瓣
				if (clickedPetal.parent) {
					clickedPetal.parent.remove(clickedPetal);
					this.newFlowerPetals = this.newFlowerPetals.filter((petal) => petal !== clickedPetal);

				}

				if (this.newFlowerPetals.length === 0) {
					this.allPetalsRemoved = true; // 设置标志，表示所有花瓣已被移除
					this.showEndMessage(); // 显示结束消息
				}
			} else if (this.allPetalsRemoved && this.endMessageCompleted && clickedPetal.name.includes("flower")) {
				this.resetToGrassland();
			}

		}
	}


	private showMessage(message: string, color: string, audioSrc: string) {
		const messageElement = document.getElementById("message"); // 假设有一个HTML元素来显示消息
		if (messageElement) {
			messageElement.textContent = message;
			messageElement.style.color = color;

			const audio = new Audio(audioSrc);
			audio.play().catch((error) => {
				console.error("Failed to play audio:", error);
			});
		}
	}


	private showEndMessage() {
		if (document.getElementById("end-message")) return;
		this.endMessageCompleted = false;

		// 创建容器
		const endMessage = document.createElement("div");
		endMessage.id = "end-message";
		endMessage.style.position = "fixed";
		endMessage.style.fontSize = "90px";
		endMessage.style.fontWeight = "bold";
		endMessage.style.opacity = "1"; // 初始透明度为 1
		endMessage.style.transition = "opacity 0.5s ease"; // 添加淡出过渡效果

		// 创建文本元素
		const sadEndingText = document.createElement("div");
		sadEndingText.innerHTML = ""; // 初始为空
		sadEndingText.style.color = "red";

		// 将文本添加到容器
		endMessage.appendChild(sadEndingText);

		// 添加容器到页面
		document.body.appendChild(endMessage);

		// 要逐字显示的文本内容
		const textContent = "I SEEK ANSWERS FROM IT, \nUNTIL IT BECOMES A WITHERED BLOOM.";

		const audio = new Audio('./sound/message4.mp3'); 
		audio.play().catch((error) => {
			console.error("Audio playback failed:", error);
		});

		let currentChar = 0;

		// 开始逐字显示
		const interval = setInterval(() => {
			const displayChar = textContent.charAt(currentChar);
			if (displayChar === "\n") {
				sadEndingText.innerHTML += "<br>"; // 如果是换行符，插入换行
			} else {
				sadEndingText.innerHTML += displayChar; // 添加字符
			}
			currentChar++;

			// 如果显示完成
			if (currentChar >= textContent.length) {
				clearInterval(interval); // 停止逐字显示
				setTimeout(() => fadeOutEndMessage(), 1000); // 停留 2 秒后淡出消失
			}
		}, 65); // 每 100 毫秒显示一个字符

		// 淡出并移除容器
		const fadeOutEndMessage = () => {
			endMessage.style.opacity = "0"; // 设置透明度为 0，触发淡出效果
			setTimeout(() => {
				document.body.removeChild(endMessage); // 从 DOM 中移除容器
				this.endMessageCompleted = true;

			}, 500); // 等待过渡效果完成后移除容器
		};

	}



	private resetToGrassland() {
		// 移除新花
		

		if (this.newFlowerMesh) {
			this.disposeObject(this.newFlowerMesh); // 释放资源
			this.scene!.remove(this.newFlowerMesh);
			this.newFlowerMesh = null;
		}

		// 清除底部消息
		const messageElement = document.getElementById("message");
		if (messageElement) {
			messageElement.textContent = "";
		}

		if (this.isFirstLoad) {
			const position = new THREE.Vector3(7.8, 1, -11.7)
			this.loadNoFlower(position);
			this.isFirstLoad = false;
		}


		if (this.lastFlowerPosition) {
			this.loadNoFlower(this.lastFlowerPosition);
		}

		this.canvas.style.cursor = "default";
		this.enableInteraction();


		this.placeRandomFlower();
		this.showResetText();
	

	}

	private disposeObject(object: THREE.Object3D) {
		// 遍历对象以释放几何体和材质
		object.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				if (child.geometry) {
					child.geometry.dispose();
				}
				if (child.material) {
					if (Array.isArray(child.material)) {
						child.material.forEach((mat) => mat.dispose());
					} else {
						child.material.dispose();
					}
				}
			}
		});
		console.log("Disposed object resources");
	}



	private showResetText() {
		const resetTextContent = `IN THIS FRUITLESS LOVE,\nANOTHER FLOWER APPEARS.\nIT FEELS SPECIAL TOO,\nAND I'M DRAWN TO THIS FEELING OF LONELINESS ONCE AGAIN.`;

		const textElement = document.createElement("div");
		textElement.id = "reset-text";
		textElement.style.position = "fixed";
		textElement.style.fontSize = "90px";
		textElement.style.fontWeight = "bold";
		textElement.style.color = "red";
		textElement.style.opacity = "1"; // 初始透明度
		textElement.style.transition = "opacity 0.5s ease";
		document.body.appendChild(textElement);

		const audio = new Audio('./sound/again.mp3'); 
		audio.play().catch((error) => {
			console.error("Audio playback failed:", error);
		});

		let currentChar = 0;
		const interval = setInterval(() => {
			const displayChar = resetTextContent.charAt(currentChar);
			if (displayChar === "\n") {
				textElement.innerHTML += "<br>"; // 如果是换行符，插入换行
			} else {
				textElement.innerHTML += displayChar; // 添加字符
			}
			currentChar++;

			// 如果显示完成
			if (currentChar >= resetTextContent.length) {
				clearInterval(interval); // 停止逐字显示
				setTimeout(() => fadeOutResetText(), 1500); 
			}
		}, 75); 

		const fadeOutResetText = () => {
			textElement.style.opacity = "0"; // 设置透明度为 0，触发淡出效果
			setTimeout(() => {
				document.body.removeChild(textElement); // 从 DOM 中移除文本
			}, 500); // 等待过渡效果完成后移除文本
		};
	}


	private placeRandomFlower() {
		this.gltfLoader.load("/flower.glb", (gltf) => {
			const randomFlower = gltf.scene.clone();
			const candidatePositions: THREE.Vector3[] = [];
			
	
			// Generate 20 candidate positions
			for (let i = 0; i < 20; i++) {
				const offsetX = (Math.random() - 0.5) * 5; // 调整范围以增加随机性
				const offsetZ = (Math.random() - 0.5) * 8;
				const candidatePosition = new THREE.Vector3(
					7.8 + offsetX,
					1, // Keep the Y position constant
					-11.7 + offsetZ
				);
				candidatePositions.push(candidatePosition);
			
			}
			
			
			
			
	
			// Find a valid position from candidates
			const validPosition = candidatePositions.find((candidatePosition) => {
				return this.existingFlowers.every((existingFlower) => {
					const distance = existingFlower.position.distanceTo(candidatePosition);
					return distance >= 3; // Ensure a minimum distance of 3 units
				});
			});
	
			if (!validPosition) {
				console.warn("Unable to find a valid position for the new flower.");
				return; // Exit if no valid position is found
			}
	
			// Set the position for the new flower
			randomFlower.position.copy(validPosition);
	
			// Make the flower look at the camera and add some tilt
			randomFlower.lookAt(this.camera!.position);
			randomFlower.rotateX(-Math.PI / -8);
			randomFlower.rotateY(Math.PI / -16);
	
			// Add the randomly placed flower to the scene
			this.scene!.add(randomFlower);
			this.flowerMesh = randomFlower; // Update flowerMesh to the new flower
	
			this.lastFlowerPosition = randomFlower.position.clone();
	
			// 保存新生成的花朵位置用于距离检查
			this.existingFlowers.push(randomFlower);
			this.generatedFlowerCount++;
	
			if (this.generatedFlowerCount === 3) {
				this.initializeSquareMini();


			}
	
			// Re-enable clicks on the newly placed flower
			this.canvas.addEventListener("click", this.onGlobalClick);
			
		});
	}

	private initializeSquareMini() {
		const squareMini = document.querySelector('.square-mini') as HTMLElement;
		squareMini.addEventListener('click', () => {
			this.switchToScene2();
			squareMini.style.backgroundColor = "red";
			
		});

		if (this.generatedFlowerCount === 3) {
			if (squareMini) {
				// 更改颜色为红色
				squareMini.style.backgroundColor = "red";
				// 播放音频
				const hintAudio = new Audio('./sound/start.mp3'); // 替换为提示音文件路径
				hintAudio.play().catch((error) => {
					console.error("Failed to play hint audio:", error);
				});
			}
		}
	}

	private switchToScene2() {
		console.log("Switching to Scene 2...");
		this.animateFogEffect().then(() => {
		
			this.disposeScene1();
			this.isActive = false;
			// Step 3: Dynamically load and initialize Scene2
			import('./scene-2').then((Scene2Module) => {
				const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
			}).catch((error) => {
				console.error("Failed to load Scene 2:", error);
			});
		});
		
	}
	
	private animateFogEffect(): Promise<void> {
		return new Promise((resolve) => {
			if (!this.scene || !this.scene.fog || !(this.scene.fog instanceof THREE.FogExp2)) {
				console.error("Fog 没有设置或不是 FogExp2 类型.");
				resolve(); // 如果条件不满足，立即结束动画
				return;
			}
	
			const duration = 3000; // 3 seconds
			const fogDensityStart = this.scene!.fog.density || 0.01; // 初始值
			const fogDensityEnd = 0.1; // 最大雾密度
			const clock = new THREE.Clock();
	
			const animate = () => {
				const elapsed = clock.getElapsedTime() * 1000;
				const progress = elapsed / duration;
	
  // 更新雾密度
  if (this.scene && this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
	this.scene.fog.density = THREE.MathUtils.lerp(fogDensityStart, fogDensityEnd, progress);
}


				// // 更新雾密度
				// if (this.scene!.fog && this.scene!.fog instanceof THREE.FogExp2) {
				// 	this.scene!.fog.density = THREE.MathUtils.lerp(fogDensityStart, fogDensityEnd, progress);
				// }
	
				// 动画结束条件
				if (progress >= 1) {
					resolve();
					return;
				}
	
				requestAnimationFrame(animate);
			};
	
			// 开始动画
			animate();
		});
	}
	
	
	






	private disposeScene1() {
		this.isActive = false;

		// 移除事件监听器
		this.canvas.removeEventListener("mousemove", this.onMouseMove);
		window.removeEventListener("resize", this.setAspectResolution);
	  
		// 清理场景中的对象
		this.scene!.traverse((object) => {
		  if (object instanceof THREE.Mesh) {
			object.geometry.dispose();
			if (object.material instanceof THREE.Material) {
			  object.material.dispose();
			}
		  }
		});
	
		


		// Stop audio playback
		this.stopAudio();
	
		// Clear text elements
		this.clearTextElements();
	
		// Dispose of Three.js resources
		this.disposeSceneResources();
	
		// Remove all event listeners
		this.removeEventListeners();
	
		// Reset any global state variables if necessary
		// Example:
		// this.someGlobalState = null;
	
		// Dispose the renderer
		this.renderer!.dispose();
	
		// Clear Scene1 references
		this.scene = null;
		this.camera = null;
		this.renderer = null;
	}
	





	// Stop all audio in Scene1
	private stopAudio() {
		const audioElements = document.querySelectorAll('audio');
		audioElements.forEach((audio) => {
			audio.pause();
			audio.currentTime = 0; // Reset playback position
		});
	}
	
	// Clear all text elements
	private clearTextElements() {
		const textElementIds = ["message", "message-0", "message-1", "message-2"];
		textElementIds.forEach((id) => {
			const element = document.getElementById(id);
			if (element) {
				element.style.display = "none";
				element.textContent = "";
			}
		});
	}
	
	private disposeSceneResources() {
		this.scene!.traverse((object) => {
			if (object instanceof THREE.Mesh) {
				// Dispose geometries and materials
				if (object.geometry) object.geometry.dispose();
				if (object.material) {
					if (Array.isArray(object.material)) {
						object.material.forEach((mat) => mat.dispose());
					} else {
						object.material.dispose();
					}
				}
			}
		});
	
		// 确保不会销毁草地的纹理
		if (this.textures.grassAlpha) {
			console.log("Grass alpha texture skipped from disposal");
		}
		if (this.textures.perlinNoise) {
			console.log("Perlin noise texture skipped from disposal");
		}
	
		// 清理场景的所有对象
		this.scene!.clear(); // Clear all objects from the scene
	}
	
	// Remove all event listeners specific to Scene1
	private removeEventListeners() {
		this.canvas.removeEventListener("click", this.onGlobalClick);
		this.canvas.removeEventListener("mousemove", this.onMouseMove);
	
		const squareMini = document.querySelector('.square-mini') as HTMLElement;
		if (squareMini) {
			squareMini.removeEventListener('click', this.switchToScene2.bind(this));
		}
	}




	private loadNoFlower(position: THREE.Vector3) {
		this.gltfLoader.load("/noflower.glb", (gltf) => {
			const noFlower = gltf.scene;
			noFlower.position.copy(position); // Set position to the given coordinates
			this.scene!.add(noFlower);
		});
	}



	private animateFlowerAppearance(flower: THREE.Object3D, duration: number) {
		const scaleStep = 0.3; // 每次增大的缩放值
		const targetScale = 3; // 目标缩放值
		const totalSteps = Math.floor(duration / scaleStep); // 总步数
		let currentStep = 0;

		const animate = () => {
			if (currentStep < totalSteps) {
				const scale = Math.min(currentStep / totalSteps * targetScale, targetScale);
				flower.scale.set(scale, scale, scale);
				currentStep++;
				requestAnimationFrame(animate);
			}
		};
		animate();
	}



	private disableInteraction() {
		// 这里可以设置一个状态变量来禁用交互
		this.isInteractionEnabled = false;
		this.firstPersonControls.enabled = false; // 禁用第一人称控制
		
	}

	private enableInteraction() {
		this.isInteractionEnabled = true;
		this.firstPersonControls.enabled = true; // 启用第一人称控制
		
	}





	private moveCameraTowardsFlower() {
		// 使用动画逐渐靠近花
		if (!this.targetPosition) return;

		const direction = new THREE.Vector3().subVectors(this.targetPosition, this.camera!.position).normalize();
		const distance = this.camera!.position.distanceTo(this.targetPosition);
		const step = Math.min(distance, 0.1); // 每帧的移动步长
		this.camera!.position.addScaledVector(direction, step);

		if (distance < 0.1) {
			this.targetPosition = null;
			this.hasReachedTarget = true; // 设置为已到达目标位置
		}
	}





	
	private animate() {
		if (!this.isActive) return;
		if (!this.camera) return;
		requestAnimationFrame(() => this.animate());
		if (this.camera instanceof THREE.PerspectiveCamera) {
			this.raycaster.setFromCamera(this.mouse, this.camera);
		  } else {
			console.error("Camera is not initialized or is not a PerspectiveCamera");
		  }

		const delta = this.clock.getDelta();
		this.firstPersonControls.update(delta);
		// 	    if (this.controlsEnabled) {
		//     // 只有在交互启用时才更新控制器
		//     this.firstPersonControls.update(delta);
		// }

		// 更新 GUI 数值为相机的最新位置和旋转值
		// this.cameraPositionGUI.x.setValue(this.camera.position.x);
		// this.cameraPositionGUI.y.setValue(this.camera.position.y);
		// this.cameraPositionGUI.z.setValue(this.camera.position.z);

		// this.cameraRotationGUI.x.setValue(this.camera.rotation.x);
		// this.cameraRotationGUI.y.setValue(this.camera.rotation.y);
		// this.cameraRotationGUI.z.setValue(this.camera.rotation.z);


		// 检测鼠标悬停状态并更新样式
		if (this.flowerMesh) {
			this.raycaster.setFromCamera(this.mouse, this.camera);
			const intersects = this.raycaster.intersectObject(this.flowerMesh, true);

			if (intersects.length > 0) {
				this.canvas.style.cursor = "pointer"; // 鼠标悬停在花上时显示指针样式
			} else {
				this.canvas.style.cursor = "default"; // 没有悬停在花上时恢复默认样式
			}
		}

		if (this.newFlowerMesh) {
			this.raycaster.setFromCamera(this.mouse, this.camera);
			const intersects = this.raycaster.intersectObject(this.newFlowerMesh, true);

			if (intersects.length > 0) {
				this.canvas.style.cursor = "pointer"; // 鼠标悬停在花上时显示指针样式
			} else {
				this.canvas.style.cursor = "default"; // 没有悬停在花上时恢复默认样式
			}
		}



		// 如果有目标位置，逐步移动相机朝向目标位置（花的位置）
		if (this.targetPosition) {
			this.moveCameraTowardsFlower();
		}

		// 为草的材质更新时间，模拟风吹效果
		if (this.grassMaterial && this.grassMaterial.uniforms) {
			this.grassMaterial.uniforms.uTime.value += delta * 0.4;
		}
		// 让旧花随风摆动
		if (this.flowerMesh) {
			const windStrength = 0.05; // 摆动的强度，可以调节
			const windFrequency = 1.5; // 摆动的频率，可以调节

			// 使花在X和Z轴轻微旋转
			this.flowerMesh.rotation.y = Math.sin(this.clock.elapsedTime * windFrequency) * windStrength;
			this.flowerMesh.rotation.z = Math.sin(this.clock.elapsedTime * windFrequency * 0.3) * windStrength; // 不同频率可以增添自然感
		}

		if (this.newFlowerMesh) {
			this.newFlowerMesh.position.lerp(this.flowerTargetPosition, 0.1);
		}




		this.renderer!.render(this.scene!, this.camera);
	}







	private updateCameraHeight() {
		this.raycaster.set(this.camera!.position, new THREE.Vector3(0, -1, 0));
		const intersects = this.raycaster.intersectObject(this.terrainMesh, true);

		if (intersects.length > 0) {
			const terrainHeight = intersects[0].point.y;
			const smoothFactor = 0.1;
			this.camera!.position.y += (terrainHeight + this.cameraHeightAboveTerrain - this.camera!.position.y) * smoothFactor;
		}
	}

	private addLights() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		this.scene!.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
		directionalLight.castShadow = true;
		directionalLight.position.set(100, 100, 100);
		directionalLight.shadow.camera.far = 200;
		directionalLight.shadow.camera.left = -50;
		directionalLight.shadow.camera.right = 50;
		directionalLight.shadow.camera.top = 50;
		directionalLight.shadow.camera.bottom = -50;
		directionalLight.shadow.mapSize.set(2048, 2048);

		this.scene!.add(directionalLight);
	}

	private loadTextures() {
        this.textures.perlinNoise = this.textureLoader.load("/perlinnoise.webp");
        this.textures.grassAlpha = this.textureLoader.load("/grass.jpeg");
    }

	private setupTextures() {
		if (!this.textures.perlinNoise) {
			this.textures.perlinNoise = this.textureLoader.load("/perlinnoise.webp");
		}
		if (!this.textures.grassAlpha) {
			this.textures.grassAlpha = this.textureLoader.load("/grass.jpeg");
		}
		
		// 只有在纹理加载后才会设置它们
		this.grassMaterial.setupTextures(this.textures.grassAlpha, this.textures.perlinNoise);

		// this.textures.perlinNoise.flipY = false; // 禁用 Y 翻转
		//     this.textures.grassAlpha.flipY = false; // 禁用 Y 翻转
		//     this.textures.perlinNoise.premultiplyAlpha = false; // 禁用预乘 alpha
		//     this.textures.grassAlpha.premultiplyAlpha = false; // 禁用预乘 alpha
	}


	// public getTextures() {
    //     return this.textures;
    // }


	private setupGUI() {
		const style = document.createElement("style");
style.textContent = `
    .dg.ac { 
        display: none !important; /* 隐藏 GUI */
    }
`;
document.head.appendChild(style);

		this.gui = new dat.GUI();
		this.sceneGUI = this.gui.addFolder("Scene Properties");
		this.sceneGUI.addColor(this.sceneProps, "terrainColor").onChange((value: string) => {
			if (this.terrainMesh && this.terrainMesh.material && (this.terrainMesh.material as THREE.MeshPhongMaterial).color) {
				(this.terrainMesh.material as THREE.MeshPhongMaterial).color.set(value);
			} else {
				console.warn("Terrain material or color is not available.");
			}
		});
		this.sceneGUI.add(this.sceneProps, "fogDensity", 0, 0.05, 0.000001).onChange((value: number) => {
			(this.scene!.fog as THREE.FogExp2).density = value;
		});
	}



	private setupEventListeners() {
		window.addEventListener("resize", () => this.setAspectResolution(), false);
	}

	private setAspectResolution() {
		if (!this.camera) return;
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer!.setSize(window.innerWidth, window.innerHeight);
	}

	private init() {

		this.setupGUI();
		this.setupTextures();
		this.loadModels();
		this.setupEventListeners();
		this.addLights();
		this.animate();


	}


}

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const app = new Scene1 (canvas);
