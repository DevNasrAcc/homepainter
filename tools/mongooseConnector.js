(function () {
    'use strict';

    const mongoose = require('../server-src/node_modules/mongoose');
    const path = require('path');
    const dotEnv = require('../server-src/node_modules/dotenv')
        .config({
            path: path.join(__dirname, '..', 'server-src', '.env')
        });

    if(dotEnv.error)
        throw dotEnv.error;

    // check for production
    let silent = false;
    for (let j = 0; j < process.argv.length; j++) {
        if(process.argv[j] === '--silent')
            silent = true;
    }

    if(process.env.MONGO_CONNECTION === undefined)
        throw Error('Connection not defined.');
    if(process.env.MONGO_DATABASE === undefined)
        throw Error('Database not defined.');

    module.exports = function (cb) {
        mongoose.connect(process.env.MONGO_CONNECTION, {
            dbName: process.env.MONGO_DATABASE,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useNewUrlParser: true,
            useFindAndModify: false
        });

        mongoose.connection.on('connected', function(){
            if(!silent)
                console.log("Mongoose has connected successfully to MongoDB instance");

            if(cb)
                cb();
        });

        mongoose.connection.on('error', function(err){
            if(!silent)
                console.log("Mongoose connection has encountered " + err + " error");
        });

        mongoose.connection.on('disconnected', function(){
            if(!silent)
                console.log("Mongoose has disconnected successfully from MongoDB instance");
        });

        process.on('SIGINT', function(){
            mongoose.connection.close(function(){
                if(!silent)
                    console.log("Mongoose has disconnected from MongoDB due to application termination");

                process.exit(0);
            });
        });
    };

})();
