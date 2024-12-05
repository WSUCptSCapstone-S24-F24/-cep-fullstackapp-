import React from 'react';
import ReactDOM from 'react-dom'
import Home from "./pages/home";


function App(){
  return (
      <Home />
  );
}

ReactDOM.render(
  <App />, document.getElementById('app')
);