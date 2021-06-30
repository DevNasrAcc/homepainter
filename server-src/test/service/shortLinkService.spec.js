(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('ShortLinkService Test', function () {
        const shortLinkRepo = require('../../src/repo/shortLinkRepo');
        const shortLinkService = require('../../src/service/shortLinkService');
        let shortLinkRepoStub;

        describe('GetShortUrl Test', () => {
            beforeEach(() => {
                shortLinkRepoStub = sinon.stub(shortLinkRepo, 'GetShortLinkByUrlCode');
            });

            afterEach(() => {
                shortLinkRepoStub.restore();
            });

            it('should throw if a shortlink is not found', async () => {
                shortLinkRepoStub.resolves(null);

                try {
                    await shortLinkService.GetShortUrl('foo', {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal('Short link with code [foo] does not exist');
                }

                shortLinkRepoStub.calledOnce.should.be.true;
            });

            it('should retrieve a url via a urlcode', async () => {
                const shortLinkResolve = {};
                shortLinkRepoStub.resolves(shortLinkResolve);

                const resp = await shortLinkService.GetShortUrl('foo', {});

                shortLinkRepoStub.calledOnce.should.be.true;
                expect(resp).to.equal(shortLinkResolve);
            });
        });

        describe('GenerateShortUrl Test', () => {
            let previousBaseUrl;

            beforeEach(() => {
                previousBaseUrl = process.env.BASE_URL;
                process.env.BASE_URL = '';
                shortLinkRepoStub = sinon.stub(shortLinkRepo, 'CreateShortLink');
            });

            afterEach(() => {
                process.env.BASE_URL = previousBaseUrl;
                shortLinkRepoStub.restore();
            });

            it('should retrieve a url via a urlcode', async () => {
                shortLinkRepoStub.resolves(null);

                await shortLinkService.GenerateShortUrl({ _id: '' }, {});

                shortLinkRepoStub.calledOnce.should.be.true;
            });
        });
    });
})();
