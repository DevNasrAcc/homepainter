(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;
    const assert = require('chai').assert;

    describe('authService Test', function () {
        const moment = require('moment');
        const helper = require('../../src/helpers/helpers');
        const authService = require('../../src/service/authService');
        const emailService = require('../../src/service/emailService');
        const userRepo = require('../../src/repo/userRepo');
        const securityEventRepo = require('../../src/repo/securityEventRepo');
        const authKeyRepo = require('../../src/repo/authKeyRepo');
        const jwt = require('jsonwebtoken');

        let promiseAllStub, emailServiceStub, userRepoStub, authKeyRepoStub;

        describe('StartLoginSequence', () => {
            let user, authKey, savedSecret;
            beforeEach(() => {
                authKey = { key: 123 };
                user = { toObject: sinon.stub().returnsThis() };

                userRepoStub = sinon.stub(userRepo, 'FindOneByEmail');
                authKeyRepoStub = sinon.stub(authKeyRepo, 'CreateLoginAuthKey');
                emailServiceStub = sinon.stub(emailService, 'UserLoginLink');

                savedSecret = process.env.JWT_ACCOUNT_SECURITY_SECRET;
                process.env.JWT_ACCOUNT_SECURITY_SECRET = 'some secret';
            });

            afterEach(() => {
                userRepoStub.restore();
                authKeyRepoStub.restore();
                emailServiceStub.restore();

                process.env.JWT_ACCOUNT_SECURITY_SECRET = savedSecret;
            });

            it("should send the user the login email if they don't have a password", async () => {
                userRepoStub.resolves(user);
                authKeyRepoStub.resolves(authKey);

                await authService.StartLoginSequence('joe@example.com', {});

                user.toObject.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
                authKeyRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
            });

            it("should wait the remaining time when a user doesn't exist or a user has a password", async () => {
                await authService.StartLoginSequence('joe@example.com', {});

                user.toObject.called.should.be.false;
                userRepoStub.calledOnce.should.be.true;
                authKeyRepoStub.called.should.be.false;
                emailServiceStub.called.should.be.false;
            });
        });

        describe('Login Test', function () {
            let getLastAccountLockoutStub,
                createAccountLockoutSecEvtStub,
                createAccountUnlockedSecEvtStub,
                createSuccessfulLoginSecEvtStub,
                createUnsuccessfulLoginSecEvtStub,
                getNumberOfLoginAttemptsIn24hoursStub,
                userLockedOutOfAccountStub,
                userLoggedInStub;

            beforeEach(() => {
                userRepoStub = sinon.stub(userRepo, 'FindOneByEmail');
                promiseAllStub = sinon.stub(helper, 'PromiseAll');
                getLastAccountLockoutStub = sinon.stub(securityEventRepo, 'GetLastAccountLockout');
                createAccountUnlockedSecEvtStub = sinon.stub(securityEventRepo, 'CreateAccountUnlockedSecEvt');
                createUnsuccessfulLoginSecEvtStub = sinon.stub(securityEventRepo, 'CreateUnsuccessfulLoginSecEvt');
                getNumberOfLoginAttemptsIn24hoursStub = sinon.stub(
                    securityEventRepo,
                    'GetNumberOfLoginAttemptsIn24hours'
                );
                createAccountLockoutSecEvtStub = sinon.stub(securityEventRepo, 'CreateAccountLockoutSecEvt');
                userLockedOutOfAccountStub = sinon.stub(emailService, 'UserLockedOutOfAccount');
                createSuccessfulLoginSecEvtStub = sinon.stub(securityEventRepo, 'CreateSuccessfulLoginSecEvt');
                userLoggedInStub = sinon.stub(emailService, 'UserLoggedIn');
            });

            afterEach(() => {
                userRepoStub.restore();
                promiseAllStub.restore();
                getLastAccountLockoutStub.restore();
                createAccountUnlockedSecEvtStub.restore();
                createUnsuccessfulLoginSecEvtStub.restore();
                getNumberOfLoginAttemptsIn24hoursStub.restore();
                createAccountLockoutSecEvtStub.restore();
                userLockedOutOfAccountStub.restore();
                createSuccessfulLoginSecEvtStub.restore();
                userLoggedInStub.restore();
            });

            it('should return if not a user', async () => {
                userRepoStub.resolves(null);

                const resp = await authService.Login({}, {});

                userRepoStub.calledOnce.should.be.true;
                promiseAllStub.called.should.be.false;
                getLastAccountLockoutStub.called.should.be.false;
                createAccountUnlockedSecEvtStub.called.should.be.false;
                createUnsuccessfulLoginSecEvtStub.called.should.be.false;
                getNumberOfLoginAttemptsIn24hoursStub.called.should.be.false;
                createAccountLockoutSecEvtStub.called.should.be.false;
                userLockedOutOfAccountStub.called.should.be.false;
                createSuccessfulLoginSecEvtStub.called.should.be.false;
                userLoggedInStub.called.should.be.false;
                expect(resp).to.equal(undefined);
            });

            it('should lock an account out if recent attempts > 5', async () => {
                const user = {
                    __t: 'contractor',
                    locked: false,
                    save: sinon.stub(),
                    toObject: sinon.stub(),
                    password: 'Password1!',
                };
                userRepoStub.resolves(user);
                getLastAccountLockoutStub.resolves(null);
                getNumberOfLoginAttemptsIn24hoursStub.resolves(6);

                const resp = await authService.Login({}, {});

                userRepoStub.calledOnce.should.be.true;
                promiseAllStub.calledOnce.should.be.true;
                getLastAccountLockoutStub.calledOnce.should.be.true;
                createAccountUnlockedSecEvtStub.called.should.be.false;
                createUnsuccessfulLoginSecEvtStub.calledOnce.should.be.true;
                getNumberOfLoginAttemptsIn24hoursStub.calledOnce.should.be.true;
                createAccountLockoutSecEvtStub.calledOnce.should.be.true;
                userLockedOutOfAccountStub.calledOnce.should.be.true;
                createSuccessfulLoginSecEvtStub.called.should.be.false;
                userLoggedInStub.called.should.be.false;
                expect(resp).to.equal(undefined);
                expect(user.locked).to.equal(true);
                user.save.calledOnce.should.be.true;
                user.toObject.calledOnce.should.be.true;
            });

            it('should log an unsuccessful attempt if a user is locked out', async () => {
                const user = {
                    __t: 'contractor',
                    locked: true,
                    save: sinon.stub(),
                    toObject: sinon.stub(),
                    password: 'Password1!',
                };
                userRepoStub.resolves(user);
                getLastAccountLockoutStub.resolves(new Date());

                const resp = await authService.Login({}, {});

                userRepoStub.calledOnce.should.be.true;
                promiseAllStub.called.should.be.false;
                getLastAccountLockoutStub.calledOnce.should.be.true;
                createAccountUnlockedSecEvtStub.called.should.be.false;
                createUnsuccessfulLoginSecEvtStub.calledOnce.should.be.true;
                getNumberOfLoginAttemptsIn24hoursStub.called.should.be.false;
                createAccountLockoutSecEvtStub.called.should.be.false;
                userLockedOutOfAccountStub.called.should.be.false;
                createSuccessfulLoginSecEvtStub.called.should.be.false;
                userLoggedInStub.called.should.be.false;
                expect(resp).to.equal(undefined);
                expect(user.locked).to.equal(true);
                user.save.called.should.be.false;
                user.toObject.called.should.be.false;
            });

            it('should let a user proceed if they are past the account lockout time and fail password check', async () => {
                const user = {
                    __t: 'contractor',
                    locked: true,
                    save: sinon.stub(),
                    toObject: sinon.stub(),
                    matchesPassword: sinon.stub().resolves(false),
                    password: 'Password1!',
                };
                userRepoStub.resolves(user);
                getLastAccountLockoutStub.resolves(new moment().subtract(2, 'days'));
                getNumberOfLoginAttemptsIn24hoursStub.resolves(0);

                const resp = await authService.Login({}, {});

                userRepoStub.calledOnce.should.be.true;
                promiseAllStub.called.should.be.false;
                getLastAccountLockoutStub.calledOnce.should.be.true;
                createAccountUnlockedSecEvtStub.calledOnce.should.be.true;
                createUnsuccessfulLoginSecEvtStub.calledOnce.should.be.true;
                getNumberOfLoginAttemptsIn24hoursStub.calledOnce.should.be.true;
                createAccountLockoutSecEvtStub.called.should.be.false;
                userLockedOutOfAccountStub.called.should.be.false;
                createSuccessfulLoginSecEvtStub.called.should.be.false;
                userLoggedInStub.called.should.be.false;
                expect(resp).to.equal(undefined);
                expect(user.locked).to.equal(false);
                user.save.calledOnce.should.be.true;
                user.toObject.called.should.be.false;
                user.matchesPassword.calledOnce.should.be.true;
            });

            it('should set min and max password checks', async () => {
                const fakeTimer = sinon.useFakeTimers(new Date());
                const user = {
                    __t: 'contractor',
                    locked: false,
                    save: sinon.stub(),
                    toObject: sinon.stub(),
                    matchesPassword: sinon.stub().resolves(true),
                    password: 'Password1!',
                };
                userRepoStub.resolves(user);
                getLastAccountLockoutStub.resolves(null);
                getNumberOfLoginAttemptsIn24hoursStub.resolves(0);

                // min password check
                await authService.Login({}, {});

                // max password check
                user.matchesPassword.callsFake(
                    () =>
                        new Promise((res) => {
                            fakeTimer.tick(5000);
                            res(true);
                        })
                );
                await authService.Login({}, {});

                // somewhere in between
                user.matchesPassword.callsFake(
                    () =>
                        new Promise((res) => {
                            fakeTimer.tick(2000);
                            res(true);
                        })
                );
                await authService.Login({}, {});

                fakeTimer.restore();
            });

            it('should successfully log a user in', async () => {
                const user = {
                    __t: 'contractor',
                    locked: false,
                    save: sinon.stub(),
                    toObject: sinon.stub(),
                    matchesPassword: sinon.stub().resolves(true),
                    password: 'Password1!',
                };
                userRepoStub.resolves(user);
                getLastAccountLockoutStub.resolves(null);
                getNumberOfLoginAttemptsIn24hoursStub.resolves(0);

                const resp = await authService.Login({}, {});

                userRepoStub.calledOnce.should.be.true;
                promiseAllStub.calledOnce.should.be.true;
                getLastAccountLockoutStub.calledOnce.should.be.true;
                createAccountUnlockedSecEvtStub.called.should.be.false;
                createUnsuccessfulLoginSecEvtStub.called.should.be.false;
                getNumberOfLoginAttemptsIn24hoursStub.calledOnce.should.be.true;
                createAccountLockoutSecEvtStub.called.should.be.false;
                userLockedOutOfAccountStub.called.should.be.false;
                createSuccessfulLoginSecEvtStub.calledOnce.should.be.true;
                userLoggedInStub.calledOnce.should.be.true;
                expect(resp).to.equal(user);
                expect(user.locked).to.equal(false);
                user.save.called.should.be.false;
                user.toObject.calledOnce.should.be.true;
                user.matchesPassword.calledOnce.should.be.true;
            });
        });

        describe('LoginWithJWT Test', () => {
            let jwtVerifyStub, securityEventRepoStub;
            let payload, authKey, user;

            beforeEach(() => {
                jwtVerifyStub = sinon.stub(jwt, 'verify');
                authKeyRepoStub = sinon.stub(authKeyRepo, 'FindLoginAuthKey');
                userRepoStub = sinon.stub(userRepo, 'FindOneById');
                securityEventRepoStub = sinon.stub(securityEventRepo, 'CreateSuccessfulLoginSecEvt');

                payload = { authKey: 'asdf' };
                authKey = { remove: sinon.stub(), user: 'user' };
                user = 'user';
            });

            afterEach(() => {
                jwtVerifyStub.restore();
                authKeyRepoStub.restore();
                userRepoStub.restore();
                securityEventRepoStub.restore();
            });

            it('should wait remaining time if the token could not be verified', async () => {
                jwtVerifyStub.throws();

                const ret = await authService.LoginWithJWT('token', {});

                assert.equal(ret, undefined);
                jwtVerifyStub.calledOnce.should.be.true;
                authKeyRepoStub.called.should.be.false;
                userRepoStub.called.should.be.false;
                securityEventRepoStub.called.should.be.false;
                authKey.remove.called.should.be.false;
            });

            it('should wait remaining time if the authKey is expired', async () => {
                jwtVerifyStub.returns(payload);
                authKeyRepoStub.resolves(undefined);

                const ret = await authService.LoginWithJWT('token', {});

                assert.equal(ret, undefined);
                jwtVerifyStub.calledOnce.should.be.true;
                authKeyRepoStub.calledOnce.should.be.true;
                userRepoStub.called.should.be.false;
                securityEventRepoStub.called.should.be.false;
                authKey.remove.called.should.be.false;
            });

            it("should throw an error if user doesn't exist", async () => {
                jwtVerifyStub.returns(payload);
                authKeyRepoStub.resolves(authKey);
                userRepoStub.resolves(undefined);

                try {
                    await authService.LoginWithJWT('token', {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`user with id [${authKey.user}] does not exist`);
                }

                jwtVerifyStub.calledOnce.should.be.true;
                authKeyRepoStub.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
                securityEventRepoStub.called.should.be.false;
                authKey.remove.called.should.be.false;
            });

            it('should return the user', async () => {
                jwtVerifyStub.returns(payload);
                authKeyRepoStub.resolves(authKey);
                userRepoStub.resolves(user);

                const ret = await authService.LoginWithJWT('token', {});

                assert.equal(ret, user);
                jwtVerifyStub.calledOnce.should.be.true;
                authKeyRepoStub.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
                securityEventRepoStub.calledOnce.should.be.true;
                authKey.remove.calledOnce.should.be.true;
            });
        });

        describe('RequestPasswordReset Test', function () {
            let findOneByEmailStub,
                createPasswordResetRequestSecEvtStub,
                userNotRegisteredStub,
                authKeyStub,
                resetPasswordEmailStub,
                user,
                pin;

            beforeEach(() => {
                findOneByEmailStub = sinon.stub(userRepo, 'FindOneByEmail');
                createPasswordResetRequestSecEvtStub = sinon.stub(
                    securityEventRepo,
                    'CreatePasswordResetRequestSecEvt'
                );
                userNotRegisteredStub = sinon.stub(emailService, 'UserNotRegistered');
                authKeyStub = sinon.stub(authKeyRepo, 'CreateForgotPasswordAuthKey');
                resetPasswordEmailStub = sinon.stub(emailService, 'ResetPassword');
                user = { toObject: sinon.stub().returnsThis() };
                pin = { toObject: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                findOneByEmailStub.restore();
                createPasswordResetRequestSecEvtStub.restore();
                userNotRegisteredStub.restore();
                authKeyStub.restore();
                resetPasswordEmailStub.restore();
            });

            it('should return user and create a new auth key when user found by email', async () => {
                findOneByEmailStub.resolves(user);
                authKeyStub.resolves(pin);

                await authService.RequestPasswordReset('', {});

                findOneByEmailStub.calledOnce.should.be.true;
                createPasswordResetRequestSecEvtStub.calledOnce.should.be.true;
                userNotRegisteredStub.called.should.be.false;
                authKeyStub.calledOnce.should.be.true;
                resetPasswordEmailStub.calledOnce.should.be.true;
            });

            it('should return user when user not found by email', async () => {
                findOneByEmailStub.resolves(undefined);

                await authService.RequestPasswordReset('', {});

                findOneByEmailStub.calledOnce.should.be.true;
                createPasswordResetRequestSecEvtStub.called.should.be.false;
                userNotRegisteredStub.calledOnce.should.be.true;
                authKeyStub.called.should.be.false;
                resetPasswordEmailStub.called.should.be.false;
            });
        });

        describe('ResetPassword Test', function () {
            let findOneByEmailStub,
                createPasswordChangeSecEvtStub,
                sendPasswordChangeConfirmationStub,
                createUnsuccessfulPasswordResetSecEvtStub,
                authKeyStub;
            let reqBody, user, authKey;

            beforeEach(() => {
                findOneByEmailStub = sinon.stub(userRepo, 'FindOneByEmail');
                createPasswordChangeSecEvtStub = sinon.stub(securityEventRepo, 'CreatePasswordResetSecEvt');
                authKeyStub = sinon.stub(authKeyRepo, 'FindForgotPasswordAuthKey');
                sendPasswordChangeConfirmationStub = sinon.stub(emailService, 'SendPasswordChangeConfirmation');
                createUnsuccessfulPasswordResetSecEvtStub = sinon.stub(
                    securityEventRepo,
                    'CreateUnsuccessfulPasswordResetSecEvt'
                );

                reqBody = {
                    passwordResetCode: '',
                    email: '',
                    password: '',
                };
                user = {
                    toObject: sinon.stub().returnsThis(),
                    save: sinon.stub().returnsThis(),
                    email: { address: '' },
                };
                authKey = { remove: sinon.stub() };
            });

            afterEach(() => {
                findOneByEmailStub.restore();
                createPasswordChangeSecEvtStub.restore();
                authKeyStub.restore();
                sendPasswordChangeConfirmationStub.restore();
                createUnsuccessfulPasswordResetSecEvtStub.restore();
            });

            it('should return undefined when the user does not exist', async () => {
                findOneByEmailStub.resolves(undefined);
                authKeyStub.resolves({});

                const ret = await authService.ResetPassword(reqBody, {});

                assert.equal(ret, undefined);
                findOneByEmailStub.calledOnce.should.be.true;
                createPasswordChangeSecEvtStub.called.should.be.false;
                authKeyStub.called.should.be.false;
                sendPasswordChangeConfirmationStub.called.should.be.false;
                createUnsuccessfulPasswordResetSecEvtStub.called.should.be.false;
                user.toObject.called.should.be.false;
                user.save.called.should.be.false;
                authKey.remove.called.should.be.false;
            });

            it('should return undefined when authKey not found', async () => {
                findOneByEmailStub.resolves(user);
                authKeyStub.resolves(undefined);

                const ret = await authService.ResetPassword(reqBody, {});

                assert.equal(ret, undefined);
                findOneByEmailStub.calledOnce.should.be.true;
                createPasswordChangeSecEvtStub.called.should.be.false;
                authKeyStub.calledOnce.should.be.true;
                sendPasswordChangeConfirmationStub.called.should.be.false;
                createUnsuccessfulPasswordResetSecEvtStub.calledOnce.should.be.true;
                user.toObject.called.should.be.false;
                user.save.called.should.be.false;
                authKey.remove.called.should.be.false;
            });

            it("should reset the user's password", async () => {
                findOneByEmailStub.resolves(user);
                authKeyStub.resolves(authKey);

                const ret = await authService.ResetPassword(reqBody, {});

                ret.should.equal(user);
                findOneByEmailStub.calledOnce.should.be.true;
                createPasswordChangeSecEvtStub.calledOnce.should.be.true;
                authKeyStub.calledOnce.should.be.true;
                sendPasswordChangeConfirmationStub.calledOnce.should.be.true;
                createUnsuccessfulPasswordResetSecEvtStub.called.should.be.false;
                user.toObject.calledOnce.should.be.true;
                user.save.calledOnce.should.be.true;
                authKey.remove.calledOnce.should.be.true;
            });
        });

        describe('ConfirmPasswordChange Test', () => {
            let reqBody, user;
            let securityEventRepoStub, userRepoStub, createUnsuccessfulPasswordChangeSecEvtStub;

            beforeEach(() => {
                userRepoStub = sinon.stub(userRepo, 'FindOneById');
                emailServiceStub = sinon.stub(emailService, 'SendPasswordChangeConfirmation');
                securityEventRepoStub = sinon.stub(securityEventRepo, 'CreatePasswordChangeSecEvt');
                createUnsuccessfulPasswordChangeSecEvtStub = sinon.stub(
                    securityEventRepo,
                    'CreateUnsuccessfulPasswordChangeSecEvt'
                );

                reqBody = {
                    emailAddress: '',
                    oldPassword: '',
                    newPassword: '',
                };
            });

            afterEach(() => {
                userRepoStub.restore();
                securityEventRepoStub.restore();
                emailServiceStub.restore();
                createUnsuccessfulPasswordChangeSecEvtStub.restore();
            });

            it('should throw when password does not match database', async () => {
                user = {
                    password: 'notfound',
                    matchesPassword: sinon.stub().resolves(false),
                };
                userRepoStub.resolves(user);
                createUnsuccessfulPasswordChangeSecEvtStub.resolves();

                const resp = await authService.ConfirmPasswordChange({}, reqBody, {});

                userRepoStub.calledOnce.should.be.true;
                securityEventRepoStub.called.should.be.false;
                emailServiceStub.called.should.be.false;
                createUnsuccessfulPasswordChangeSecEvtStub.calledOnce.should.be.true;
                user.matchesPassword.calledOnce.should.be.true;
                expect(resp).to.be.false;
            });

            it('should succeed when user is found and password matches', async () => {
                user = {
                    password: '',
                    matchesPassword: sinon.stub().resolves(true),
                    save: sinon.stub(),
                };
                userRepoStub.resolves(user);
                securityEventRepoStub.resolves(undefined);
                emailServiceStub.resolves(undefined);

                const resp = await authService.ConfirmPasswordChange({}, reqBody, {});

                userRepoStub.calledOnce.should.be.true;
                securityEventRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                createUnsuccessfulPasswordChangeSecEvtStub.called.should.be.false;
                user.matchesPassword.calledOnce.should.be.true;
                user.save.calledOnce.should.be.true;
                expect(resp).to.be.true;
            });
        });

        describe('GetNotificationPreferences Test', function () {
            let jwtStub, userRepoStub;

            beforeEach(() => {
                jwtStub = sinon.stub(jwt, 'verify');
                userRepoStub = sinon.stub(userRepo, 'FindOneByEmail');
            });

            afterEach(() => {
                jwtStub.restore();
                userRepoStub.restore();
            });

            it('should throw an error if a user is not found', async () => {
                jwtStub.resolves({});
                userRepoStub.resolves(null);

                try {
                    await authService.GetNotificationPreferences({});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal('User not found');
                }

                jwtStub.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
            });

            it('should return the users email and mobile preferences', async () => {
                jwtStub.resolves({});
                userRepoStub.resolves({
                    toObject: sinon.stub().returns({
                        email: {
                            address: 'some@email.address',
                            sendPromotional: true,
                        },
                        mobile: {
                            number: '1234567890',
                            sendPromotional: true,
                        },
                    }),
                });

                const resp = await authService.GetNotificationPreferences({});

                expect(resp.email).to.deep.equal({ sendPromotional: true });
                expect(resp.mobile).to.deep.equal({ sendPromotional: true });
                jwtStub.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
            });
        });

        describe('UpdateNotificationPreferences Test', function () {
            let jwtStub, userRepoStub;

            beforeEach(() => {
                jwtStub = sinon.stub(jwt, 'verify');
                userRepoStub = sinon.stub(userRepo, 'FindOneByEmail');
            });

            afterEach(() => {
                jwtStub.restore();
                userRepoStub.restore();
            });

            it('should throw an error if a user is not found', async () => {
                jwtStub.resolves({});
                userRepoStub.resolves(null);

                try {
                    await authService.UpdateNotificationPreferences({});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal('User not found');
                }

                jwtStub.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
            });

            it('should update a users preferences', async () => {
                jwtStub.resolves({});
                userRepoStub.resolves({ email: {}, mobile: {}, save: sinon.stub() });

                await authService.UpdateNotificationPreferences({ email: {}, mobile: {} });

                jwtStub.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
            });
        });
    });
})();
