// receiving client's url and do math
chrome.runtime.onMessage.addListener(function(req, sender, sendRes) {
  if (req.type === 'url') {
    localStorage.setItem("currentDomain1020", req.msg.domain);
    localStorage.setItem("currentQueries1020", req.msg.queries);
    sendRes({
      msg: req.msg
    });
  }
});

// 扩展向内容脚本发送消息
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(
    tab.id,
    {
      greeting: "hello to content script!"
    },
    function(res) {
      console.log(res.msg);
    }
  );
});
