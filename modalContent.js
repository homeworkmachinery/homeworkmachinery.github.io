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
        textB: `[用户指南]

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
    textB: `[用户指南]

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
    imageCa: "",
    iframeAa:"//player.bilibili.com/player.html?isOutside=true&aid=113337593499679&bvid=BV1NWytYTEPF&cid=26373655252&p=1",
    imageCa: "",
    videoAa: ``,
    videoAb: "",
    videoCa: "./shadow-box/2.mp4",
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
    textB: `[用户指南]
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
},
{id: 4,
    imageAa: "./love-game/001.gif",
    imageAb: "./love-game/002.gif",
    imageB: "./love-game/002.png",
    imageCa: "./love-game/003.png",
    iframeCa:"//player.bilibili.com/player.html?isOutside=true&aid=113634483114161&bvid=BV1R2qDYPE6j&cid=27291618234&p=1",
    videoAa: ``,
    videoAb: "",
    videoC: "",
    title: "爱情游戏",
    textA: `
    [第一幕]

    那么大的草坪

    我一眼就看中了这朵丑花

    它是那么的特别

    于是我径直走向它

    命运般地把它摘下

    爱我
    不爱我
    爱我
    不爱我

    我向它寻求答案

    直到它变成了一朵残花
    
    在这无果的爱情里

    另一朵花又出现了

    它是那么的特别

    我再次看中了这份孤独

    于是我径直走向它

    轮回般地把它摘下
    ...

    [第二幕]

    那么大的草坪

我一眼就看中了这朵丑花

我确定它拥有着世界上独一无二的平凡

就如同平凡的我一样

于是我径直走向它

此刻我已不再孤独

我不想叩问答案

因为我内心已经平静

并不期待对方为我带来什么

爱我
不爱我
爱我
不爱我

谁在乎呢

我也只是这草坪上的另一朵丑花
`,
    textB: `[用户指南]

<div class='textB-desc'>
<img src='./love-game/001.png' width='55px'>
第二幕


进入家庭作业机器


重新开始
</div>
`,
    textC: `[README]
一开始本来有挺多话想说的，但由于第一次尝试ts以及vite环境，被频繁弹出的bug折腾得半死，心态已被磨平。着实也没什么好说的，稍微祭奠一下好了。

在我人生第一段对他人主动而真诚的爱意里，除了收获到贬低、调侃和欺骗，显然还告诉了我一些别的东西——当你向往的是再普通不过的人身上的平凡，你照样也收获不到一颗平等而真诚的心。有时我会想，如果我在第一幕第一朵就成功了，会不会收获一个愚蠢的幸福结局？不过现实生活运气一般没有那么好，爱情往往出自于一朵接一朵的幻想，最后又会因为现实的无聊感而凋谢。人们出于对自身某些角度的自恋或意图掩盖某些角度的自卑，往往执着于特别，但打着灯笼都找不到特别又情投意合的人。于是携带着最初的一些痛苦执念，被欲望推动，开始不断寻找和循环。

只有当爱上了自身的普通和平凡，放平了急于遮掩或暴露的心态，随着环境而缓缓流动，才能感受到这个世界更宽广的怀抱以及更真实而细微的爱。这种爱不来自于他人，而是对自身的善待。从某个角度来说，第二幕的爱意来自于这片草坪。不再纠结自身的付出，也不再依赖对方的给予，这对丑花不过就是在这片草坪上玩耍和陪伴。这就是我能想象出的爱情游戏最幸福的结局。

`,
    link: "LOVE GAME",
    href: "./love-game"
},
{id: 5,
    imageAa: "",
    imageAb: "",
    imageB: "./ripple/001.png",
    imageCa: "./ripple/004.png",
    imageCb: "./ripple/003.png",
    iframeCa:"//player.bilibili.com/player.html?isOutside=true&aid=113690250581264&bvid=BV19ukbYmE4W&cid=27456309026&p=1",
    videoAa: `./ripple/1.mp4`,
    videoAb: "",
    videoC: "",
    title: "涟漪的声音",
    textA: `<pre>
     O 

                                      (O)

                    (())  

        (((O)))          

                             (((())))

()

       o                               (((o)))


O                 ()

(((O)))


                                      (O)
                        o
              O       
              </pre>
`,
    textB: `[用户指南]

<div class='textB-desc'>
<img src='./ripple/002.png' width='55px'>
开始/停止录制(下载)


进入家庭作业机器


自定义背景图片
</div>
`,
    textC: `[README]
    ((利用WEB MIDI API控制声效))
    MIDI（ Musical Instrument Digital Interface ）是一个广泛使用的音乐标准，它定义了 128 个音符 ，从 0 到 127 。 每个音符对应一个特定的音符名称（如 C0 、 C#0 、 D0 等）和一个 频率 （单位为赫兹，Hz）。频率的定义遵循 十二平均律 （ Equal Temperament ），即每个音符之间的间隔是相等的。 最常用的音符范围是 C3 到 C6， A4 （标准音）的 MIDI 编号是 69 ，其频率为 440Hz 。 Web MIDI API 会将 MIDI 编号 （如 60）转换为相应的音符名称（如 "C4"）并将其传递给相关的音频合成器或音频处理系统。

    比如，你千辛万苦求得ripple.mp3。 通过 Web Audio API ，你可以加载该文件并创建一个音频源来播放它。
    
    然后，通过 MIDI 键盘发送的 'Note On' 和 'Note Off' 消息，控制音符的播放和停止。 当按下键盘上的某个音符时， 'Note On' 消息携带音符编号和力度（velocity）信息，触发该音符的播放，并根据力度值控制音量和音效。当键盘释放某个音符时， 'Note Off' 消息将终止音符的播放，确保音符的精确结束。

    这样一来，你可以实现任何声音的音高控制，并通过你的MIDI设备对此进行操作，打造你属于你自己的网页合成器。不妨一试！

`,
    link: "(((RIPPLE)))",
    href: "./ripple/ripple.html"
},
{id: 6,
    imageAa: "",
    imageAb: "",
    imageB: "./noise-to-word/1.jpg",
    imageCa: "",
    imageCb: "",
    iframeCa:"",
    videoAa: `./noise-to-word/1.mp4`,
    videoAb: "",
    videoCa: "./noise-to-word/1.mp4",
    title: "噪音转文字",
    textA: ` const randomTexts = [

            "岢", "龘", "媿", "冭", "囬", "硪", "鎬", "丄", "弑", "乂", "㈠", "恏", "庅", "罘", "旳", "迩", "臫", "觜", "→\uFE0E", "↘\uFE0E", "囡", "亾", "呮", "兲", "ㄋ", "伱", "倣", "庇", "迡", "臥", "，", "耦", "狔", "棏", "口", "。", "！", "潑", "犇", "骉","淼", "焱", "垚", "莮", "婹", "豞", "屍", "沵", "厷", "匚", "侞", "㤙", "峎", "杺", "〇", "卝", "口", "の", "尐", "①", "徊", "哽", "汏", "懂？", "趉", "孒", "蛧", "伖", "煩", "掱", "衮", "彳亍","唵嘛呢","叭咪吽"  

            ];
`,
    textB: `[用户指南]

<div class='textB-desc'>
<img src='./ripple/002.png' width='55px'>
开始/停止录制(下载)


进入家庭作业机器


后置/前置
</div>
`,
    textC: `[README]
   好吧。这实际上是个千锤百炼下失败的手机端产品。无奈手机浏览器不支持getDisplayMedia的录屏功能，所以「█」按钮的录屏功能只能在电脑上实现。

   我也懒得去想怎么办了，唵嘛呢叭咪吽，9这样8，886。

   [佷想換個冼扆僟哋説=..=]

`,
    link: "NOISE-TO-WORD",
    href: "./noise-to-word/noise-to-word.html"
},
{id: 7,
    imageAa: "",
    imageAb: "",
    imageB: "./chord-ritual/1.png",
    imageCa: "",
    imageCb: "",
    iframeCa:"",
    videoAa: `./chord-ritual/1.mp4`,
    videoAb: "",
    videoCa: "./chord-ritual/1.mp4",
    title: "和弦仪式",
    textA: ` const scalePatterns = {

            "Major": [0, 2, 4, 5, 7, 9, 11, 12],
            "Minor": [0, 2, 3, 5, 7, 8, 10, 12],
            "Dorian": [0, 2, 3, 5, 7, 9, 10, 12],
            "Phrygian": [0, 1, 3, 5, 7, 8, 10, 12],
            "Lydian": [0, 2, 4, 6, 7, 9, 11, 12],
            "Mixolydian": [0, 2, 4, 5, 7, 9, 10, 12],
            "Locrian": [0, 1, 3, 5, 6, 8, 10, 12], 
            "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11, 12], 
            "Phrygian Dominant": [0, 1, 4, 5, 7, 8, 10, 12]
        
        };
`,
    textB: `[用户指南]

<div class='textB-desc'>
<img src='./chord-ritual/001.png' width='55px'>
隐藏提示


进入家庭作业机器


联系
</div>
`,
    textC: `[README]
    在古希腊和古罗马时期，“行星”（Planetai，意为“游移者”）是指在夜空中相对于恒星背景会移动的光点。在这一定义下，七大行星包括：

    太阳（Sun）
    月亮（Moon）   
    水星（Mercury）  
    金星（Venus）   
    火星（Mars）   
    木星（Jupiter） 
    土星（Saturn） 
    
    这些天体都在天空中移动，而地球并不显现在天际中，因此不被列入这一体系。由于地球是观察者所在的基点，在当时它本身并不被视为行星，而是“万物的舞台”。在这个体系中，地球（“我”）是观察的起点。

    基于这一观察视角，“我”将七级和弦同七大行星进行类比。在不同的调式中，这些和弦的作用各有不同。

`,
    link: "Chord Ritual",
    href: "./chord-ritual/chord-ritual.html"
},
{id: 8,
    imageAa: "",
    imageAb: "",
    imageB: "./square-vs-rectangle/1.png",
    imageCa: "",
    imageCb: "",
    iframeCa:"",
    videoAa: `./square-vs-rectangle/1.mp4`,
    videoAb: "",
    videoCa: "./square-vs-rectangle/1.mp4",
    title: "正方形大战长方形",
    textA: `{
        "manifest_version": 3,
        "name": "Square vs Rectangle",
        "version": "1.0",
        "description": "’Square vs Rectangle‘ is a strikeback against Instagram’s new layout",
        "permissions": [
          "activeTab"
        ],
        
        "host_permissions": [
          "*://*.instagram.com/*"
        ],
        "background": {
          "service_worker": "background.js"
        },
        "action": {
          "default_popup": "popup.html",
          "default_icon": {
            "16": "./square.png",
            "32": "./square.png",
            "48": "./square.png",
            "128": "./square.png"
          }
        }
        "content_scripts": [
          {
            "matches": ["*://*.instagram.com/*"],
            "css": ["style.css"],
            "js": ["content.js"]
          }
        ]
      }
`,
    textB: `[用户指南]

<div class='textB-desc'>
<img src='./square-vs-rectangle/2.png' width='255px'>

</div>
`,
    textC: `[README]
    好像从我开始尝试做图起，用的都是方形排版。搞来搞去还是看不惯IG的4:5排版，就干脆做了个Chrome插件自用了。

    在谷歌扩展程序商城添加插件后，固定插件在Chrome浏览器上。点击正方形排版刷新切换成正方形，点击长方形切换成长方形。轻松应对视觉强迫症。...
   
    口口口, NO MATTER WHAT, I WILL ALWAY LOVE U T..T
`,
    link: "square-vs-rectangle",
    href: "https://chromewebstore.google.com/detail/square-vs-rectangle/dndkmkklfkpaidkkajognhnpadpjmkpb?utm_source=item-share-cb"
},
{id: 9 ,
    imageAa: "",
    imageAb: "./question-box/1.jpg",
    imageB: "./question-box/3.png",
    imageCa: "",
    imageCb: "./question-box/1.jpg",
    iframeCa:"",
    videoAa: `./question-box/1.mp4`,
    videoAb: "",
    videoCa: "./question-box/1.mp4",
    title: "问题盒子",
    textA: `最近给我的小微商换了个快递包装

在座的网友可能以为我死了

但其实在主业之余

我每天还是有坚持给我的小副业发货的

微商之道

不显于言

而藏于行

要从无中找有

有中辩无

我中找你

你中找我

虚实结合

阴阳相生

方其识人真面目

与其结友之

以精神化物质

以物质养精神

循环往复

以成方圆

不争一时高下

只赢一生沉浮
`,
    textB: `[用户指南]

    <div class='textB-desc'>
<img src='./run-out-of-time/001.png' width='55px'>
    打开/关闭盒子
    
    
    进入家庭作业机器
    
    
    联系
    </div>
`,
    textC: `[README]
    有些时候会觉得自己是个问题体质，因为过分敏感加上接触了过多没有必要的人，内心的阴魂开始聚合起来，化成了鬼，藏在身体里面。遇到恶意中伤的时候，就会释放出来。

这个可怜的小阴魂藏在这个让人好奇又充满问题的盒子里，大多数情况下不知道该怎么消化自己的欲望和变得快乐。明明是只幽灵，还动不动会被别人吓得魂飞魄散。

这里希望它有天可以被活人超度，做个真正快乐的正常人。
   
`,
    link: "'?'BOX",
    href: "./question-box/question-box.html"
},

{id: 10 ,
    imageAa: "./gui-face/1.gif",
    imageAb: "",
    iframeAa:"//player.bilibili.com/player.html?isOutside=true&aid=114521763025724&bvid=BV1h8JcznEgt&cid=30002973103&p=1",
    imageB: "./gui-face/1.png",
    imageCa: "",
    imageCb: "",
    iframeCa:"",
    videoAa: ``,
    videoAb: "",
    videoCa: "./gui-face/1.mp4",
    title: "鬼魂的表情",
    textA: `
&lt;img id="gif1" src="sweating.gif" /&gt;
&lt;img id="gif2" src="shy.gif" /&gt;
&lt;img id="gif3" src="thanks.gif" /&gt;
&lt;img id="gif4" src="cry.gif" /&gt;
&lt;img id="gif5" src="terrified.gif" /&gt;
&lt;img id="gif6" src="sleepy.gif" /&gt;
&lt;img id="gif7" src="nope.gif" /&gt;
&lt;img id="gif8" src="angry.gif" /&gt;
&lt;img id="gif9" src="sigh.gif" /&gt;
&lt;img id="gif10" src="observe.gif" /&gt;
&lt;img id="gif11" src="dizzy.gif" /&gt;
&lt;img id="gif12" src="wow.gif" /&gt;
&lt;img id="gif13" src="awkward.gif" /&gt;
&lt;img id="gif14" src="speechless.gif" /&gt;
&lt;img id="gif15" src="ok.gif" /&gt;
&lt;img id="gif16" src="bye.gif" /&gt;
`,
    textB: `[用户指南]

    <div class='textB-desc'>
<img src='./endless-tears/002.png' width='55px'>
    黑夜/白天
    
    
    进入家庭作业机器
    
    
    下载表情包
    </div>
`,
    textC: `[README]
 除了情绪丰富外，目前确实没什么人性的光辉
 微信表情包请复制下载链接：https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/emoticonview?oper=single&t=shop/detail&productid=aL2PCfwK/89qO7sF6/+I+UDhfwEjhec2ZNvdnLLJRd/PHmWrRrfQjDtbbyihdbDOKU4m4DM/eprUmk85iePmwRyuEHsPxlj+r7Cs9bcbsdKY=

`,
    link: "Ghost in the Shell (2025)",
    href: "./gui-face/ghost-in-the-shell.html"
}



];