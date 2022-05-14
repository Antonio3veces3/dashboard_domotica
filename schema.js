const {Schema} = require('mongoose')

const schema = new Schema(
    {
        tiempo: {type: Object, required: true},
        clima: {type: Object,  required: true},
        notificacion:  {type: Object, required: true}
    }, {versionKey: false}
);

module.exports.schema = schema;
