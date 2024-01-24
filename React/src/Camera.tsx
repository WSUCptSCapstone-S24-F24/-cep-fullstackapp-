import React, { useRef, useEffect } from 'react';

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Error accessing the webcam", error);
        });
    }
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{width: '640px', height: '480px'}} autoPlay playsInline />
    </div>
  );
};

export default Camera;
