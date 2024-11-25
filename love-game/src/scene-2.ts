import * as THREE from "three";
import Stats from "stats-gl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { GrassMaterial } from "./GrassMaterial";
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';


export class Scene2 {
    private isPlaying: boolean = false;
    private hasShownText5 = false; 
    private isLeftAndDownKeyActive: boolean = false; // 左和下键是否在跳动
    private canShowText4: boolean = false; // 是否可以触发 showText4

    private isFlowerOneClickable: boolean = false; // 控制 flowerOne 是否可点击
    private flowerOne: THREE.Object3D | null = null;
    private flowerTwo: THREE.Object3D | null = null;
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
    private textureLoader: THREE.TextureLoader;
    private gltfLoader: GLTFLoader;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private canvas: HTMLCanvasElement;
    private stats: Stats;
    private lastFlowerPosition: THREE.Vector3 | null = null;

    private existingFlowers: THREE.Object3D[] = []; // 用于存储已生成的花朵

    private sceneProps = {
        fogColor: "#eeeeee",
        terrainColor: "#5e875e",
        fogDensity: 0.02,
    };
    private textures: { [key: string]: THREE.Texture } = {};
    private keyStates: { [key: string]: boolean } = {};

    private flowerMesh: THREE.Object3D; // 用于存储花的模型
    private targetPosition: THREE.Vector3 | null = null;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private flowerCount = 1; // 花的数量
    private isFlowerSelected = false; // 记录花的选择状态
    private flowerPetals: THREE.Object3D[] = []; // 存储花瓣对象
    private hasReachedTarget: boolean = false; // 跟踪相机是否到达目标位置


    private gui: dat.GUI;
    private sceneGUI: dat.GUI;
    private cameraPositionGUI: { x: dat.GUIController; y: dat.GUIController; z: dat.GUIController };
    private cameraRotationGUI: { x: dat.GUIController; y: dat.GUIController; z: dat.GUIController };
    private guiControls: { positionX: number; positionY: number; positionZ: number; rotationX: number; rotationY: number; rotationZ: number; };

    private setupCameraControls() {
        // 添加到 dat.GUI 面板
        const cameraFolder = this.gui.addFolder("Camera Controls");

        // 位置控制项
        this.cameraPositionGUI = {
            x: cameraFolder.add(this.camera.position, "x", -100, 100, 0.1).name("Position X"),
            y: cameraFolder.add(this.camera.position, "y", -100, 100, 0.1).name("Position Y"),
            z: cameraFolder.add(this.camera.position, "z", -100, 100, 0.1).name("Position Z"),
        };

        // 旋转控制项
        this.cameraRotationGUI = {
            x: cameraFolder.add(this.camera.rotation, "x", -Math.PI, Math.PI, 0.01).name("Rotation X"),
            y: cameraFolder.add(this.camera.rotation, "y", -Math.PI, Math.PI, 0.01).name("Rotation Y"),
            z: cameraFolder.add(this.camera.rotation, "z", -Math.PI, Math.PI, 0.01).name("Rotation Z"),
        };

        cameraFolder.open();
    }



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


        this.onGlobalClick = this.onGlobalClick.bind(this);
        this.terrainMesh = new THREE.Mesh(); // 地形网格初始化
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.canvas = _canvas;
        this.disableControls();


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

  // 添加雾化动画
  this.animateFogEffect().then(() => {
    // 显示文字并恢复交互
    setTimeout(() => {
        this.showText0(() => {
            document.getElementById("canvas").style.pointerEvents = "auto";
        });
    }, 1500);
});

      

    }







    enableControls() {
        this.controlsEnabled = true;
    }

    disableControls() {
        this.controlsEnabled = false;
    }
    private animateFogEffect(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.scene.fog || !(this.scene.fog instanceof THREE.FogExp2)) {
                console.error("Fog is not set or is not of type FogExp2.");
                resolve(); // 如果雾未初始化，立即结束动画
                return;
            }
    
            const duration = 3000; // 3秒
            const fogDensityStart = 0.3; // 初始雾密度
            const fogDensityEnd = this.sceneProps.fogDensity; // 目标雾密度
            const clock = new THREE.Clock();
    
            const animate = () => {
                const elapsed = clock.getElapsedTime() * 1000; // 已经过的时间
                const progress = Math.min(elapsed / duration, 1); // 进度 [0, 1]
    
                // 更新雾密度
                (this.scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp(fogDensityStart, fogDensityEnd, progress);
    
                if (progress < 1) {
                    requestAnimationFrame(animate); // 继续动画
                } else {
                    resolve(); // 动画完成
                }
            };
    
            animate(); // 启动动画
        });
    }
    




    private loadModels() {
        this.sceneGUI.addColor(this.sceneProps, "terrainColor").onChange((value) => {
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
            this.scene.add(gltf.scene);
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

        this.scene.add(grassInstancedMesh);
    }




    private loadFlowers() {
        // 使用 GLTFLoader 加载 flower.glb
        this.gltfLoader.load("/flower.glb", (gltf) => {
            this.flowerMesh = gltf.scene;

            // 确保花的模型存在
            if (!this.flowerMesh) return;


            // 克隆花模型并设置为相机正前方
            const flowerone = this.flowerMesh.clone();

            // 使花投射阴影
            flowerone.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true; // 花的子物体可以投射阴影
                    child.receiveShadow = false; // 花也接收阴影
                }
            });

            flowerone.position.set(7.8, 0, -11.7);
            // const distanceInFront = 20;
            // flower.position.set(this.camera.position.x, 0, this.camera.position.z - distanceInFront);


            // 设置花的缩放大小，使其更显眼
            const scale = 1.5; // 可以根据需要调整
            flowerone.scale.set(scale, 1.8, scale);

            // 将花的朝向设置为相机方向，使其面向玩家
            flowerone.lookAt(this.camera.position);

            // 增加倾斜效果，调整花的旋转角度
            flowerone.rotateX(-Math.PI / -8); // 调整花沿 X 轴的倾斜角度
            flowerone.rotateY(Math.PI / -16); // 调整花沿 Y 轴的倾斜角度


            const flowertwo = this.flowerMesh.clone();
            flowertwo.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true; // 花的子物体可以投射阴影
                    child.receiveShadow = false; // 花也接收阴影
                }
            });

            flowertwo.position.set(-8, 0, -2);
            flowertwo.scale.set(scale, 1.8, scale);
            flowertwo.lookAt(this.camera.position);
            flowertwo.rotateX(-Math.PI / -8);
            flowertwo.rotateY(Math.PI / -16);

            // 将花添加到场景中
            this.scene.add(flowerone);
            this.flowerOne = flowerone;
            this.scene.add(flowertwo);
            this.flowerTwo = flowertwo;
            this.flowerMesh = flowerone; // 确保 flowerMesh 引用的是场景中的对象


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













    private onGlobalClick(event: MouseEvent) {
        if (!this.flowerOne || !this.flowerTwo) return;
    

        if (this.isPlaying) return; // 如果正在播放，直接返回
        this.isPlaying = true; // 设置为播放中
    
        // 解锁机制，延迟一段时间后允许再次触发
        setTimeout(() => {
            this.isPlaying = false; // 解锁
        }, 3000);


        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            [this.flowerOne, this.flowerTwo].flatMap((flower) => {
                const children: THREE.Object3D[] = [];
                flower.traverse((child) => children.push(child)); // 遍历所有子对象
                return children;
            }),
            true
        );
    
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
    
            // 判断点击的是 flowerOne
            let isFlowerOneClicked = false;
            this.flowerOne.traverse((child) => {
                if (child === clickedObject) {
                    isFlowerOneClicked = true;
                }
            });
    
            // 判断点击的是 flowerTwo
            let isFlowerTwoClicked = false;
            this.flowerTwo.traverse((child) => {
                if (child === clickedObject) {
                    isFlowerTwoClicked = true;
                }
            });
    
            if (isFlowerOneClicked) {
                if (this.isFlowerOneClickable) { // 检查是否可以点击 flowerOne
                    console.log("Clicked on flowerOne");
                    this.controlsEnabled = false;
                    this.moveCameraTowardsTarget(() => {
                        this.showText3();
                        this.controlsEnabled = true;
                    });
                }
            } else if (isFlowerTwoClicked) {
                console.log("Clicked on flowerTwo");
                this.controlsEnabled = false;
                this.showText5();
            }
        }
    }
    


    private showText0(callback?: () => void) {
        const text2 = "In such a wide grassland,\nI noticed this ugly flower at first glance.";
        const textElement = document.createElement("div");
        textElement.id = "text0";
        textElement.style.position = "fixed";
        textElement.style.textTransform = "uppercase";
        textElement.style.fontSize = "90px";
        textElement.style.fontWeight = "bold";
        textElement.style.color = "red";
        textElement.style.opacity = "1"; // 初始透明度
        textElement.style.transition = "opacity 0.5s ease";
        document.body.appendChild(textElement);

        this.disableInteraction();


        const audio = new Audio('./sound/text1.mp3'); // 替换为你的语音文件路径
        audio.play().catch((error) => {
            console.error("Audio playback failed:", error);
        });



        let currentChar = 0;
        const interval = setInterval(() => {
            const displayChar = text2.charAt(currentChar);
            if (displayChar === "\n") {
                textElement.innerHTML += "<br>"; // 如果是换行符，插入换行
            } else {
                textElement.innerHTML += displayChar; // 添加字符
            }
            currentChar++;

            // 判断是否已经显示完整
            if (currentChar >= text2.length) {
                clearInterval(interval);

                // 显示完文字后，设置一个延迟后开始淡出
                setTimeout(() => {
                    this.fadeOutText(textElement, () => {
                        // 恢复交互
                        this.enableInteraction();
                        this.showArrowHint();
                        if (callback) callback();
                    });
                }, 1000);
            }
        }, 80); // 调整此间隔以控制文字显示速度

    }



    private showText2() {
        const text2 = `I’m sure it possesses a one-of-a-kind ordinariness in this world, just as ordinary as I am.\nSo I walk straight toward it.`;

        const textElement = document.createElement("div");
        textElement.id = "text2";
        textElement.style.position = "fixed";
        textElement.style.textTransform = "uppercase";
        textElement.style.fontSize = "90px";
        textElement.style.fontWeight = "bold";
        textElement.style.color = "red";
        textElement.style.opacity = "1"; // 初始透明度
        textElement.style.transition = "opacity 0.5s ease";
        document.body.appendChild(textElement);


        const audio = new Audio('./sound/text2.mp3'); // 替换为你的语音文件路径
        audio.play().catch((error) => {
            console.error("Audio playback failed:", error);
        });


        let currentChar = 0;
        const interval = setInterval(() => {
            let displayText = text2.charAt(currentChar);
            if (displayText === '\n') {
                textElement.innerHTML += "<br>";
            } else {
                textElement.innerHTML += displayText;
            }

            currentChar++;

            // 判断是否已经显示完整
            if (currentChar >= text2.length) {
                clearInterval(interval);

                // 显示完文字后，设置一个延迟后开始淡出
                setTimeout(() => {
                    this.fadeOutText(textElement);  // 调用淡出方法
                }, 1000);
                this.isFlowerOneClickable = true;
                this.enableControls();
            }
        }, 60); // 调整此间隔以控制文字显示速度

    }



    private showText3() {
        const text3 = `in this moment, i am no longer alone. \ni have no need to seek answers.`;

        const textElement = document.createElement("div");
        textElement.id = "text3";
        textElement.style.position = "fixed";
        textElement.style.textTransform = "uppercase";
        textElement.style.fontSize = "90px";
        textElement.style.fontWeight = "bold";
        textElement.style.color = "red";
        textElement.style.opacity = "1"; // 初始透明度
        textElement.style.transition = "opacity 0.5s ease";
        document.body.appendChild(textElement);


        const audio = new Audio('./sound/text3.mp3'); // 替换为你的语音文件路径
        
           
            audio.play().catch((error) => {
                console.error("Audio playback failed:", error);
            });
        


        let currentChar = 0;
        const interval = setInterval(() => {
            let displayText = text3.charAt(currentChar);
            if (displayText === '\n') {
                textElement.innerHTML += "<br>";
            } else {
                textElement.innerHTML += displayText;
            }

            currentChar++;

            // 判断是否已经显示完整
            if (currentChar >= text3.length) {
                clearInterval(interval);

                // 显示完文字后，设置一个延迟后开始淡出
                setTimeout(() => {
                    this.fadeOutText(textElement); 
                    this.canShowText4 = true;
                    this.triggerKeyBounce();  // 调用淡出方法
                }, 1000);
                this.enableControls();
            }
        }, 60); // 调整此间隔以控制文字显示速度

    }


    private triggerKeyBounce() {
        this.isLeftAndDownKeyActive = true;
    
        const leftKey = document.getElementById("arrow-left");
        const downKey = document.getElementById("arrow-down");
    
        if (leftKey) leftKey.classList.add("jumping");
        if (downKey) downKey.classList.add("jumping");
    }
    
    private checkKeyBounceStopConditions() {
        if (!this.isLeftAndDownKeyActive) return;
    
        const leftKey = document.getElementById("arrow-left");
        const downKey = document.getElementById("arrow-down");
    
        // 条件 1：当 position.x < 1 时，停止左键跳动
        if (this.camera.position.x < 1 && leftKey?.classList.contains("jumping")) {
            leftKey.classList.remove("jumping");
        }
    
        // 条件 2：当 position.z > 6 时，停止下键跳动
        if (this.camera.position.z > 4 && downKey?.classList.contains("jumping")) {
            downKey.classList.remove("jumping");
        }
    
        // 如果两键都不跳动，则更新状态
        const leftKeyActive = leftKey?.classList.contains("jumping");
        const downKeyActive = downKey?.classList.contains("jumping");
    
        if (!leftKeyActive && !downKeyActive) {
            this.isLeftAndDownKeyActive = false; // 停止跳动状态
        }
    }
    
    
    
    private showText4() {
        const text4 = `for I’ve found peace within myself,\nexpecting nothing from it.`;

        const textElement = document.createElement("div");
        textElement.id = "text4";
        textElement.style.position = "fixed";
        textElement.style.textTransform = "uppercase";
        textElement.style.fontSize = "90px";
        textElement.style.fontWeight = "bold";
        textElement.style.color = "red";
        textElement.style.opacity = "1"; // 初始透明度
        textElement.style.transition = "opacity 0.5s ease";
        document.body.appendChild(textElement);


        const audio = new Audio('./sound/text4.mp3'); // 替换为你的语音文件路径
        audio.play().catch((error) => {
            console.error("Audio playback failed:", error);
        });


        let currentChar = 0;
        const interval = setInterval(() => {
            let displayText = text4.charAt(currentChar);
            if (displayText === '\n') {
                textElement.innerHTML += "<br>";
            } else {
                textElement.innerHTML += displayText;
            }

            currentChar++;

            // 判断是否已经显示完整
            if (currentChar >= text4.length) {
                clearInterval(interval);

                // 显示完文字后，设置一个延迟后开始淡出
                setTimeout(() => {
                    this.fadeOutText(textElement);  // 调用淡出方法
                }, 1000);
                this.enableControls();
            }
        }, 60); // 调整此间隔以控制文字显示速度

    }

    private showText5() {
        const text5 = `Loves me, loves me not...\nWhatever.\nI’m just another ugly flower in this grassland, too.`;

        const textElement = document.createElement("div");
        textElement.id = "text5";
        textElement.style.position = "fixed";
        textElement.style.textTransform = "uppercase";
        textElement.style.fontSize = "90px";
        textElement.style.fontWeight = "bold";
        textElement.style.color = "red";
        textElement.style.opacity = "1"; // 初始透明度
        textElement.style.transition = "opacity 0.5s ease";
        document.body.appendChild(textElement);


        const audio = new Audio('./sound/finaltext.mp3'); // 替换为你的语音文件路径
       
       
       
      
         
            audio.play().catch((error) => {
                console.error("Audio playback failed:", error);
            });
        

        let currentChar = 0;
        const interval = setInterval(() => {
            let displayText = text5.charAt(currentChar);
            if (displayText === '\n') {
                textElement.innerHTML += "<br>";
            } else {
                textElement.innerHTML += displayText;
            }

            currentChar++;

            // 判断是否已经显示完整
            if (currentChar >= text5.length) {
                clearInterval(interval);

                setTimeout(() => {
                    this.fadeOutText(textElement, () => {
                        setTimeout(() => {
                       
                        if (!this.hasShownText5) {
                            this.hasShownText5 = true; // 标志变量置为 true，确保只执行一次
    
                            // 改变 mini-triangle 背景颜色
                            const miniTriangle = document.querySelector('.triangle-mini') as HTMLElement;
                            if (miniTriangle) {
                                miniTriangle.style.borderTop = '35px solid red'; // 改变背景颜色
    
                                // 播放 start.mp3 声音
                                const startAudio = new Audio('./sound/start.mp3');
                                startAudio.play().catch((error) => {
                                    console.error("Start audio playback failed:", error);
                                });
    
                                // 添加点击事件监听器
                                miniTriangle.addEventListener('click', () => {
                                    window.location.reload(); // 刷新页面重新开始
                                });
                            }
                        }
                    },2000);
                    });
                }, 1000);
                this.enableControls();
            }
        }, 60); // 调整此间隔以控制文字显示速度

    }


    private fadeOutText(messageElement: HTMLElement, callback?: () => void) {
        let opacity = 1;
        const fadeOutInterval = setInterval(() => {
            opacity -= 0.08;
            messageElement.style.opacity = opacity.toString();
            if (opacity <= 0) {
                clearInterval(fadeOutInterval);
                messageElement.style.display = "none"; // 隐藏文本
                if (callback) callback();
            }
        }, 50);
    }




    // 移动相机到目标位置，接受一个完成时调用的回调函数
    private moveCameraTowardsTarget(onComplete: () => void) {
        this.targetPosition = new THREE.Vector3(7.8, 5, -2.2);

        // 模拟动画移动相机到目标位置
        const interval = setInterval(() => {
            if (this.targetPosition) {
                const direction = new THREE.Vector3().subVectors(this.targetPosition, this.camera.position).normalize();
                // 继续进行相机移动或其他逻辑

                const distance = this.camera.position.distanceTo(this.targetPosition!);


                // 如果相机距离目标位置足够近，则停止移动
                if (distance < 0.1) {
                    this.camera.position.copy(this.targetPosition!);
                    clearInterval(interval);

                    // 调用完成后的回调
                    onComplete();
                } else {
                    // 每帧移动
                    this.camera.position.addScaledVector(direction, 0.01);
                }
            }
        }, 16); // 模拟每帧更新，约60fps
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
        this.canvas.style.pointerEvents = "none";
        window.addEventListener("keydown", this.preventKeyEvent, true);
        window.addEventListener("keyup", this.preventKeyEvent, true);
        this.isInteractionEnabled = false;
        this.firstPersonControls.enabled = false; // 禁用第一人称控制
      
    }

    private enableInteraction() {
        this.canvas.style.pointerEvents = "auto";

        // 恢复键盘事件
        window.removeEventListener("keydown", this.preventKeyEvent, true);
        window.removeEventListener("keyup", this.preventKeyEvent, true);
        this.isInteractionEnabled = true;
        this.firstPersonControls.enabled = true; // 启用第一人称控制
      
    }


    private preventKeyEvent(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
    }


    private moveCameraTowardsFlower() {
        // 使用动画逐渐靠近花
        if (!this.targetPosition) return;

        const direction = new THREE.Vector3().subVectors(this.targetPosition, this.camera.position).normalize();
        const distance = this.camera.position.distanceTo(this.targetPosition);
        const step = Math.min(distance, 0.1); // 每帧的移动步长
        this.camera.position.addScaledVector(direction, step);

        if (distance < 0.1) {
            this.targetPosition = null;
            this.hasReachedTarget = true; // 设置为已到达目标位置
        }
    }






    private animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.firstPersonControls.update(delta);
      

       
        // this.cameraPositionGUI.x.setValue(this.camera.position.x);
        // this.cameraPositionGUI.y.setValue(this.camera.position.y);
        // this.cameraPositionGUI.z.setValue(this.camera.position.z);

        // this.cameraRotationGUI.x.setValue(this.camera.rotation.x);
        // this.cameraRotationGUI.y.setValue(this.camera.rotation.y);
        // this.cameraRotationGUI.z.setValue(this.camera.rotation.z);


        const flowers = [this.flowerOne, this.flowerTwo];
        let isHovering = false;
    
        flowers.forEach((flower) => {
            if (flower && this.isFlowerOneClickable) { 
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObject(flower, true);
    
                if (intersects.length > 0) {
                    isHovering = true;
                }
    
                // 模拟花的风吹效果
                const windStrength = 0.05; // 摆动的强度
                const windFrequency = 1.5; // 摆动的频率
    
                flower.rotation.y = Math.sin(this.clock.elapsedTime * windFrequency) * windStrength;
                flower.rotation.z = Math.sin(this.clock.elapsedTime * windFrequency * 0.3) * windStrength;
            }
        });

        this.canvas.style.cursor = isHovering ? "pointer" : "default";

        // 如果有目标位置，逐步移动相机朝向目标位置（花的位置）
        if (this.targetPosition) {
            this.moveCameraTowardsFlower();
        }

        // 为草的材质更新时间，模拟风吹效果
        if (this.grassMaterial && this.grassMaterial.uniforms) {
            this.grassMaterial.uniforms.uTime.value += delta * 0.4;
        }
     
       

   

        this.checkKeyBounceStopConditions();

        this.renderer.render(this.scene, this.camera);
    }







    private updateCameraHeight() {
        this.raycaster.set(this.camera.position, new THREE.Vector3(0, -1, 0));
        const intersects = this.raycaster.intersectObject(this.terrainMesh, true);

        if (intersects.length > 0) {
            const terrainHeight = intersects[0].point.y;
            const smoothFactor = 0.1;
            this.camera.position.y += (terrainHeight + this.cameraHeightAboveTerrain - this.camera.position.y) * smoothFactor;
        }
    }

    private addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.castShadow = true;
        directionalLight.position.set(100, 100, 100);
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.mapSize.set(2048, 2048);

        this.scene.add(directionalLight);
    }



    private setupTextures() {
        this.textures.perlinNoise = this.textureLoader.load("/perlinnoise.webp");
        this.textures.grassAlpha = this.textureLoader.load("/grass.jpeg");
        this.grassMaterial.setupTextures(this.textures.grassAlpha, this.textures.perlinNoise);
    }

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
        this.sceneGUI.addColor(this.sceneProps, "terrainColor").onChange((value) => {
            this.terrainMesh.material.color.set(value);
        });
        this.sceneGUI.add(this.sceneProps, "fogDensity", 0, 0.05, 0.000001).onChange((value) => {
            (this.scene.fog as THREE.FogExp2).density = value;
        });
    }



    private setupEventListeners() {
        window.addEventListener("resize", () => this.setAspectResolution(), false);

        window.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft" && this.canShowText4) {
                this.showText4();
                this.canShowText4 = false; // 重置状态，避免多次触发
            }
        });
    }

    private setAspectResolution() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private init() {
        this.gui = new dat.GUI();
        this.setupGUI();
        this.setupCameraControls();
        this.setupTextures();
        this.loadModels();
        this.setupEventListeners();
        this.addLights();
        this.animate();


    }

    private showArrowHint() {
        // 创建容器
        const arrowHint = document.createElement("div");
        arrowHint.id = "arrow-hint";

        // 创建方向键布局
        arrowHint.innerHTML = `
      <div class="row">
        <div class="arrow-key jumping" id="arrow-up">↑</div>
      </div>
      <div class="row">
        <div class="arrow-key" id="arrow-left">←</div>
        <div class="arrow-key" id="arrow-down">↓</div>
        <div class="arrow-key" id="arrow-right">→</div>
      </div>
    `;

        // 插入到页面中
        document.body.appendChild(arrowHint);

        // 添加样式
        const style = document.createElement("style");
        style.textContent = `
      #arrow-hint {
        position: fixed;
        bottom: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        z-index: 1000;
      }

      .row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .arrow-key {
        width: 40px;
        height: 40px;
        background-color: rgba(245, 245, 245, 0.8);
        color: black;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        font-size: 24px;
        font-weight: bold;
        transition: background-color 0.2s ease, transform 0.2s ease;
      }

      .arrow-key.jumping {
        animation: arrowBounce 1s infinite;
      }

      .arrow-key.active {
        background-color: rgba(0, 0, 0, 0.3);
        color: white; /* 可选：改变文字颜色 */
      }

      @keyframes arrowBounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
    `;
        document.head.appendChild(style);

        // 添加按键交互效果
        this.addArrowKeyListeners();
    }
    private addArrowKeyListeners() {
        const arrowKeys = {
            ArrowUp: "arrow-up",
            ArrowLeft: "arrow-left",
            ArrowDown: "arrow-down",
            ArrowRight: "arrow-right"
        };

        // 监听按键按下事件
        window.addEventListener("keydown", (event) => {
            const key = arrowKeys[event.key];
            if (key) {
                const element = document.getElementById(key);
                if (element) {
                    element.classList.add("active");

                    // 如果按下的是 ArrowUp
                    if (key === "arrow-up" && element.classList.contains("jumping")) {
                        // 停止跳动动画
                        element.classList.remove("jumping");

                        // 显示 text2
                        this.showText2();
                    }
                }
            }
        });

        // 监听按键松开事件
        window.addEventListener("keyup", (event) => {
            const key = arrowKeys[event.key];
            if (key) {
                const element = document.getElementById(key);
                if (element) {
                    element.classList.remove("active");
                }
            }
        });
    }




}

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const app = new Scene2(canvas);