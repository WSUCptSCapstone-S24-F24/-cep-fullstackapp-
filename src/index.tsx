import React, { useRef} from 'react';
import ReactDOM from 'react-dom';
import Webcam from 'react-webcam';

const App = () => {

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user'
  }
  const webcamRef = useRef<Webcam>(null);

  return (
  <div>
    <h1>Webcam App!</h1>
    <Webcam 
      audio={false}
      width={1280}
      height={720}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      videoConstraints={videoConstraints}
      />
  </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));