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

    const leftEyeRef = useRef<any>(null);
    const rightEyeRef = useRef<any>(null);
    const headRef = useRef<any>(null);

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
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {

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

          const landmarks = results.multiFaceLandmarks[0];
          //get both indexes on the landmarking grid
          const leftIrisIndex = 473;
          const rightIrisIndex = 468;
          const noseIndex = 4;

          //grabs the x,y coordinates from landmark library so it will follow and track irises on the facemesh
          const leftIrisLandmark = landmarks[leftIrisIndex];
          const rightIrisLandmark = landmarks[rightIrisIndex];
          const noseLandmark = landmarks[noseIndex];

          //if you wish to view each iris coordinates
          if (leftIrisLandmark){
            //console.log(`LEFT IRIS: x=${leftIrisLandmark.x}, y=${leftIrisLandmark.y}`);
          }
          if (rightIrisIndex){
            //console.log(`RIGHT IRIS: x=${rightIrisLandmark.x}, y=${rightIrisLandmark.y}`);
          }

          //draw canvases for each iris
          drawZoomedEye(leftEyeRef.current, webcamRef.current.video, leftIrisLandmark.x, leftIrisLandmark.y, 3);
          drawZoomedEye(rightEyeRef.current, webcamRef.current.video, rightIrisLandmark.x, rightIrisLandmark.y, 3);
          drawZoomedEye(headRef.current, webcamRef.current.video, noseLandmark.x, noseLandmark.y, 0.75);

        }
        canvasCtx.restore();
      }


      function drawZoomedEye(canvas:HTMLCanvasElement, video: HTMLVideoElement, pointX:number, pointY:number, zoom:number){
        if (!canvas || !video || !pointX || !pointY) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        
        //enlarges are image to video size
        pointX = pointX * video.videoWidth;
        pointY = pointY * video.videoHeight;

        //console.log(`pointX : ${pointX}, pointY : ${pointY}`);

        //zooms in our camera to focus on the specific point
        const newWidth = canvas.width / zoom;
        const newHeight = canvas.height / zoom;

        const newX = pointX - newWidth / 2;
        const newY = pointY - newHeight / 2;

        //reset our canvas (so images are cleared after each frame)
        ctx.clearRect(0,0, canvas.width, canvas.height);

        //draw image
        ctx.drawImage(
          video,
          newX, newY,
          newWidth, newHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
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

      <h2 style={{ position: "absolute", top: "420px", left: "150px"}}>Left Eye</h2>
      <canvas 
      ref={leftEyeRef} 
        style={{ 
          position: "absolute", 
          top: "480px", 
          left: "50px", 
          zIndex: 10, 
          width: 320, 
          height: 240 
          }} 
      />

        <h2 style={{ position: "absolute", top: "420px", right: "160px"}}>Right Eye</h2>
        <canvas
         ref={rightEyeRef} 
          style={{ 
            position: "absolute", 
            top: "480px", 
            right: "50px", 
            zIndex: 10, 
            width: 320, 
            height: 240 
            }}
        />

        <h2 style={{ position: "absolute", top: "540px", right: "920px"}}>Head</h2>
        <canvas
         ref={headRef} 
          style={{ 
            position: "absolute", 
            top: "600px",
            right: "790px",
            zIndex: 10, 
            width: 320, 
            height: 240 
            }}
        /> 
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));