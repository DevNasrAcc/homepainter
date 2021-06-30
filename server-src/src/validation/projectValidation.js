(function () {
    'use strict';

    const validation = require('./requestValidator');
    const projectValidation = require('./files/project.json');
    const projectInProgressValidation = require('./files/project-in-progress.json');
    const proposalValidation = require('./files/project.proposal.json');
    const shareProjectRules = require('./files/share-project.json');

    module.exports = {
        ProjectId: ProjectId,
        Project: Project,
        ProjectInProgress: ProjectInProgress,
        Proposal: Proposal,
        InvitePainter: InvitePainter,
        ShareProject: ShareProject,
    };

    /**
     * Validates a single param exists for the project details id
     * @param req
     * @return {Array}
     */
    function ProjectId(req) {
        return validation.Validate(req.params, {
            projectId: {
                type: 'mongoId',
                required: true,
            },
        });
    }

    /**
     * Validates that project details has all of the required params with no malfunctions
     * @param req the request object from the controller
     * @return {Array}
     */
    function Project(req) {
        return validation.Validate(req.body, projectValidation);
    }

    /**
     * Validates that project details but all fields are optional
     * @param req the request object from the controller
     * @return {Array}
     */
    function ProjectInProgress(req) {
        return validation.Validate(req.body, projectInProgressValidation);
    }

    /**
     * Validates that a proposal has all of the required information
     * @param req the request object from the controller
     * @return {Array}
     */
    function Proposal(req) {
        return validation.Validate(req.body, proposalValidation);
    }

    function InvitePainter(req) {
        return validation.Validate(req.body, {
            contractorId: {
                type: 'mongoId',
                required: true,
            },
            projectId: {
                type: 'mongoId',
                required: true,
            },
            message: {
                type: 'string',
                required: true,
            },
        });
    }

    function ShareProject(req) {
        return validation.Validate(req.body, shareProjectRules);
    }
})();
