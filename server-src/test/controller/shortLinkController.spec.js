(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    const slackService = require('../../src/service/slackService');
    const shortLinkService = require('../../src/service/shortLinkService');
    const shortLinkController = require('../../src/controller/shortLinkController');

    describe('shortLinkController Test', function () {
        let shortLinkServiceStub, shortLinkServiceResolve, req, res, resRedirectSpy, slackServiceStub;

        describe('RedirectShortUrls Test', () => {
            beforeEach(() => {
                shortLinkServiceResolve = {
                    originalUrl: 'foo',
                };
                req = {
                    params: {
                        code: 'poo',
                    },
                };
                res = {
                    redirect: () => {},
                };
                resRedirectSpy = sinon.spy(res, 'redirect');
                shortLinkServiceStub = sinon.stub(shortLinkService, 'GetShortUrl');
                slackServiceStub = sinon.stub(slackService, 'SendMessage');
            });

            afterEach(() => {
                shortLinkServiceStub.restore();
                slackServiceStub.restore();
                resRedirectSpy.resetHistory();
            });

            it('should redirect user to the original url', async () => {
                shortLinkServiceStub.resolves(shortLinkServiceResolve);

                await shortLinkController.RedirectShortUrls(req, res);

                shortLinkServiceStub.calledOnce.should.be.true;
                slackServiceStub.calledOnce.should.be.false;
                resRedirectSpy.withArgs(shortLinkServiceResolve.originalUrl).calledOnce.should.be.true;
            });

            it('should show an error message and redirect to home page', async () => {
                shortLinkServiceStub.rejects();
                slackServiceStub.resolves(undefined);

                await shortLinkController.RedirectShortUrls(req, res);

                shortLinkServiceStub.calledOnce.should.be.true;
                slackServiceStub.calledOnce.should.be.true;
                resRedirectSpy.withArgs(process.env.BASE_URL).calledOnce.should.be.true;
            });
        });
    });
})();
