(function () {
    'use strict';

    const ms = require('ms');
    const Tokens = require('csrf');
    const tokens = new Tokens({});
    const mongoSanitize = require('express-mongo-sanitize');
    const constants = require('./constants');
    const h = require('../helpers/helpers');
    const slackService = require('../service/slackService');

    module.exports = {
        socketWrapper: socketWrapper,
        controllerWrapper: controllerWrapper,
    };

    function socketWrapper(socket, validationFunc, controllerFunc, duration) {
        return async (req) => {
            // absolute timeout
            const now = Date.now();
            const createdAt = socket.request.session.createdAt;
            if (now > createdAt + ms(process.env.EXPRESS_SESSION_ABSOLUTE_TIMEOUT)) {
                socket.emit(constants.ioEmitters.error, {
                    status: constants._4xx._401.status,
                    body: JSON.parse(constants._4xx._401.reason),
                });
                return;
            }

            // verify csrf
            if (!tokens.verify(socket.request.session.csrfSecret, req.headers['XSRF-TOKEN'])) {
                socket.emit(constants.ioEmitters.error, {
                    status: constants._4xx._403.status,
                    body: JSON.parse(constants._4xx._403.reason),
                });
                return;
            }

            // create a signature match between sockets and api calls
            req.session = socket.request.session;
            req.params = {};
            req.query = {};
            req.body = mongoSanitize.sanitize(req.body || {}); // sanitize body

            const cw = controllerWrapper(validationFunc, controllerFunc, duration);
            await cw(req, undefined);
        };
    }

    function controllerWrapper(validationFunc, controllerFunc, duration) {
        return async (req, res) => {
            const start = new Date().getTime();

            try {
                if (validationFunc) {
                    const failures = validationFunc(req);

                    if (failures.length > 0) {
                        await slackService.SendMessage(failures);
                        if (res) {
                            return res.status(constants._4xx._400.status).send(failures);
                        } else {
                            return global.io.to(req.session.userId).emit(constants.ioEmitters.error, {
                                status: constants._4xx._400.status,
                                body: JSON.parse(constants._4xx._400.reason),
                            });
                        }
                    }
                }

                const resp = await controllerFunc(req, res);
                const end = new Date().getTime();

                if (duration) {
                    if (end - start >= duration) {
                        const error = new Error(
                            `Function was expected to take [${duration}] ms but actually took [${end - start}] ms`
                        );
                        Error.captureStackTrace(error);
                        await slackService.SendMessage(error);
                    } else {
                        await h.PromiseRemainingTime(start, duration);
                    }
                }

                for (const sendTo of resp.ioSendTo || []) {
                    if (sendTo === 'all') {
                        global.io.emit(resp.ioEmitterName, {
                            status: resp.status,
                            body: resp.ioContent || resp.content,
                        });
                        continue; // io.emit sends to all
                    }
                    global.io
                        .to(sendTo)
                        .emit(resp.ioEmitterName, { status: resp.status, body: resp.ioContent || resp.content });
                }

                if (res) {
                    return res.status(resp.status).send(resp.content);
                }
            } catch (e) {
                if (duration) await h.PromiseRemainingTime(start, duration);
                await slackService.SendMessage(e);
                if (res) {
                    return res.status(constants._5xx._500.status).send(constants._5xx._500.reason);
                } else {
                    return global.io.to(req.session.userId).emit(constants.ioEmitters.error, {
                        status: constants._5xx._500.status,
                        body: JSON.parse(constants._5xx._500.reason),
                    });
                }
            }
        };
    }
})();
