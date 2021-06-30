(function () {
    'use strict';
    const sinon = require('sinon');
    const expect = require('chai').expect;
    require('chai').should();

    describe('LocationService Test', function () {
        const repo = require('../../src/repo/locationRepo');
        const service = require('../../src/service/locationService');
        let repoStub;

        describe('IsAreaServiced', () => {
            beforeEach(() => {
                repoStub = sinon.stub(repo, 'FindAllServicedByZipCode');
            });

            afterEach(() => {
                repoStub.restore();
            });

            it('should search by zip and return true', async () => {
                repoStub.resolves([50014]);

                const resp = await service.IsAreaServiced('50014', {});

                resp.should.be.true;
            });

            it('should return false', async () => {
                repoStub.resolves([]);

                const resp = await service.IsAreaServiced('50014', {});

                resp.should.be.false;
            });
        });

        describe('GetRoomSizes', () => {
            const locationRepo = require('../../src/repo/locationRepo');
            const h = require('../../src/helpers/helpers');
            let isNullStub, locationRepoStub;
            const _mockData = require('../_mockData/location.mock');
            let mockData;

            beforeEach(() => {
                locationRepoStub = sinon.stub(locationRepo, 'FindOneByZipCode');
                isNullStub = sinon.stub(h, 'isNull');
                mockData = JSON.parse(JSON.stringify(_mockData));
            });

            afterEach(() => {
                locationRepoStub.restore();
                isNullStub.restore();
            });

            it('should return null if the database does not find a match', async () => {
                locationRepoStub.resolves(null);
                isNullStub.returns(true);

                const resp = await service.GetRoomSizes('50014', 'house', 'livingRoom', {});

                expect(resp).to.equal(null);
            });

            it('should return a correctly formatted object for room sizes when items match', async () => {
                const resolveResp = [
                    { name: 'small', length: 10, width: 10, prepHours: 1, label: "10'x10' or less" },
                    { name: 'medium', length: 15, width: 15, prepHours: 1.5, label: "10'x10' to 15'x15'" },
                    { name: 'large', length: 20, width: 20, prepHours: 2, label: "15'x15' to 20'x20'" },
                ];
                const expectedResp = [
                    { name: 'small', length: 10, width: 10, prepHours: 1, label: "10'x10' or less" },
                    { name: 'medium', length: 15, width: 15, prepHours: 1.5, label: "10'x10' to 15'x15'" },
                    { name: 'large', length: 20, width: 20, prepHours: 2, label: "15'x15' to 20'x20'" },
                ];
                mockData.house.livingRoom.size = resolveResp;

                locationRepoStub.resolves(mockData);
                isNullStub.returns(false);

                const resp = await service.GetRoomSizes('50014', 'house', 'livingRoom', {});
                expect(resp).to.deep.equal(expectedResp);
            });

            it('should return a correctly formatted object for room sizes when out of order', async () => {
                const resolveResp = [
                    { name: 'medium', length: 15, width: 15, prepHours: 1.5, label: "10'x10' to 15'x15'" },
                    { name: 'small', length: 10, width: 10, prepHours: 1, label: "10'x10' or less" },
                    { name: 'large', length: 20, width: 20, prepHours: 2, label: "15'x15' to 20'x20'" },
                ];
                const expectedResp = [
                    { name: 'small', length: 10, width: 10, prepHours: 1, label: "10'x10' or less" },
                    { name: 'medium', length: 15, width: 15, prepHours: 1.5, label: "10'x10' to 15'x15'" },
                    { name: 'large', length: 20, width: 20, prepHours: 2, label: "15'x15' to 20'x20'" },
                ];
                mockData.house.livingRoom.size = resolveResp;

                locationRepoStub.resolves(mockData);
                isNullStub.returns(false);

                const resp = await service.GetRoomSizes('50014', 'house', 'livingRoom', {});
                expect(resp).to.deep.equal(expectedResp);
            });

            it('should return a correctly formatted object for room sizes when equal', async () => {
                const resolveResp = [
                    { name: 'medium', length: 15, width: 15, prepHours: 1.5, label: "10'x10' to 15'x15'" },
                    { name: 'large', length: 15, width: 15, prepHours: 2, label: "15'x15' to 20'x20'" },
                    { name: 'small', length: 15, width: 15, prepHours: 1, label: "10'x10' or less" },
                ];
                const expectedResp = [
                    { name: 'medium', length: 15, width: 15, prepHours: 1.5, label: "10'x10' to 15'x15'" },
                    { name: 'large', length: 15, width: 15, prepHours: 2, label: "15'x15' to 20'x20'" },
                    { name: 'small', length: 15, width: 15, prepHours: 1, label: "10'x10' or less" },
                ];
                mockData.house.livingRoom.size = resolveResp;

                locationRepoStub.resolves(mockData);
                isNullStub.returns(false);

                const resp = await service.GetRoomSizes('50014', 'house', 'livingRoom', {});
                expect(resp).to.deep.equal(expectedResp);
            });
        });

        describe('GetRoomHeights', () => {
            const locationRepo = require('../../src/repo/locationRepo');
            const h = require('../../src/helpers/helpers');
            let isNullStub, locationRepoStub;
            const mockData = require('../_mockData/location.mock');

            beforeEach(() => {
                locationRepoStub = sinon.stub(locationRepo, 'FindOneByZipCode');
                isNullStub = sinon.stub(h, 'isNull');
            });

            afterEach(() => {
                locationRepoStub.restore();
                isNullStub.restore();
            });

            it('should return null if the database does not find a match', async () => {
                locationRepoStub.resolves(null);
                isNullStub.returns(true);

                const resp = await service.GetRoomHeights('50014', 'house', 'livingRoom', {});

                expect(resp).to.equal(null);
            });

            it('should return a correctly sorted room size array', async () => {
                const resolveResp = [
                    { name: 'small', height: 10, label: "10' or less" },
                    { name: 'medium', height: 15, label: "10' to 15'" },
                ];
                const expectedResp = [
                    { name: 'small', height: 10, label: "10' or less" },
                    { name: 'medium', height: 15, label: "10' to 15'" },
                ];
                mockData.house.livingRoom.height = resolveResp;

                locationRepoStub.resolves(mockData);
                isNullStub.returns(false);

                const resp = await service.GetRoomHeights('50014', 'house', 'livingRoom', {});
                expect(resp).to.deep.equal(expectedResp);
            });

            it('should return a correctly sorted room size array', async () => {
                const resolveResp = [
                    { name: 'large', height: 20, label: "15' to 20'" },
                    { name: 'small', height: 10, label: "10' or less" },
                ];
                const expectedResp = [
                    { name: 'small', height: 10, label: "10' or less" },
                    { name: 'large', height: 20, label: "15' to 20'" },
                ];
                mockData.house.livingRoom.height = resolveResp;

                locationRepoStub.resolves(mockData);
                isNullStub.returns(false);

                const resp = await service.GetRoomHeights('50014', 'house', 'livingRoom', {});
                expect(resp).to.deep.equal(expectedResp);
            });

            it('should return a correctly sorted room size array', async () => {
                const resolveResp = [
                    { name: '', height: 10, label: '' },
                    { name: '', height: 10, label: '' },
                ];
                const expectedResp = [
                    { name: '', height: 10, label: '' },
                    { name: '', height: 10, label: '' },
                ];
                mockData.house.livingRoom.height = resolveResp;

                locationRepoStub.resolves(mockData);
                isNullStub.returns(false);

                const resp = await service.GetRoomHeights('50014', 'house', 'livingRoom', {});
                expect(resp).to.deep.equal(expectedResp);
            });
        });

        describe('FindOneByZipCode', () => {
            beforeEach(() => {
                repoStub = sinon.stub(repo, 'FindOneByZipCode');
            });

            afterEach(() => {
                repoStub.restore();
            });

            it('should return the locationData at the zip code', async () => {
                repoStub.resolves('asdf');

                const resp = await service.FindOneByZipCode('', {});

                resp.should.equal('asdf');
            });
        });
    });
})();
