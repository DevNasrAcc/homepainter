(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const functions = require('./project.functions');
    const projectDetails = require('./project.details');
    const projectProposal = require('./project.proposal');

    const projectSchema = new Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            status: {
                type: Schema.Types.String,
                required: true,
                enum: ['creating', 'invitingPainters', 'expired', 'awaitingDownPaymentConfirmation', 'booked'],
            },
            owner: { type: Schema.Types.ObjectId, ref: 'user', required: true },
            invitees: [{ type: Schema.Types.ObjectId, ref: 'user', required: true }],
            details: { type: projectDetails.schema, required: true },
            promoCode: { type: Schema.Types.String },
            proposals: { type: [projectProposal.schema] },
            selectedProposal: { type: projectProposal.schema },
            invitedContractors: [{ type: Schema.Types.ObjectId }],
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    projectSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    projectSchema.methods.toFrontEnd = functions.toFrontEnd;
    projectSchema.methods.toContractorVisibleFields = functions.toContractorVisibleFields;
    projectSchema.pre('validate', functions.preValidate);
    projectSchema.pre('save', functions.preSaveUpdate);
    projectSchema.pre('updateOne', functions.preSaveUpdate);

    module.exports = mongoose.model('project', projectSchema);
})();
