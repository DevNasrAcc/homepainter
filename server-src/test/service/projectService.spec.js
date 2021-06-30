(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;
    const moment = require('moment');
    const Contractor = require('../../src/dbsmodel/user/user').ContractorDiscriminator;

    describe('ProjectService Test', function () {
        const service = require('../../src/service/projectService');
        const projectRepo = require('../../src/repo/projectRepo');
        const customerRepo = require('../../src/repo/customerRepo');
        const contractorRepo = require('../../src/repo/contractorRepo');
        const promoCodeRepo = require('../../src/repo/promoCodeRepo');
        const tempPhotoRepo = require('../../src/repo/tempPhotoRepo');
        const emailService = require('../../src/service/emailService');
        const authKeyRepo = require('../../src/repo/authKeyRepo');
        const userRepo = require('../../src/repo/userRepo');
        const mongoose = require('mongoose');
        let projectRepoStub,
            contractorRepoStub,
            customerRepoStub,
            promoCodeRepoStub,
            tempPhotoRepoStub,
            userRepoStub,
            emailServiceStub;

        describe('GetProject Test', () => {
            let project;

            beforeEach(() => {
                projectRepoStub = sinon.stub(projectRepo, 'FindOneById');
                project = 'foobar';
            });

            afterEach(() => {
                projectRepoStub.restore();
            });

            it('should return the value returned by projectRepo', async () => {
                projectRepoStub.resolves(project);

                const ret = await service.GetProject('', '', {});

                ret.should.equal(project);
                projectRepoStub.calledOnce.should.be.true;
            });
        });

        describe('SaveProject Test', () => {
            let findProjectStub;
            let existingProject, project, ownerId;
            beforeEach(() => {
                existingProject = {
                    proposals: [
                        { contractor: new Contractor(), price: 1100 },
                        { contractor: new Contractor(), price: 1035 },
                    ],
                };
                project = {
                    owner: {},
                    details: {
                        interior: [{ photos: [{}, {}] }],
                        exterior: [{ photos: [{}, {}] }],
                    },
                };
                ownerId = 'asdf';

                findProjectStub = sinon.stub(projectRepo, 'FindOneById');
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                tempPhotoRepoStub = sinon.stub(tempPhotoRepo, 'Delete');
                projectRepoStub = sinon.stub(projectRepo, 'FindOneAndUpsert').resolves(project);
            });

            afterEach(() => {
                findProjectStub.restore();
                contractorRepoStub.restore();
                tempPhotoRepoStub.restore();
                projectRepoStub.restore();
            });

            it('should save a new project', async () => {
                findProjectStub.resolves(null);

                const ret = await service.SaveProject(project, ownerId);

                ret.should.equal(project);
                findProjectStub.calledOnce.should.be.true;
                contractorRepoStub.called.should.be.false;
                tempPhotoRepoStub.callCount.should.equal(4);
                projectRepoStub.calledOnce.should.be.true;
            });

            it('should save an existing project', async () => {
                project.selectedProposal = existingProject.proposals[0];
                findProjectStub.resolves(existingProject);
                contractorRepoStub.resolves(existingProject.proposals[0].contractor);

                const ret = await service.SaveProject(project, ownerId);

                ret.should.equal(project);
                findProjectStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                tempPhotoRepoStub.callCount.should.equal(4);
                projectRepoStub.calledOnce.should.be.true;
            });

            it('should detect an attempt to modify the price of a proposal', async () => {
                project.selectedProposal = {
                    contractor: existingProject.proposals[0].contractor,
                    price: 100,
                };
                findProjectStub.resolves(existingProject);
                contractorRepoStub.resolves(existingProject.proposals[0].contractor);

                try {
                    await service.SaveProject(project, ownerId);
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(
                        `Customer [${ownerId}] has modified the contractor price for project [${project._id}]`
                    );
                }

                findProjectStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                tempPhotoRepoStub.called.should.be.false;
                projectRepoStub.called.should.be.false;
            });
        });

        describe('GetDiscount Test', () => {
            let mockTwoDaysAgo = new moment().subtract(2, 'days');
            let mockYesterday = new moment().subtract(1, 'days');
            let mockTomorrow = new moment().add(1, 'days');
            let mockInTwoDays = new moment().add(2, 'days');

            beforeEach(() => {
                promoCodeRepoStub = sinon.stub(promoCodeRepo, 'FindPromoCodeByCode');
            });

            afterEach(() => {
                promoCodeRepoStub.restore();
            });

            it('should return if promoCode is undefined', async () => {
                const resp = await service.GetDiscount({}, undefined, {});

                promoCodeRepoStub.called.should.be.false;
                resp.should.equal(0);
            });

            it("should return if the promoCode doesn't exist", async () => {
                promoCodeRepoStub.resolves(undefined);

                const resp = await service.GetDiscount({}, 'promoCode', {});

                promoCodeRepoStub.calledOnce.should.be.true;
                resp.should.equal(0);
            });

            it("should return if it's before the promoCode's start date", async () => {
                promoCodeRepoStub.resolves({
                    starts: mockTomorrow.format(),
                    ends: mockInTwoDays.format(),
                    discount: 35,
                    type: 'amount',
                    code: 'asdf',
                });

                const resp = await service.GetDiscount({}, 'promoCode', {});

                promoCodeRepoStub.calledOnce.should.be.true;
                resp.should.equal(0);
            });

            it("should return if it's past the promoCode's end date", async () => {
                promoCodeRepoStub.resolves({
                    starts: mockTwoDaysAgo.format(),
                    ends: mockYesterday.format(),
                    discount: 35,
                    type: 'amount',
                    code: 'asdf',
                });

                const resp = await service.GetDiscount({}, 'promoCode', {});

                promoCodeRepoStub.calledOnce.should.be.true;
                resp.should.equal(0);
            });

            it('should apply the promo code when type is amount', async () => {
                promoCodeRepoStub.resolves({
                    starts: mockYesterday.format(),
                    ends: mockTomorrow.format(),
                    discount: 35,
                    type: 'amount',
                    code: 'asdf',
                });

                const resp = await service.GetDiscount({ subtotal: 100 }, 'promoCode', {});

                promoCodeRepoStub.calledOnce.should.be.true;
                resp.should.equal(35);
            });

            it('should apply the promo code when type is percent', async () => {
                promoCodeRepoStub.resolves({
                    starts: mockYesterday.format(),
                    ends: mockTomorrow.format(),
                    discount: 0.2,
                    type: 'percent',
                    code: 'asdf',
                });

                const resp = await service.GetDiscount({ contractPrice: 200 }, 'promoCode', {});

                promoCodeRepoStub.calledOnce.should.be.true;
                resp.should.equal(40);
            });

            it('should apply the promo code when type is serviceFeePromo', async () => {
                promoCodeRepoStub.resolves({
                    starts: mockYesterday.format(),
                    ends: mockTomorrow.format(),
                    type: 'serviceFeePromo',
                    code: 'servfee',
                });

                const resp = await service.GetDiscount({ subtotal: 200, serviceFee: 25 }, 'promoCode', {});

                promoCodeRepoStub.calledOnce.should.be.true;
                resp.should.equal(25);
            });

            it('should apply the promo code when start and end dates are undefined', async () => {
                promoCodeRepoStub.resolves({
                    discount: 0.1,
                    type: 'percent',
                    code: 'asdf',
                });

                const resp = await service.GetDiscount({ contractPrice: 200 }, 'promoCode', {});

                promoCodeRepoStub.calledOnce.should.be.true;
                resp.should.equal(20);
            });

            it("should throw an error when promoCode doesn't have a valid type", async () => {
                promoCodeRepoStub.resolves({
                    starts: mockYesterday.format(),
                    ends: mockTomorrow.format(),
                    discount: 0.2,
                    type: 'persent',
                    code: 'asdf',
                });

                try {
                    await service.GetDiscount({ subtotal: 200 }, 'promoCode', {});
                    sinon.assert.fail('function should have thrown');
                } catch (e) {
                    e.message.should.equal('promoCode.type [persent] is not a valid type');
                }
            });
        });

        describe('InvitePainter Test', () => {
            let contractorId, projectId, mongooseSession;
            let project, contractor;
            let contractorRepoStub;

            beforeEach(() => {
                contractorId = '636f6e74726163746f724964';
                projectId = 'projectId';
                mongooseSession = {};

                project = {
                    save: sinon.stub().resolvesThis(),
                    invitedContractors: [],
                    proposals: [],
                    _id: 'foo',
                };
                contractor = {
                    _id: mongoose.Types.ObjectId('636f6e74726163746f724964'),
                    email: { address: 'PaisleyPainters@example.com' },
                };

                projectRepoStub = sinon.stub(projectRepo, 'FindOneById');
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
            });

            afterEach(() => {
                projectRepoStub.restore();
                contractorRepoStub.restore();
            });

            it("should throw an error if project doesn't exist", async () => {
                projectRepoStub.resolves(undefined);

                try {
                    await service.InvitePainter(contractorId, projectId, mongooseSession);
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`project with _id [${projectId}] does not exist`);
                }

                projectRepoStub.calledOnce.should.be.true;
                contractorRepoStub.called.should.be.false;
                project.save.called.should.be.false;
            });

            it("should throw an error if contractor doesn't exist", async () => {
                projectRepoStub.resolves(project);
                contractorRepoStub.resolves(undefined);

                try {
                    await service.InvitePainter(contractorId, projectId, mongooseSession);
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`Contractor with _id [${contractorId}] does not exist`);
                }

                projectRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                project.save.called.should.be.false;
            });

            it('should return project if the contractor has already been invited', async () => {
                project.invitedContractors.push(contractor._id);
                projectRepoStub.resolves(project);
                contractorRepoStub.resolves(contractor);

                const resp = await service.InvitePainter(contractorId, projectId, mongooseSession);

                resp.should.equal(project);
                projectRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                project.save.called.should.be.false;
            });

            it('should return project, add the contractor to invitedContractors', async () => {
                projectRepoStub.resolves(project);
                contractorRepoStub.resolves(contractor);

                const resp = await service.InvitePainter(contractorId, projectId, mongooseSession);

                resp.should.equal(project);
                projectRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                project.save.calledOnce.should.be.true;
            });
        });

        describe('AcceptDeclineProposal Test', () => {
            let userId, reqBody, project;

            beforeEach(() => {
                projectRepoStub = sinon.stub(projectRepo, 'FindOneById');

                userId = '636f6e74726163746f724964';

                reqBody = {
                    projectId: '',
                    price: undefined,
                    message: undefined,
                    feedback: undefined,
                };

                project = {
                    proposals: [],
                    save: sinon.stub().resolvesThis(),
                };
            });

            afterEach(() => {
                projectRepoStub.restore();
            });

            it('should throw when a project is not found', async () => {
                projectRepoStub.resolves(null);

                try {
                    await service.AcceptDeclineProposal(userId, reqBody, false, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`project with id [${reqBody.projectId}] does not exist`);
                }

                projectRepoStub.calledOnce.should.be.true;
                project.save.called.should.be.false;
            });

            it('should return project if a user has already bid', async () => {
                reqBody.price = 1000;
                reqBody.message = 'hello world';
                project.proposals = [{ contractor: mongoose.Types.ObjectId(userId) }];
                projectRepoStub.resolves(project);

                const resp = await service.AcceptDeclineProposal(userId, reqBody, true);

                projectRepoStub.calledOnce.should.be.true;
                project.save.called.should.be.false;
                expect(resp).to.equal(project);
            });

            it('should accept a proposal', async () => {
                reqBody.price = 1000;
                reqBody.message = 'hello world';
                projectRepoStub.resolves(project);

                const resp = await service.AcceptDeclineProposal(userId, reqBody, true);

                projectRepoStub.calledOnce.should.be.true;
                project.save.calledOnce.should.be.true;
                project.save.calledOnce.should.be.true;
                expect(resp).to.equal(project);
            });

            it('should decline a proposal', async () => {
                reqBody.feedback = 'hello world';
                projectRepoStub.resolves(project);

                const resp = await service.AcceptDeclineProposal(userId, reqBody, false);

                projectRepoStub.calledOnce.should.be.true;
                project.save.calledOnce.should.be.true;
                project.save.calledOnce.should.be.true;
                expect(resp).to.equal(project);
            });
        });

        describe('GetChargeDetails Test', () => {
            let getDiscountStub;

            beforeEach(() => {
                getDiscountStub = sinon.stub(service, 'GetDiscount');
            });

            afterEach(() => {
                getDiscountStub.restore();
            });

            it('should return charge details for project less than $1000', async () => {
                getDiscountStub.resolves(0);
                const proposal = { price: 500 };

                const resp = await service.GetChargeDetails(proposal, undefined, {});

                expect(resp.contractPrice).to.equal(500);
                expect(resp.discount).to.equal(0);
                expect(resp.serviceFee).to.equal(0);
                expect(resp.subtotal).to.equal(500);
                expect(resp.taxRate).to.equal(0.07);
                // tax = 1800 * .07  (excluding service fee)
                expect(resp.tax).to.equal(35);
                expect(resp.total).to.equal(535);
                expect(resp.downPaymentPercent).to.equal(0.1);
                expect(resp.downPaymentAmount).to.equal(53.5);
                expect(resp.total - resp.downPaymentAmount).to.equal(535 - 53.5);
                expect(resp.payoutPercent).to.equal(0.85);
                expect(resp.payoutAmount).to.equal(425);
                expect(resp.downPaymentPayoutAmount).to.equal(42.5);

                getDiscountStub.called.should.be.true;
            });

            it('should return charge details when there is a promoCode for project less than $2500', async () => {
                getDiscountStub.resolves(50);
                const proposal = { price: 1800 };

                const resp = await service.GetChargeDetails(proposal, 'asdf', {});

                expect(resp.contractPrice).to.equal(1800);
                expect(resp.serviceFee).to.equal(50);
                expect(resp.subtotal).to.equal(1800 + 50 - 50);
                expect(resp.taxRate).to.equal(0.07);
                // tax = 1800 * .07  (excluding service fee)
                expect(resp.tax).to.equal(126);
                expect(resp.total).to.equal(1926);
                expect(resp.downPaymentPercent).to.equal(0.1);
                expect(resp.downPaymentAmount).to.equal(192.6);
                expect(resp.total - resp.downPaymentAmount).to.equal(1733.4);
                expect(resp.payoutPercent).to.equal(0.85);
                expect(resp.payoutAmount).to.equal(1530);
                expect(resp.downPaymentPayoutAmount).to.equal(153);

                getDiscountStub.calledOnce.should.be.true;
            });

            it('should return charge details for project less than $4000', async () => {
                getDiscountStub.resolves(0);
                const proposal = { price: 3500 };

                const resp = await service.GetChargeDetails(proposal, undefined, {});

                expect(resp.contractPrice).to.equal(3500);
                expect(resp.discount).to.equal(0);
                expect(resp.serviceFee).to.equal(75);
                expect(resp.subtotal).to.equal(3575);
                expect(resp.taxRate).to.equal(0.07);
                // tax = 1800 * .07  (excluding service fee)
                expect(resp.tax).to.equal(245);
                expect(resp.total).to.equal(3820);
                expect(resp.downPaymentPercent).to.equal(0.1);
                expect(resp.downPaymentAmount).to.equal(382);
                expect(resp.total - resp.downPaymentAmount).to.equal(3438);
                expect(resp.payoutPercent).to.equal(0.85);
                expect(resp.payoutAmount).to.equal(2975);
                expect(resp.downPaymentPayoutAmount).to.equal(297.5);

                getDiscountStub.called.should.be.true;
            });

            it('should return charge details for project less than $10000', async () => {
                getDiscountStub.resolves(0);
                const proposal = { price: 10000 };

                const resp = await service.GetChargeDetails(proposal, undefined, {});

                expect(resp.contractPrice).to.equal(10000);
                expect(resp.discount).to.equal(0);
                expect(resp.serviceFee).to.equal(100);
                expect(resp.subtotal).to.equal(10100);
                expect(resp.taxRate).to.equal(0.07);
                // tax = 1800 * .07  (excluding service fee)
                expect(resp.tax).to.equal(700);
                expect(resp.total).to.equal(10800);
                expect(resp.downPaymentPercent).to.equal(0.1);
                expect(resp.downPaymentAmount).to.equal(1080);
                expect(resp.total - resp.downPaymentAmount).to.equal(9720);
                expect(resp.payoutPercent).to.equal(0.85);
                expect(resp.payoutAmount).to.equal(8500);
                expect(resp.downPaymentPayoutAmount).to.equal(850);

                getDiscountStub.called.should.be.true;
            });
        });

        describe('GetAllProjects Test', () => {
            beforeEach(() => {
                projectRepoStub = sinon.stub(projectRepo, 'FindAllProjectsUserHasAccessTo');
            });

            afterEach(() => {
                projectRepoStub.restore();
            });

            it('should return an empty array if the user has no projects', async () => {
                const projectRepoResolve = [];
                projectRepoStub.resolves(projectRepoResolve);

                const resp = await service.GetAllProjects('some user id', {});

                projectRepoStub.calledOnce.should.be.true;
                expect(resp).to.equal(projectRepoResolve);
            });

            it('should return an array with censored info if the user has projects', async () => {
                const projectRepoResolve = [{ toFrontEnd: sinon.stub().returnsThis() }];
                projectRepoStub.resolves(projectRepoResolve);

                const resp = await service.GetAllProjects('some user id', {});

                projectRepoStub.calledOnce.should.be.true;
                projectRepoResolve[0].toFrontEnd.calledOnce.should.be.true;
                expect(resp).to.equal(projectRepoResolve);
            });
        });

        describe('ShareProject Test', () => {
            let customerUpdateStub, authKeyRepoStub;
            let userId, firstName, lastName, email, message, projectid, mongooseSession;
            let invitee, owner, project;
            let JWT_ACCOUNT_SECURITY_SECRET;

            beforeEach(() => {
                customerRepoStub = sinon.stub(customerRepo, 'FindOneByEmail');
                customerUpdateStub = sinon.stub(customerRepo, 'FindOneAndUpsert');
                userRepoStub = sinon.stub(userRepo, 'FindOneById');
                projectRepoStub = sinon.stub(projectRepo, 'FindOneById');
                authKeyRepoStub = sinon.stub(authKeyRepo, 'CreateLoginAuthKey');
                emailServiceStub = sinon.stub(emailService, 'CustomerShareProject');

                invitee = { toObject: sinon.stub().returnsThis(), _id: mongoose.Types.ObjectId('bbbbbbbbbbbb') };
                owner = { toObject: sinon.stub().returnsThis(), _id: mongoose.Types.ObjectId('aaaaaaaaaaaa') };
                project = {
                    toObject: sinon.stub().returnsThis(),
                    save: sinon.stub().returnsThis(),
                    owner: owner._id,
                    invitees: [],
                };

                userId = 'foo';
                firstName = 'John';
                lastName = 'Doe';
                email = 'j.doe@example.com';
                projectid = 'cbb3a76d-5720-4f68-969b-eb8e0e77de02';
                mongooseSession = {};
                JWT_ACCOUNT_SECURITY_SECRET = process.env.JWT_ACCOUNT_SECURITY_SECRET;
            });

            afterEach(() => {
                customerRepoStub.restore();
                customerUpdateStub.restore();
                userRepoStub.restore();
                projectRepoStub.restore();
                authKeyRepoStub.restore();
                emailServiceStub.restore();
                process.env.JWT_ACCOUNT_SECURITY_SECRET = JWT_ACCOUNT_SECURITY_SECRET;
            });

            it("should create a new customer from the invitee if one doesn't exist", async () => {
                process.env.JWT_ACCOUNT_SECURITY_SECRET = 'asdf';
                customerRepoStub.resolves(null);
                customerUpdateStub.resolves(invitee);
                userRepoStub.resolves(owner);
                project.invitees = [];
                projectRepoStub.resolves(project);
                authKeyRepoStub.resolves({ key: 'asdf' });

                await service.ShareProject(userId, firstName, lastName, email, message, projectid);

                customerRepoStub.calledOnce.should.be.true;
                customerUpdateStub.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
                projectRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                invitee.toObject.calledOnce.should.be.true;
                owner.toObject.calledOnce.should.be.true;
                project.toObject.calledOnce.should.be.true;
                project.save.calledOnce.should.be.true;
            });

            it("should throw if owner doesn't exist", async () => {
                customerRepoStub.resolves(invitee);
                userRepoStub.resolves(null);

                try {
                    await service.ShareProject(userId, firstName, lastName, email, message, projectid, mongooseSession);
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`user with _id [${userId}] does not exist`);
                }

                customerRepoStub.calledOnce.should.be.true;
                customerUpdateStub.called.should.be.false;
                userRepoStub.calledOnce.should.be.true;
                projectRepoStub.called.should.be.false;
                emailServiceStub.called.should.be.false;
                invitee.toObject.called.should.be.false;
                owner.toObject.called.should.be.false;
                project.toObject.called.should.be.false;
                project.save.called.should.be.false;
            });

            it("should throw if project doesn't exist", async () => {
                customerRepoStub.resolves(invitee);
                userRepoStub.resolves(owner);
                projectRepoStub.resolves(null);

                try {
                    await service.ShareProject(userId, firstName, lastName, email, message, projectid, mongooseSession);
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`project with id [${projectid}] for user [${userId}] does not exist`);
                }

                customerRepoStub.calledOnce.should.be.true;
                customerUpdateStub.called.should.be.false;
                userRepoStub.calledOnce.should.be.true;
                projectRepoStub.calledOnce.should.be.true;
                emailServiceStub.called.should.be.false;
                invitee.toObject.called.should.be.false;
                owner.toObject.called.should.be.false;
                project.toObject.called.should.be.false;
                project.save.called.should.be.false;
            });

            it('should send the email', async () => {
                customerRepoStub.resolves(invitee);
                userRepoStub.resolves(owner);
                projectRepoStub.resolves(project);

                await service.ShareProject(userId, firstName, lastName, email, message, projectid, mongooseSession);

                customerRepoStub.calledOnce.should.be.true;
                customerUpdateStub.called.should.be.false;
                userRepoStub.calledOnce.should.be.true;
                projectRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                invitee.toObject.calledOnce.should.be.true;
                owner.toObject.calledOnce.should.be.true;
                project.toObject.calledOnce.should.be.true;
                project.save.calledOnce.should.be.true;
            });
        });
    });
})();
