(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('FileUploadController Test', function () {
        const constants = require('../../src/config/constants');
        const controller = require('../../src/controller/fileUploadController');
        const objectStorageService = require('../../src/service/objectStorageService');
        const tempPhotoService = require('../../src/service/tempPhotoService');
        let objectStorageServiceStub, tempPhotoServiceStub;

        const res = {
            send: () => {},
            status: function () {
                return this;
            },
        };
        const req = { params: {}, body: {}, files: { 'file1.jpg': {} } };
        const resSendSpy = sinon.spy(res, 'send');
        const resStatusSpy = sinon.spy(res, 'status');

        afterEach(() => {
            resSendSpy.resetHistory();
            resStatusSpy.resetHistory();
        });

        describe('UploadPhoto Test', () => {
            beforeEach(() => {
                objectStorageServiceStub = sinon.stub(objectStorageService, 'UploadPublicFile');
                tempPhotoServiceStub = sinon.stub(tempPhotoService, 'CreateTempPhoto');
            });

            afterEach(() => {
                objectStorageServiceStub.restore();
                tempPhotoServiceStub.restore();
            });

            it('should return 200', async () => {
                const dbsFile = {};
                objectStorageServiceStub.resolves('some.url');
                tempPhotoServiceStub.resolves(dbsFile);

                const ret = await controller.UploadPhoto(req, res);

                objectStorageServiceStub.calledOnce.should.be.true;
                tempPhotoServiceStub.calledOnce.should.be.true;
                ret.status.should.equal(constants._2xx._201.status);
                ret.content.should.equal(dbsFile);
            });
        });
    });
})();
