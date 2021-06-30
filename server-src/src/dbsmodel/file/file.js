(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const functions = require('./file.functions');

    const fileSchema = new Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            url: { type: Schema.Types.String, required: true, index: true },
            originalName: { type: Schema.Types.String, required: true },
            size: { type: Schema.Types.Number, required: true },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    fileSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    fileSchema.pre('validate', functions.preValidate);

    const FileModel = mongoose.model('file', fileSchema);
    const TempPhotoDiscriminator = FileModel.discriminator('tempPhoto', new Schema({}, { timestamps: true }));

    module.exports = {
        FileModel: FileModel,
        TempPhotoDiscriminator: TempPhotoDiscriminator,
    };
})();
