import {config} from 'http://localhost:3001/static/config.js';
const socket = io("http://localhost:3001/");
let canvatemp = document.getElementById("chartTemp").getContext("2d");
let canvaHum = document.getElementById("chartHum").getContext("2d");
let chartTemp, chartHum, chartAcciones;
socket.on("vectorTemp", async (dataArray) => {
  console.log(dataArray);
  await createCharts(dataArray);
});

const createCharts = (dataArray) => {
    if (chartTemp && chartHum) {
      chartTemp.destroy();
      chartHum.destroy();
    }
    chartTemp = new Chart(canvatemp, config.temperatura(dataArray));
    chartHum = new Chart(canvaHum, config.humedad(dataArray));
  };




