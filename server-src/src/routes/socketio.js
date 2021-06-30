(function () {
    "use strict";

    const socketIo = require('socket.io');
    const requireMongoSanitize = require('express-mongo-sanitize');
    const mongoSanitize = requireMongoSanitize();
    const socketWrapper = require('../config/middleware').socketWrapper;
    const guards = require('../guards/authGuard');
    const messageValidator = require('../validation/messageValidation');
    const messageController = require('../controller/messagesController');

    module.exports = function (server, expressSessions) {
        global.io = socketIo(server);

        global.io.use((socket, next) => { mongoSanitize(socket.request, {}, next) } );
        global.io.use((socket, next) => { expressSessions(socket.request, {}, next) });
        global.io.use((socket, next) => { guards.isLoggedIn(socket.request, {}, next) });

        global.io.on('connection', (socket) => {
            socket.join(socket.request.session.userId);

            socket.on('update_user_online_status', socketWrapper(socket, undefined, messageController.UpdateUserOnlineStatus));
            socket.on('send_message', socketWrapper(socket, messageValidator.ToAndMessage, messageController.SendMessage));
            socket.on('user_start_typing', socketWrapper(socket, messageValidator.To, messageController.UserStartTyping));
            socket.on('user_stop_typing', socketWrapper(socket, messageValidator.To, messageController.UserStopTyping));
            socket.on('mark_messages_as_read', socketWrapper(socket, messageValidator.ListOfMessages, messageController.MarkAllMessagesAsRead));
        });
    }
})();
