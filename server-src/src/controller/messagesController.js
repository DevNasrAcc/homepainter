(function () {
    'use strict';

    const constants = require('../config/constants');
    const messageService = require('../service/messageService');

    module.exports = {
        RetrieveAllMessages: RetrieveAllMessages,
        UpdateUserOnlineStatus: UpdateUserOnlineStatus,
        SendMessage: SendMessage,
        UserStartTyping: UserStartTyping,
        UserStopTyping: UserStopTyping,
        MarkAllMessagesAsRead: MarkAllMessagesAsRead,
    };

    async function RetrieveAllMessages(req) {
        const conversations = await messageService.RetrieveAllConversations(req.session.userId);
        return { status: constants._2xx._200.status, content: conversations };
    }

    async function UpdateUserOnlineStatus(req) {
        const user = await messageService.UpdateLastSeenOnline(req.session.userId);
        return {
            status: constants._2xx._200.status,
            content: user,
            ioEmitterName: constants.ioEmitters.updateUserOnlineStatus,
            ioSendTo: ['all'],
        };
    }

    async function SendMessage(req) {
        const message = await messageService.SendNewMessage(req.session.userId, req.body.to, req.body.message, true);
        return {
            status: constants._2xx._201.status,
            content: message,
            ioEmitterName: constants.ioEmitters.newMessage,
            ioSendTo: [message.to._id.toString(), message.from._id.toString()],
        };
    }

    function UserStartTyping(req) {
        return {
            status: constants._2xx._200.status,
            content: { otherUserId: req.session.userId, typing: true },
            ioEmitterName: constants.ioEmitters.userTyping,
            ioSendTo: [req.body.to],
        };
    }

    function UserStopTyping(req) {
        return {
            status: constants._2xx._200.status,
            content: { otherUserId: req.session.userId, typing: false },
            ioEmitterName: constants.ioEmitters.userTyping,
            ioSendTo: [req.body.to],
        };
    }

    async function MarkAllMessagesAsRead(req) {
        await messageService.MarkAllMessagesAsRead(req.session.userId, req.body.messages);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }
})();
