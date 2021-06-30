(function () {
    'use strict';

    const validation = require('./requestValidator');
    const customerInProgressValidation = require('./files/customer-in-progress.json');
    const generalFeedbackValidation = require('./files/general-feedback');
    const customerProjectCompletionValidation = require('./files/customer.project-completion.json');
    const application = require('./files/application.json');
    const approveDenyRules = require('./files/agent.approve-deny');

    module.exports = {
        CustomerInProgress: CustomerInProgress,
        Feedback: Feedback,
        JobComplete: JobComplete,
        Contact: Contact,
        ApproveDeny: ApproveDeny,
    };

    function CustomerInProgress(req) {
        let failures = validation.Validate(req.body, customerInProgressValidation);

        if (!req.body.acceptedTermsAndPrivacy) {
            failures.push(
                `[acceptedTermsAndPrivacy] failed validation: was [${req.body.acceptedTermsAndPrivacy}] expected true`
            );
        }

        return failures;
    }

    function Feedback(req) {
        return validation.Validate(req.body, generalFeedbackValidation);
    }

    function JobComplete(req) {
        return validation.Validate(req.body, customerProjectCompletionValidation);
    }

    function Contact(req) {
        const failures = validation.Validate(req.body, application);

        if (!req.body.acceptedTermsAndPrivacy) {
            failures.push(
                `[acceptedTermsAndPrivacy] failed validation: was [${req.body.acceptedTermsAndPrivacy}] expected true`
            );
        }

        return failures;
    }

    function ApproveDeny(req) {
        return validation.Validate(req.body, approveDenyRules);
    }
})();
