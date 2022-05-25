const cors = require('cors');
const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');


server.listen(3001, ()=>{
    console.log('Listing on 3001');
});

const io = new Server(server,{
    cors: {
        origin: "http://127.0.0.1:5500",
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let count = 0;

//CONEXION MQTT
const mqtt = require('mqtt');
const clientMqtt = mqtt.connect('mqtt://test.mosquitto.org');
clientMqtt.on('connect', connect);

//CONEXION MONGO DB
const mongoose = require('mongoose');
const {schema} = require('./schema');
const express = require('express');
const user = "domotic-user",
      pass = "Domotic2022",
      database = "domoticDatabase";
const mongodb_URI = `mongodb+srv://${user}:${pass}@clusterdomotic.329yh.mongodb.net/${database}?retryWrites=true&w=majority`;

mongoose.connect(mongodb_URI,{
    useUnifiedTopology: true,
    useNewUrlParser: true
})
  .then(db => console.log(`Conectado a la base de datos ${db.connections[0].name}`))
  .catch(console.log);

const modelData =  mongoose.model('monitoreos', schema);


//RUTAS SERVIDOR
app.use(cors());
app.use("/static", express.static('./app/static/'));
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/app/app.html');
})


//CONEXION SOCKET.IO
io.on('connection', (socket) => {
    console.log('User connected');
    getClima().then((data)=>{
        socket.emit('vectorTemp', data);
    });
    clientMqtt.on('message', (topic, message)=>{
        const {tiempo, clima, notificacion} = JSON.parse(message);
        postTrama(tiempo.fecha,tiempo.hora,clima.temperatura, clima.humedad, notificacion.accion, notificacion.advertencia);
        
        if( count == 9){
            count = 0;
            getClima().then((data)=>{
                socket.emit('vectorTemp', data);
                console.log('DATOS ENVIADOS...');
            })
            return;
        }
        count++;
    });
    socket.on('disconnect',()=>console.log('User disconnected'));
})
//FUNCIONES MQTT
function connect() { 
    clientMqtt.subscribe('esp32-RALMT/data', (err)=>{
        if(!err){
            console.log('Conectado a MQTT');
        }
    });
}


//FUNCIONES MONGOOSE
const postTrama = async (fecha, hora,temperatura, humedad,accion, advertencia) => {
    const datos= new modelData({
        tiempo: {
            fecha,
            hora
        },
        clima: {
            temperatura,
            humedad,
        },
        notificacion: {
            accion,
            advertencia
        }
    });

    await datos.save();
    console.log(count + ' - REGISTRO AGREGADO CORRECTAMENTE');
}

const getClima = async()=>{
    try {
        let newArray = new Array();
        const list = await modelData.find();
        let n = list.length;
        if( n > 10){
            for( let  i= n - 1; i>= n-10; i--){
                const dataJson = {
                    tiempo: list[i].tiempo,
                    clima: list[i].clima
                };
                await newArray.push(dataJson);
            }
            return newArray.reverse();
        }
    } catch (error) {
        throw error;
    }
};



