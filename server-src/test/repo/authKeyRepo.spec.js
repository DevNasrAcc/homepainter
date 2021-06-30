(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('AuthKeyRepo Test', function () {
        const repo = require('../../src/repo/authKeyRepo');
        const dbsModel = require('../../src/dbsmodel/authKey/authKey');
        let saveStub, sessionStub, createNewAuthKeyStub;

        describe('FindForgotPasswordAuthKey Test', () => {
            let query, schemaStub, authKey;

            beforeEach(() => {
                authKey = 'key';
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(authKey),
                };
                schemaStub = sinon.stub(dbsModel, 'findOne').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find a forgot password authKey without a mongooseSession', async () => {
                const resp = await repo.FindForgotPasswordAuthKey();

                resp.should.equal(authKey);
                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
            });

            it('should find a forgot password authKey with a mongooseSession', async () => {
                const resp = await repo.FindForgotPasswordAuthKey('', '', {});

                resp.should.equal(authKey);
                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
            });
        });

        describe('FindLoginAuthKey Test', () => {
            let query, schemaStub, authKey;

            beforeEach(() => {
                authKey = 'key';
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(authKey),
                };
                schemaStub = sinon.stub(dbsModel, 'findOne').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find a forgot password authKey without a mongooseSession', async () => {
                const resp = await repo.FindLoginAuthKey();

                resp.should.equal(authKey);
                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
            });

            it('should find a forgot password authKey with a mongooseSession', async () => {
                const resp = await repo.FindLoginAuthKey('', {});

                resp.should.equal(authKey);
                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
            });
        });

        describe('CreateForgotPasswordAuthKey Test', () => {
            let authKey;

            beforeEach(() => {
                authKey = 'key';
                createNewAuthKeyStub = sinon.stub(repo, '_CreateNewAuthKey').resolves(authKey);
            });

            afterEach(() => {
                createNewAuthKeyStub.restore();
            });

            it('should successfully create an auth key', async () => {
                const resp = await repo.CreateForgotPasswordAuthKey('', {});

                resp.should.equal(authKey);
                createNewAuthKeyStub.calledOnce.should.be.true;
            });
        });

        describe('CreateLoginAuthKey Test', () => {
            let authKey;

            beforeEach(() => {
                authKey = 'key';
                createNewAuthKeyStub = sinon.stub(repo, '_CreateNewAuthKey').resolves(authKey);
            });

            afterEach(() => {
                createNewAuthKeyStub.restore();
            });

            it('should successfully create an auth key', async () => {
                const resp = await repo.CreateLoginAuthKey('', {});

                resp.should.equal(authKey);
                createNewAuthKeyStub.calledOnce.should.be.true;
            });
        });

        describe('_CreateNewAuthKey Test', () => {
            let authKey;

            beforeEach(() => {
                authKey = 'key';
                sessionStub = sinon.stub(dbsModel.prototype, '$session');
                saveStub = sinon.stub(dbsModel.prototype, 'save').resolves(authKey);
            });

            afterEach(() => {
                sessionStub.restore();
                saveStub.restore();
            });

            it('should create an auth key without a mongoose session', async () => {
                const ret = await repo._CreateNewAuthKey('', '', '', 32);

                ret.should.equal(authKey);
                sessionStub.called.should.be.false;
                saveStub.calledOnce.should.be.true;
            });

            it('should create an auth key with a mongoose session', async () => {
                const ret = await repo._CreateNewAuthKey('', '', '', 32, {});

                ret.should.equal(authKey);
                sessionStub.calledOnce.should.be.true;
                saveStub.calledOnce.should.be.true;
            });
        });
    });
})();
