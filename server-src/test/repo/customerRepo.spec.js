(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('customerRepo Test', function () {
        const repo = require('../../src/repo/customerRepo');
        const customerModel = require('../../src/dbsmodel/user/user').CustomerDiscriminator;
        let schemaStub, saveStub, sessionStub;

        describe('FindOneById Test', function () {
            let customer, query;
            beforeEach(() => {
                customer = 'bob';
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(customer),
                };
                schemaStub = sinon.stub(customerModel, 'findById').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find one by id without a mongoose session', async () => {
                const ret = await repo.FindOneById('');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });

            it('should find one by id with a mongoose session', async () => {
                const ret = await repo.FindOneById('', {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });
        });

        describe('FindOneByEmail Test', function () {
            let customer, query;
            beforeEach(() => {
                customer = 'bob';
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(customer),
                };
                schemaStub = sinon.stub(customerModel, 'findOne').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find one by email without a mongoose session', async () => {
                const ret = await repo.FindOneByEmail('');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });

            it('should find one by email with a mongoose session', async () => {
                const ret = await repo.FindOneByEmail('', {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });
        });

        describe('FindOneAndUpdate Test', function () {
            let customer, query;

            beforeEach(() => {
                customer = new customerModel({ email: { address: 'a@b.com' } });
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(customer),
                };
                schemaStub = sinon.stub(customerModel, 'findOneAndUpdate').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find and update one without a mongoose session', async () => {
                const ret = await repo.FindOneAndUpdate(customer);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });

            it('should find and update one with a mongoose session', async () => {
                const ret = await repo.FindOneAndUpdate(customer, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });

            it('should throw if customer is not a mongoose model', async () => {
                try {
                    await repo.FindOneAndUpdate({}, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    expect(e.message).to.equal('customer is not a document');
                }

                schemaStub.called.should.be.false;
                query.session.called.should.be.false;
                query.exec.called.should.be.false;
            });
        });

        describe('FindOneAndUpsert Test', function () {
            let customer, query;

            beforeEach(() => {
                customer = { email: { address: 'a@b.com' } };
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(customer),
                };
                schemaStub = sinon.stub(customerModel, 'findOneAndUpdate').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find and update one without a mongoose session', async () => {
                const ret = await repo.FindOneAndUpsert(customer);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });

            it('should find and update one with a mongoose session', async () => {
                const ret = await repo.FindOneAndUpsert(customer, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });

            it('should find and update with an id present', async () => {
                customer._id = 'foobar';

                const ret = await repo.FindOneAndUpsert(customer, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(customer);
            });
        });

        describe('CreateAgent Test', () => {
            let agent;

            beforeEach(() => {
                agent = {};
                sessionStub = sinon.stub(customerModel.prototype, '$session');
                saveStub = sinon.stub(customerModel.prototype, 'save').resolves(agent);
            });

            afterEach(() => {
                sessionStub.restore();
                saveStub.restore();
            });

            it('should create a customer with the role of agent with a mongoose session', async () => {
                const ret = await repo.CreateAgent({}, {});

                saveStub.calledOnce.should.be.true;
                sessionStub.calledOnce.should.be.true;
                ret.should.equal(agent);
            });

            it('should create a customer with the role of agent without a mongoose session', async () => {
                const ret = await repo.CreateAgent({});

                saveStub.calledOnce.should.be.true;
                sessionStub.called.should.be.false;
                ret.should.equal(agent);
            });
        });
    });
})();
