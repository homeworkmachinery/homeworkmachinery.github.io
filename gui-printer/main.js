var timeInterval;
var isTimeRunning = true;
var currentBarcodeValue = "";
var capturing = true;

var camera = (function() {
	var options;
	var video, canvas, context;
	var renderTimer;

	function initVideoStream() {
		video = document.createElement("video");
		video.setAttribute('width', options.width);
		video.setAttribute('height', options.height);
		video.setAttribute('playsinline', 'true');
		video.setAttribute('webkit-playsinline', 'true');
	
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			options.onNotSupported();
			return;
		}
	
		navigator.mediaDevices.getUserMedia({ video: true, audio: false })
			.then(function(stream) {
				options.onSuccess();
	
				if ("srcObject" in video) {
					video.srcObject = stream;
				} else {
					video.src = window.URL.createObjectURL(stream); // 旧浏览器
				}
	
				video.play();
				initCanvas();
			})
			.catch(function(err) {
				// 打印详细错误信息，帮助你排查
				console.error("getUserMedia error:", err);
				options.onError(err);
			});
		}

	function initCanvas() {
		canvas = options.targetCanvas || document.createElement("canvas");
		canvas.setAttribute('width', options.width);
		canvas.setAttribute('height', options.height);

		context = canvas.getContext('2d');

		// mirror video
		if (options.mirror) {
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}
	}

	function startCapture() {
		video.play();

		renderTimer = setInterval(function() {
			try {
				context.drawImage(video, 0, 0, video.width, video.height);
				options.onFrame(canvas);
			} catch (e) {
				// TODO
			}
		}, Math.round(1000 / options.fps));
	}

	function stopCapture() {
		pauseCapture();

		if (video.mozSrcObject !== undefined) {
			video.mozSrcObject = null;
		} else {
			video.srcObject = null;
		}
	}

	function pauseCapture() {
		if (renderTimer) clearInterval(renderTimer);
		video.pause();
	}

	return {
		init: function(captureOptions) {
			var doNothing = function(){};

			options = captureOptions || {};

			options.fps = options.fps || 30;
			options.width = options.width || 640;
			options.height = options.height || 480;
			options.mirror = options.mirror || false;
			options.targetCanvas = options.targetCanvas || null; // TODO: is the element actually a <canvas> ?

		

			options.onSuccess = options.onSuccess || doNothing;
			
			options.onError = options.onError || doNothing;
			options.onNotSupported = options.onNotSupported || doNothing;
			options.onFrame = options.onFrame || doNothing;

			initVideoStream();
		},

		start: startCapture,

		pause: pauseCapture,

		stop: stopCapture
	};
})();

//-----

async function generateHash(text) {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex.slice(0, 15); 
  }



function replaceWithInput() {
    const h2 = document.getElementById("manifesto-input"); // 注意是 h2，不要用 el
    const isPlaceholder = h2.textContent === i18n.zh.placeholder || h2.textContent === i18n.en.placeholder;
    
    const textarea = document.createElement("textarea");
    textarea.rows = 1;
    textarea.value = isPlaceholder ? "" : h2.textContent;
    textarea.placeholder = i18n[currentLang].placeholder;

    // 设置样式
    textarea.style.fontFamily = '"STSong", serif';
    textarea.style.fontSize = "35px";
    textarea.style.fontWeight = "900";
    textarea.style.color = "black";
    textarea.style.textAlign = "center";
    textarea.style.border = "none";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.maxWidth = "400px";
    textarea.style.width = "100%";
    textarea.style.display = "block";
    textarea.style.margin = "0 auto 4px auto";
    textarea.style.padding = "0";
    textarea.style.lineHeight = "1.1";
    textarea.style.overflowWrap = "break-word";
    textarea.style.whiteSpace = "pre-wrap";

    // 绑定输入时生成条形码
	textarea.addEventListener("input", function() {
		generateBarcode(this.value); // 用异步函数生成并设置 currentBarcodeValue
	});

    textarea.addEventListener("blur", function() {
        const value = textarea.value.trim();
        const restoredText = value || i18n[currentLang].placeholder;

        h2.innerText = restoredText;
        h2.onclick = replaceWithInput;
        h2.id = "manifesto-input";

        textarea.replaceWith(h2);
    });

    h2.replaceWith(textarea);
    textarea.focus();
}



async function generateBarcode(text) {
	if (!text || text === i18n.zh.placeholder || text === i18n.en.placeholder) {
		text = "MANIFESTOCLUB";
	}
	const hash = await generateHash(text);
	currentBarcodeValue = hash; // 保存用于数据库的值

	try {
		JsBarcode("#barcode", hash, {
			format: "CODE128",
			displayValue: true,
			font:'"Lucida Console"',
			width: 2,
			height: 80,
			margin: 0
		});
		// 把值写入 svg 属性，供 getCurrentBarcode 使用
		document.querySelector("#barcode").setAttribute("data-barcode", hash);
	} catch (e) {
		console.error("生成条形码失败:", e);
	}
}




window.addEventListener("load", () => {
    // 等待 DOM 和 SVG 完全渲染后执行
    requestAnimationFrame(() => {
        setTimeout(() => {
            generateBarcode("MANIFESTOCLUB");
        }, 0);
    });
});




function updateTimestamp() {
    const now = new Date();
    const timestamp = document.getElementById("timestamp");
    const formattedTime = 
        now.getFullYear() + "/" +
        String(now.getMonth() + 1).padStart(2, "0") + "/" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");
    timestamp.textContent = formattedTime;
}




function startTime() {
    if (!timeInterval) {
        updateTimestamp(); // 立即更新一次时间
        timeInterval = setInterval(updateTimestamp, 1000);
    }
    isTimeRunning = true;
}

// 停止时间更新
function stopTime() {
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
    isTimeRunning = false;
}

// 初始启动时间
startTime();



//--------------


(function() {
	var asciiContainer = document.getElementById("ascii");
	

	var targetWidth = 150;
    var targetHeight = Math.round(targetWidth * (4 / 3) / 0.9);;


    var originalAspectRatio = 4 / 3;

 
    var videoWidth, videoHeight;


    videoHeight = targetHeight;
    videoWidth = Math.round(videoHeight * originalAspectRatio); // 266.66 → 267




	camera.init({
		width: videoWidth,
		height: videoHeight,
		fps: 30,
		mirror: true,
		

		onFrame: function(canvas) {
            // Create a temporary canvas to crop/resize to 160x200
            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = targetWidth;
            tempCanvas.height = targetHeight;
            var tempCtx = tempCanvas.getContext("2d");

            // Crop center to fit 160x200
            var sourceX = (canvas.width - targetWidth) / 2;
            var sourceY = (canvas.height - targetHeight) / 2;

            // If video is taller than target, crop top/bottom
            if (canvas.height > targetHeight) {
                sourceX = 0;
                sourceY = (canvas.height - targetHeight) / 2;
                tempCtx.drawImage(canvas, 0, sourceY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
            } 
            // If video is wider than target, crop left/right
            else {
                sourceX = (canvas.width - targetWidth) / 2;
                sourceY = 0;
                tempCtx.drawImage(canvas, sourceX, 0, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
            }

            // Convert the cropped canvas to ASCII
            ascii.fromCanvas(tempCanvas, {
			
                callback: function(asciiString) {
                    asciiContainer.innerHTML = asciiString;
                }
            });
        },

		onSuccess: function() {
			camera.start();
			document.getElementById("info").style.display = "none";
			const button = document.getElementById("button");
			button.style.display = "block"; // 确保按钮显示
			
		
            // const onFirstClick = function() {
			// 	camera.start();
			// 	document.removeEventListener("click", onFirstClick); // 移除监听器
			// };
		
			// document.addEventListener("click", onFirstClick);
		
			
			button.onclick = function() {
				if (capturing) {
					camera.pause();	
					stopTime(); 
				} else {
					camera.start();
					startTime();
				}
				capturing = !capturing;
			};
		},

		onError: function(error) {
			console.error("Camera error:", error);
			document.getElementById("info").textContent = "无法访问摄像头: " + error.name;
		},
		onNotSupported: function() {
			document.getElementById("info").textContent = "您的浏览器不支持摄像头访问";
		}
	});
})();




var ascii = (function() {
	function asciiFromCanvas(canvas, options) {
		

		var characters = [" ", "░", "▒", "▓", "█"];




		// var characters = (" .'`^\",:;Il!i~+_-?][}{1)(|&8%B@$").split("");


		var context = canvas.getContext("2d");
		var canvasWidth = canvas.width;
		var canvasHeight = canvas.height;
		
		var asciiCharacters = "";

		// calculate contrast factor
		// http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
		var contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));

		var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
		for (var y = 0; y < canvasHeight; y += 2) { // every other row because letters are not square
			for (var x = 0; x < canvasWidth; x++) {
				// get each pixel's brightness and output corresponding character

				var offset = (y * canvasWidth + x) * 4;

				var color = getColorAtOffset(imageData.data, offset);
	
				// increase the contrast of the image so that the ASCII representation looks better
				// http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
				var contrastedColor = {
					red: bound(Math.floor((color.red - 128) * contrastFactor) + 128, [0, 255]),
					green: bound(Math.floor((color.green - 128) * contrastFactor) + 128, [0, 255]),
					blue: bound(Math.floor((color.blue - 128) * contrastFactor) + 128, [0, 255]),
					alpha: color.alpha
				};

				// calculate pixel brightness
				// http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
				var brightness = (0.299 * contrastedColor.red + 0.587 * contrastedColor.green + 0.114 * contrastedColor.blue) / 255;

				var character = characters[(characters.length - 1) - Math.round(brightness * (characters.length - 1))];

				asciiCharacters += character;
			}

			asciiCharacters += "\n";
		}

		options.callback(asciiCharacters);
	}

	function getColorAtOffset(data, offset) {
		return {
			red: data[offset],
			green: data[offset + 1],
			blue: data[offset + 2],
			alpha: data[offset + 3]
		};
	}

	function bound(value, interval) {
		return Math.max(interval[0], Math.min(interval[1], value));
	}

	return {
		fromCanvas: function(canvas, options) {
			options = options || {};
			options.contrast = (typeof options.contrast === "undefined" ? 128 : options.contrast);
			options.callback = options.callback || doNothing;

			return asciiFromCanvas(canvas, options);
		}
	};
})();


//------





async function uploadImage(file) {
	const filePath = `${Date.now()}-${file.name}`;
  
	const { data, error } = await client.storage
	  .from("manifesto-images") // 替换成你的 bucket 名称
	  .upload(filePath, file, {
		cacheControl: "3600",
		upsert: false,
	  });
  
	if (error) {
	  console.error("上传失败：", error);
	  alert("上传失败！");
	  return null;
	}
  
	console.log("上传成功：", data);
  

	const {
	  data: { publicUrl },
	} = client.storage.from("manifesto-images").getPublicUrl(filePath);
  
	return publicUrl;
  }
  

  let isSaving = false;
  let lastSavedPhotoHash = null; 

  
  async function handleTriangleClick() {
	if (isSaving) {
        console.log("保存操作正在进行中");
        return;
    }
    
    isSaving = true;
    
    try {
        window.print();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 获取当前照片的哈希值
        const currentPhotoHash = await getCurrentPhotoHash();
        
        // 检查是否是相同的照片
        if (currentPhotoHash !== lastSavedPhotoHash) {
            await saveManifesto();
            lastSavedPhotoHash = currentPhotoHash; // 更新最后保存的照片哈希
        } else {
            console.log("宣言已保存");
			alert("宣言已保存");
        }
    } catch (error) {
        console.error("保存过程中出错:", error);
        alert("保存失败: " + error.message);
    } finally {
        isSaving = false;
    }
}

async function getCurrentPhotoHash() {
    const storageArea = document.getElementById("storage-area");
    const canvas = await html2canvas(storageArea);
    const imageData = canvas.toDataURL("image/png");
    
    // 简单的哈希生成方法，实际应用中可以使用更复杂的算法
    const encoder = new TextEncoder();
    const data = encoder.encode(imageData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}


async function saveManifesto() {
	const el = document.getElementById("manifesto-input");
	let content = "";

	if (el.tagName === "H2") {
		content = el.innerText.trim();
	} else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
		content = el.value.trim();
	}

	const placeholders = ["请输入你的宣言", "YOUR MANIFESTO"];

if (!content || placeholders.includes(content)) {
	alert("请输入你的宣言");
	return;
}

if (capturing) {
	alert("请点击方块定格照片");
	return;
}

	const barcode = currentBarcodeValue;
	const timestamp = new Date().toISOString();


	const storageArea = document.getElementById("storage-area");

	// 截图 print-area

	const canvas = await html2canvas(storageArea);
	const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

	// 为文件生成唯一名称
	const filename = `manifestos/${barcode}-${Date.now()}.png`;

	// 上传图片到 Supabase Storage
	const { data: uploadData, error: uploadError } = await supabase.storage
		.from("manifesto-images")  // 在 Supabase 控制台先创建这个 bucket
		.upload(filename, blob, {
			contentType: "image/png",
		});

	if (uploadError) {
		console.error("图片上传失败：", uploadError);
		alert("图片上传失败！");
		return;
	}

	// 构造图片 URL
	const { data: urlData } = supabase
		.storage
		.from("manifesto-images")
		.getPublicUrl(filename);

	const imageUrl = urlData.publicUrl;

	// 写入 manifesto 表
	const { data, error } = await supabase
		.from("manifesto")
		.insert([{ barcode, content, timestamp, image_url: imageUrl }]);

	if (error) {
		console.error("保存失败：", error.message, error.details, error.hint);
		alert("保存失败，请打开控制台查看具体错误。");
	} else {
		console.log("保存成功：", data);
		alert("宣言保存成功");
	}
}

