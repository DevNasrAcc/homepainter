(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('ProjectValidation Test', function () {
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/projectValidation');
        let requestValidationStub;

        describe('ProjectId Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.ProjectId({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('Project Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.Project({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ProjectInProgress Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.ProjectInProgress({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('Proposal Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.Proposal({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('InvitePainter Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should validate successfully', () => {
                requestValidationStub.returns([]);
                const resp = validator.InvitePainter({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });

        describe('ShareProject Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
            });

            afterEach(() => {
                requestValidationStub.restore();
            });

            it('should return the failures array', () => {
                requestValidationStub.returns([]);
                const resp = validator.ShareProject({});
                requestValidationStub.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });
        });
    });
})();
