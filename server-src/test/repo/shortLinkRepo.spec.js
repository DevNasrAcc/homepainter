(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('shortLinkRepo Test', function () {
        const repo = require('../../src/repo/shortLinkRepo');
        const shortLinkModel = require('../../src/dbsmodel/shortLink/shortLink');
        let modelStub, query, saveStub, sessionStub;

        describe('CreateShortLink Test', function () {
            const _shortLink = 'foo';
            beforeEach(() => {
                sessionStub = sinon.stub(shortLinkModel.prototype, '$session');
                saveStub = sinon.stub(shortLinkModel.prototype, 'save').resolves(_shortLink);
            });

            afterEach(() => {
                sessionStub.restore();
                saveStub.restore();
            });

            it('should save one short link with a mongoose session', async () => {
                const ret = await repo.CreateShortLink({}, {});

                saveStub.calledOnce.should.be.true;
                sessionStub.calledOnce.should.be.true;
                ret.should.equal(_shortLink);
            });

            it('should save one short link without a mongoose session', async () => {
                const ret = await repo.CreateShortLink({});

                saveStub.calledOnce.should.be.true;
                sessionStub.called.should.be.false;
                ret.should.equal(_shortLink);
            });
        });

        describe('GetShortLinkByUrlCode Test', function () {
            const _shortLink = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(_shortLink),
                };
                modelStub = sinon.stub(shortLinkModel, 'findOne').returns(query);
            });

            afterEach(() => {
                query = {};
                modelStub.restore();
            });

            it('should find a shortLink by urlCode with a mongoose session', async () => {
                const resp = await repo.GetShortLinkByUrlCode('asdf', {});

                modelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(_shortLink);
            });

            it('should find a shortLink by urlCode without a mongoose session', async () => {
                const resp = await repo.GetShortLinkByUrlCode('asdf');

                modelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(_shortLink);
            });
        });
    });
})();
