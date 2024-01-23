const video = document.getElementById('webcam');

// calculate the average color from an image data array
function getAverageColor(imageData) {
    let totalRed = 0;
    let totalGreen = 0;
    let totalBlue = 0;

    // four values for each pixel in the data[] array: R, G, B, A
    // length is the number of these values (sum of pixels multiplied by four)
    // so this loop sums up all the RGB values
    for (let i = 0; i < imageData.data.length; i += 4) {
    totalRed += imageData.data[i];
    totalGreen += imageData.data[i + 1];
    totalBlue += imageData.data[i + 2];
    }

    // get the average RGB values
    const pixelCount = imageData.data.length / 4;
    const avgRed = totalRed / pixelCount;
    const avgGreen = totalGreen / pixelCount;
    const avgBlue = totalBlue / pixelCount;

    return {
        r: (avgRed),
        g: (avgGreen),
        b: (avgBlue),
  };
}

// update the background color
function updateAverageColor() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // match canvas and video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // get image data from the webcam frame and calculate the average color
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const averageColor = getAverageColor(imageData);

    //update the background color
    document.body.style.backgroundColor = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
}

// update loop
// until I considered framerate I got 35% gpu usage with a 3080. now it peaks around 10%.
video.addEventListener('loadedmetadata', () => {
    let lastTimestamp = 0;
    const frameInterval = 1000 / 30; // 30fps for my camera

    function update(timestamp) {
        if (!lastTimestamp || timestamp - lastTimestamp >= frameInterval) {
        updateAverageColor();
        lastTimestamp = timestamp;
        }

        requestAnimationFrame(update);
    }

    update();
  });

// set the webcam as the video source
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    console.error('Error accessing webcam:', error);
  });
