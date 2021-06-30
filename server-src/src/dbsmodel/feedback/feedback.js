(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const functions = require('./feedback.functions');

    const feedbackSchema = new Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            reviewer: { type: Schema.Types.ObjectId, ref: 'user' }, // Person who writes the review
            reviewee: { type: Schema.Types.ObjectId, ref: 'user' }, // One who undergoes a review
            order: { type: Schema.Types.ObjectId, ref: 'order' },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    feedbackSchema.methods.toFrontEnd = functions.toFrontEnd;
    feedbackSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    feedbackSchema.pre('validate', functions.preValidate);

    const FeedbackModel = mongoose.model('feedback', feedbackSchema);

    const ContractorJobCompleteDiscriminator = FeedbackModel.discriminator(
        'contractor-job-complete',
        new Schema(
            {
                projectRating: { type: Schema.Types.Number, min: 1, max: 5, required: true },
                projectComment: { type: Schema.Types.String },
                homepainterRating: { type: Schema.Types.Number, min: 1, max: 5, required: true },
                homepainterComment: { type: Schema.Types.String },
                additionalComment: { type: Schema.Types.String },
            },
            { timestamps: true }
        )
    );

    const GeneralFeedbackDiscriminator = FeedbackModel.discriminator(
        'general-feedback',
        new Schema(
            {
                overallRating: { type: Schema.Types.Number, min: 1, max: 5, required: true },
                feedbackAround: { type: Schema.Types.String, required: true },
                additionalComment: { type: Schema.Types.String },
            },
            { timestamps: true }
        )
    );

    const CustomerJobCompleteDiscriminator = FeedbackModel.discriminator(
        'customer-job-complete',
        new Schema(
            {
                contractorOverallRating: { type: Schema.Types.Number, min: 1, max: 5, required: true },
                contractorOverallComment: { type: Schema.Types.String },
                contractorProfessionalismRating: { type: Schema.Types.Number, min: 1, max: 5, required: true },
                contractorProfessionalismComment: { type: Schema.Types.String },
                contractorQualityRating: { type: Schema.Types.Number, min: 1, max: 5, required: true },
                contractorQualityComment: { type: Schema.Types.String },
                contractorAdditionalComment: { type: Schema.Types.String },
                homepainterOverallRating: { type: Schema.Types.Number, min: 1, max: 5, required: true },
                homepainterOverallComment: { type: Schema.Types.String },
                homepainterAdditionalComment: { type: Schema.Types.String },
            },
            { timestamps: true }
        )
    );

    module.exports = {
        FeedbackModel: FeedbackModel,
        ContractorJobCompleteDiscriminator: ContractorJobCompleteDiscriminator,
        GeneralFeedbackDiscriminator: GeneralFeedbackDiscriminator,
        CustomerJobCompleteDiscriminator: CustomerJobCompleteDiscriminator,
    };
})();
