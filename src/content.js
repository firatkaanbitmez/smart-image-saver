chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { imageUrl, format } = message;
  
    fetch(imageUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const img = document.createElement('img');
        const url = URL.createObjectURL(blob);
        img.src = url;
  
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
  
          canvas.toBlob(blob => {
            const newFileName = imageUrl.split('/').pop().split('.')[0] + `.${format}`;
            const reader = new FileReader();
  
            reader.onloadend = () => {
              const base64data = reader.result;
  
              chrome.runtime.sendMessage({
                action: 'downloadImage',
                base64data: base64data,
                fileName: newFileName
              }, () => {
                sendResponse({status: 'success'});
              });
            };
  
            reader.readAsDataURL(blob);
            URL.revokeObjectURL(url);
          }, `image/${format}`);
        };
  
        img.onerror = () => {
          sendResponse({status: 'error', message: 'Image failed to load.'});
        };
      })
      .catch(error => {
        sendResponse({status: 'error', message: error.message});
      });
  
    return true;
  });
  