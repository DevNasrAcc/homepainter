(function () {
    'use strict';

    const sinon = require('sinon');
    const chai = require('chai');
    require('chai').should();
    const expect = chai.expect;

    describe('ObjectStorageService Test', function () {
        const config = require('../../src/config/config');
        const objectStorageService = require('../../src/service/objectStorageService');

        describe('UploadPublicFile Test', () => {
            let GetS3Stub, ImageToJpgStub, _endpoint, _bucket, file;
            beforeEach(() => {
                GetS3Stub = sinon.stub(config, 'getS3');
                ImageToJpgStub = sinon.stub(config, 'imageToJpg');
                _endpoint = process.env.S3_ENDPOINT;
                _bucket = process.env.S3_BUCKET;
                process.env.S3_ENDPOINT = 'https://test.site';
                process.env.S3_BUCKET = 'painter-dev';
                file = {
                    name: 'name.jpg',
                    data: '',
                    size: 0,
                };
            });

            afterEach(() => {
                GetS3Stub.restore();
                ImageToJpgStub.restore();
                process.env.S3_ENDPOINT = _endpoint;
                process.env.S3_BUCKET = _bucket;
            });

            it('should successfully store the image file', async () => {
                let promise = { promise: sinon.spy() };
                let S3 = {
                    putObject: sinon.stub().returns(promise),
                };
                GetS3Stub.returns(S3);
                ImageToJpgStub.resolves('');

                const ret = await objectStorageService.UploadPublicFile(file);

                expect(ret).to.be.a('string');
                promise.promise.calledOnce.should.be.true;
            });
        });
    });
})();
