(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('ProjectController Test', () => {
        const customerService = require('../../src/service/customerService');
        const constants = require('../../src/config/constants');
        const contractorService = require('../../src/service/contractorService');
        const controller = require('../../src/controller/projectController');
        const emailService = require('../../src/service/emailService');
        const locationService = require('../../src/service/locationService');
        const projectAnalyticsService = require('../../src/service/projectAnalyticsService');
        const projectService = require('../../src/service/projectService');
        const projectUpdate = require('../../src/dbsmodel/project/project.functions');
        const orderService = require('../../src/service/orderService');
        const stripeService = require('../../src/service/stripeService');
        const messageService = require('../../src/service/messageService');

        let customerServiceStub,
            emailServiceStub,
            locationServiceStub,
            projectAnalyticsServiceStub,
            contractorServiceStub,
            projectServiceStub,
            messageServiceStub,
            orderServiceStub;

        const req = { params: {}, body: {}, session: { userId: '' }, mongooseSession: {} };
        const res = {};

        describe('GetProject Test', () => {
            let project;
            beforeEach(() => {
                projectServiceStub = sinon.stub(projectService, 'GetProject');
                project = {
                    populate: sinon.stub(),
                    execPopulate: sinon.stub(),
                    toFrontEnd: sinon.stub().returnsThis(),
                };
            });

            afterEach(() => {
                projectServiceStub.restore();
            });

            it('should return the project', async () => {
                projectServiceStub.resolves(project);

                const { status, content } = await controller.GetProject(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(project);
                projectServiceStub.calledOnce.should.be.true;
                project.populate.calledTwice.should.be.true;
                project.execPopulate.calledOnce.should.be.true;
                project.toFrontEnd.calledOnce.should.be.true;
            });

            it('should return an empty object', async () => {
                projectServiceStub.resolves(null);

                const { status, content } = await controller.GetProject(req);

                status.should.equal(constants._2xx._200.status);
                content.should.deep.equal({});
                projectServiceStub.calledOnce.should.be.true;
                project.populate.called.should.be.false;
                project.execPopulate.called.should.be.false;
                project.toFrontEnd.called.should.be.false;
            });
        });

        describe('GetProjectDetailsAndCustomer', () => {
            beforeEach(() => {
                projectServiceStub = sinon.stub(projectService, 'GetProject');
            });

            afterEach(() => {
                projectServiceStub.restore();
            });

            it('should throw if a project is not found', async () => {
                projectServiceStub.resolves(null);

                try {
                    await controller.GetProjectDetailsAndCustomer(req);
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.be.a('string');
                }

                projectServiceStub.calledOnce.should.be.true;
            });

            it('should resolve the details and customer successfully', async () => {
                const project = {
                    toContractorVisibleFields: sinon.stub(),
                    populate: sinon.stub(),
                    execPopulate: sinon.stub(),
                    proposals: [
                        {
                            contractor: { _id: { toString: sinon.stub().returns('asdf') } },
                        },
                    ],
                };
                projectServiceStub.resolves(project);

                const resp = await controller.GetProjectDetailsAndCustomer(req);

                projectServiceStub.calledOnce.should.be.true;
                project.toContractorVisibleFields.calledOnce.should.be.true;
                project.populate.calledOnce.should.be.true;
                project.execPopulate.calledOnce.should.be.true;
                resp.status.should.equal(constants._2xx._200.status);
            });
        });

        describe('RetrieveProjects Test', () => {
            beforeEach(() => {
                projectServiceStub = sinon.stub(projectService, 'GetAllProjects');
            });

            afterEach(() => {
                projectServiceStub.restore();
            });

            it('should retrieve all projects for a user', async () => {
                const projects = [];
                projectServiceStub.resolves(projects);

                const { status, content } = await controller.RetrieveProjects(req);

                projectServiceStub.calledOnce.should.be.true;
                expect(status).to.equal(constants._2xx._200.status);
                expect(content).to.equal(projects);
            });
        });

        describe('SaveProgress Test', () => {
            let project;
            beforeEach(() => {
                projectServiceStub = sinon.stub(projectService, 'SaveProject');
                project = { toFrontEnd: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                projectServiceStub.restore();
            });

            it('should return project', async () => {
                projectServiceStub.resolves(project);

                const { status, content } = await controller.SaveProgress(req);

                projectServiceStub.calledOnce.should.be.true;
                project.toFrontEnd.calledOnce.should.be.true;
                expect(status).to.equal(constants._2xx._200.status);
                expect(content).to.equal(project);
            });
        });

        describe('SaveAndReturnLater Test', () => {
            let project, customer;
            beforeEach(() => {
                projectServiceStub = sinon.stub(projectService, 'SaveProject');
                customerServiceStub = sinon.stub(customerService, 'RetrieveCustomer');
                emailServiceStub = sinon.stub(emailService, 'CustomerReturnToProject');
                project = {
                    toObject: sinon.stub().returnsThis(),
                    toFrontEnd: sinon.stub().returnsThis(),
                };
                customer = { toObject: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                projectServiceStub.restore();
                customerServiceStub.restore();
                emailServiceStub.restore();
            });

            it('should return the project', async () => {
                projectServiceStub.resolves(project);
                customerServiceStub.resolves(customer);

                const { status, content } = await controller.SaveAndReturnLater(req);

                projectServiceStub.calledOnce.should.be.true;
                customerServiceStub.calledOnce.should.be.true;
                project.toFrontEnd.calledOnce.should.be.true;
                project.toObject.calledOnce.should.be.true;
                customer.toObject.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(project);
            });
        });

        describe('ShareProject Test', () => {
            beforeEach(() => {
                projectServiceStub = sinon.stub(projectService, 'ShareProject');
            });

            afterEach(() => {
                projectServiceStub.restore();
            });

            it('should return 200', async () => {
                const { status, content } = await controller.ShareProject(req);

                projectServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('StartReceivingProposals Test', () => {
            let project, customer;
            let getProjectStub, saveProjectStub;
            let req;
            beforeEach(() => {
                getProjectStub = sinon.stub(projectService, 'GetProject');
                locationServiceStub = sinon.stub(locationService, 'FindOneByZipCode');
                projectAnalyticsServiceStub = sinon.stub(projectAnalyticsService, 'FillAnalytics');
                saveProjectStub = sinon.stub(projectService, 'SaveProject');
                customerServiceStub = sinon.stub(customerService, 'RetrieveCustomer');
                contractorServiceStub = sinon.stub(contractorService, 'RequestProposals');
                emailServiceStub = sinon.stub(emailService, 'CustomerReturnToProject');
                project = {
                    toFrontEnd: sinon.stub().returnsThis(),
                    toObject: sinon.stub().returnsThis(),
                };
                customer = { toObject: sinon.stub().returnsThis() };
                req = {
                    body: { details: { address: {} } },
                    session: {},
                    mongooseSession: {},
                };
            });

            afterEach(() => {
                getProjectStub.restore();
                locationServiceStub.restore();
                projectAnalyticsServiceStub.restore();
                saveProjectStub.restore();
                customerServiceStub.restore();
                contractorServiceStub.restore();
                emailServiceStub.restore();
            });

            it('should return 200 and do nothing if the user is already inviting painters', async () => {
                project.status = 'invitingPainters';
                getProjectStub.resolves(project);
                saveProjectStub.resolves(project);
                customerServiceStub.resolves(customer);

                const { status, content } = await controller.StartReceivingProposals(req);

                getProjectStub.calledOnce.should.be.true;
                locationServiceStub.called.should.be.false;
                projectAnalyticsServiceStub.called.should.be.false;
                saveProjectStub.called.should.be.false;
                customerServiceStub.called.should.be.false;
                contractorServiceStub.called.should.be.false;
                emailServiceStub.called.should.be.false;
                project.toFrontEnd.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                customer.toObject.calledOnce.should.be.false;
                project.toObject.calledOnce.should.be.false;
                project.toFrontEnd.calledOnce.should.be.true;
                content.should.equal(project);
            });

            it('should return 200 and invite contractors', async () => {
                project.status = 'creating';
                getProjectStub.resolves(project);
                saveProjectStub.resolves(project);
                customerServiceStub.resolves(customer);

                const { status, content } = await controller.StartReceivingProposals(req);

                getProjectStub.calledOnce.should.be.true;
                locationServiceStub.calledOnce.should.be.true;
                projectAnalyticsServiceStub.calledOnce.should.be.true;
                saveProjectStub.calledOnce.should.be.true;
                customerServiceStub.calledOnce.should.be.true;
                contractorServiceStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                project.toFrontEnd.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(project);
                req.body.status.should.equal('invitingPainters');
                customer.toObject.calledOnce.should.be.true;
                project.toObject.calledOnce.should.be.true;
                project.toFrontEnd.calledOnce.should.be.true;
            });
        });

        describe('InvitePainter Test', () => {
            let project;

            beforeEach(() => {
                project = { toFrontEnd: sinon.stub().returnsThis() };
                projectServiceStub = sinon.stub(projectService, 'InvitePainter');
                messageServiceStub = sinon.stub(messageService, 'SendNewMessage');
            });

            afterEach(() => {
                projectServiceStub.restore();
                messageServiceStub.restore();
            });

            it('should return 200', async () => {
                req.body.message = '';
                projectServiceStub.resolves(project);

                const { status, content } = await controller.InvitePainter(req);

                projectServiceStub.calledOnce.should.be.true;
                messageServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(project);
            });
        });

        describe('GetChargeDetails Test', () => {
            let SaveProjectStub, GetChargeDetailsStub;
            let project, chargeDetails;

            beforeEach(() => {
                SaveProjectStub = sinon.stub(projectService, 'SaveProject');
                GetChargeDetailsStub = sinon.stub(projectService, 'GetChargeDetails');
                project = {};
                chargeDetails = { toFrontEnd: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                SaveProjectStub.restore();
                GetChargeDetailsStub.restore();
            });

            it('should return details', async () => {
                SaveProjectStub.resolves(chargeDetails);
                GetChargeDetailsStub.returns(chargeDetails);

                const { status, content } = await controller.GetChargeDetails(req);

                SaveProjectStub.calledOnce.should.be.true;
                GetChargeDetailsStub.calledOnce.should.be.true;
                chargeDetails.toFrontEnd.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(chargeDetails);
            });
        });

        describe('UpsertOrder Test', () => {
            let project, clientSecret;
            beforeEach(() => {
                projectServiceStub = sinon.stub(projectService, 'SaveProject');
                orderServiceStub = sinon.stub(orderService, 'UpsertOrderFromProject');
                project = { selectedProposal: { contractor: 'bob' } };
                clientSecret = 'stripeClientSecret';
            });

            afterEach(() => {
                projectServiceStub.restore();
                orderServiceStub.restore();
            });

            it('should update an order and save the paymentIntent id', async () => {
                projectServiceStub.resolves(project);
                orderServiceStub.resolves(clientSecret);

                const resp = await controller.UpsertOrder(req, res);

                projectServiceStub.calledOnce.should.be.true;
                orderServiceStub.calledOnce.should.be.true;
                resp.status.should.equal(constants._2xx._200.status);
                resp.content.should.deep.equal({ clientSecret: clientSecret });
            });
        });

        describe('UpgradeProjectSchema Test', () => {
            let productUpdateStub;

            beforeEach(() => {
                productUpdateStub = sinon.stub(projectUpdate, 'updateVersionFromObject');
            });

            afterEach(() => {
                productUpdateStub.restore();
            });

            it('should return 200', async () => {
                req.body.cart = { project: {} };
                const upgradeUserVersionReturn = { foo: 'bar' };
                productUpdateStub.returns(upgradeUserVersionReturn);

                const resp = await controller.UpgradeProjectSchema(req, res);

                productUpdateStub.calledOnce.should.be.true;
                resp.status.should.equal(constants._2xx._200.status);
                resp.content.should.equal(req.body);
            });
        });
    });
})();
