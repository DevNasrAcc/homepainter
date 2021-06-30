(function () {
    'use strict';

    const config = require('../config/config');
    const communicationEventRepo = require('../repo/communicationEventRepo');
    const userRepo = require('../repo/userRepo');
    const slackService = require('./slackService');
    const constants = require('../config/constants');
    const shortLinkService = require('./shortLinkService');
    const taskQueueService = require('./taskQueueService');
    let twilioClient;

    const _this = {
        ShouldSend: ShouldSend,
        _SendMessage: _SendMessage,
        MessageReceived: MessageReceived,
        ContractorSolicitBid: ContractorSolicitBid,
    };
    module.exports = _this;

    function ShouldSend(user) {
        return !!user.mobile.number && user.mobile.sendProjectNotices;
    }

    async function _SendMessage(body, from, to) {
        if (!twilioClient) twilioClient = config.twilioClient();
        if (process.env.NODE_ENV === constants.nodeEnv.qa) {
            body = '[DEV] ' + body;
        }
        return await twilioClient.messages.create({ body: body, from: from, to: to });
    }

    async function MessageReceived(body, from, to) {
        const fromUsers = await userRepo.FindByMobileNumber(from);
        if (!fromUsers || !fromUsers.length) {
            const error = new Error(`users with phone number [${from}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const toUsers = to === process.env.TWILIO_PHONE_NUMBER ? to : await userRepo.FindByMobileNumber(to);
        if (!toUsers || !toUsers.length) {
            const error = new Error(`users with phone number [${to}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        // Update if we should stop or start sending the user messages
        let sendProjectNotices;
        switch (body.toLowerCase().trim()) {
            case 'stop':
            case 'stopall':
            case 'unsubscribe':
            case 'cancel':
            case 'end':
            case 'quit':
                sendProjectNotices = false;
                break;
            case 'start':
            case 'yes':
            case 'unstop':
                sendProjectNotices = true;
                break;
            default:
                await slackService.SendMessage(`Unknown message received from ${from}. Message body: ${body}`);
        }

        for (let i = 0; i < fromUsers.length; ++i) {
            if (sendProjectNotices !== undefined) {
                fromUsers[i].mobile.sendProjectNotices = sendProjectNotices;
                await fromUsers[i].save();
            }

            if (toUsers === process.env.TWILIO_PHONE_NUMBER) {
                await communicationEventRepo.SaveTextEvent(fromUsers[i], toUsers, body, undefined);
                continue;
            }

            for (let j = 0; j < toUsers.length; ++j) {
                await communicationEventRepo.SaveTextEvent(fromUsers[i], toUsers[j], body, undefined);
            }
        }
    }

    async function ContractorSolicitBid(contractor, project) {
        if (!_this.ShouldSend(contractor)) return;
        await taskQueueService.getPQueue().add(async function () {
            const generatedShortUrl = await shortLinkService.GenerateShortUrl(project);

            const acceptLink = generatedShortUrl.shortUrl;

            const message = `You have a new available project from homepainter. Click the link below to view and bid the project. Reply STOP to stop receiving text notifications. `;
            const resp = await _this._SendMessage(
                message + acceptLink,
                process.env.TWILIO_PHONE_NUMBER,
                contractor.mobile.number
            );

            await communicationEventRepo.SaveTextEvent(
                process.env.TWILIO_PHONE_NUMBER,
                contractor,
                message,
                resp.error_code
            );
        });
    }
})();
