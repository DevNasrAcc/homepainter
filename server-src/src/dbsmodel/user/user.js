(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const fileModel = require('../file/file').FileModel;
    const functions = require('./user.functions');
    const emailMatcher = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const maxFoundedYear = new Date().getFullYear();

    const userSchema = new Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            roles: { type: [Schema.Types.String], required: true },
            password: { type: Schema.Types.String },
            locked: { type: Schema.Types.Boolean, required: true, default: false },
            // securityQuestions: [
            //     {
            //         question: { type: Schema.Types.String, required: true },
            //         answer: { type: Schema.Types.String, required: true }
            //     }
            // ],
            firstName: { type: Schema.Types.String, required: true, trim: true },
            lastName: { type: Schema.Types.String, required: true, trim: true },
            email: {
                address: {
                    type: Schema.Types.String,
                    required: true,
                    unique: true,
                    lowercase: true,
                    trim: true,
                    minlength: 5,
                    match: [emailMatcher, 'Email failed to pass validation'],
                },
                sendPromotional: { type: Schema.Types.Boolean, required: true },
                sendProductNews: { type: Schema.Types.Boolean, required: true, default: true },
                sendBlog: { type: Schema.Types.Boolean, required: true, default: true },
                sendProjectNotices: { type: Schema.Types.Boolean, required: true, default: true },
                sendMessageNotices: { type: Schema.Types.Boolean, required: true, default: true },
            },
            mobile: {
                number: { type: Schema.Types.String, index: true },
                sendProjectNotices: { type: Schema.Types.Boolean, required: true, default: true },
                sendMessageNotices: { type: Schema.Types.Boolean, required: true, default: false },
            },
            lastSeenOnline: { type: Schema.Types.Date, default: new Date(0) },
            acceptedTermsAndPrivacy: { type: Schema.Types.Boolean, required: true },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    userSchema.methods.matchesPassword = functions.matchesPassword;
    userSchema.methods.toContractorVisibleFields = functions.toContractorVisibleFields;
    userSchema.methods.toFrontEnd = functions.toFrontEnd;
    userSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    userSchema.pre('validate', functions.preValidate);
    userSchema.pre('save', functions.preSaveUpdate);
    userSchema.pre('updateOne', functions.preSaveUpdate);

    const UserModel = mongoose.model('user', userSchema);

    const ContractorDiscriminator = UserModel.discriminator(
        'contractor',
        new Schema(
            {
                roles: { type: [Schema.Types.String], required: true, default: ['contractor'] },
                timezone: { type: Schema.Types.String },
                title: { type: Schema.Types.String },
                organizationName: { type: Schema.Types.String, required: false },
                picture: { type: Schema.Types.String, trim: true },
                bio: { type: Schema.Types.String, trim: true },
                website: { type: Schema.Types.String, trim: true, required: false },
                numberOfEmployees: { type: Schema.Types.Number, min: 0, required: false },
                founded: { type: Schema.Types.Number, min: 1900, max: maxFoundedYear, required: false },
                rating: { type: Schema.Types.Number },
                ratingCount: { type: Schema.Types.Number, default: 0 },
                completedJobCount: { type: Schema.Types.Number, default: 0 },
                services: { type: [Schema.Types.String], required: false, default: [] },
                address: {
                    streetAddress: { type: Schema.Types.String, required: false },
                    city: { type: Schema.Types.String, required: false },
                    state: { type: Schema.Types.String, required: false },
                    zipCode: { type: Schema.Types.Number, required: false },
                },
                approvalDate: { type: Schema.Types.Date },
                completedStripeConnectDate: { type: Schema.Types.Date },
                accountStatus: {
                    type: Schema.Types.String,
                    required: true,
                    enum: ['restricted', 'approved', 'rejected', 'active', 'inactive', 'closed'],
                    default: 'restricted',
                },
                stripeConnectAccountId: { type: Schema.Types.String },
                insurance: {
                    insured: { type: Schema.Types.Boolean, required: false },
                    companyName: { type: Schema.Types.String },
                    status: { type: Schema.Types.String },
                    agentName: { type: Schema.Types.String },
                    effectiveDate: { type: Schema.Types.Date },
                    expirationDate: { type: Schema.Types.Date },
                    fileLocation: { type: Schema.Types.String },
                    verified: { type: Schema.Types.Boolean, required: false },
                },
                socialMedia: {
                    twitter: { type: Schema.Types.String },
                    facebook: { type: Schema.Types.String },
                    instagram: { type: Schema.Types.String },
                    google: { type: Schema.Types.String },
                },
                photosOfPastWork: [{ type: fileModel.schema }],
            },
            { timestamps: true }
        )
    );

    const CustomerDiscriminator = UserModel.discriminator(
        'customer',
        new Schema(
            {
                roles: { type: [Schema.Types.String], required: true, default: ['customer'] },
                stripeCustomerId: { type: Schema.Types.String, required: false },
                companyName: { type: Schema.Types.String, required: false },
            },
            { timestamps: true }
        )
    );

    module.exports = {
        UserModel: UserModel,
        ContractorDiscriminator: ContractorDiscriminator,
        CustomerDiscriminator: CustomerDiscriminator,
    };
})();
