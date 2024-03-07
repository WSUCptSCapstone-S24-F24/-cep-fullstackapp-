import React from 'react';
import ReactDOM from 'react-dom'

import Paths from './routes';

function App(){
  return (
    <Paths />
  );
}

ReactDOM.render(
  <App />, document.getElementById('app')
);