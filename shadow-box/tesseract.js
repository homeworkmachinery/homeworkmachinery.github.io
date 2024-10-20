// 等待DOM加载完毕后运行代码
document.addEventListener("DOMContentLoaded", function() {
    // 设置场景、摄像机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threejsCanvas'), alpha: true });
    renderer.setClearColor(0x000000, 0); 
    renderer.setSize(window.innerWidth, window.innerHeight);


    // 超正方体的 8 个顶点 (4D -> 3D 投影)
    const vertices = [
        [-1, -1, -1,  1], [1, -1, -1,  1],
        [1,  1, -1,  1], [-1,  1, -1,  1],
        [-1, -1,  1,  1], [1, -1,  1,  1],
        [1,  1,  1,  1], [-1,  1,  1,  1],
        [-1, -1, -1, -1], [1, -1, -1, -1],
        [1,  1, -1, -1], [-1,  1, -1, -1],
        [-1, -1,  1, -1], [1, -1,  1, -1],
        [1,  1,  1, -1], [-1,  1,  1, -1]
    ];

    // 4D 投影矩阵 (将 4D 转换为 3D)
    function projectTo3D(v) {
        const distance = 2;  // 控制 4D 到 3D 投影距离
        const w = 1 / (distance - v[3]);  // 投影比例系数
        return [v[0] * w, v[1] * w, v[2] * w];
    }

    // 旋转 4D 向量
    function rotate4D(vertex, angleXW, angleYW, angleZW) {
        let [x, y, z, w] = vertex;

        // XW 平面的旋转
        let newX = x * Math.cos(angleXW) - w * Math.sin(angleXW);
        let newW = x * Math.sin(angleXW) + w * Math.cos(angleXW);
        x = newX;
        w = newW;

        // YW 平面的旋转
        let newY = y * Math.cos(angleYW) - w * Math.sin(angleYW);
        newW = y * Math.sin(angleYW) + w * Math.cos(angleYW);
        y = newY;
        w = newW;

        // ZW 平面的旋转
        let newZ = z * Math.cos(angleZW) - w * Math.sin(angleZW);
        newW = z * Math.sin(angleZW) + w * Math.cos(angleZW);
        z = newZ;
        w = newW;

        return [x, y, z, w];
    }

    // 连接顶点的边
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],  // 立方体1
        [4, 5], [5, 6], [6, 7], [7, 4],  // 立方体2
        [0, 4], [1, 5], [2, 6], [3, 7],  // 立方体1-2之间的边
        [8, 9], [9, 10], [10, 11], [11, 8], // 立方体3
        [12, 13], [13, 14], [14, 15], [15, 12],  // 立方体4
        [8, 12], [9, 13], [10, 14], [11, 15], // 立方体3-4之间的边
        [0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15] // 超正方体之间的边
    ];

    const lines = [];
    for (const edge of edges) {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ color: 'white' });
        const positions = new Float32Array(6);  // 每条边有两个顶点，每个顶点有三个坐标

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const line = new THREE.Line(geometry, material);
        lines.push(line);
        scene.add(line);
    }

  



    camera.position.z = 5;

    let angleXW = 0;
    let angleYW = 0;
    let angleZW = 0;

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const keysPressed = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false
    };

    // 键盘按键按下事件
    document.addEventListener('keydown', (event) => {
        if (event.code in keysPressed) {
            keysPressed[event.code] = true;
        }
    });

    // 键盘按键松开事件
    document.addEventListener('keyup', (event) => {
        if (event.code in keysPressed) {
            keysPressed[event.code] = false;
        }
    });

    // 鼠标按下事件
    document.addEventListener('mousedown', (event) => {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        document.body.classList.add('grabbing'); // 切换到抓手样式
    });

    // 鼠标移动事件
    document.addEventListener('mousemove', (event) => {
        if (!isDragging) {
            document.body.classList.add('grabbable'); // 鼠标未按下时，切换到可抓手样式
            return;
        }

        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        angleXW += deltaX * 0.01; // 根据鼠标移动的 X 轴距离调整 XW 平面的旋转角度
        angleYW += deltaY * 0.01; // 根据鼠标移动的 Y 轴距离调整 YW 平面的旋转角度

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    });

    // 鼠标松开事件
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.classList.remove('grabbing'); // 恢复默认样式
    });

    // 用于自动旋转的开关
    let isAutoRotating = true; 

    // 点击 .square-mini 切换自动旋转开关
    document.querySelector('.square-mini').addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;  // 切换自动旋转状态
    });

    // 监听窗口大小变化事件，自动更新渲染器和摄像机
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    function animate() {
        requestAnimationFrame(animate);

        // 持续旋转逻辑，根据按下的键持续更新旋转角度
        if (keysPressed.ArrowLeft) {
            angleXW -= 0.1;  // 持续向左旋转
        }
        if (keysPressed.ArrowRight) {
            angleXW += 0.1;  // 持续向右旋转
        }
        if (keysPressed.ArrowUp) {
            angleYW -= 0.1;  // 持续向上旋转
        }
        if (keysPressed.ArrowDown) {
            angleYW += 0.1;  // 持续向下旋转
        }

        // 如果开启了自动旋转，则持续旋转
        if (isAutoRotating) {
            angleXW += 0.01;  // 控制 XW 平面的旋转速度
            angleYW += 0.01;  // 控制 YW 平面的旋转速度
        }

        // 更新每条边的顶点位置
        for (let i = 0; i < edges.length; i++) {
            const [startIdx, endIdx] = edges[i];
            const startVertex = rotate4D(vertices[startIdx], angleXW, angleYW, angleZW);
            const endVertex = rotate4D(vertices[endIdx], angleXW, angleYW, angleZW);

            const start3D = projectTo3D(startVertex);
            const end3D = projectTo3D(endVertex);

            const line = lines[i];
            const positions = line.geometry.attributes.position.array;
            positions[0] = start3D[0];
            positions[1] = start3D[1];
            positions[2] = start3D[2];
            positions[3] = end3D[0];
            positions[4] = end3D[1];
            positions[5] = end3D[2];
            line.geometry.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }



    
    animate();

     
       let isWhite = true;

      
       document.querySelector('.triangle-mini').addEventListener('click', () => {
           isWhite = !isWhite; 

           
           lines.forEach(line => {
               line.material.color.set(isWhite ? 0xffffff : 0x000000); 
           });

          
           document.getElementById('flashlightCanvas').style.display = isWhite ? 'none' : 'block';

          
           document.querySelector('.square-mini').style.borderColor = isWhite ? 'white' : 'black';
           document.querySelector('.circle-mini').style.borderColor = isWhite ? 'white' : 'black';
           document.querySelector('.triangle-mini').style.borderTopColor = isWhite ? 'white' : 'black';
           document.addEventListener('mousemove', function(event) {
          
          
          
            if (!isDragging) {
               
                document.body.style.cursor = isWhite ? 'auto' : 'none';
            } else {
                document.body.style.cursor = 'grabbing'; 
            }
        });
      
        document.addEventListener('mousedown', (event) => {
            isDragging = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            document.body.style.cursor = 'grabbing'; 
        });
        
       
        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.cursor = isWhite ? 'auto' : 'none'; 
        });
    
    });

 
});
