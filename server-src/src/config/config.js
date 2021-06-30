(function () {
    'use strict';

    const fs = require('fs');
    const rfs = require('rotating-file-stream');
    const path = require('path');
    const ms = require('ms');
    const expressSession = require('express-session');
    const MongoDBStore = require('connect-mongodb-session')(expressSession);
    const angularCore = require('@angular/core');
    const dotenv = require('dotenv');
    const nodeMailer = require('nodemailer');
    const hbs = require('nodemailer-express-handlebars');
    const htmlToText = require('nodemailer-html-to-text').htmlToText;
    const inlineCss = require('inline-css');
    const twilio = require('twilio');
    const AWS = require('aws-sdk');
    const sharp = require('sharp');
    const h = require('../helpers/helpers');
    const constants = require('./constants');
    const homepainterSessions = require('./sessions');

    module.exports = {
        envVariables: envVariables,
        angularUniversal: angularUniversal,
        expressSessions: expressSessions,
        logger: logger,
        nodemailerTransport: nodemailerTransport,
        twilioClient: twilioClient,
        getS3: getS3,
        imageToJpg: imageToJpg,
    };

    function envVariables() {
        const result = dotenv.config({
            path: path.join(__dirname, '..', '..', '.env'),
        });

        if (result.error || !process.env.NODE_ENV) {
            console.log('Error setting environment variables: %s', result.error);
            process.exit(-1);
        }

        // env vars { _var: 'variable name', development: 'required on development', quality_assurance: 'required on staging', production: 'required on production' }
        const nodeEnvVars = [
            { _var: 'NODE_ENV', development: true, quality_assurance: true, production: true },
            { _var: 'PORT', development: true, quality_assurance: true, production: true },
            { _var: 'LOG_DIRECTORY', development: false, quality_assurance: true, production: true },
            { _var: 'LOG_FILENAME', development: false, quality_assurance: true, production: true },
            { _var: 'MONGO_DATABASE', development: true, quality_assurance: true, production: true },
            { _var: 'MONGO_CONNECTION', development: true, quality_assurance: true, production: true },
            { _var: 'MONGO_KEEP_ALIVE', development: true, quality_assurance: true, production: true },
            { _var: 'EXPRESS_SESSION_COLLECTION', development: true, quality_assurance: true, production: true },
            { _var: 'EXPRESS_SESSION_NAME', development: true, quality_assurance: true, production: true },
            { _var: 'EXPRESS_SESSION_ROLES', development: true, quality_assurance: true, production: true },
            { _var: 'EXPRESS_SESSION_MAX_AGE', development: true, quality_assurance: true, production: true },
            { _var: 'EXPRESS_SESSION_ABSOLUTE_TIMEOUT', development: true, quality_assurance: true, production: true },
            { _var: 'EXPRESS_SESSION_SECRET', development: true, quality_assurance: true, production: true },
            { _var: 'JWT_ACCOUNT_SECURITY_SECRET', development: true, quality_assurance: true, production: true },
            { _var: 'JWT_EMAIL_UNSUBSCRIBE_SECRET', development: true, quality_assurance: true, production: true },
            { _var: 'SMTP_HOST', development: true, quality_assurance: true, production: true },
            { _var: 'SMTP_PORT', development: true, quality_assurance: true, production: true },
            { _var: 'SMTP_USERNAME', development: true, quality_assurance: true, production: true },
            { _var: 'SMTP_PASSWORD', development: true, quality_assurance: true, production: true },
            { _var: 'MAILGUN_WEBHOOK_SIGNING_API_KEY', development: false, quality_assurance: true, production: true },
            { _var: 'BASE_URL', development: false, quality_assurance: true, production: true },
            { _var: 'STRIPE_EXECUTABLE', development: true, quality_assurance: false, production: false },
            { _var: 'STRIPE_PUBLISHABLE_KEY', development: true, quality_assurance: true, production: true },
            { _var: 'STRIPE_SECRET_KEY', development: true, quality_assurance: true, production: true },
            { _var: 'STRIPE_CLIENT_ID', development: true, quality_assurance: true, production: true },
            { _var: 'STRIPE_WEBHOOK_SECRET', development: false, quality_assurance: true, production: true },
            { _var: 'STRIPE_WEBHOOK_CONNECT_SECRET', development: false, quality_assurance: false, production: false },
            { _var: 'SLACK_WEBHOOK_URL', development: false, quality_assurance: true, production: true },
            { _var: 'S3_REGION', development: true, quality_assurance: true, production: true },
            { _var: 'S3_BUCKET', development: true, quality_assurance: true, production: true },
            { _var: 'S3_ENDPOINT', development: true, quality_assurance: true, production: true },
            { _var: 'S3_ACCESS_KEY', development: true, quality_assurance: true, production: true },
            { _var: 'S3_SECRET_KEY', development: true, quality_assurance: true, production: true },
            { _var: 'TWILIO_ACCOUNT_SID', development: true, quality_assurance: true, production: true },
            { _var: 'TWILIO_AUTH_TOKEN', development: true, quality_assurance: true, production: true },
            { _var: 'TWILIO_PHONE_NUMBER', development: true, quality_assurance: true, production: true },
            { _var: 'DATABASE_BACKUP_PASSWORD', development: false, quality_assurance: false, production: true },
        ];
        let hasError = false;

        for (let i = 0; i < nodeEnvVars.length; i++) {
            if (
                process.env[nodeEnvVars[i]._var] === undefined ||
                (nodeEnvVars[i][process.env.NODE_ENV] && !process.env[nodeEnvVars[i]._var])
            ) {
                console.log('\x1b[31m%s\x1b[0m', `process.env.${nodeEnvVars[i]._var} is not set or is incorrect`);
                hasError = true;
            }
        }

        if (hasError) {
            process.exit(-1);
        }
    }

    function angularUniversal(app) {
        angularCore.enableProdMode();

        // * NOTE :: leave this as require() since this file is built Dynamically from webpack
        const { AppServerModule, ngExpressEngine } = require('../public/server/main');

        app.engine(
            'html',
            ngExpressEngine({
                bootstrap: AppServerModule,
            })
        );

        app.set('trust proxy', 'loopback');
        app.set('view engine', 'html');
        app.set('views', path.join(__dirname, '..', 'public', 'browser'));
    }

    function expressSessions(app, slackService) {
        const store = new MongoDBStore({
            uri: process.env.MONGO_CONNECTION,
            databaseName: process.env.MONGO_DATABASE,
            collection: process.env.EXPRESS_SESSION_COLLECTION,
        });
        store.on('error', slackService.SendMessage);

        // setup sessions
        const newSession = expressSession({
            name: process.env.EXPRESS_SESSION_NAME,
            secret: process.env.EXPRESS_SESSION_SECRET.split(','),
            cookie: {
                path: '/',
                httpOnly: true,
                maxAge: ms(process.env.EXPRESS_SESSION_MAX_AGE),
                secure: process.env.NODE_ENV !== constants.nodeEnv.dev,
                sameSite: 'lax',
            },
            store: store,
            resave: true,
            saveUninitialized: true,
        });

        app.use(newSession);
        app.use(homepainterSessions.AbsoluteTimeout);

        return newSession;
    }

    function logger() {
        if (!process.env.LOG_DIRECTORY || !process.env.LOG_FILENAME || !fs.existsSync(process.env.LOG_DIRECTORY))
            return {};

        const dir = process.env.LOG_DIRECTORY;
        const file = process.env.LOG_FILENAME;
        return { stream: rfs.createStream(file, { path: dir, interval: '3d', maxFiles: 5 }) };
    }

    function nodemailerTransport() {
        const transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        transporter.use(
            'compile',
            hbs({
                viewEngine: {
                    extname: '.hbs',
                    layoutsDir: path.join(__dirname, '../public/email-src/layouts'),
                    partialsDir: path.join(__dirname, '../public/email-src/partials'),
                    helpers: {
                        storageName2DisplayName: h.StorageName2DisplayName,
                        formatList: h.FormatList,
                        formatCurrency: h.FormatCurrency,
                        formatPercent: h.FormatPercent,
                        formatDate: h.FormatDate,
                        subtract: function (minuend, ...subtrahends) {
                            subtrahends.pop(); // remove metadata object
                            return subtrahends.reduce((l, r) => l - r, minuend);
                        },
                        if_eq: function (a, b, opts) {
                            if (a === b) {
                                return opts.fn(this);
                            } else {
                                return opts.inverse(this);
                            }
                        },
                        if_not_eq: function (a, b, opts) {
                            if (a === b) {
                                return opts.inverse(this);
                            } else {
                                return opts.fn(this);
                            }
                        },
                        eq: (a1, a2) => a1 === a2,
                        url: () => process.env.BASE_URL || 'http://localhost:' + (process.env.PORT || 80),
                    },
                },
                viewPath: path.join(__dirname, '../public/email-src'),
                extName: '.hbs',
            })
        );

        transporter.use(
            'compile',
            htmlToText({
                wordWrap: 120,
                singleNewLineParagraphs: true,
            })
        );

        const materializeCss = fs.readFileSync(
            path.join(__dirname, '../../node_modules/materialize-css/dist/css/materialize.min.css'),
            'utf-8'
        );

        transporter.use('compile', async (mail, cb) => {
            if (mail && mail.data && mail.data.html) {
                mail.data.html = await inlineCss(mail.data.html, {
                    url: 'https://thehomepainter.com',
                    extraCss: materializeCss,
                });
            }
            cb();
        });

        return transporter;
    }

    function twilioClient() {
        return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    function getS3() {
        return new AWS.S3({
            region: process.env.S3_REGION,
            endpoint: process.env.S3_ENDPOINT,
            apiVersion: 'latest',
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
        });
    }

    async function imageToJpg(imageBuffer) {
        return await sharp(imageBuffer)
            .resize({ width: 720 })
            .rotate()
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
    }
})();
