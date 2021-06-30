(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('tempPhotoService Test', function () {
        const service = require('../../src/service/tempPhotoService');
        const repo = require('../../src/repo/tempPhotoRepo');
        let repoStub;

        describe('CreateTempPhoto Test', () => {
            beforeEach(() => {
                repoStub = sinon.stub(repo, 'Create');
            });

            afterEach(() => {
                repoStub.restore();
            });

            it('should create a new temp photo', async () => {
                const dbsObj = {};
                repoStub.resolves(dbsObj);

                const resp = await service.CreateTempPhoto({}, 'some.url', {});

                repoStub.calledOnce.should.be.true;
                expect(resp).to.equal(dbsObj);
            });
        });
    });
})();
