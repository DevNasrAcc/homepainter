(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('securityEventRepo Test', function () {
        const repo = require('../../src/repo/securityEventRepo');
        const securityEventModels = require('../../src/dbsmodel/securityEvent/securityEvent');
        let schemaStub, query, saveStub, sessionStub;

        describe('CreateUnsuccessfulLoginSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateUnsuccessfulLoginSecEvt();

                ret.should.equal(event);
            });
        });

        describe('CreateSuccessfulLoginSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateSuccessfulLoginSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreateUnsuccessfulLoginWithJwtSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateUnsuccessfulLoginWithJwtSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreateLogoutSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateLogoutSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreateUnsuccessfulPasswordChangeSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateUnsuccessfulPasswordChangeSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreatePasswordChangeSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreatePasswordChangeSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreatePasswordResetRequestSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreatePasswordResetRequestSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreateUnsuccessfulPasswordResetSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateUnsuccessfulPasswordResetSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreatePasswordResetSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreatePasswordResetSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreateAccountLockoutSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateAccountLockoutSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreateAccountUnlockedSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateAccountUnlockedSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreateAccountSettingsChangeSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateAccountSettingsChangeSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('CreateProfileSettingsChangeSecEvt Test', function () {
            let createSecurityEventStub;

            beforeEach(() => {
                createSecurityEventStub = sinon.stub(repo, '_CreateSecurityEvent');
            });

            afterEach(() => {
                createSecurityEventStub.restore();
            });

            it('should resolve successfully', async () => {
                const event = 'foo';
                createSecurityEventStub.resolves(event);

                const ret = await repo.CreateProfileSettingsChangeSecEvt({}, {});

                ret.should.equal(event);
            });
        });

        describe('_CreateSecurityEvent Test', () => {
            const event = 'foo';

            beforeEach(() => {
                saveStub = sinon.stub(securityEventModels.SecurityEventModel.prototype, 'save').resolves(event);
                sessionStub = sinon.stub(securityEventModels.SecurityEventModel.prototype, '$session');
            });

            afterEach(() => {
                saveStub.restore();
                sessionStub.restore();
            });

            it('should create a security event with a mongoose session', async () => {
                const ret = await repo._CreateSecurityEvent('SecurityEventModel', {}, {});

                saveStub.calledOnce.should.be.true;
                sessionStub.calledOnce.should.be.true;
                ret.should.equal(event);
            });

            it('should create a security event without a mongoose session', async () => {
                const ret = await repo._CreateSecurityEvent('SecurityEventModel', {});

                saveStub.calledOnce.should.be.true;
                sessionStub.called.should.be.false;
                ret.should.equal(event);
            });
        });

        describe('GetLastAccountLockout', function () {
            beforeEach(() => {
                query = {
                    sort: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub(),
                };
                schemaStub = sinon
                    .stub(securityEventModels.AccountLockoutSecEvtDiscriminator, 'findOne')
                    .returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should return null if resp is null', async () => {
                query.exec.resolves(null);

                const ret = await repo.GetLastAccountLockout({}, {});

                schemaStub.calledOnce.should.be.true;
                query.sort.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                expect(ret).to.equal(null);
            });

            it('should return created if resp exists', async () => {
                const resolve = { createdAt: new Date() };
                query.exec.resolves(resolve);

                const ret = await repo.GetLastAccountLockout({});

                schemaStub.calledOnce.should.be.true;
                query.sort.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                expect(ret).to.equal(resolve.createdAt);
            });
        });

        describe('GetNumberOfLoginAttemptsIn24hours', function () {
            const loginEvents = [{}, {}];
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(loginEvents),
                };
                schemaStub = sinon
                    .stub(securityEventModels.UnsuccessfulLoginSecEvtDiscriminator, 'find')
                    .returns(query);
            });

            afterEach(() => {
                query = {};
                schemaStub.restore();
            });

            it('should return the length of unsuccessful logins in 24 hours with mongoose session', async () => {
                const ret = await repo.GetNumberOfLoginAttemptsIn24hours({}, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                expect(ret).to.equal(loginEvents.length);
            });

            it('should return the length of unsuccessful logins in 24 hours without mongoose session', async () => {
                const ret = await repo.GetNumberOfLoginAttemptsIn24hours({});

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                expect(ret).to.equal(loginEvents.length);
            });
        });
    });
})();
