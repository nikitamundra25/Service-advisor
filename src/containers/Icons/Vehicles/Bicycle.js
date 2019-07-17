import React from "react";

const Bicycle = props => (
  <>
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width= {props.size||"280.307px"}
      height="171.306px"
      viewBox="0 0 280.307 171.306"
      enable-background="new 0 0 280.307 171.306"
      space="preserve"
    >
      <path
        fill={props.color}
        d="M84.673,62.945c-3.097,5.754-6.477,5.709-12.192,3.703c-24.215-8.503-51.512,0.775-64.023,21.875
    C-2.87,107.629-2.928,127.448,8.94,146.201c10.978,17.346,27.808,25.982,48.229,24.546c23.974-1.685,40.892-14.999,47.874-37.75
    c3.041-9.907,7.79-11.012,15.674-10.07c10.503,1.253,18.011-1.871,25.013-10.817c15.6-19.922,32.762-38.623,49.377-57.924
    c6.694,9.141,6.836,14.818-3.204,22.324c-19.048,14.242-24.044,38.844-15.221,60.387c8.644,21.11,30.744,35.792,51.633,34.305
    c25.015-1.782,43.639-16.875,50.059-40.568c9.498-35.06-17.124-67.723-55.328-66.622c-9.129,0.264-12.319-2.882-14.859-10.551
    c-4.147-12.509-9.254-24.699-13.9-37.046c-6.354-16.875-6.333-16.903-24.735-16.198c-3.947,0.151-9.24-0.723-9.312,5.093
    c-0.08,6.398,5.438,5.816,9.788,5.669c5.973-0.203,11.36-0.407,13.072,7.458c1.281,5.885,4.33,11.383,5.649,17.267
    c0.594,2.652-2.894,2.014-4.669,2.018c-23.379,0.067-46.759-0.006-70.138,0.082c-4.118,0.014-6.722-1.724-6.843-5.705
    c-0.133-4.473,3.784-2.66,6.068-3.025c3.585-0.574,7.125-1.527,7.077-5.752c-0.056-4.819-3.905-5.826-7.927-5.848
    c-9.146-0.05-18.297-0.067-27.444,0.016c-3.846,0.036-8.068,0.453-8.221,5.435c-0.173,5.693,4.401,5.923,8.61,6.11
    c4.213,0.185,8.587-1.013,10.641,5.009c1.857,5.442,3.019,9.908-1.307,14.808C90.809,53.139,87.381,57.912,84.673,62.945z
     M219.866,115.366c1.458,3.674,2.497,8.674,8.092,6.853c6.072-1.979,4.272-6.509,2.546-10.843
    c-3.633-9.121-6.549-18.572-10.797-27.387c-3.973-8.245,0.532-9.218,6.642-9.425c31.203-1.055,52.915,34.049,38.357,61.936
    c-8.584,16.444-26.819,25.712-44.941,22.84c-17.106-2.711-32.501-17.938-35.362-34.975c-2.998-17.86,5.013-34.354,21.835-43.911
    C210.798,92.164,215.277,103.788,219.866,115.366z M94.889,130.755c-6.296,18.864-27.385,31.774-47.347,28.575
    c-20.227-3.244-35.856-21.484-35.866-41.855c-0.01-28.896,27.911-49.544,55.29-41.047c5.543,1.72,6.747,3.697,2.868,8.668
    c-6.026,7.725-11.396,15.958-17.132,23.911c-2.25,3.123-4.342,6.38-2.751,10.261c1.798,4.38,6.041,3.595,9.679,3.619
    c9.81,0.063,19.646,0.451,29.425-0.119C96.123,122.355,96.933,124.636,94.889,130.755z M91.055,112.074
    c-8.106,0.05-16.212,0.02-26.429,0.02c5.554-8.356,10.17-15.302,14.79-22.247c0.373-0.562,0.769-1.112,1.182-1.646
    c1.773-2.292,3.426-1.323,5.037,0.212c6.147,5.855,9.254,13.304,10.283,21.484C96.222,112.314,92.996,112.063,91.055,112.074z
     M122.161,48.694c20.51-0.242,41.027-0.127,63.074-0.127c-16.593,19.327-32.333,37.66-49.307,57.433
    c-7.151-18.194-13.908-34.927-20.264-51.808C113.2,47.655,119.149,48.729,122.161,48.694z M103.96,55.523
    c7.583,19.08,14.764,37.144,22.467,56.527c-4.748,0-8.315-0.226-11.84,0.056c-4.815,0.383-7.262-0.898-7.953-6.356
    c-1.128-8.907-5.196-17.12-11.32-23.426c-4.928-5.075-4.847-8.652-0.769-13.616C97.729,64.833,100.411,60.542,103.96,55.523z"
      />
    </svg>
  </>
);

export default Bicycle;
