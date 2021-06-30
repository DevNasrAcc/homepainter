(function () {
    'use strict';

    const moment = require('moment');
    const emailService = require('../service/emailService');
    const messageRepo = require('../repo/messageRepo');
    const userRepo = require('../repo/userRepo');

    module.exports = {
        RetrieveAllConversations: RetrieveAllConversations,
        SendNewMessage: SendNewMessage,
        UpdateLastSeenOnline: UpdateLastSeenOnline,
        MarkAllMessagesAsRead: MarkAllMessagesAsRead,
    };

    async function RetrieveAllConversations(userId) {
        const messages = await messageRepo.GetAllMessagesForUser(userId);
        const conversations = {};
        const you = await userRepo.FindOneById(userId);
        if (!you) {
            const error = new Error(`user with _id [${userId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        for (const message of messages) {
            const otherPersonId = message.to.toString() === userId ? message.from.toString() : message.to.toString();

            if (!conversations[otherPersonId]) {
                const otherPerson = await userRepo.FindOneById(otherPersonId);
                if (!otherPerson) {
                    const error = new Error(`user with _id [${otherPersonId}] does not exist`);
                    Error.captureStackTrace(error);
                    throw error;
                }

                conversations[otherPersonId] = {
                    messages: [],
                    you: you.toFrontEnd(),
                    otherPerson: otherPerson.toFrontEnd(),
                };
            }

            conversations[otherPersonId].messages.push(message);
        }

        const unreadConversations = [];
        const readConversations = [];

        for (const [otherPersonId, conversation] of Object.entries(conversations)) {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            if (lastMessage.from.toString() === otherPersonId && !lastMessage.toReadAt) {
                unreadConversations.splice(0, 0, conversation);
            } else {
                readConversations.splice(0, 0, conversation);
            }
        }

        return unreadConversations.concat(readConversations);
    }

    async function SendNewMessage(fromUserId, toUserId, message, sendEmailIfOffline) {
        const messageBetweenUsers = await messageRepo.GetAllMessagesBetweenUsers(toUserId, fromUserId, -1, 1);
        const lastMessage = messageBetweenUsers.length > 0 ? messageBetweenUsers[0] : undefined;
        const toUserLastMessageReadAt = !lastMessage
            ? undefined
            : messageBetweenUsers[0].to.toString() === toUserId
            ? lastMessage.toReadAt
            : lastMessage.fromReadAt;

        const objStorageRegex = /((https:\/\/us-east-1\.linodeobjects.com\/homepainter-images(-development)?\/)[^\s]+)/;
        const uriRegex = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/;
        const wordArray = message.split(' ');
        for (let i = 0, imageCounter = 1; i < wordArray.length; ++i) {
            // find homepainter images and convert them to markdown images
            if (objStorageRegex.test(wordArray[i])) {
                wordArray[i] = `![image${imageCounter}](${wordArray[i]})`; // markdown image - see also markdown-cheat-sheet.md
                ++imageCounter;
            }
            // find rouge links and convert them to standard markdown
            else if (uriRegex.test(wordArray[i]) || wordArray[i].startsWith('http://localhost')) {
                let url = wordArray[i];
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'http://' + url;
                }
                wordArray[i] = `[${wordArray[i]}](${url})`; // markdown hyperlink - see also markdown-cheat-sheet.md
            }
        }
        message = wordArray.join(' ');

        const newMessage = await messageRepo.CreateMessage(fromUserId, toUserId, message);
        newMessage.populate('to');
        newMessage.populate('from');
        await newMessage.execPopulate();

        await emailService.UserNewMessageReceived(
            newMessage.to.toObject(),
            newMessage.from.toObject(),
            newMessage.toObject()
        );

        // if lastMessage is undefined or null, it is a new message. Send the user an email.
        // if the user read the last message, and they have been offline for more than 5 minutes, send email
        // if (
        //     sendEmailIfOffline &&
        //     (!lastMessage ||
        //         (toUserLastMessageReadAt && moment().subtract(5, 'minutes').isAfter(newMessage.to.lastSeenOnline)))
        // ) {
        //     await emailService.UserNewMessageReceived(
        //         newMessage.to.toObject(),
        //         newMessage.from.toObject(),
        //         newMessage.toObject()
        //     );
        // }

        return newMessage;
    }

    async function UpdateLastSeenOnline(userId) {
        const user = await userRepo.FindOneById(userId);
        user.lastSeenOnline = new moment();
        await user.save();
        return user;
    }

    async function MarkAllMessagesAsRead(userId, messages) {
        for (const _message of messages) {
            const message = await messageRepo.FindOneById(_message._id);
            if (!message) {
                const error = new Error(`Message with _id [${_message._id}] does not exist`);
                Error.captureStackTrace(error);
                throw error;
            }

            if (message.from.toString() === userId && !message.fromReadAt) {
                message.fromReadAt = new moment();
                await message.save();
            } else if (message.to.toString() === userId && !message.toReadAt) {
                message.toReadAt = new moment();
                await message.save();
            }
        }
    }
})();
