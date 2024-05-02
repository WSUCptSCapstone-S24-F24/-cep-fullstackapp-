import React from 'react';
import ReactDOM from 'react-dom'
import Calibration from "./pages/calibration";

//for pages
//import Paths from './routes';

function App(){
  return (
      <Calibration />
  );
}

ReactDOM.render(
  <App />, document.getElementById('app')
);