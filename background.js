// receiving client's url and do math
chrome.runtime.onMessage.addListener(function(req, sender, sendRes) {
  if (req.result) {
    localStorage.setItem("currentDomain", req.msg.domain);
    localStorage.setItem("currentQueries", req.msg.queries);
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
