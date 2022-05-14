const cors = require('cors');
const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

let count = 0;

//CONEXION MQTT
const mqtt = require('mqtt');
const clientMqtt = mqtt.connect('mqtt://test.mosquitto.org');
clientMqtt.on('connect', connect);

//CONEXION MONGO DB
const mongoose = require('mongoose');
const {schema} = require('./schema');
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
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/html/index.html');
})


//CONEXION SOCKET.IO
io.on('connection', (socket) => {
    console.log('User connected');
    getClima().then((data)=>{
        socket.emit('vectorTemp', data);
    });
    clientMqtt.on('message', (topic, message)=>{
       // console.log(`${topic} - ${parseInt(message,10)}`);
        const {tiempo, clima, notificacion} = JSON.parse(message);
        if( count == 9){
            count = 0;
            getClima().then((data)=>{
                socket.emit('vectorTemp', data);
            });
            return;
        }
        count++;
        postTrama(tiempo.fecha,tiempo.hora,clima.temperatura, clima.humedad, notificacion.accion, notificacion.advertencia);
    });
    socket.on('disconnect',()=>console.log('User disconnected'));
    socket.emit('count', count);
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
    console.log('REGISTRO AGREGADO CORRECTAMENTE');
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


server.listen(3000, ()=>{
    console.log('Listing on 3000');
});

//postTrama("09/05/2022", "18:00", 20,50,"LED ON", "Hay movimiento");
//getTramas().then(console.log);
