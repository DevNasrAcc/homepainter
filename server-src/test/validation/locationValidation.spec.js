(function() {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('LocationValidation Test', function() {
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/locationValidation');
        let requestValidationStub;

        describe('ZipCodeProvided Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.ZipCodeProvided({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ZipCodeJobTypeRoomTypeProvided Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.ZipCodeJobTypeRoomTypeProvided({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });
    });
})();
