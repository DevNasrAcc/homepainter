(function () {
    'use strict';

    const feedbackSchema = require('../dbsmodel/feedback/feedback');

    module.exports = {
        CreateContractorJobComplete: CreateContractorJobComplete,
        CreateGeneralFeedback: CreateGeneralFeedback,
        CreateCustomerJobComplete: CreateCustomerJobComplete,
        FindCustomerJobCompleteFeedback: FindCustomerJobCompleteFeedback,
        GetContractorAverageRatings: GetContractorAverageRatings,
        FindAllCustomerJobCompleteReviewsForContractorsFromList: FindAllCustomerJobCompleteReviewsForContractorsFromList,
    };

    async function CreateContractorJobComplete(reviewerID, orderID, feedback, mongooseSession) {
        const _feedback = new feedbackSchema.ContractorJobCompleteDiscriminator({
            order: orderID,
            reviewer: reviewerID,
            projectRating: feedback.projectRating,
            projectComment: feedback.projectComment,
            homepainterRating: feedback.homepainterRating,
            homepainterComment: feedback.homepainterComment,
            additionalComment: feedback.additionalComment,
        });

        if (mongooseSession) _feedback.$session(mongooseSession);
        return await _feedback.save();
    }

    async function CreateGeneralFeedback(customerID, feedback, mongooseSession) {
        const _feedback = new feedbackSchema.GeneralFeedbackDiscriminator({
            reviewer: customerID,
            overallRating: feedback.overallRating,
            feedbackAround: feedback.feedbackAround,
            additionalComment: feedback.additionalComment,
        });

        if (mongooseSession) _feedback.$session(mongooseSession);
        return await _feedback.save();
    }

    async function CreateCustomerJobComplete(order, feedback, mongooseSession) {
        const _feedback = new feedbackSchema.CustomerJobCompleteDiscriminator({
            reviewer: order.owner,
            reviewee: order.contractor,
            order: order._id,
            contractorOverallRating: feedback.contractorOverallRating,
            contractorOverallComment: feedback.contractorOverallComment,
            contractorProfessionalismRating: feedback.contractorProfessionalismRating,
            contractorProfessionalismComment: feedback.contractorProfessionalismComment,
            contractorQualityRating: feedback.contractorQualityRating,
            contractorQualityComment: feedback.contractorQualityComment,
            contractorAdditionalComment: feedback.contractorAdditionalComment,
            homepainterOverallRating: feedback.homepainterOverallRating,
            homepainterOverallComment: feedback.homepainterOverallComment,
            homepainterAdditionalComment: feedback.homepainterAdditionalComment,
        });

        if (mongooseSession) _feedback.$session(mongooseSession);
        return await _feedback.save();
    }

    async function FindCustomerJobCompleteFeedback(customerId, orderId, mongooseSession) {
        const query = feedbackSchema.CustomerJobCompleteDiscriminator.findOne({
            reviewer: customerId,
            order: orderId,
        });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function GetContractorAverageRatings(mongooseSession) {
        const query = feedbackSchema.CustomerJobCompleteDiscriminator.aggregate([
            { $match: { __t: 'customer-job-complete' } },
            {
                $group: {
                    _id: '$reviewee',
                    contractorOverallRating: { $avg: '$contractorOverallRating' },
                    contractorRatingCount: { $sum: 1 },
                },
            },
        ]);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindAllCustomerJobCompleteReviewsForContractorsFromList(list, mongooseSession) {
        const items = list.map((item) => `{"reviewee": "${item}"}`).join(',');
        const queryString = `{"$or": [${items}]}`;
        const query = feedbackSchema.CustomerJobCompleteDiscriminator.find(JSON.parse(queryString));
        query.populate('reviewer');
        query.sort({ createdAt: -1 });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
