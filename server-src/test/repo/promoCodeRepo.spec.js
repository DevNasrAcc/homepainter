(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('promoCodeRepo Test', function () {
        const repo = require('../../src/repo/promoCodeRepo');
        const promoCodeModel = require('../../src/dbsmodel/promoCode/promoCode');
        let promoCodeModelStub, query;

        describe('UpsertUserPromoCode Test', () => {
            const promoCode = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(promoCode),
                };
                promoCodeModelStub = sinon.stub(promoCodeModel, 'findOneAndUpdate').returns(query);
            });

            afterEach(() => {
                promoCodeModelStub.restore();
            });

            it('should create a user promo code with a mongoose session', async () => {
                const ret = await repo.UpsertUserPromoCode('', '', {});

                promoCodeModelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(promoCode);
            });

            it('should create a user promo code without a mongoose session', async () => {
                const ret = await repo.UpsertUserPromoCode('', '');

                promoCodeModelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(promoCode);
            });
        });

        describe('FindPromoCodeByCode', function () {
            const promoCode = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(promoCode),
                };
                promoCodeModelStub = sinon.stub(promoCodeModel, 'findOne').returns(query);
            });

            afterEach(() => {
                promoCodeModelStub.restore();
            });

            it('should return a promoCode by code with a mongoose session', async () => {
                const ret = await repo.FindPromoCodeByCode('asdf', {});

                promoCodeModelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(promoCode);
            });

            it('should return a promoCode by code without a mongoose session', async () => {
                const ret = await repo.FindPromoCodeByCode('asdf');

                promoCodeModelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(promoCode);
            });
        });
    });
})();
