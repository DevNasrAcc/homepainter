(async function () {
    'use strict';

    // setup env vars right away
    const config = require('./config/config');
    config.envVariables();

    // packages
    const express = require('express');
    const path = require('path');
    const helmet = require('helmet'); // Helmet helps you secure your Express apps by setting various HTTP headers.
    const rateLimit = require('express-rate-limit'); // Use to limit repeated requests to public APIs and/or endpoints
    const morgan = require('morgan'); // HTTP request Logger
    const expressFingerprint = require('express-fingerprint');

    // app
    const constants = require('./config/constants');
    const mongoose = require('./config/mongoose');
    const stripe = require('./config/stripe');
    const authRoutes = require('./routes/auth');
    const apiRoutes = require('./routes/api');
    const fileUploadRoutes = require('./routes/fileUpload');
    const mailgunRoutes = require('./routes/mailgun');
    const stripeRoutes = require('./routes/stripe');
    const twilioRoutes = require('./routes/twilio');
    const shortLinksRoutes = require('./routes/shortLinks');
    const staticRoutes = require('./routes/static');
    const scheduleService = require('./service/scheduleService');
    const slackService = require('./service/slackService');

    // setup and configure application
    const app = express();
    config.angularUniversal(app);
    await mongoose.connect();
    stripe.start();
    scheduleService.Init();

    // set up the app.use functions
    app.use(morgan('common', config.logger()));
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(new rateLimit(constants.rateLimit));
    app.use(expressFingerprint());
    app.set('trust proxy', true);
    app.disable('x-powered-by');

    // Routes without sessions
    app.get('*.*', express.static(path.join(__dirname, 'public', 'browser'), { maxAge: '1y' }));
    app.use('/mailgun', mailgunRoutes);
    app.use('/stripe', stripeRoutes);
    app.use('/twilio', twilioRoutes);
    app.use('/s', shortLinksRoutes);

    // Routes with sessions
    // #see-also https://stackoverflow.com/questions/24027731/nodejs-express-static-routes-creating-multiple-sessions
    const expressSession = config.expressSessions(app, slackService);
    app.use('/auth', authRoutes);
    app.use('/api/files', fileUploadRoutes);
    app.use('/api', apiRoutes);
    app.use('*', staticRoutes);

    // error handler must come as last app.use with exactly 4 arguments
    // #see-also http://expressjs.com/en/guide/error-handling.html
    app.use(async function (err, req, res, next) {
        await slackService.SendMessage(err);

        if (err.code === 'EUNAUTHORIZED') {
            return res.status(constants._4xx._401.status).send(constants._4xx._401.reason);
        } else if (err.code === 'EBADCSRFTOKEN' || err.code === 'EFORBIDDEN') {
            return res.status(constants._4xx._403.status).send(constants._4xx._403.reason);
        } else {
            return next(err);
        }
    });

    // Start server listening
    const server = app.listen(process.env.PORT, () => console.info('listening on port %s...', process.env.PORT));

    // socket io requires a server to be set up so it can listen uniquely on it.
    // gets shut down with exit handler (server.close())
    require('./routes/socketio')(server, expressSession);

    // set up the shutdown handlers
    const exitHandler = async function (code) {
        const services = [server, stripe, mongoose];
        for (let i = 0; i < services.length; ++i) {
            const resp = await services[i].close();
            if (resp instanceof Error) await slackService.SendMessage(resp);
        }
        await slackService.SendMessage(`${process.env.NODE_ENV} has shut down with exit code: ${code}`);
        process.exit(0);
    };
    process.on('warning', slackService.SendMessage);
    process.on('unhandledRejection', slackService.SendMessage);
    process.on('SIGINT', exitHandler);
    process.on('SIGTERM', exitHandler);
})();
