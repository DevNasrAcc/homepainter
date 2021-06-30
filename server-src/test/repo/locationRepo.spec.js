(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('LocationRepo Test', function () {
        const repo = require('../../src/repo/locationRepo');
        const dbsModel = require('../../src/dbsmodel/locationData/locationData');
        let schemaStub, query;

        describe('FindOneByZipCode Test', function () {
            const location = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(location),
                };
                schemaStub = sinon.stub(dbsModel, 'findOne').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find a location by zip as a number with a mongoose session', async () => {
                const ret = await repo.FindOneByZipCode(50601, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(location);
            });

            it('should find a location by zip as a string without a mongoose session', async () => {
                const ret = await repo.FindOneByZipCode('50601');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(location);
            });

            it('should fail when NaN', async () => {
                try {
                    await repo.FindOneByZipCode({}, {});
                    sinon.assert.fail('Should have thrown');
                } catch (e) {
                    sinon.assert.match(e.message, sinon.match.string);
                }

                schemaStub.called.should.be.false;
                query.session.called.should.be.false;
                query.exec.called.should.be.false;
            });
        });

        describe('FindAllServicedByZipCode Test', function () {
            const location = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(location),
                };
                schemaStub = sinon.stub(dbsModel, 'find').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find a location by zip as a number with a mongoose session', async () => {
                const ret = await repo.FindAllServicedByZipCode(50601, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(location);
            });

            it('should find a location by zip as a string without a mongoose session', async () => {
                const ret = await repo.FindAllServicedByZipCode('50601');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(location);
            });

            it('should fail when NaN', async () => {
                try {
                    await repo.FindAllServicedByZipCode({}, {});
                    sinon.assert.fail('Should have thrown');
                } catch (e) {
                    sinon.assert.match(e.message, sinon.match.string);
                }

                schemaStub.called.should.be.false;
                query.session.called.should.be.false;
                query.exec.called.should.be.false;
            });
        });
    });
})();
