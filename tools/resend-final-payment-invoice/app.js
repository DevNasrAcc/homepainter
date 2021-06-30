(function () {
    "use strict";

    const dotEnv = require('../../server-src/node_modules/dotenv').config({path: `${__dirname}/../../server-src/.env`});
    if(dotEnv.error) throw dotEnv.error;

    const orderRepo = require('../../server-src/src/repo/orderRepo');
    const customerRepo = require('../../server-src/src/repo/customerRepo');
    const projectRepo = require('../../server-src/src/repo/projectRepo');
    const contractorRepo = require('../../server-src/src/repo/contractorRepo');
    const emailService = require('../../server-src/src/service/emailService');
    require('../mongooseConnector')(start);

    async function start() {
        let orderID;
        for (let i = 0; i < process.argv.length; ++i) {
            if (process.argv[i] === '--orderID')
                orderID = process.argv[++i];
        }
        if (!orderID) {
            console.error('orderID is required');
            process.exit(1);
        }

        const order = (await orderRepo.FindOneById(orderID)).toObject();
        const customer = (await customerRepo.FindOneById(order.owner)).toObject();
        const project = (await projectRepo.FindOneById(order.details.project)).toObject();
        const contractor = (await contractorRepo.FindOneById(order.contractor)).toObject();
        const promoCode = (customer.firstName + customer.lastName).toLowerCase();
        await emailService.CustomerFinalPaymentInvoice(customer, project, contractor, order, promoCode);

        console.log('done');
        process.exit(0);
    }

})();
