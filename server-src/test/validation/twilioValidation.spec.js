(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('TwilioValidation Test', function () {
        const twilioClient = require('twilio');
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/twilioValidation');
        let requestValidationStub, clientValidateRequestStub;

        describe('Contact Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
                clientValidateRequestStub = sinon.stub(twilioClient, 'validateRequest');
            });

            afterEach(() => {
                requestValidationStub.restore();
                clientValidateRequestStub.restore();
            });

            it('should return no errors', () => {
                requestValidationStub.returns([]);
                clientValidateRequestStub.returns(true);

                const resp = validator.ValidateIncomingSMS('', '', {});

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });

            it('should return an error if validation fails', () => {
                requestValidationStub.returns([]);
                clientValidateRequestStub.returns(false);

                const resp = validator.ValidateIncomingSMS('', '', {});

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal(['invalid signature']);
            });
        });
    });
})();
