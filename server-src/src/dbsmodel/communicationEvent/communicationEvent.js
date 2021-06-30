(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const functions = require('./communicationEvent.functions');

    const communicationEventSchema = new Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    communicationEventSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    communicationEventSchema.pre('validate', functions.preValidate);

    const CommunicationEventModel = mongoose.model('communicationEvent', communicationEventSchema);

    const TextCommunicationEventDiscriminator = CommunicationEventModel.discriminator(
        'text',
        new Schema(
            {
                from: { type: Schema.Types.Mixed, required: true },
                to: { type: Schema.Types.Mixed, required: true },
                message: { type: Schema.Types.String, required: true },
                errCode: { type: Schema.Types.Number, required: false },
            },
            { timestamps: true }
        )
    );

    const EmailCommunicationEventDiscriminator = CommunicationEventModel.discriminator(
        'email',
        new Schema(
            {
                from: { type: Schema.Types.Mixed, required: false },
                to: { type: Schema.Types.Mixed, required: false },
                subject: { type: Schema.Types.String },
                messageId: { type: Schema.Types.String },
                deliveredTimestamp: { type: Schema.Types.Date },
                opens: [Schema.Types.Date],
            },
            { timestamps: true }
        )
    );

    const MessageCommunicationEventDiscriminator = CommunicationEventModel.discriminator(
        'message',
        new Schema(
            {
                from: { type: Schema.Types.ObjectId, ref: 'user', required: true },
                to: { type: Schema.Types.ObjectId, ref: 'user', required: true },
                fromReadAt: { type: Schema.Types.Date, required: false },
                toReadAt: { type: Schema.Types.Date, required: false },
                message: { type: Schema.Types.String, required: true },
            },
            { timestamps: true }
        )
    );

    module.exports = {
        CommunicationEventModel: CommunicationEventModel,
        TextCommunicationEventDiscriminator: TextCommunicationEventDiscriminator,
        EmailCommunicationEventDiscriminator: EmailCommunicationEventDiscriminator,
        MessageCommunicationEventDiscriminator: MessageCommunicationEventDiscriminator,
    };
})();
