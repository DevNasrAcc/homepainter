(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('ContractorValidation Test', function () {
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/contractorValidation');
        let requestValidationStub;

        describe('Application Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return a failure when acceptedTermsAndPrivacy is false', () => {
                requestValidationStub.returns([]);
                const resp = validator.Application({ body: { acceptedTermsAndPrivacy: false } });
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal(['[acceptedTermsAndPrivacy] failed validation: was [false] expected true']);
            });

            it('should succeed validation', () => {
                requestValidationStub.returns([]);
                const resp = validator.Application({ body: { acceptedTermsAndPrivacy: true } });
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

            it('should validate successfully', () => {
                requestValidationStub.returns([]);

                const resp = validator.ApproveDeny({});

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('CompleteSetup Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);

                const resp = validator.CompleteSetup({}, true);

                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ProposalAccept Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.ProposalAccept({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ProposalDecline Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.ProposalDecline({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ProjectSchedule Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.ProjectSchedule({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ProjectCompletion Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.ProjectCompletion({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ListOfPainterIds Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return a failure for type array', () => {
                requestValidationStub.returns(['should be a string']);
                const resp = validator.ListOfPainterIds({ params: { commaSeparatedList: [] } });
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal(['should be a string']);
            });

            it('should validate successfully if list contains all', () => {
                requestValidationStub.returns([]);
                const resp = validator.ListOfPainterIds({ params: { commaSeparatedList: 'all' } });
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });

            it('should validate successfully if list contains all', () => {
                requestValidationStub.returns([]);
                const resp = validator.ListOfPainterIds({ params: { commaSeparatedList: 'c1,c2,c3' } });
                requestValidationStub.calledTwice.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('UpdateInsuranceInfo Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.UpdateInsuranceInfo({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });
    });
})();
