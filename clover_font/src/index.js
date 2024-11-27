import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'mdb-ui-kit/css/mdb.min.css';
import { Input } from 'mdb-ui-kit';

const root = ReactDOM.createRoot(document.getElementById('root'));

document.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('.form-outline');
  inputs.forEach((input) => {
    if (input) {
      new Input(input);
    }
  });
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
