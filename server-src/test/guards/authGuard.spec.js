(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('authGuard Test', function () {
        const guard = require('../../src/guards/authGuard');
        const constants = require('../../src/config/constants');
        const homepainterSessions = require('../../src/config/sessions');
        let serviceStub;

        const res = {};
        const req = { session: {} };

        afterEach(() => {});

        describe('any Test', () => {
            it('should let anything through', () => {
                const nextStub = sinon.stub();

                guard.any({}, {}, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.equal(undefined);
            });
        });

        describe('isGuest Test', () => {
            let nextStub;

            beforeEach(() => {
                serviceStub = sinon.stub(homepainterSessions, 'IsLoggedIn');
                nextStub = sinon.stub();
            });

            afterEach(() => {
                serviceStub.restore();
            });

            it('should call next with an error if a user tries to access a resource as anything other than a guest', () => {
                serviceStub.returns(true);

                guard.isGuest(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.be.a('error');
                expect(nextStub.getCall(0).args[0].message).to.equal('EFORBIDDEN');
                expect(nextStub.getCall(0).args[0].code).to.equal('EFORBIDDEN');
            });

            it('should allow access to a resource as a guest', () => {
                serviceStub.returns(false);

                guard.isGuest(req, res, nextStub);
                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.equal(undefined);
            });
        });

        describe('isLoggedIn Test', () => {
            let nextStub;

            beforeEach(() => {
                serviceStub = sinon.stub(homepainterSessions, 'IsLoggedIn');
                nextStub = sinon.stub();
            });

            afterEach(() => {
                serviceStub.restore();
            });

            it('should call next with an error if a user tries to access a resource and is not logged in', () => {
                serviceStub.returns(false);

                guard.isLoggedIn(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.be.a('error');
                expect(nextStub.getCall(0).args[0].message).to.equal('EFORBIDDEN');
                expect(nextStub.getCall(0).args[0].code).to.equal('EFORBIDDEN');
            });

            it('should allow access to a resource if logged in', () => {
                serviceStub.returns(true);

                guard.isLoggedIn(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.equal(undefined);
            });
        });

        describe('isContractor Test', () => {
            let nextStub;

            beforeEach(() => {
                serviceStub = sinon.stub(homepainterSessions, 'IsLoggedIn');
                nextStub = sinon.stub();
            });

            afterEach(() => {
                serviceStub.restore();
            });

            it('should call next with an error if a user is not logged in', () => {
                serviceStub.returns(false);

                guard.isContractor(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.be.a('error');
                expect(nextStub.getCall(0).args[0].message).to.equal('EUNAUTHORIZED');
                expect(nextStub.getCall(0).args[0].code).to.equal('EUNAUTHORIZED');
            });

            it('should call next with an error if a user does not have the required roles', () => {
                req.session.roles = 'rick_rolled';
                serviceStub.returns(true);

                guard.isContractor(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.be.a('error');
                expect(nextStub.getCall(0).args[0].message).to.equal('EUNAUTHORIZED');
                expect(nextStub.getCall(0).args[0].code).to.equal('EUNAUTHORIZED');
            });

            it('should allow access to a resource as a contractor', () => {
                req.session.roles = 'contractor';
                serviceStub.returns(true);

                guard.isContractor(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.equal(undefined);
            });
        });

        describe('isAgent Test', () => {
            let nextStub;

            beforeEach(() => {
                serviceStub = sinon.stub(homepainterSessions, 'IsLoggedIn');
                nextStub = sinon.stub();
            });

            afterEach(() => {
                serviceStub.restore();
            });

            it('should call next with an error if a user is not logged in', () => {
                serviceStub.returns(false);

                guard.isAgent(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.be.a('error');
                expect(nextStub.getCall(0).args[0].message).to.equal('EUNAUTHORIZED');
                expect(nextStub.getCall(0).args[0].code).to.equal('EUNAUTHORIZED');
            });

            it('should call next with an error if a user does not have the required roles', () => {
                req.session.roles = 'rick_rolled';
                serviceStub.returns(true);

                guard.isAgent(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.be.a('error');
                expect(nextStub.getCall(0).args[0].message).to.equal('EUNAUTHORIZED');
                expect(nextStub.getCall(0).args[0].code).to.equal('EUNAUTHORIZED');
            });

            it('should allow access to a resource as an agent', () => {
                req.session.roles = 'customer,agent';
                serviceStub.returns(true);

                guard.isAgent(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.equal(undefined);
            });
        });

        describe('isCustomer Test', () => {
            let nextStub;

            beforeEach(() => {
                serviceStub = sinon.stub(homepainterSessions, 'IsLoggedIn');
                nextStub = sinon.stub();
            });

            afterEach(() => {
                serviceStub.restore();
            });

            it('should call next with an error if a user is not logged in', () => {
                serviceStub.returns(false);

                guard.isCustomer(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.be.a('error');
                expect(nextStub.getCall(0).args[0].message).to.equal('EUNAUTHORIZED');
                expect(nextStub.getCall(0).args[0].code).to.equal('EUNAUTHORIZED');
            });

            it('should call next with an error if a user does not have the required roles', () => {
                req.session.roles = 'rick_rolled';
                serviceStub.returns(true);

                guard.isCustomer(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.be.a('error');
                expect(nextStub.getCall(0).args[0].message).to.equal('EUNAUTHORIZED');
                expect(nextStub.getCall(0).args[0].code).to.equal('EUNAUTHORIZED');
            });

            it('should allow access to a resource as a customer', () => {
                req.session.roles = 'customer';
                serviceStub.returns(true);

                guard.isCustomer(req, res, nextStub);

                nextStub.calledOnce.should.be.true;
                expect(nextStub.getCall(0).args[0]).to.equal(undefined);
            });
        });
    });
})();
