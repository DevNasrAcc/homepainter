(function () {
    'use strict';

    const constants = require('../config/constants');
    const contractorService = require('../service/contractorService');
    const emailService = require('../service/emailService');
    const customerService = require('../service/customerService');
    const locationService = require('../service/locationService');
    const projectAnalyticsService = require('../service/projectAnalyticsService');
    const projectService = require('../service/projectService');
    const projectUpdate = require('../dbsmodel/project/project.functions');
    const orderService = require('../service/orderService');
    const messageService = require('../service/messageService');

    module.exports = {
        GetProject: GetProject,
        GetProjectDetailsAndCustomer: GetProjectDetailsAndCustomer,
        RetrieveProjects: RetrieveProjects,
        SaveProgress: SaveProgress,
        SaveAndReturnLater: SaveAndReturnLater,
        ShareProject: ShareProject,
        StartReceivingProposals: StartReceivingProposals,
        InvitePainter: InvitePainter,
        GetChargeDetails: GetChargeDetails,
        UpsertOrder: UpsertOrder,
        UpgradeProjectSchema: UpgradeProjectSchema,
    };

    async function GetProject(req) {
        const project = await projectService.GetProject(req.params.projectId);
        if (project) {
            project.populate('proposals.contractor');
            project.populate('selectedProposal.contractor');
            await project.execPopulate();
        }
        return { status: constants._2xx._200.status, content: project ? project.toFrontEnd() : {} };
    }

    /**
     * Retrieves the details and customer info for a contractor looking to submit a proposal
     * @param req
     * @return {Promise<*>}
     */
    async function GetProjectDetailsAndCustomer(req) {
        const project = await projectService.GetProject(req.params.projectId);
        if (!project) {
            const error = new Error(`project with id [${req.params.projectId}] not found`);
            Error.captureStackTrace(error);
            throw error;
        }

        project.populate('owner');
        await project.execPopulate();

        project.proposals = project.proposals.filter(
            (proposal) => proposal.contractor._id.toString() === req.session.userId
        );

        return {
            status: constants._2xx._200.status,
            content: project.toContractorVisibleFields(),
        };
    }

    async function RetrieveProjects(req) {
        const projects = await projectService.GetAllProjects(req.session.userId);
        return { status: constants._2xx._200.status, content: projects };
    }

    async function SaveProgress(req) {
        const project = await projectService.SaveProject(req.body, req.session.userId);

        return { status: constants._2xx._200.status, content: project.toFrontEnd() };
    }

    async function SaveAndReturnLater(req) {
        const project = await projectService.SaveProject(req.body, req.session.userId);
        const customer = await customerService.RetrieveCustomer(req.session.userId);
        await emailService.CustomerReturnToProject(customer.toObject(), project.toObject());

        return { status: constants._2xx._200.status, content: project.toFrontEnd() };
    }

    async function ShareProject(req) {
        await projectService.ShareProject(
            req.session.userId,
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.message,
            req.body.projectId
        );

        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    async function StartReceivingProposals(req) {
        // documentation on bug fix (code below)
        // this code is here to prevent users from saving the same project twice.
        // ex: user starts a project on desktop, selects 'save and return later' just
        // before starting search. Then user selects start search on mobile. Then user tries to select
        // start search on desktop. Before, this would throw an error. Now it does not.
        // here we just check if the customer already exists and if that customer has selected 'start search'.
        // Retrieve customer returns an empty object if there is not user found in the database, so we
        // must include the '.toFrontEnd' property to verify the customer exists (instead of just verifying 'customer' exists).
        let project = await projectService.GetProject(req.body._id);
        if (project && project.status !== 'creating') {
            return { status: constants._2xx._200.status, content: project.toFrontEnd() };
        }

        req.body.status = 'invitingPainters';

        // Populate estimate fields
        const locationInfo = await locationService.FindOneByZipCode(req.body.details.address.zipCode);
        req.body.details = projectAnalyticsService.FillAnalytics(req.body.details, locationInfo, {
            laborRate: 66,
            materialPricePerGallon: 35,
            averageCoats: 1.5,
        });

        project = await projectService.SaveProject(req.body, req.session.userId);
        const customer = await customerService.RetrieveCustomer(req.session.userId);
        await contractorService.RequestProposals(project);

        await emailService.CustomerReturnToProject(customer.toObject(), project.toObject());

        return { status: constants._2xx._200.status, content: project.toFrontEnd() };
    }

    async function InvitePainter(req) {
        const project = await projectService.InvitePainter(req.body.contractorId, req.body.projectId);

        // add a url to the message for the contractor to click
        const message = await messageService.SendNewMessage(
            req.session.userId,
            req.body.contractorId,
            req.body.message.trim() + ` [view project](${process.env.BASE_URL}/view-project/${project._id})`,
            true
        );

        return {
            status: constants._2xx._200.status,
            content: project.toFrontEnd(),
            ioEmitterName: constants.ioEmitters.newMessage,
            ioSendTo: [req.session.userId, req.body.contractorId],
            ioContent: message,
        };
    }

    async function GetChargeDetails(req) {
        const project = await projectService.SaveProject(req.body, req.session.userId);

        let chargeDetails = await projectService.GetChargeDetails(project.selectedProposal, project.promoCode);

        return { status: constants._2xx._200.status, content: chargeDetails.toFrontEnd() };
    }

    async function UpsertOrder(req) {
        req.body.status = 'awaitingDownPaymentConfirmation';
        const project = await projectService.SaveProject(req.body, req.session.userId);
        const clientSecret = await orderService.UpsertOrderFromProject(project);
        return { status: constants._2xx._200.status, content: { clientSecret: clientSecret } };
    }

    async function UpgradeProjectSchema(req) {
        req.body = await projectUpdate.updateVersionFromObject(req.body);
        return { status: constants._2xx._200.status, content: req.body };
    }
})();
