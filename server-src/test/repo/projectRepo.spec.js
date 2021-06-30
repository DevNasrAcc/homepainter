(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('projectRepo Test', function () {
        const repo = require('../../src/repo/projectRepo');
        const projectModel = require('../../src/dbsmodel/project/project');
        let projectModelStub, query;

        describe('FindAllProjectsUserHasAccessTo Test', () => {
            const projects = [{}, {}];
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(projects),
                };
                projectModelStub = sinon.stub(projectModel, 'find').returns(query);
            });

            afterEach(() => {
                query = {};
                projectModelStub.restore();
            });

            it('should return all projects a user has access to with a mongoose session', async () => {
                const resp = await repo.FindAllProjectsUserHasAccessTo('id', {});

                projectModelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(projects);
            });

            it('should return all projects a user has access to without a mongoose session', async () => {
                const resp = await repo.FindAllProjectsUserHasAccessTo('id');

                projectModelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(projects);
            });
        });

        describe('FindOneById', () => {
            const project = 'foo';
            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(project),
                };
                projectModelStub = sinon.stub(projectModel, 'findById').returns(query);
            });

            afterEach(() => {
                projectModelStub.restore();
            });

            it('should find a project by id with a mongoose session', async () => {
                const resp = await repo.FindOneById('id', {});

                projectModelStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(project);
            });

            it('should find a project by id without a mongoose session', async () => {
                const resp = await repo.FindOneById('id');

                projectModelStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(project);
            });
        });

        describe('FindOneAndUpdate Test', function () {
            let project, query, schemaStub;

            beforeEach(() => {
                project = new projectModel({});
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(project),
                };
                schemaStub = sinon.stub(projectModel, 'findOneAndUpdate').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find and update one without a mongoose session', async () => {
                const ret = await repo.FindOneAndUpdate(project);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(project);
            });

            it('should find and update one with a mongoose session', async () => {
                const ret = await repo.FindOneAndUpdate(project, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(project);
            });

            it('should throw if project is not a mongoose model', async () => {
                try {
                    await repo.FindOneAndUpdate({}, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    expect(e.message).to.equal('project is not a document');
                }

                schemaStub.called.should.be.false;
                query.session.called.should.be.false;
                query.exec.called.should.be.false;
            });
        });

        describe('FindOneAndUpsert Test', function () {
            let project, query, schemaStub;

            beforeEach(() => {
                project = {};
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(project),
                };
                schemaStub = sinon.stub(projectModel, 'findOneAndUpdate').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find and update one without a mongoose session', async () => {
                const ret = await repo.FindOneAndUpsert(project);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(project);
            });

            it('should find and update one with a mongoose session', async () => {
                const ret = await repo.FindOneAndUpsert(project, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(project);
            });

            it('should find and update with an id present', async () => {
                project._id = 'foobar';

                const ret = await repo.FindOneAndUpsert(project, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(project);
            });
        });

        describe('FindOneWeekAbandonedProjects', () => {
            const projects = [{}, {}];
            beforeEach(() => {
                query = {
                    populate: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(projects),
                };
                projectModelStub = sinon.stub(projectModel, 'find').returns(query);
            });

            afterEach(() => {
                projectModelStub.restore();
            });

            it("should return a list of projects that haven't been updated in 1 week with a mongoose session", async () => {
                const resp = await repo.FindOneWeekAbandonedProjects({});

                projectModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(projects);
            });

            it("should return a list of projects that haven't been updated in 1 week without a mongoose session", async () => {
                const resp = await repo.FindOneWeekAbandonedProjects();

                projectModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(projects);
            });
        });

        describe('FindTwelveWeekAbandonedProjects', () => {
            const projects = [{}, {}];
            beforeEach(() => {
                query = {
                    populate: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(projects),
                };
                projectModelStub = sinon.stub(projectModel, 'find').returns(query);
            });

            afterEach(() => {
                projectModelStub.restore();
            });

            it("should return a list of projects that haven't been updated in 12 weeks with a mongoose session", async () => {
                const resp = await repo.FindTwelveWeekAbandonedProjects({});

                projectModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(projects);
            });

            it("should return a list of projects that haven't been updated in 12 weeks without a mongoose session", async () => {
                const resp = await repo.FindTwelveWeekAbandonedProjects();

                projectModelStub.calledOnce.should.be.true;
                query.populate.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(projects);
            });
        });
    });
})();
