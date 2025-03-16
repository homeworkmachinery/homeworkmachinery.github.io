// 使用 MutationObserver 监听 DOM 变化，处理新加载的图片
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                  // 如果新添加的节点本身就是一个目标容器且不带 _aato
                  if (node.matches && node.matches('div._aagu:not(._aato)')) {
                      applySquareToContainer(node);
                  } else {
                      // 如果新添加的节点中包含目标容器
                      const newContainers = node.querySelectorAll && node.querySelectorAll('div._aagu:not(._aato)');
                      if (newContainers && newContainers.length > 0) {
                          newContainers.forEach(applySquareToContainer);
                      }
                  }
              }
          });
      }
  });
});

if (localStorage.getItem("disablePlugin") === "true") {
  console.log("Plugin is temporarily disabled.");
  localStorage.removeItem("disablePlugin"); // 清除标记
} else {

  setSquareLayout();

  observer.observe(document.body, { childList: true, subtree: true });
}





setSquareLayout();


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "toggleSquare") {
        setSquareLayout();
        sendResponse({ status: "Square layout applied" });
    } else if (request.action === "toggleRectangle") {
        restoreDefaultLayout();
        sendResponse({ status: "Default layout restored" });
    }
});


function setSquareLayout() {
    const containers = document.querySelectorAll('div._aagu:not(._aato)');
    containers.forEach(container => {
        applySquareToContainer(container);
    });
   
}


function restoreDefaultLayout() {
  localStorage.setItem("disablePlugin", "true");
  // 断开 MutationObserver 监控
  observer.disconnect();
  window.location.reload();
}




function applySquareToContainer(container) {
    const width = container.offsetWidth;
    container.style.height = width + 'px';
    container.style.aspectRatio = '1 / 1';
    
    const img = container.querySelector('img.x5yr21d.xu96u03.x10l6tqk.x13vifvy.x87ps6o.xh8yej3');
    if (img) {
        img.style.width = width + 'px';
        img.style.height = width + 'px';
        img.style.objectFit = 'cover';
        img.style.aspectRatio = '1 / 1';
    }

}

