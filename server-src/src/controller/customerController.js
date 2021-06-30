(function () {
    'use strict';

    const constants = require('../config/constants');
    const customerService = require('../service/customerService');
    const homepainterSessions = require('../config/sessions');

    module.exports = {
        UpsertCustomer: UpsertCustomer,
        RetrievePaintersList: RetrievePaintersList,
        GeneralFeedback: GeneralFeedback,
        CompleteProject: CompleteProject,
        BecomeAnAgent: BecomeAnAgent,
        ApproveDenyAgent: ApproveDenyAgent,
    };

    async function UpsertCustomer(req, res) {
        try {
            const customer = await customerService.SaveCustomer(req.body);
            homepainterSessions.Login(req, res, customer);
            return { status: constants._2xx._200.status, content: customer.toFrontEnd() };
        } catch (e) {
            if (e.message.includes('duplicate key error') && e.message.includes('email.address')) {
                return { status: constants._4xx._409.status, content: constants._4xx._409.reason };
            }
            throw e;
        }
    }

    async function RetrievePaintersList(req) {
        const contractors = await customerService.RetrievePaintersList(req.params.commaSeparatedList.split(','));
        return { status: constants._2xx._200.status, content: contractors };
    }

    async function GeneralFeedback(req) {
        const resp = await customerService.CreateGeneralFeedback(req.body, req.session.userId);
        return { status: constants._2xx._200.status, content: resp || constants._2xx._200.reason };
    }

    async function CompleteProject(req) {
        const resp = await customerService.CompleteProject(req.session.userId, req.body);

        return { status: constants._2xx._200.status, content: resp || constants._2xx._200.reason };
    }

    async function BecomeAnAgent(req, res) {
        try {
            const customer = await customerService.CreateAgent(req.body);
            homepainterSessions.Login(req, res, customer);
            return { status: constants._2xx._200.status, content: customer.toFrontEnd() };
        } catch (e) {
            if (e.message.includes('duplicate key error') && e.message.includes('email.address')) {
                return { status: constants._4xx._409.status, content: constants._4xx._409.reason };
            }
            throw e;
        }
    }

    async function ApproveDenyAgent(req) {
        const info = await customerService.ApproveDenyAgent(req.body);
        return { status: constants._2xx._200.status, content: info || constants._2xx._200.reason };
    }
})();
