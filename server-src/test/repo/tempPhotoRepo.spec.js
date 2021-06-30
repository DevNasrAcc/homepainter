(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('tempPhotoRepo Test', function () {
        const repo = require('../../src/repo/tempPhotoRepo');
        const tempPhotoModel = require('../../src/dbsmodel/file/file').TempPhotoDiscriminator;
        let modelStub, query, saveStub, sessionStub;

        describe('Create Test', () => {
            const _tempPhoto = 'foo';
            beforeEach(() => {
                sessionStub = sinon.stub(tempPhotoModel.prototype, '$session');
                saveStub = sinon.stub(tempPhotoModel.prototype, 'save').resolves(_tempPhoto);
            });

            afterEach(() => {
                sessionStub.restore();
                saveStub.restore();
            });

            it('should create a temp photo with a mongoose session', async () => {
                const ret = await repo.Create({}, {});

                sessionStub.calledOnce.should.be.true;
                saveStub.calledOnce.should.be.true;
                ret.should.equal(_tempPhoto);
            });

            it('should create a temp photo without a mongoose session', async () => {
                const ret = await repo.Create({});

                sessionStub.called.should.be.false;
                saveStub.calledOnce.should.be.true;
                ret.should.equal(_tempPhoto);
            });
        });

        describe('Delete Test', function () {
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub(),
                };
                modelStub = sinon.stub(tempPhotoModel, 'findOneAndDelete').returns(query);
            });

            afterEach(() => {
                modelStub.restore();
            });

            it('should delete a shortLink by url with a mongooseSession', async () => {
                await repo.Delete('some.url', {});

                modelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
            });

            it('should delete a shortLink by url without a mongooseSession', async () => {
                await repo.Delete('some.url');

                modelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
            });
        });
    });
})();
