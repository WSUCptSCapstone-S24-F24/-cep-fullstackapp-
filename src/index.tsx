import { FaceMesh } from '@mediapipe/face_mesh'
import * as Facemesh from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import Webcam from 'react-webcam'
import {useRef, useEffect} from 'react'
import React from 'react'
import ReactDOM from 'react-dom'

declare global {
  interface Window {
    drawConnectors:any;
  }
}

function App() {
  
    const webcamRef = useRef<any>(null);
    const canvasRef = useRef<any>(null);
    const connect = window.drawConnectors;
    var camera = null;

    function onResults(results:any) {
        // const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set canvas width
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");

        //resets face mesh so it can be updated for next image
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image,0,0,canvasElement.width,canvasElement.height);

        //create landmarks for each point of interest
        if (results.multiFaceLandmarks) {
          for (const landmarks of results.multiFaceLandmarks) {
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
              color: "#eae8fd",
              lineWidth: 1,
            });
            /*connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
              color: "#F50B0B",
            });*/
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
              color: "#F50B0B",
            });
            /*connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
              color: "#18FF00",
            });*/
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
              color: "#18FF00",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_IRIS, {
              color: "#18FF00",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_IRIS, {
              color: "#F50B0B",
            });
          }
        }
        canvasCtx.restore();
      }

      //instantiate FaceMesh
      useEffect(() => {
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        //apply options for facemesh (ps: refinelandmarks is what enables the option to use iris tracking)
        faceMesh.setOptions({
          maxNumFaces: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          refineLandmarks: true,
        });

        //update facemesh
        faceMesh.onResults(onResults);

        //apply facemesh to webcam
        if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
          camera = new cam.Camera(webcamRef.current.video, {
            onFrame: async () => {
              await faceMesh.send({ image: webcamRef.current.video });
            },
            width: 640,
            height: 480,
          });
          camera.start();
        }
      }, []);

  return (
    <div>
      <Webcam 
        ref={webcamRef}
          style={{
            position:"absolute",
            marginRight:'auto',
            marginLeft:'auto',
            left:0,
            right:0,
            textAlign:'center',
            zIndex:9,
            width:640,
            height:480
      }}/>
      
      <canvas
        ref={canvasRef}
          style={{
            position:"absolute",
            marginRight:'auto',
            marginLeft:'auto',
            left:0,
            right:0,
            textAlign:'center',
            zIndex:9,
            width:640,
            height:480
      }}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));