(function () {
    'use strict';

    const validation = require('./requestValidator');
    const application = require('./files/application.json');
    const contractorApproveDenyValidation = require('./files/contractor.approve-deny');
    const contractorProposalAcceptValidation = require('./files/contractor.proposal-accept');
    const contractorProposalDeclineValidation = require('./files/contractor.proposal-decline');
    const contractorProjectScheduleValidation = require('./files/contractor.project-schedule');
    const contractorProjectCompletionValidation = require('./files/contractor.project-completion');

    module.exports = {
        Application: Application,
        ApproveDeny: ApproveDeny,
        CompleteSetup: CompleteSetup,
        ProposalAccept: ProposalAccept,
        ProposalDecline: ProposalDecline,
        ProjectSchedule: ProjectSchedule,
        ProjectCompletion: ProjectCompletion,
        ListOfPainterIds: ListOfPainterIds,
        UpdateInsuranceInfo: UpdateInsuranceInfo,
    };

    /**
     * Validates a contractor's application
     * @param body
     * @return {Array}
     */
    function Application(req) {
        // must accept acceptedTermsAndPrivacy
        let failures = validation.Validate(req.body, application);

        if (!req.body.acceptedTermsAndPrivacy) {
            failures.push(
                `[acceptedTermsAndPrivacy] failed validation: was [${req.body.acceptedTermsAndPrivacy}] expected true`
            );
        }

        return failures;
    }

    /**
     * Validates a request to approve or deny a contractor
     * @param req
     * @return {Array}
     */
    function ApproveDeny(req) {
        return validation.Validate(req.body, contractorApproveDenyValidation);
    }

    /**
     * Validates a request has a stripe code
     * @param req
     * @return {Array}
     */
    function CompleteSetup(req) {
        return validation.Validate(req.body, {
            stripeCode: {
                type: 'string',
                required: true,
            },
            stateValue: {
                type: 'string',
                required: true,
            },
        });
    }

    /**
     * Validates an accept proposal send from a contractor is valid
     * @param req the request
     * @return {Array}
     */
    function ProposalAccept(req) {
        return validation.Validate(req.body, contractorProposalAcceptValidation);
    }

    /**
     * Validates a decline proposal send from a contractor is valid
     * @param req the request
     * @return {Array}
     */
    function ProposalDecline(req) {
        return validation.Validate(req.body, contractorProposalDeclineValidation);
    }

    /**
     * Validates a project schedule sent from a contractor is valid
     * @param req the request
     * @return {Array}
     */
    function ProjectSchedule(req) {
        return validation.Validate(req.body, contractorProjectScheduleValidation);
    }

    /**
     * Validates input from the contractor verifying a job is complete
     * @param req the request
     * @return {Array}
     */
    function ProjectCompletion(req) {
        return validation.Validate(req.body, contractorProjectCompletionValidation);
    }

    /**
     * Validates a query param is a list of painter ids or the keyword all
     * @param req the request
     * @return {Array}
     */
    function ListOfPainterIds(req) {
        const failures = validation.Validate(req.params, {
            commaSeparatedList: { type: 'string', required: true },
        });

        if (failures.length > 0) {
            return failures;
        }

        // remove any extra items in list if it contains the keyword all
        if (req.params.commaSeparatedList.includes('all')) {
            req.params.commaSeparatedList = 'all';
            return failures;
        }

        const array = req.params.commaSeparatedList.split(',');

        return validation.Validate(
            { array },
            {
                array: {
                    type: 'array',
                    required: true,
                    fields: {
                        type: 'mongoId',
                        required: true,
                    },
                },
            }
        );
    }

    /**
     * Validate the insurance parameters including the companyName, expirationDate of the insurance as well as stored
     * file from the bucket
     * @param req
     * @returns {Array}
     */
    function UpdateInsuranceInfo(req) {
        return validation.Validate(req.body, {
            insurance: {
                type: 'object',
                required: true,
                fields: {
                    companyName: {
                        type: 'string',
                        required: true,
                    },
                    expirationDate: {
                        type: 'date',
                        required: true,
                    },
                    fileLocation: {
                        type: 'string',
                        required: true,
                    },
                },
            },
        });
    }
})();
