(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('MessageValidation Test', function () {
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/messageValidation');
        let requestValidationStub;

        describe('To Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);

                const resp = validator.To({});

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ToAndMessage Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);

                const resp = validator.ToAndMessage({});

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ListOfMessages Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);

                const resp = validator.ListOfMessages({});

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });
    });
})();
