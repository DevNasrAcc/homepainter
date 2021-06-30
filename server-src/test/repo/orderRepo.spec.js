(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('OrderRepo Test', function () {
        const repo = require('../../src/repo/orderRepo');
        const orderModel = require('../../src/dbsmodel/order/order');
        let orderModelStub, query;

        describe('FindOneById Test', () => {
            const order = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(order),
                };
                orderModelStub = sinon.stub(orderModel, 'findOne').returns(query);
            });

            afterEach(() => {
                orderModelStub.restore();
            });

            it('should find one by id with a mongoose session', async () => {
                const resp = await repo.FindOneById('', {});

                orderModelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(order);
            });

            it('should find one by id without a mongoose session', async () => {
                const resp = await repo.FindOneById('');

                orderModelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(order);
            });
        });

        describe('FindOneByProjectId Test', () => {
            const order = 'foo';
            beforeEach(() => {
                query = {
                    populate: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(order),
                };
                orderModelStub = sinon.stub(orderModel, 'findOne').returns(query);
            });

            afterEach(() => {
                orderModelStub.restore();
            });

            it('should find one and update by project id with a mongoose session', async () => {
                const ret = await repo.FindOneByProjectId('', {});

                orderModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(order);
            });

            it('should find one and update by project id without a mongoose session', async () => {
                const ret = await repo.FindOneByProjectId('');

                orderModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(order);
            });
        });

        describe('FindOneAndUpdate Test', function () {
            let order, query, schemaStub;

            beforeEach(() => {
                order = new orderModel({});
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(order),
                };
                schemaStub = sinon.stub(orderModel, 'findOneAndUpdate').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find and update one without a mongoose session', async () => {
                const ret = await repo.FindOneAndUpdate(order);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(order);
            });

            it('should find and update one with a mongoose session', async () => {
                const ret = await repo.FindOneAndUpdate(order, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(order);
            });

            it('should throw if order is not a mongoose model', async () => {
                try {
                    await repo.FindOneAndUpdate({}, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    expect(e.message).to.equal('order is not a document');
                }

                schemaStub.called.should.be.false;
                query.session.called.should.be.false;
                query.exec.called.should.be.false;
            });
        });

        describe('FindOneAndUpsert Test', function () {
            let order, query, schemaStub;

            beforeEach(() => {
                order = {};
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(order),
                };
                schemaStub = sinon.stub(orderModel, 'findOneAndUpdate').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find and update one without a mongoose session', async () => {
                const ret = await repo.FindOneAndUpsert(order);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(order);
            });

            it('should find and update one with a mongoose session', async () => {
                const ret = await repo.FindOneAndUpsert(order, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(order);
            });

            it('should find and update with an id present', async () => {
                order._id = 'foobar';

                const ret = await repo.FindOneAndUpsert(order, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(order);
            });
        });

        describe('FindAllAwaitingStartEndDateSubmission Test', () => {
            const orders = ['foo', 'bar'];
            beforeEach(() => {
                query = {
                    populate: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(orders),
                };
                orderModelStub = sinon.stub(orderModel, 'find').returns(query);
            });

            afterEach(() => {
                orderModelStub.restore();
            });

            it('should find orders by project id with a mongoose session', async () => {
                const ret = await repo.FindAllAwaitingStartEndDateSubmission({});

                orderModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });

            it('should find orders by project id without a mongoose session', async () => {
                const ret = await repo.FindAllAwaitingStartEndDateSubmission();

                orderModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });
        });

        describe('FindAllStartingTomorrow Test', () => {
            const orders = [{}, {}];
            beforeEach(() => {
                query = {
                    populate: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(orders),
                };
                orderModelStub = sinon.stub(orderModel, 'find').returns(query);
            });

            afterEach(() => {
                orderModelStub.restore();
            });

            it('should return all orders starting tomorrow with a mongoose session', async () => {
                const ret = await repo.FindAllStartingTomorrow({});

                orderModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });

            it('should return all orders starting tomorrow without a mongoose session', async () => {
                const ret = await repo.FindAllStartingTomorrow();

                orderModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });
        });

        describe('FindAllAwaitingContractorJobCompleteConfirmation Test', () => {
            const orders = [{}, {}];
            beforeEach(() => {
                query = {
                    populate: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(orders),
                };
                orderModelStub = sinon.stub(orderModel, 'find').returns(query);
            });

            afterEach(() => {
                orderModelStub.restore();
            });

            it('should return all orders awaiting contractor job complete confirmation with a mongoose session', async () => {
                const ret = await repo.FindAllAwaitingContractorJobCompleteConfirmation({});

                orderModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });

            it('should return all orders awaiting contractor job complete confirmation starting tomorrow without a mongoose session', async () => {
                const ret = await repo.FindAllAwaitingContractorJobCompleteConfirmation();

                orderModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });
        });

        describe('FindAllUnpaidPendingFinalPayments Test', () => {
            const orders = [{}, {}];
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(orders),
                };
                orderModelStub = sinon.stub(orderModel, 'find').returns(query);
            });

            afterEach(() => {
                orderModelStub.restore();
            });

            it('should return all orders awaiting final payment with a mongoose session', async () => {
                const ret = await repo.FindAllUnpaidPendingFinalPayments({});

                orderModelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });

            it('should return all orders awaiting final payment without a mongoose session', async () => {
                const ret = await repo.FindAllUnpaidPendingFinalPayments();

                orderModelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });
        });

        describe('FindAllAwaitingCustomerFeedback Test', () => {
            const orders = [{}, {}];
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(orders),
                };
                orderModelStub = sinon.stub(orderModel, 'find').returns(query);
            });

            afterEach(() => {
                orderModelStub.restore();
            });

            it('should return all orders awaiting customer feedback with a mongoose session', async () => {
                const ret = await repo.FindAllAwaitingCustomerFeedback({});

                orderModelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });

            it('should return all orders customer feedback starting tomorrow without a mongoose session', async () => {
                const ret = await repo.FindAllAwaitingCustomerFeedback();

                orderModelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(orders);
            });
        });
    });
})();
