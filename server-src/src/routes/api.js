(function () {
    'use strict';

    const bodyParser = require('body-parser');
    const mongoSanitize = require('express-mongo-sanitize');
    const router = require('express').Router();
    const csurf = require('csurf');
    router.use(bodyParser.json());
    router.use(mongoSanitize());
    router.use(csurf({}));

    const guards = require('../guards/authGuard');
    const locationController = require('../controller/locationController');
    const contactController = require('../controller/contactController');
    const customerController = require('../controller/customerController');
    const contractorController = require('../controller/contractorController');
    const projectController = require('../controller/projectController');
    const messageController = require('../controller/messagesController');
    const stripeController = require('../controller/stripeController');
    const wrap = require('../config/middleware.js').controllerWrapper;

    const customerVal = require('../validation/customerValidation');
    const contractorVal = require('../validation/contractorValidation');
    const contactVal = require('../validation/contactValidation');
    const locationVal = require('../validation/locationValidation');
    const projectVal = require('../validation/projectValidation');
    const messageVal = require('../validation/messageValidation');

    router.get('/is-area-serviced/:zipCode',               guards.any,        wrap(locationVal.ZipCodeProvided, locationController.IsAreaServiced));
    router.get('/room-height/:zipCode/:jobType/:roomType', guards.any,        wrap(locationVal.ZipCodeJobTypeRoomTypeProvided, locationController.GetRoomHeights));
    router.get('/room-size/:zipCode/:jobType/:roomType',   guards.any,        wrap(locationVal.ZipCodeJobTypeRoomTypeProvided, locationController.GetRoomSizes));
    router.get('/retrieve-painters/:commaSeparatedList',   guards.any,        wrap(contractorVal.ListOfPainterIds, customerController.RetrievePaintersList));
    router.get('/retrieve-all-projects',                   guards.isCustomer, wrap(null, projectController.RetrieveProjects));
    router.get('/retrieve-project/:projectId',             guards.isCustomer, wrap(projectVal.ProjectId, projectController.GetProject));
    router.get('/retrieve-all-messages',                   guards.isLoggedIn, wrap(null, messageController.RetrieveAllMessages));

    // Anyone related
    router.post('/upgrade-project-schema', guards.any,        wrap(null, projectController.UpgradeProjectSchema));
    router.post('/general-feedback',       guards.any,        wrap(customerVal.Feedback, customerController.GeneralFeedback));
    router.post('/contact-us',             guards.any,        wrap(contactVal.ContactForm, contactController.ContactUs));
    router.post('/send-message',           guards.isLoggedIn, wrap(messageVal.ToAndMessage, messageController.SendMessage));

    // TODO - don't allow any userPlease
    router.post('/approve-deny-customer',   guards.any, wrap(customerVal.ApproveDeny, customerController.ApproveDenyAgent));
    router.post('/approve-deny-contractor', guards.any, wrap(contractorVal.ApproveDeny, contractorController.ApproveDenyContractor));

    // Customer related
    router.get('/stripe/get-publishable-key', guards.isCustomer, wrap(undefined, stripeController.GetPublishableKey));

    router.post('/upsert-customer',           guards.any,        wrap(customerVal.CustomerInProgress, customerController.UpsertCustomer));
    router.post('/save-partial-progress',     guards.isCustomer, wrap(projectVal.ProjectInProgress, projectController.SaveProgress));
    router.post('/save-progress',             guards.isCustomer, wrap(projectVal.Project, projectController.SaveProgress));
    router.post('/save-and-return',           guards.isCustomer, wrap(projectVal.ProjectInProgress, projectController.SaveAndReturnLater));
    router.post('/start-receiving-proposals', guards.isCustomer, wrap(projectVal.Project, projectController.StartReceivingProposals));
    router.post('/get-charge-details',        guards.isCustomer, wrap(projectVal.Project, projectController.GetChargeDetails));
    router.post('/invite-painter',            guards.isCustomer, wrap(projectVal.InvitePainter, projectController.InvitePainter));
    router.post('/upsert-order',              guards.isCustomer, wrap(projectVal.Project, projectController.UpsertOrder));
    router.post('/customer-complete',         guards.isCustomer, wrap(customerVal.JobComplete, customerController.CompleteProject));
    router.post('/share-project',             guards.isCustomer, wrap(projectVal.ShareProject, projectController.ShareProject));

    // Agent related
    router.post('/become-an-agent', guards.isGuest,    wrap(customerVal.Contact, customerController.BecomeAnAgent));

    // Contractor related
    router.get('/stripe/get-client-id-and-state-code', guards.isContractor, wrap(undefined, stripeController.GetClientIdAndStateCode));
    router.get('/retrieve-contractor',                 guards.isContractor, wrap(undefined, contractorController.RetrieveContractor));
    router.get('/retrieve-project-details/:projectId', guards.isContractor, wrap(projectVal.ProjectId, projectController.GetProjectDetailsAndCustomer));

    router.post('/become-a-pro',                       guards.isGuest,      wrap(contractorVal.Application, contractorController.SubmitApplication));
    router.post('/complete-setup',                     guards.isContractor, wrap(contractorVal.CompleteSetup, contractorController.CompleteSetup));
    router.post('/proposal-accept',                    guards.isContractor, wrap(contractorVal.ProposalAccept, contractorController.AcceptProposal));
    router.post('/proposal-decline',                   guards.isContractor, wrap(contractorVal.ProposalDecline, contractorController.DeclineProposal));
    router.post('/submit-project-schedule',            guards.isContractor, wrap(contractorVal.ProjectSchedule, contractorController.SubmitProjectSchedule));
    router.post('/contractor-complete',                guards.isContractor, wrap(contractorVal.ProjectCompletion, contractorController.CompleteProject));

    router.post('/update-insurance-info',               guards.isContractor, wrap(contractorVal.UpdateInsuranceInfo, contractorController.UpdateInsuranceInfo));
    router.get('/retrieve-insurance-info',              guards.isContractor, wrap(null, contractorController.RetrieveInsuranceInfo));
    router.get('/stripe-get-account-link',              guards.isContractor, wrap(null, contractorController.GetStripeAccountLink));

    module.exports = router;
})();
