(function () {
    'use strict';

    const crypto = require('crypto');
    const constants = require('../config/constants');
    const h = require('../helpers/helpers');
    const contractorService = require('../service/contractorService');
    const projectService = require('../service/projectService');
    const messageService = require('../service/messageService');
    const emailService = require('../service/emailService');
    const homepainterSessions = require('../config/sessions');

    module.exports = {
        SubmitApplication: SubmitApplication,
        ApproveDenyContractor: ApproveDenyContractor,
        CompleteSetup: CompleteSetup,
        RetrieveContractor: RetrieveContractor,
        AcceptProposal: AcceptProposal,
        DeclineProposal: DeclineProposal,
        SubmitProjectSchedule: SubmitProjectSchedule,
        CompleteProject: CompleteProject,
        UpdateInsuranceInfo: UpdateInsuranceInfo,
        RetrieveInsuranceInfo: RetrieveInsuranceInfo,
        GetStripeAccountLink: GetStripeAccountLink,
    };

    /**
     * Submits a contractor application
     * @param req
     * @return {Promise<*>}
     */
    async function SubmitApplication(req, res) {
        try {
            const contractor = await contractorService.SubmitApplication(req.body);
            homepainterSessions.Login(req, res, contractor);
            return { status: constants._2xx._200.status, content: contractor.toFrontEnd() };
        } catch (e) {
            if (e.message.includes('duplicate key error') && e.message.includes('email.address')) {
                return { status: constants._4xx._409.status, content: constants._4xx._409.reason };
            }
            throw e;
        }
    }

    /**
     * Approves or denies a contractor
     * @param req
     * @return {Promise<*>}
     */
    async function ApproveDenyContractor(req) {
        const resp = await contractorService.ApproveDenyContractor(req.body);
        return { status: constants._2xx._200.status, content: resp || constants._2xx._200.reason };
    }

    /**
     * Completes the setup for a contractor
     * @param req
     * @return {Promise<*>}
     */
    async function CompleteSetup(req) {
        let stateHash = crypto.createHash('sha256');
        stateHash = stateHash.update(req.session.csrfSecret);
        stateHash = stateHash.update(req.session.userId);
        stateHash = stateHash.digest('hex');

        if (stateHash !== req.body.stateValue) {
            return { status: constants._4xx._403.status, content: constants._4xx._403.reason };
        }

        await contractorService.CompleteSetup(req.session.userId, req.body.stripeCode);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    async function RetrieveContractor(req) {
        const contractor = await contractorService.RetrieveContractor(req.session.userId);

        return {
            status: constants._2xx._200.status,
            content: contractor || {},
        };
    }

    /**
     * Accepts a proposal
     * @param req
     * @return {Promise<*>}
     */
    async function AcceptProposal(req) {
        const contractor = await contractorService.GetContractor(req.session.userId);
        const project = await projectService.AcceptDeclineProposal(req.session.userId, req.body, true);

        // message the users that a bid has been placed, but don't send email about new message because we will email below
        const message = await messageService.SendNewMessage(
            req.session.userId,
            project.owner.toString(),
            `homepainter system - ${contractor.firstName} has placed a bid for $${req.body.price}.` +
                ` [view quote](${process.env.BASE_URL}/view-project/${project._id}/quote)`,
            false
        );

        // send customer an email - we save a database call by using message because customer has already been populated
        await emailService.CustomerNewProposal(message.to.toObject(), project.toObject());

        return {
            status: constants._2xx._201.status,
            content: constants._2xx._201.reason,
            ioEmitterName: constants.ioEmitters.newMessage,
            ioSendTo: [req.session.userId, project.owner.toString()],
            ioContent: message,
        };
    }

    /**
     * Declines a proposal
     * @param req
     * @return {Promise<*>}
     */
    async function DeclineProposal(req) {
        const contractor = await contractorService.GetContractor(req.session.userId);
        const project = await projectService.AcceptDeclineProposal(req.session.userId, req.body, false);
        const message = await messageService.SendNewMessage(
            req.session.userId,
            project.owner.toString(),
            `homepainter system - ${contractor.firstName} has declined the project. Reason [${h.StorageName2DisplayName(
                req.body.reason
            )}]`,
            false
        );
        return {
            status: constants._2xx._201.status,
            content: constants._2xx._201.reason,
            ioEmitterName: constants.ioEmitters.newMessage,
            ioSendTo: [req.session.userId, project.owner.toString()],
            ioContent: message,
        };
    }

    /**
     * Submits a project schedule when sent in from the contractor
     * @param req
     * @param res
     * @return {Promise<*>}
     */
    async function SubmitProjectSchedule(req) {
        const message = await contractorService.SubmitProjectSchedule(req.session.userId, req.body);

        return {
            status: constants._2xx._201.status,
            content: constants._2xx._201.reason,
            ioEmitterName: constants.ioEmitters.newMessage,
            ioSendTo: [message.to, message.from],
            ioContent: message,
        };
    }

    /**
     * Completes the last step a contractor needs to take to finish a job
     * @param req
     * @return {Promise<*>}
     */
    async function CompleteProject(req) {
        const message = await contractorService.CompleteProject(req.session.userId, req.body);
        return {
            status: constants._2xx._200.status,
            content: constants._2xx._200.reason,
            ioEmitterName: constants.ioEmitters.newMessage,
            ioSendTo: [message.to, message.from],
            ioContent: message,
        };
    }

    /**
     * Update the insurance information of the contractor
     * @param req
     * @returns {Promise<{content: string, status: number}>}
     */
    async function UpdateInsuranceInfo(req) {
        await contractorService.UpdateInsuranceInfo(req.session, req.body);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    /**
     * Rerieve iinsurance info of the contractor
     * @param req
     * @returns {Promise<{content: string, status: number}>}
     */
    async function RetrieveInsuranceInfo(req) {
        await contractorService.RetrieveInsuranceInfo(req.session);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    /**
     * Get Stripe Account Link of the user
     * @param req
     * @returns {Promise<{content: string, status: number}>}
     */
    async function GetStripeAccountLink(req) {
        await contractorService.StripeAccountLink(req.session.userId);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }
})();
