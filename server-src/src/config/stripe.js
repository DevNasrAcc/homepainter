(function () {
    'use strict';

    const constants = require('./constants');
    const slackService = require('../service/slackService');
    const spawn = require('child_process').spawn;
    const fs = require('fs');
    let childProcess;
    let expectingShutdown = false;

    module.exports = {
        start: start,
        close: close,
    };

    function start() {
        if (process.env.NODE_ENV === constants.nodeEnv.prod || process.env.NODE_ENV === constants.nodeEnv.qa) {
            return;
        }

        const portString = process.env.PORT === '80' ? '' : `:${process.env.PORT}`;
        const url = `http://localhost${portString}/stripe/webhook`;
        const stripeExecutableExists = fs.existsSync(process.env.STRIPE_EXECUTABLE);

        if (!stripeExecutableExists) {
            checkForWebhookSecrets();
            return;
        }

        childProcess = spawn(process.env.STRIPE_EXECUTABLE, ['listen', '--forward-to', url]);
        childProcess.stdout.on('data', stdOut);
        childProcess.stderr.on('data', stdErr);
        childProcess.on('exit', childExited);

        console.log('Stripe child process has started successfully');
    }

    function close() {
        return new Promise((resolve) => {
            if (!childProcess) return resolve();
            console.log('Shutting down stripe child process');
            expectingShutdown = true;
            childProcess.on('exit', resolve);
            childProcess.kill('SIGTERM');
            setTimeout(() => {
                const error = new Error('Timeout for disconnecting stripe has triggered.');
                Error.captureStackTrace(error);
                resolve(error);
            }, 3000);
        });
    }

    function checkForWebhookSecrets() {
        if (!process.env.STRIPE_WEBHOOK_SECRET)
            throw new Error('STRIPE_WEBHOOK_SECRET is not set and could not be configured automatically');
        // if (!process.env.STRIPE_WEBHOOK_CONNECT_SECRET)
        //     throw new Error('STRIPE_WEBHOOK_CONNECT_SECRET is not set and could not be configured automatically');
    }

    function stdOut(msg) {
        msg = msg.toString();
        while (msg.indexOf('\r\n') > -1 || msg.indexOf('\n') > -1 || msg.indexOf('\r') > -1) {
            msg = msg.replace(/(\r\n|\n|\r)/, '');
        }
        if (!msg) return;

        console.log('Stripe Message: %s', msg);

        const newVersion = RegExp(/^A newer version of the Stripe CLI is available, please update to\: v[0-9.]+$/);
        if (newVersion.test(msg)) {
            console.log('https://github.com/stripe/stripe-cli/tags');
            process.exit(-1);
        }
    }

    function stdErr(err) {
        err = err.toString().replace(/(\r\n|\n|\r)/, '');
        while (err.indexOf('\r\n') > -1 || err.indexOf('\n') > -1 || err.indexOf('\r') > -1) {
            err = err.replace(/(\r\n|\n|\r)/, '');
        }
        if (!err) return;

        const gettingReadyMsg = RegExp(/^Getting ready...$/);
        if (gettingReadyMsg.test(err)) {
            stdOut(err);
            return;
        }

        const signingSec = RegExp(/^Ready! Your webhook signing secret is whsec_[a-zA-Z0-9]+ \(\^C to quit\)$/);
        if (signingSec.test(err)) {
            stdOut(err);
            process.env.STRIPE_WEBHOOK_SECRET = err.split(' ')[6];
            return;
        }

        console.error('Stripe Error: %s', err);
    }

    async function childExited(code) {
        if (!expectingShutdown) {
            await slackService.SendMessage(`Stripe has prematurely shut down with exit code ${code}. Shutting down...`);
            process.exit(1);
        }

        console.log(`Stripe child process has shut down with exit code: ${code}`);
    }
})();
