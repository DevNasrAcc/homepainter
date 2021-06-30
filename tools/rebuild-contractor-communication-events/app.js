(function () {
    'use strict';

    const path = require('path');
    require('../mongooseConnector')(start);
    const communicationEventDataModel = require('../../server-src/src/dbsmodel/communicationEvent/communicationEvent').EmailCommunicationEventDiscriminator;
    const userModel = require('../../server-src/src/dbsmodel/user/user').ContractorDiscriminator;

    const dotEnv = require('../../server-src/node_modules/dotenv')
        .config({
            path: path.join(__dirname, '..', '..', 'server-src', '.env')
        });

    if(dotEnv.error)
        throw dotEnv.error;

    async function start() {
        let users = await userModel.find({}).exec();

        for(let i = 0; i < users.length; i++){
            users[i] = users[i].toObject();
            users[i].email.events = [];
            let events = await communicationEventDataModel.find({to: users[i]._id }).exec();
            for(let j = 0; j < events.length; j++){
                events[j] = events[j].toObject();
                users[i].email.events[j] = events[j];
            }
        }

        for(let k = 0; k < users.length; k++){
            console.log(users[k]);
            console.log(users[k].email.events);
        }

        process.exit(0);
    }
})();
