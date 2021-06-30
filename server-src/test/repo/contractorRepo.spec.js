(function () {
    'use strict';
    const sinon = require('sinon');
    const expect = require('chai').expect;
    require('chai').should();

    describe('contractorRepo Test', function () {
        const repo = require('../../src/repo/contractorRepo');
        const contractorModel = require('../../src/dbsmodel/user/user').ContractorDiscriminator;
        let schemaStub, query, saveStub, sessionStub;

        describe('CreateContractor Test', () => {
            beforeEach(() => {
                saveStub = sinon.stub(contractorModel.prototype, 'save').resolvesThis();
                sessionStub = sinon.stub(contractorModel.prototype, '$session');
            });

            afterEach(() => {
                saveStub.restore();
                sessionStub.restore();
            });

            it('should create a contractor without a mongoose session', async () => {
                const ret = await repo.CreateContractor({});

                saveStub.calledOnce.should.be.true;
                sessionStub.called.should.be.false;
                (ret instanceof contractorModel).should.be.true;
            });

            it('should create a contractor with a mongoose session', async () => {
                const ret = await repo.CreateContractor({}, {});

                saveStub.calledOnce.should.be.true;
                sessionStub.calledOnce.should.be.true;
                (ret instanceof contractorModel).should.be.true;
            });
        });

        describe('FindAllIncompleteProfileContractors Test', () => {
            let contractorList;
            beforeEach(() => {
                contractorList = [{}, {}];
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(contractorList),
                };
                schemaStub = sinon.stub(contractorModel, 'find').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find all contractors with an incomplete profile approved 2 weeks ago without a mongoose session', async () => {
                const ret = await repo.FindAllIncompleteProfileContractors();

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });

            it('should find all contractors with an incomplete profile approved 2 weeks ago with a mongoose session', async () => {
                const ret = await repo.FindAllIncompleteProfileContractors({});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });
        });

        describe('FindAllContractorsWhoReceiveProjects Test', () => {
            let contractorList;
            beforeEach(() => {
                contractorList = [{}, {}];
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(contractorList),
                };
                schemaStub = sinon.stub(contractorModel, 'find').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find all contractors who receive projects without a mongoose session', async () => {
                const ret = await repo.FindAllContractorsWhoReceiveProjects();

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });

            it('should find all contractors who receive projects with a mongoose session', async () => {
                const ret = await repo.FindAllContractorsWhoReceiveProjects({});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });
        });

        describe('FindAllContractorsWhoCanBid', () => {
            let contractorList;
            beforeEach(() => {
                contractorList = [{}, {}];
                query = {
                    session: sinon.stub(),
                    sort: sinon.stub(),
                    exec: sinon.stub().resolves(contractorList),
                };
                schemaStub = sinon.stub(contractorModel, 'find').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find all contractors who receive projects without a mongoose session', async () => {
                const ret = await repo.FindAllContractorsWhoCanBid();

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.sort.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });

            it('should find all contractors who receive projects with a mongoose session', async () => {
                const ret = await repo.FindAllContractorsWhoCanBid({});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.sort.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });
        });

        describe('FindOneByEmail Test', () => {
            let contractorList;
            beforeEach(() => {
                contractorList = [{}, {}];
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(contractorList),
                };
                schemaStub = sinon.stub(contractorModel, 'findOne').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find all contractors who receive projects without a mongoose session', async () => {
                const ret = await repo.FindOneByEmail('');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });

            it('should find all contractors who receive projects with a mongoose session', async () => {
                const ret = await repo.FindOneByEmail('', {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });
        });

        describe('FindOneById Test', () => {
            let contractorList;
            beforeEach(() => {
                contractorList = [{}, {}];
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(contractorList),
                };
                schemaStub = sinon.stub(contractorModel, 'findOne').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find all contractors who receive projects without a mongoose session', async () => {
                const ret = await repo.FindOneById('');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });

            it('should find all contractors who receive projects with a mongoose session', async () => {
                const ret = await repo.FindOneById('', {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });
        });

        describe('FindAllContractorsFromList Test', () => {
            let contractorList;

            beforeEach(() => {
                contractorList = [{}, {}];
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(contractorList),
                };
                schemaStub = sinon.stub(contractorModel, 'find').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find all contractors from a list without a mongoose session', async () => {
                const ret = await repo.FindAllContractorsFromList(['', '']);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });

            it('should find all contractors who receive projects with a mongoose session', async () => {
                const ret = await repo.FindAllContractorsFromList(['', ''], {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractorList);
            });
        });

        describe('IncrementJobCompleteCount Test', () => {
            let contractor;

            beforeEach(() => {
                contractor = {};
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(contractor),
                };
                schemaStub = sinon.stub(contractorModel, 'findOneAndUpdate').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should increment job complete count without a mongoose session', async () => {
                const ret = await repo.IncrementJobCompleteCount('');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractor);
            });

            it('should increment job complete count with a mongoose session', async () => {
                const ret = await repo.IncrementJobCompleteCount('', {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(contractor);
            });
        });
    });
})();
