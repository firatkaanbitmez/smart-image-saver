chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "saveImageAs",
      title: "Save image as...",
      contexts: ["image"]
    });
  
    const formats = ["png", "jpeg", "webp"];
    formats.forEach(format => {
      chrome.contextMenus.create({
        id: format,
        title: format.toUpperCase(),
        parentId: "saveImageAs",
        contexts: ["image"]
      });
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const format = info.menuItemId;
  
    if (info.mediaType === "image") {
      const imageUrl = info.srcUrl;
  
      chrome.tabs.sendMessage(tab.id, { imageUrl: imageUrl, format: format });
    }
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'downloadImage') {
      const url = message.base64data;
  
      chrome.downloads.download({
        url: url,
        filename: message.fileName,
        conflictAction: 'uniquify'
      }, (downloadId) => {
        sendResponse({status: 'success', downloadId: downloadId});
      });
    }
  
    return true;
  });
  