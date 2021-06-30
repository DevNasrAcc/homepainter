(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('UserRepo Test', function () {
        const repo = require('../../src/repo/userRepo');
        const userModel = require('../../src/dbsmodel/user/user').UserModel;
        let modelStub, query;

        describe('FindOneById Test', () => {
            const user = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(user),
                };
                modelStub = sinon.stub(userModel, 'findById').returns(query);
            });

            afterEach(() => {
                modelStub.restore();
            });

            it('should find a user by id with a mongoose session', async () => {
                const ret = await repo.FindOneById('id', {});

                modelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(user);
            });

            it('should find a user by id without a mongoose session', async () => {
                const ret = await repo.FindOneById('id');

                modelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(user);
            });
        });

        describe('FindOneByEmail Test', () => {
            const user = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(user),
                };
                modelStub = sinon.stub(userModel, 'findOne').returns(query);
            });

            afterEach(() => {
                modelStub.restore();
            });

            it('should find a user by email.address with a mongoose session', async () => {
                const ret = await repo.FindOneByEmail({}, {});

                modelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(user);
            });

            it('should find a user by email.address without a mongoose session', async () => {
                const ret = await repo.FindOneByEmail({});

                modelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(user);
            });
        });

        describe('FindByMobileNumber Test', () => {
            const user = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(user),
                };
                modelStub = sinon.stub(userModel, 'find').returns(query);
            });

            afterEach(() => {
                modelStub.restore();
            });

            it('should find a user by phone number with a mongoose session', async () => {
                const ret = await repo.FindByMobileNumber('+15555555555', {});

                modelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(user);
            });

            it('should find a user by phone number without a mongoose session', async () => {
                const ret = await repo.FindByMobileNumber('+15555555555');

                modelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(user);
            });
        });
    });
})();
