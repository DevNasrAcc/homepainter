(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('LocationController Tests', function () {
        const constants = require('../../src/config/constants');
        const controller = require('../../src/controller/locationController');
        const locationService = require('../../src/service/locationService');
        let locationServiceStub;

        const req = { params: {}, body: {}, session: { userId: '' }, mongooseSession: {} };

        describe('IsAreaServiced Test', () => {
            beforeEach(() => {
                locationServiceStub = sinon.stub(locationService, 'IsAreaServiced');
            });

            afterEach(() => {
                locationServiceStub.restore();
            });

            it('should return resp', async () => {
                let resp = 'foo';
                locationServiceStub.resolves(resp);

                const { status, content } = await controller.IsAreaServiced(req);

                locationServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(resp);
            });
        });

        describe('GetRoomSizes Test', () => {
            let resp;

            beforeEach(() => {
                locationServiceStub = sinon.stub(locationService, 'GetRoomHeights');
            });

            afterEach(() => {
                locationServiceStub.restore();
            });

            it('should return 404', async () => {
                resp = null;
                locationServiceStub.resolves(resp);

                let { status, content } = await controller.GetRoomHeights(req);

                locationServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._4xx._404.status);
                content.should.equal(constants._4xx._404.reason);
            });

            it('should return 200 and resp', async () => {
                resp = 'foo';
                locationServiceStub.resolves(resp);

                let { status, content } = await controller.GetRoomHeights(req);

                locationServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(resp);
            });
        });

        describe('GetRoomHeights Test', () => {
            let resp;

            beforeEach(() => {
                locationServiceStub = sinon.stub(locationService, 'GetRoomSizes');
            });

            afterEach(() => {
                locationServiceStub.restore();
            });

            it('should return 404', async () => {
                resp = null;
                locationServiceStub.resolves(resp);

                let { status, content } = await controller.GetRoomSizes(req);

                locationServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._4xx._404.status);
                content.should.equal(constants._4xx._404.reason);
            });

            it('should return 200 and resp', async () => {
                resp = 'foo';
                locationServiceStub.resolves(resp);

                let { status, content } = await controller.GetRoomSizes(req);

                locationServiceStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(resp);
            });
        });
    });
})();
