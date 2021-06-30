(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('CustomerValidation Test', function () {
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/authValidation');
        let requestValidationStub;

        describe('StartLoginSequence Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.StartLoginSequence({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('Login Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.Login({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('LoginWithJWT Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.LoginWithJWT({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('RequestPasswordReset Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.RequestPasswordReset({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ResetPassword Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.ResetPassword({}, true);
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('PasswordChange Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should fail validation if their passwords dont match', () => {
                requestValidationStub.returns([]);

                const resp = validator.PasswordChange({
                    body: {
                        newPassword: '',
                        confirmNewPassword: 'password',
                    },
                });

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([
                    '[newPassword] and [confirmNewPassword] filed validation: values do not match',
                ]);
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.PasswordChange({
                    body: {
                        newPassword: 'password',
                        confirmNewPassword: 'password',
                    },
                });
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('UpdateNotifications Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.UpdateNotifications({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('UpdatePersonalInformation Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.UpdatePersonalInformation({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('UpdateUserNotificationPreferences Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.UpdateUserNotificationPreferences({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });
    });
})();
