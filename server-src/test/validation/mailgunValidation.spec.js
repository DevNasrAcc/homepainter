(function() {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('MailgunValidation Test', function() {
        const requestValidation = require('../../src/validation/requestValidator');
        const validator = require('../../src/validation/mailgunValidation');
        let requestValidationStub, validateHashEqualsSignatureStub;

        describe('ValidateDelivery Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
                validateHashEqualsSignatureStub = sinon.stub(validator, 'ValidateHashEqualsSignature');
            });

            afterEach(() => {
                requestValidationStub.restore();
                validateHashEqualsSignatureStub.restore();
            });

            it('should return the two concatenated arrays', () => {
                requestValidationStub.returns(['a', 'b']);
                validateHashEqualsSignatureStub.returns(['b', 'c']);

                const resp = validator.ValidateDelivery({});

                requestValidationStub.calledOnce.should.be.true;
                validateHashEqualsSignatureStub.calledOnce.should.be.true;
                resp.should.deep.equal(['a', 'b', 'b', 'c']);
            });
        });

        describe('ValidateOpen Test', () => {
            beforeEach(() => {
                requestValidationStub = sinon.stub(requestValidation, 'Validate');
                validateHashEqualsSignatureStub = sinon.stub(validator, 'ValidateHashEqualsSignature');
            });

            afterEach(() => {
                requestValidationStub.restore();
                validateHashEqualsSignatureStub.restore();
            });

            it('should return the concatenation of the two arrays', () => {
                requestValidationStub.returns(['a', 'b']);
                validateHashEqualsSignatureStub.returns(['b', 'c']);

                const resp = validator.ValidateOpen({});

                requestValidationStub.calledOnce.should.be.true;
                validateHashEqualsSignatureStub.calledOnce.should.be.true;
                resp.should.deep.equal(['a', 'b', 'b', 'c']);
            });
        });

        describe('ValidateHashEqualsSignature test', () => {
            const crypto = require('crypto');
            let cryptoStub, updateStub, digestStub, req, env;

            beforeEach(() => {
                req = { signature: { timestamp: '', token: '', signature: '' } };
                env = process.env.MAILGUN_WEBHOOK_SIGNING_API_KEY;
                process.env.MAILGUN_WEBHOOK_SIGNING_API_KEY = 'some key';

                digestStub = {
                    digest: sinon.stub()
                };
                updateStub = {
                    update: sinon.stub().returns(digestStub)
                };
                cryptoStub = sinon.stub(crypto, 'createHmac').returns(updateStub);
            });

            afterEach(() => {
                process.env.MAILGUN_WEBHOOK_SIGNING_API_KEY = env;
                cryptoStub.restore();
            });

            it('should return an empty array', () => {
                digestStub.digest.returns('');

                const resp = validator.ValidateHashEqualsSignature(req);

                cryptoStub.calledOnce.should.be.true;
                updateStub.update.calledOnce.should.be.true;
                digestStub.digest.calledOnce.should.be.true;
                resp.should.deep.equal([]);
            });

            it('should return an array with one failure', () => {
                digestStub.digest.returns('notEqual');

                const resp = validator.ValidateHashEqualsSignature(req);

                cryptoStub.calledOnce.should.be.true;
                updateStub.update.calledOnce.should.be.true;
                digestStub.digest.calledOnce.should.be.true;
                resp.should.deep.equal(['invalid signature']);
            });
        });
    });
})();
