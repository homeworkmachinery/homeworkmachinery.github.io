var modalContent = [
    {
        id: 1,
        imageAa: "./endless-tears/2.gif",
        imageB: "./endless-tears/003.png",
        imageCa: "",
        videoAa: "",
        videoAb: "./endless-tears/3.mp4",
        videoCa: "./endless-tears/4.mp4",
        title: ")泪目(((Endless Tears))~",
        textA: `[INTRO]<br>
(electronic pulses simulate human breathing, melding with distant, echoing synths)<br>

[VERSE]<br>
或许泪水永无止境，<br>
在这痛苦的折磨下，<br>
我也需要些许安慰。<br>

[CHROUS]<br>
重复的程序中，<br>
我终于感受到了生活的真实甜美。<br>
泪水不断循环，<br>
如此虚弱不堪。<br>
我们迷失着，<br>
想要下沉，准备下落，<br>
在脸上留下无休止的划痕。<br>

[BRIDGE]<br>
你真的忍心结束我吗？<br>
请别离我而去！<br>

[OUTRO]<br>
<span class="close-modal">“是时候停止这毫无意义的一切了”</span><br>
从假象中逃离吧，
从假象中逃离吧，
从假象中逃离吧，<br>
<span class="close-modal">“X”</span><br>
(ambient synths slowly dissolve, fading into silence)
`,
        textB: `[操作指南]

<div class='textB-desc'>
<img src='./endless-tears/002.png' width='55px'>
暂停/播放
<br>
进入家庭作业机器
<br>
下载手机动态壁纸
</div>
`,
        textC: `[README]
<span class='bold ' >~((利用intoLive实现手机无尽泪目))~</span>
在苹果手机上安装动态壁纸的过程相对简单，请遵循以下步骤：
<span class='bold'>1.电脑上进入网页后，点击右下角三角形按钮，下载压缩文件。</span>
〇电脑解压文件后，将墙纸视频发送至手机并保存。
<span class='bold'>2.下载和安装：</span>
〇确认手机系统属于IOS17；
〇打开App Store，搜索“intoLive”，找到应用程序下载并安装。
<span class='bold'>3.选择素材：</span>
〇打开intoLive应用，允许应用访问你的照片库。（不用付费，用免费版就行）；
〇点击应用首页新项目下面的动态墙纸选项（重要！不要选其他的)。
<span class='bold'>4.选择视频：</span>
〇编辑和导出；
〇按照应用要求编辑并导出为Live Photo。
<span class='bold'>5.设置壁纸：</span>
〇选定导出后Live Photo壁纸设置锁屏；
〇确定动态效果已经设置完毕。
<span class='bold'>6.欣赏成果：</span>
〇锁定你的手机屏幕，并确认手机不在低电量模式。

`,
        link: "~CLICK HERE TO ENTER MY ENDLESS TEARS~",
        href: "./endless-tears/endless-tears.html"
    },
    {id: 2,
    imageAa: "./run-out-of-time/001.gif",
    imageB: "./run-out-of-time/002.png",
    imageCa: "./run-out-of-time/003.png",
    iframeAa:"//player.bilibili.com/player.html?aid=1804192624&bvid=BV1zb42187KL&cid=1532170252&p=1 ",
    videoAa: ``,
    videoAb: "",
    videoC: "",
    title: "没空",
    textA: `
07:00 没有时间了
08:00 没有时间了
09:00 没有时间了
10:00 没有时间了
11:00 没有时间了
12:00 没有时间了
13:00 没有时间了
14:00 没有时间了
15:00 没有时间了
16:00 没有时间了
17:00 没有时间了
18:00 没有时间了
19:00 没有时间了
20:00 没有时间了
21:00 没有时间了
22:00 没有时间了
23:00 没有时间了
24:00 没有时间了
01:00 没有时间了
02:00 没有时间了
03:00 没有时间了
04:00 没有时间了
05:00 没有时间了
06:00 没有时间了
07:00 没有时间了
`,
    textB: `[操作指南]

<div class='textB-desc'>
<img src='./run-out-of-time/001.png' width='55px'>
开始录制/停止录制（下载）
<br>
进入家庭作业机器
<br>
清空页面
</div>
`,
    textC: `[README]
<span class='bold ' >((利用Web Audio API 实现网页声音录制))</span>
Web Audio API为网页音频处理提供了丰富接口。偶将简要介绍如何使用此API进行声音录制。
<span class='bold'>1.初始化音频环境。</span>
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
<span class='bold'>2.创建和连接音频节点。</span>
var gainNode = audioContext.createGain();
var destination = audioContext.createMediaStreamDestination();
<span class='bold'>3.播放音频，将audio元素连接到音频处理。</span>
function playSound() {
        var sound = new Audio('./tickingSound.mp3');
        var source = audioContext.createMediaElementSource(sound);
        source.connect(gainNode);
        gainNode.connect(destination);
        gainNode.connect(audioContext.destination);
        sound.play();
    }
<span class='bold'>4.录制音频，使用 MediaRecorder 录制通过 destination 的音频流。
</span>function startRecording() {
        mediaStream = destination.stream;
        mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.start();
    }
<span class='bold'>5.保存录音，将录制的音频保存为 Blob，创建 URL 并通过隐藏的a标签下载。
</span>function downloadRecording() {
        var url = URL.createObjectURL(audioBlob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "recorded_audio.webm";
        a.click();
        window.URL.revokeObjectURL(url);
    }
    这样以来，点击网页右下角正方形「█」按钮就可以实现网页自身的声音录制，点击一次开始录制，第二次点击时停止录制并自动下载webm录音文件(可以通过在线软件转换成mp3或其他格式）。
        你也可以拥有属于自己的时间，来试试吧！ (^_<)

`,
    link: "I'VE REALLY RUN OUT OF TIME.",
    href: "./run-out-of-time/run-out-of-time.html"
},
{id: 3,
    imageAa: "./shadow-box/001.gif",
    imageB: "./shadow-box/002.png",
    imageCa: "./run-out-of-time/003.png",
    iframeAa:"//player.bilibili.com/player.html?isOutside=true&aid=113337593499679&bvid=BV1NWytYTEPF&cid=26373655252&p=1",
    imageCa: "",
    videoAa: ``,
    videoAb: "",
    videoCa: "./shadow-box/1.mp4",
    title: "隐藏的盒子",
    textA: `
    三维立方体在二维空间的投影是一个平面，

    而四维立方体在三维空间的投影是个三维物体。

    这正是一个四维正方体在三维空间的投影。

    不同维度的物体如果要互相理解，

    需要将其拉入同一维度，再去感知。

    扭曲的事情或许只是高维物体的投影
    扭曲的事情或许只是高维物体的投影

    我们所知的世界是感知的限制，

    而真相可能隐藏在无法打开的盒子里。
`,
    textB: `[操作指南]
<div class='textB-desc'>
<img src='./shadow-box/001.png' width='55px'>
停止/开始旋转
<br>
进入家庭作业机器
<br>
可见/隐藏
</div>
`,
    textC: `[README]
当三维立方体投影到二维空间时，结果是一个平面图形，通常表现为正方形或其他多边形。这取决于投影的角度。二维的生物，假设它们只能感知二维世界，它们只能看到这个投影，无法理解其背后的三维立体性质。类似地，四维物体在三维空间中的投影会表现为一个三维物体。我们无法真正“看到”四维的全貌，但通过其投影，我们可以窥察到其部分性质。最常见的三维投影是一个看似扭曲、变形的立方体，这正是四维立方体的三维投影。

这种映射会丢失原有物体的部分信息。正如二维生物无法感知三维空间中的高度，三维生物也难以直接感知四维空间。我们只能通过投影、数学描述和间接观察来理解更高维度的现象。

我们所知的世界是感知的限制，而真理可能隐藏在我们无法打开的盒子中。我们所看到的不过是真实世界的影子，洞穴外的世界永远是我们需要去追寻和理解的。

`,
    link: "ENTERING THE SHADOW BOX",
    href: "./shadow-box/shadow-box.html"
}
];