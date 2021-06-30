(function () {
    'use strict';

    const communicationEventModel = require('../dbsmodel/communicationEvent/communicationEvent');

    module.exports = {
        SaveTextEvent: SaveTextEvent,
        UpsertEmailEvent: UpsertEmailEvent,
        FindOneEmailByMessageId: FindOneEmailByMessageId,
    };

    /**
     * Creates a text communication event
     * @param from can be either a string for a phone number or mongoose model
     * @param to can be either a string for a phone number or mongoose model
     * @param message body of the message
     * @param errCode errCode to save if available, undefined otherwise
     * @param mongooseSession
     * @returns {Promise<*>}
     */

    async function SaveTextEvent(from, to, message, errCode, mongooseSession) {
        if (typeof from !== 'string') from = from._id;
        if (typeof to !== 'string') to = to._id;

        const textCommunicationEvent = new communicationEventModel.TextCommunicationEventDiscriminator({
            from: from,
            to: to,
            message: message,
            errCode: errCode,
        });

        if (mongooseSession) textCommunicationEvent.$session(mongooseSession);
        return await textCommunicationEvent.save();
    }

    async function UpsertEmailEvent(emailEvent, mongooseSession) {
        const query = communicationEventModel.EmailCommunicationEventDiscriminator.findOneAndUpdate(
            { messageId: emailEvent.messageId },
            emailEvent,
            {
                new: true,
                upsert: true,
            }
        );

        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindOneEmailByMessageId(messageId, mongooseSession) {
        const query = communicationEventModel.EmailCommunicationEventDiscriminator.findOne({
            messageId: messageId,
        });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
