(function() {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('ContactValidation Test', function() {
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/contactValidation');
        let requestValidationStub;

        describe('ContactForm Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.ContactForm({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });
    });
})();
