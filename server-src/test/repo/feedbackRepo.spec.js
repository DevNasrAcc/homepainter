(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('FeedbackRepo Test', function () {
        const repo = require('../../src/repo/feedbackRepo');
        const customerJobCompleteModel = require('../../src/dbsmodel/feedback/feedback')
            .CustomerJobCompleteDiscriminator;
        const contractorJobCompleteModel = require('../../src/dbsmodel/feedback/feedback')
            .ContractorJobCompleteDiscriminator;
        const generalFeedbackModel = require('../../src/dbsmodel/feedback/feedback').GeneralFeedbackDiscriminator;
        let saveStub, sessionStub, query, schemaStub;

        describe('CreateContractorJobComplete Test', () => {
            let feedback;
            beforeEach(() => {
                feedback = 'foo';
                sessionStub = sinon.stub(contractorJobCompleteModel.prototype, '$session');
                saveStub = sinon.stub(contractorJobCompleteModel.prototype, 'save').resolves(feedback);
            });

            afterEach(() => {
                sessionStub.restore();
                saveStub.restore();
            });

            it('should create feedback with a mongoose session', async () => {
                const ret = await repo.CreateContractorJobComplete('', '', {}, {});

                ret.should.equal(feedback);
                sessionStub.calledOnce.should.be.true;
                saveStub.calledOnce.should.be.true;
            });

            it('should create feedback without a mongoose session', async () => {
                const ret = await repo.CreateContractorJobComplete('', '', {});

                ret.should.equal(feedback);
                sessionStub.called.should.be.false;
                saveStub.calledOnce.should.be.true;
            });
        });

        describe('CreateGeneralFeedback Test', () => {
            let feedback;
            beforeEach(() => {
                feedback = 'foo';
                sessionStub = sinon.stub(generalFeedbackModel.prototype, '$session');
                saveStub = sinon.stub(generalFeedbackModel.prototype, 'save').resolves(feedback);
            });

            afterEach(() => {
                sessionStub.restore();
                saveStub.restore();
            });

            it('should create feedback with a mongoose session', async () => {
                const ret = await repo.CreateGeneralFeedback('', '', {}, {});

                ret.should.equal(feedback);
                sessionStub.calledOnce.should.be.true;
                saveStub.calledOnce.should.be.true;
            });

            it('should create feedback without a mongoose session', async () => {
                const ret = await repo.CreateGeneralFeedback('', '');

                ret.should.equal(feedback);
                sessionStub.called.should.be.false;
                saveStub.calledOnce.should.be.true;
            });
        });

        describe('CreateCustomerJobComplete Test', () => {
            let feedback;
            beforeEach(() => {
                feedback = 'foo';
                sessionStub = sinon.stub(customerJobCompleteModel.prototype, '$session');
                saveStub = sinon.stub(customerJobCompleteModel.prototype, 'save').resolves(feedback);
            });

            afterEach(() => {
                sessionStub.restore();
                saveStub.restore();
            });

            it('should create feedback with a mongoose session', async () => {
                const ret = await repo.CreateCustomerJobComplete('', '', {}, {});

                ret.should.equal(feedback);
                sessionStub.calledOnce.should.be.true;
                saveStub.calledOnce.should.be.true;
            });

            it('should create feedback without a mongoose session', async () => {
                const ret = await repo.CreateCustomerJobComplete('', '');

                ret.should.equal(feedback);
                sessionStub.called.should.be.false;
                saveStub.calledOnce.should.be.true;
            });
        });

        describe('FindCustomerJobCompleteFeedback Test', () => {
            let feedback;
            beforeEach(() => {
                feedback = 'foo';
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(feedback),
                };
                schemaStub = sinon.stub(customerJobCompleteModel, 'findOne').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find one with a mongoose session', async () => {
                const ret = await repo.FindCustomerJobCompleteFeedback('id', {}, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(feedback);
            });

            it('should find one without a mongoose session', async () => {
                const ret = await repo.FindCustomerJobCompleteFeedback('id', {});

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(feedback);
            });
        });

        describe('GetContractorAverageRatings Test', () => {
            const ratings = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(ratings),
                };
                schemaStub = sinon.stub(customerJobCompleteModel, 'aggregate').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should aggregate the contractor ratings with a mongoose session', async () => {
                const ret = await repo.GetContractorAverageRatings({});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(ratings);
            });

            it('should aggregate the contractor ratings without a mongoose session', async () => {
                const ret = await repo.GetContractorAverageRatings();

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(ratings);
            });
        });

        describe('FindAllCustomerJobCompleteReviewsForContractorsFromList Test', () => {
            let feedback;
            beforeEach(() => {
                feedback = 'foo';
                query = {
                    session: sinon.stub(),
                    populate: sinon.stub(),
                    sort: sinon.stub(),
                    exec: sinon.stub().resolves(feedback),
                };
                schemaStub = sinon.stub(customerJobCompleteModel, 'find').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find one with a mongoose session', async () => {
                const ret = await repo.FindAllCustomerJobCompleteReviewsForContractorsFromList(['c1', 'c2']);

                schemaStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.sort.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(feedback);
            });

            it('should find one without a mongoose session', async () => {
                const ret = await repo.FindAllCustomerJobCompleteReviewsForContractorsFromList(['c1', 'c2'], {});

                schemaStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.sort.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(feedback);
            });
        });
    });
})();
