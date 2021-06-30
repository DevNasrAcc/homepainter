(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('authController Test', function () {
        const constants = require('../../src/config/constants');
        const homepainterSessions = require('../../src/config/sessions');
        const controller = require('../../src/controller/authController');
        const authService = require('../../src/service/authService');

        let authServiceStub, sessionsStub;

        const req = { params: {}, body: {}, session: { userId: '' }, mongooseSession: {} };
        const res = {};

        describe('StartLoginSequence Test', () => {
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'StartLoginSequence');
            });

            afterEach(() => {
                authServiceStub.restore();
            });

            it(' should call StartLoginSequence and return 200', async () => {
                const { status, content } = await controller.StartLoginSequence(req, res);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
                authServiceStub.calledOnce.should.be.true;
            });
        });

        describe('Login Test', () => {
            let user;
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'Login');
                sessionsStub = sinon.stub(homepainterSessions, 'Login');
                user = { toFrontEnd: sinon.stub().returnsThis() };
            });
            afterEach(() => {
                authServiceStub.restore();
                sessionsStub.restore();
            });

            it('should log the user in and return 200', async () => {
                authServiceStub.resolves(user);

                const { status, content } = await controller.Login(req, res);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(user);
                authServiceStub.calledOnce.should.be.true;
                sessionsStub.calledOnce.should.be.true;
                user.toFrontEnd.calledOnce.should.be.true;
            });

            it('should return 401', async () => {
                const { status, content } = await controller.Login(req, res);

                status.should.equal(constants._4xx._401.status);
                content.should.equal(constants._4xx._401.reason);
                authServiceStub.calledOnce.should.be.true;
                sessionsStub.calledOnce.should.be.true;
                user.toFrontEnd.called.should.be.false;
            });
        });

        describe('LoginWithJWT Test', () => {
            let user;
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'LoginWithJWT');
                sessionsStub = sinon.stub(homepainterSessions, 'Login');
                user = { toFrontEnd: sinon.stub().returnsThis() };
            });
            afterEach(() => {
                authServiceStub.restore();
                sessionsStub.restore();
            });

            it('should log the user in and return 200', async () => {
                authServiceStub.resolves(user);

                const { status, content } = await controller.LoginWithJWT(req, res);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(user);
                authServiceStub.calledOnce.should.be.true;
                sessionsStub.calledOnce.should.be.true;
                user.toFrontEnd.calledOnce.should.be.true;
            });

            it('should return 401', async () => {
                const { status, content } = await controller.LoginWithJWT(req, res);

                status.should.equal(constants._4xx._401.status);
                content.should.equal(constants._4xx._401.reason);
                authServiceStub.calledOnce.should.be.true;
                sessionsStub.calledOnce.should.be.true;
                user.toFrontEnd.called.should.be.false;
            });
        });

        describe('Logout Test', () => {
            beforeEach(() => {
                sessionsStub = sinon.stub(homepainterSessions, 'Logout');
            });

            afterEach(() => {
                sessionsStub.restore();
            });

            it('should return 200 and log a user out', async () => {
                const { status, content } = await controller.Logout(req, res);

                sessionsStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('ResetPassword Test', () => {
            let user;
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'ResetPassword');
                sessionsStub = sinon.stub(homepainterSessions, 'Login');
                user = { toFrontEnd: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                authServiceStub.restore();
                sessionsStub.restore();
            });

            it('should reset password and return user', async () => {
                authServiceStub.resolves(user);

                const { status, content } = await controller.ResetPassword(req, res);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(user);
                authServiceStub.calledOnce.should.be.true;
                sessionsStub.calledOnce.should.be.true;
                user.toFrontEnd.calledOnce.should.be.true;
            });

            it('should return 401 when no user is found', async () => {
                const { status, content } = await controller.ResetPassword(req, res);

                status.should.equal(constants._4xx._401.status);
                content.should.equal(constants._4xx._401.reason);
                authServiceStub.calledOnce.should.be.true;
                sessionsStub.calledOnce.should.be.true;
                user.toFrontEnd.called.should.be.false;
            });
        });

        describe('Request Password Reset Test', () => {
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'RequestPasswordReset');
            });

            afterEach(() => {
                authServiceStub.restore();
            });

            it('should return 200', async () => {
                const { status, content } = await controller.RequestPasswordReset(req);

                authServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('ConfirmPasswordChange Test', () => {
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'ConfirmPasswordChange');
            });

            afterEach(() => {
                authServiceStub.restore();
            });

            it('should return 200', async () => {
                let success = true;
                authServiceStub.resolves(success);

                const { status, content } = await controller.ConfirmPasswordChange(req);

                authServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(success);
            });
        });

        describe('GetNotificationPreferences Test', () => {
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'GetNotificationPreferences');
            });

            afterEach(() => {
                authServiceStub.restore();
            });

            it('should return 200', async () => {
                const resolve = { email: {}, mobile: {} };
                authServiceStub.resolves(resolve);

                const { status, content } = await controller.GetNotificationPreferences(req);

                authServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(resolve);
            });
        });

        describe('UpdateNotificationPreferences Test', () => {
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'UpdateNotificationPreferences');
            });

            afterEach(() => {
                authServiceStub.restore();
            });

            it('should return 200', async () => {
                authServiceStub.resolves();

                const { status, content } = await controller.UpdateNotificationPreferences(req);

                authServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('UpdatePersonalInformation Test', () => {
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'UpdatePersonalInformation');
            });

            afterEach(() => {
                authServiceStub.restore();
            });

            it('should return 200', async () => {
                authServiceStub.resolves();

                const { status, content } = await controller.UpdatePersonalInformation(req);

                authServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('UpdateUserNotificationPreferences Test', () => {
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'UpdateUserNotificationPreferences');
            });

            afterEach(() => {
                authServiceStub.restore();
            });

            it('should return 200', async () => {
                authServiceStub.resolves();

                const { status, content } = await controller.UpdateUserNotificationPreferences(req);

                authServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });

        describe('RetrieveUserPersonalInfo Test', () => {
            beforeEach(() => {
                authServiceStub = sinon.stub(authService, 'RetrieveUserPersonalInfo');
            });

            afterEach(() => {
                authServiceStub.restore();
            });

            it('should return 200', async () => {
                authServiceStub.resolves();

                const { status, content } = await controller.RetrieveUserPersonalInfo(req);

                authServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });
    });
})();
