export const config = {
    temperatura:(dataArray)=>{
        let xValues = new Array();
        let yValues = new Array();
        dataArray.forEach(({tiempo, clima}) => {
        xValues.push(tiempo.hora);
        yValues.push(clima.temperatura);
        });
        let data = {
            labels: xValues,
            datasets: [{
                label: 'Temperatura',
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues,
            }]
        };

        let configTemp = {
            type: 'line',
            data: data
        };
        return configTemp;
        },
    humedad:  (dataArray)=>{
        let xValues = new Array();
    let yValues = new Array();
    dataArray.forEach(({tiempo, clima}) => {
        xValues.push(tiempo.hora);
        yValues.push(clima.humedad);
    });
        let data = {
            labels: xValues,
            datasets: [{
                label: 'Humedad',
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues,
            }]
        };

        let configHum = {
            type: 'line',
            data: data,
        };
        return configHum;
    }
};