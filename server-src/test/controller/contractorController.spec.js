(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('ContractorController Test', function () {
        const crypto = require('crypto');
        const constants = require('../../src/config/constants');
        const controller = require('../../src/controller/contractorController');
        const contractorService = require('../../src/service/contractorService');
        const projectService = require('../../src/service/projectService');
        const messageService = require('../../src/service/messageService');
        const emailService = require('../../src/service/emailService');
        const homepainterSessions = require('../../src/config/sessions');
        let contractorServiceStub, projectServiceStub, messageServiceStub, emailServiceStub, sessionsStub;

        const req = { params: {}, body: {}, session: { userId: '' }, mongooseSession: {} };

        describe('SubmitApplication Test', () => {
            let contractor;
            beforeEach(() => {
                contractorServiceStub = sinon.stub(contractorService, 'SubmitApplication');
                sessionsStub = sinon.stub(homepainterSessions, 'Login');
                contractor = { toFrontEnd: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                contractorServiceStub.restore();
                sessionsStub.restore();
            });

            it('should return 200', async () => {
                contractorServiceStub.resolves(contractor);

                const { status, content } = await controller.SubmitApplication(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(contractor);
                contractorServiceStub.calledOnce.should.be.true;
                sessionsStub.calledOnce.should.be.true;
                contractor.toFrontEnd.calledOnce.should.be.true;
            });

            it('should return 409', async () => {
                contractorServiceStub.rejects(new Error('duplicate key error email.address'));

                const { status, content } = await controller.SubmitApplication(req);

                status.should.equal(constants._4xx._409.status);
                content.should.equal(constants._4xx._409.reason);
                contractorServiceStub.calledOnce.should.be.true;
                sessionsStub.called.should.be.false;
                contractor.toFrontEnd.called.should.be.false;
            });

            it('should throw', async () => {
                contractorServiceStub.throws(new Error('message'));

                try {
                    await controller.SubmitApplication(req);
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal('message');
                }

                contractorServiceStub.calledOnce.should.be.true;
                sessionsStub.called.should.be.false;
                contractor.toFrontEnd.called.should.be.false;
            });
        });

        describe('ApproveDenyContractor Test', () => {
            beforeEach(() => {
                contractorServiceStub = sinon.stub(contractorService, 'ApproveDenyContractor');
            });

            afterEach(() => {
                contractorServiceStub.restore();
            });

            it('should return resp', async () => {
                const resp = 'foo';
                contractorServiceStub.returns(resp);

                const { status, content } = await controller.ApproveDenyContractor(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(resp);
            });

            it('should return 200', async () => {
                const { status, content } = await controller.ApproveDenyContractor(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('CompleteSetup Test', () => {
            beforeEach(() => {
                contractorServiceStub = sinon.stub(contractorService, 'CompleteSetup');
            });

            afterEach(() => {
                contractorServiceStub.restore();
                req.body = {};
                req.session = {};
            });

            it('should return 403 on invalid digest', async () => {
                req.session.csrfSecret = '';
                req.session.userId = '';
                req.body.stateValue = '';

                const { status, content } = await controller.CompleteSetup(req);

                contractorServiceStub.called.should.be.false;
                status.should.equal(constants._4xx._403.status);
                content.should.equal(constants._4xx._403.reason);
            });

            it('should return 200 on success', async () => {
                req.session.csrfSecret = 'some secret';
                req.session.userId = 'some id';
                req.body.stateValue = crypto
                    .createHash('sha256')
                    .update(req.session.csrfSecret)
                    .update(req.session.userId)
                    .digest('hex');

                const { status, content } = await controller.CompleteSetup(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('RetrieveContractor Test', () => {
            let contractor;

            beforeEach(() => {
                contractorServiceStub = sinon.stub(contractorService, 'RetrieveContractor');
                contractor = { toContractorVisibleFields: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                contractorServiceStub.restore();
            });

            it('should return the contractor', async () => {
                contractorServiceStub.resolves(contractor);

                const { status, content } = await controller.RetrieveContractor(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(contractor);
            });

            it('should return an empty object', async () => {
                const { status, content } = await controller.RetrieveContractor(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.deep.equal({});
            });
        });

        describe('AcceptProposal Test', () => {
            beforeEach(() => {
                contractorServiceStub = sinon.stub(contractorService, 'GetContractor');
                projectServiceStub = sinon.stub(projectService, 'AcceptDeclineProposal');
                messageServiceStub = sinon.stub(messageService, 'SendNewMessage');
                emailServiceStub = sinon.stub(emailService, 'CustomerNewProposal');
            });

            afterEach(() => {
                contractorServiceStub.restore();
                projectServiceStub.restore();
                messageServiceStub.restore();
                emailServiceStub.restore();
            });

            it('should accept a proposal', async () => {
                const projectResolve = { owner: { toString: sinon.stub().returns('') }, toObject: sinon.stub() };
                contractorServiceStub.resolves({});
                projectServiceStub.resolves(projectResolve);
                messageServiceStub.resolves({ to: { toObject: sinon.stub() } });

                const resp = await controller.AcceptProposal(req);

                contractorServiceStub.calledOnce.should.be.true;
                projectServiceStub.calledOnce.should.be.true;
                messageServiceStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;

                expect(resp.status).to.equal(constants._2xx._201.status);
                expect(resp.content).to.equal(constants._2xx._201.reason);
            });
        });

        describe('DeclineProposal Test', () => {
            beforeEach(() => {
                contractorServiceStub = sinon.stub(contractorService, 'GetContractor');
                projectServiceStub = sinon.stub(projectService, 'AcceptDeclineProposal');
                messageServiceStub = sinon.stub(messageService, 'SendNewMessage');
            });

            afterEach(() => {
                contractorServiceStub.restore();
                projectServiceStub.restore();
                messageServiceStub.restore();
            });

            it('should accept a proposal', async () => {
                const projectResolve = { owner: { toString: sinon.stub().returns('') } };
                contractorServiceStub.resolves({});
                projectServiceStub.resolves(projectResolve);
                messageServiceStub.resolves({});

                const resp = await controller.DeclineProposal(req);

                contractorServiceStub.calledOnce.should.be.true;
                projectServiceStub.calledOnce.should.be.true;
                messageServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._201.status);
                expect(resp.content).to.equal(constants._2xx._201.reason);
            });
        });

        describe('SubmitProjectSchedule Test', () => {
            let message;

            beforeEach(() => {
                message = { to: 'a', from: 'b' };
                contractorServiceStub = sinon.stub(contractorService, 'SubmitProjectSchedule').resolves(message);
            });

            afterEach(() => {
                contractorServiceStub.restore();
            });

            it('should return 200', async () => {
                const { status, content } = await controller.SubmitProjectSchedule(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._201.status);
                content.should.equal(constants._2xx._201.reason);
            });
        });

        describe('CompleteProject Test', () => {
            let message;

            beforeEach(() => {
                message = { to: 'a', from: 'b' };
                contractorServiceStub = sinon.stub(contractorService, 'CompleteProject').resolves(message);
            });

            afterEach(() => {
                contractorServiceStub.restore();
            });

            it('should return 200', async () => {
                const { status, content } = await controller.CompleteProject(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('UpdateInsuranceInfo Test', () => {
            beforeEach(() => {
                contractorServiceStub = sinon.stub(contractorService, 'UpdateInsuranceInfo');
            });

            afterEach(() => {
                contractorServiceStub.restore();
            });

            it('should return 200', async () => {
                contractorServiceStub.resolves();

                const { status, content } = await controller.UpdateInsuranceInfo(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('RetrieveInsuranceInfo Test', () => {
            beforeEach(() => {
                contractorServiceStub = sinon.stub(contractorService, 'RetrieveInsuranceInfo');
            });

            afterEach(() => {
                contractorServiceStub.restore();
            });

            it('should return 200', async () => {
                contractorServiceStub.resolves();

                const { status, content } = await controller.RetrieveInsuranceInfo(req);

                contractorServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });
    });
})();
