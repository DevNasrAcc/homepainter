(function () {
    'use strict';

    const constants = require('../config/constants');
    const emailService = require('./emailService');
    const IncomingWebhook = require('@slack/webhook').IncomingWebhook;
    let webhook;

    const _this = {
        SlackWebhook: SlackWebhook,
        SendMessage: SendMessage,
    };

    module.exports = _this;

    /**
     * Configures and returns the slack webhook
     * @return {IncomingWebhook}
     */
    function SlackWebhook() {
        if (!webhook) {
            webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
        }
        return webhook;
    }

    /**
     *
     * @param systemMessage String, Error, or Array of Strings
     * @returns {Promise<void>}
     */
    async function SendMessage(systemMessage) {
        if (Array.isArray(systemMessage)) systemMessage = systemMessage.join('\n');
        if (systemMessage instanceof Error) systemMessage = systemMessage.stack;
        if (typeof systemMessage !== 'string') systemMessage = systemMessage.toString();
        systemMessage = 'NODE_ENV=' + process.env.NODE_ENV + '\n' + systemMessage;

        if (process.env.NODE_ENV === constants.nodeEnv.dev) {
            console.error(systemMessage);
            return;
        }

        try {
            const webhook = _this.SlackWebhook();
            await webhook.send({ text: systemMessage });
        } catch (slackError) {
            await emailService.SupportSystemError(slackError, systemMessage);
        }
    }
})();
