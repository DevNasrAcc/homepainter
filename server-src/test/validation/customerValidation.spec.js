(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('CustomerValidation Test', function () {
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/customerValidation');
        let requestValidationStub;

        describe('CustomerInProgress Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully if not requiring proposals', () => {
                requestValidationStub.returns([]);

                const resp = validator.CustomerInProgress({ body: { acceptedTermsAndPrivacy: true } });

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });

            it('should fail if acceptedTermsAndPrivacy is false', () => {
                requestValidationStub.returns([]);

                const resp = validator.CustomerInProgress({ body: { acceptedTermsAndPrivacy: false } });

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal(['[acceptedTermsAndPrivacy] failed validation: was [false] expected true']);
            });
        });

        describe('Feedback Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);

                const resp = validator.Feedback({});

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('JobComplete Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.JobComplete({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });

            it('should fail validation', () => {
                requestValidationStub.returns([]);
                const resp = validator.JobComplete({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('Contact Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should fail validation if they havent accepted the terms and privacy', () => {
                requestValidationStub.returns([]);

                const resp = validator.Contact({ body: {} });

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal(['[acceptedTermsAndPrivacy] failed validation: was [undefined] expected true']);
            });

            it('should pass validation', () => {
                requestValidationStub.returns([]);

                const resp = validator.Contact({ body: { password: '', acceptedTermsAndPrivacy: true } });

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ApproveDeny Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.ApproveDeny({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });
    });
})();
