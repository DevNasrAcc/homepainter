(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('ProductAnalyticsService Test', () => {
        const projectAnalyticsService = require('../../src/service/projectAnalyticsService');

        describe('GetTotalItemUnits', () => {
            let projectDetails;

            beforeEach(() => {
                projectDetails = {
                    interior: [
                        {
                            size: {},
                            height: {},
                            items: [
                                {
                                    additionalDetails: {},
                                },
                            ],
                        },
                    ],
                };
            });

            it('should return correctly for invalid input type, cabinets', () => {
                projectDetails.interior[0].items[0].type = 'cabinets';

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(0);
            });

            it('should return correctly for ceilings', () => {
                projectDetails.interior[0].items[0].type = 'ceiling';
                projectDetails.interior[0].items[0].additionalDetails.ceilingType = 'flat';
                projectDetails.interior[0].size.length = 7;
                projectDetails.interior[0].size.width = 3;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(21);
            });

            it('should return correctly for ceilings that are vaulted', () => {
                projectDetails.interior[0].items[0].type = 'ceiling';
                projectDetails.interior[0].items[0].additionalDetails.ceilingType = 'vaulted';
                projectDetails.interior[0].size.length = 4;
                projectDetails.interior[0].size.width = 3;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(15);
            });

            it('should return correctly for 4 wall items', () => {
                projectDetails.interior[0].items[0].type = 'wall';
                projectDetails.interior[0].items[0].additionalDetails.amount = 4;
                projectDetails.interior[0].size.length = 4;
                projectDetails.interior[0].size.width = 3;
                projectDetails.interior[0].height.height = 10;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(140);
            });

            it('should return correctly for 3 wall items', () => {
                projectDetails.interior[0].items[0].type = 'wall';
                projectDetails.interior[0].items[0].additionalDetails.amount = 3;
                projectDetails.interior[0].size.length = 4;
                projectDetails.interior[0].size.width = 3;
                projectDetails.interior[0].height.height = 10;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(110);
            });

            it('should return correctly for 1 accentWall item', () => {
                projectDetails.interior[0].items[0].type = 'accentWall';
                projectDetails.interior[0].items[0].additionalDetails.amount = 1;
                projectDetails.interior[0].size.length = 4;
                projectDetails.interior[0].size.width = 3;
                projectDetails.interior[0].height.height = 10;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(40);
            });

            it('should return correctly for crownMolding items', () => {
                projectDetails.interior[0].items[0].type = 'crownMolding';
                projectDetails.interior[0].size.length = 4;
                projectDetails.interior[0].size.width = 3;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(14);
            });

            it('should return correctly for baseboard items', () => {
                projectDetails.interior[0].items[0].type = 'baseboard';
                projectDetails.interior[0].size.length = 4;
                projectDetails.interior[0].size.width = 3;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(14);
            });

            it('should return correctly for door items', () => {
                projectDetails.interior[0].items[0].type = 'door';
                projectDetails.interior[0].items[0].additionalDetails.amount = 1;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(1);
            });

            it('should return correctly for doorFrame items', () => {
                projectDetails.interior[0].items[0].type = 'doorFrame';
                projectDetails.interior[0].items[0].additionalDetails.amount = 1;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(1);
            });

            it('should return correctly for window items', () => {
                projectDetails.interior[0].items[0].type = 'window';
                projectDetails.interior[0].items[0].additionalDetails.amount = 1;

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(2);
            });

            it('should return correctly for fireplaceMantel items', () => {
                projectDetails.interior[0].items[0].type = 'fireplaceMantel';

                const res = projectAnalyticsService.GetTotalItemUnits(projectDetails, 0, 0);

                res.should.equal(1);
            });
        });

        describe('GetRoomPrepHours', () => {
            const _locationData = require('../_mockData/location.mock');
            let projectDetails, locationData;

            beforeEach(() => {
                locationData = JSON.parse(JSON.stringify(_locationData));
                projectDetails = {
                    interior: [
                        {
                            size: {},
                            height: {},
                            items: [],
                        },
                    ],
                };
            });

            it('should successfully return prep hours for a standard room size', () => {
                projectDetails.jobType = 'house';
                projectDetails.interior[0].type = 'livingRoom';
                projectDetails.interior[0].size = { length: 15, width: 15 };
                projectDetails.interior[0].items.push({ type: 'cabinets', estimates: { prepHours: 2 } });
                for (let sizeInfo of locationData.house.livingRoom.size) {
                    if ((sizeInfo.name = 'medium')) {
                        sizeInfo.prepHours = 5;
                    }
                }
                const resp = projectAnalyticsService.GetRoomPrepHours(projectDetails, locationData, 0);

                resp.should.equal(7);
            });

            it('should successfully return prep hours for a custom sized room', () => {
                projectDetails.jobType = 'house';
                projectDetails.interior[0].type = 'livingRoom';
                projectDetails.interior[0].size = { name: 'custom', width: 30, length: 30 };
                projectDetails.interior[0].items.push({ type: 'cabinets', estimates: { prepHours: 2 } });
                for (let sizeInfo of locationData.house.livingRoom.size) {
                    if ((sizeInfo.name = 'large')) {
                        sizeInfo.prepHours = 5;
                    }
                }

                const resp = projectAnalyticsService.GetRoomPrepHours(projectDetails, locationData, 0);

                resp.should.equal(7);
            });

            it('should successfully apply a multiplier for ceiling and not wall', () => {
                /* ceiling and not walls */
                projectDetails.jobType = 'house';
                projectDetails.interior[0].type = 'livingRoom';
                projectDetails.interior[0].size = { length: 15, width: 15 };
                projectDetails.interior[0].items.push({ type: 'ceiling', estimates: { prepHours: 0 } });
                for (let sizeInfo of locationData.house.livingRoom.size) {
                    if ((sizeInfo.name = 'medium')) {
                        sizeInfo.prepHours = 5;
                    }
                }

                const resp = projectAnalyticsService.GetRoomPrepHours(projectDetails, locationData, 0);

                resp.should.equal(10);
            });

            it('should successfully apply a multiplier for baseboard and not wall', () => {
                /* ceiling and not walls */
                projectDetails.jobType = 'house';
                projectDetails.interior[0].type = 'livingRoom';
                projectDetails.interior[0].size = { length: 15, width: 15 };
                projectDetails.interior[0].items.push({ type: 'baseboard', estimates: { prepHours: 0 } });
                for (let sizeInfo of locationData.house.livingRoom.size) {
                    if ((sizeInfo.name = 'medium')) {
                        sizeInfo.prepHours = 5;
                    }
                }

                const resp = projectAnalyticsService.GetRoomPrepHours(projectDetails, locationData, 0);

                resp.should.equal(10);
            });

            it('should successfully apply a multiplier for crown molding and not wall', () => {
                /* ceiling and not walls */
                projectDetails.jobType = 'house';
                projectDetails.interior[0].type = 'livingRoom';
                projectDetails.interior[0].size = { length: 15, width: 15 };
                projectDetails.interior[0].items.push({ type: 'crownMolding', estimates: { prepHours: 0 } });
                for (let sizeInfo of locationData.house.livingRoom.size) {
                    if ((sizeInfo.name = 'medium')) {
                        sizeInfo.prepHours = 5;
                    }
                }
                const resp = projectAnalyticsService.GetRoomPrepHours(projectDetails, locationData, 0);

                resp.should.equal(10);
            });

            it('should successfully apply a multiplier for crown molding and not ceiling', () => {
                /* ceiling and not walls */
                projectDetails.jobType = 'house';
                projectDetails.interior[0].type = 'livingRoom';
                projectDetails.interior[0].size = { length: 15, width: 15 };
                projectDetails.interior[0].items.push({ type: 'crownMolding', estimates: { prepHours: 0 } });
                projectDetails.interior[0].items.push({ type: 'wall', estimates: { prepHours: 0 } });
                for (let sizeInfo of locationData.house.livingRoom.size) {
                    if ((sizeInfo.name = 'medium')) {
                        sizeInfo.prepHours = 5;
                    }
                }

                const resp = projectAnalyticsService.GetRoomPrepHours(projectDetails, locationData, 0);

                resp.should.equal(10);
            });

            it('should not apply the multiplier twice', () => {
                projectDetails.jobType = 'house';
                projectDetails.interior[0].type = 'livingRoom';
                projectDetails.interior[0].size = { length: 15, width: 15 };
                projectDetails.interior[0].items.push({ type: 'ceiling', estimates: { prepHours: 0 } });
                projectDetails.interior[0].items.push({ type: 'baseboard', estimates: { prepHours: 0 } });
                for (let sizeInfo of locationData.house.livingRoom.size) {
                    if ((sizeInfo.name = 'medium')) {
                        sizeInfo.prepHours = 5;
                    }
                }

                const resp = projectAnalyticsService.GetRoomPrepHours(projectDetails, locationData, 0);

                resp.should.equal(10);
            });
        });

        describe('GetTimeMultiplier', () => {
            const _locationData = require('../_mockData/location.mock');
            let projectDetails, locationData;

            beforeEach(() => {
                projectDetails = {
                    jobType: 'house',
                    interior: [
                        {
                            type: 'livingRoom',
                        },
                    ],
                };
                locationData = JSON.parse(JSON.stringify(_locationData));
            });

            it('should return the correct room size', () => {
                const expected = _locationData.house.livingRoom.paintingPrimingTimeMultiplier;

                const resp = projectAnalyticsService.GetTimeMultiplier(projectDetails, locationData, 0);

                resp.should.equal(expected);
            });
        });

        describe('GetItemRepairHours', () => {
            let projectDetails;

            beforeEach(() => {
                projectDetails = {
                    interior: [
                        {
                            items: [{}],
                        },
                    ],
                };
            });

            it('should return 0.5 when item is a wall and drywallRepair is selected', () => {
                projectDetails.interior[0].items[0].type = 'wall';
                projectDetails.interior[0].items[0].additionalDetails = { conditions: ['drywallRepair'] };

                const resp = projectAnalyticsService.GetItemRepairHours(projectDetails, 0, 0);

                resp.should.equal(0.5);
            });

            it('should return 0 when item is a wall and drywallRepair is not selected', () => {
                projectDetails.interior[0].items[0].type = 'wall';
                projectDetails.interior[0].items[0].additionalDetails = { conditions: [] };

                const resp = projectAnalyticsService.GetItemRepairHours(projectDetails, 0, 0);

                resp.should.equal(0);
            });

            it('should return 0 when item is not a wall', () => {
                projectDetails.interior[0].items[0].type = 'ceiling';

                const resp = projectAnalyticsService.GetItemRepairHours(projectDetails, 0, 0);

                resp.should.equal(0);
            });
        });

        describe('GetItemPrepHours', () => {
            const _locationData = require('../_mockData/location.mock');
            let projectDetails, locationData;

            beforeEach(() => {
                locationData = JSON.parse(JSON.stringify(_locationData));
                projectDetails = {
                    interior: [
                        {
                            items: [
                                {
                                    additionalDetails: {
                                        numberOfCabinetDoors: 0,
                                        numberOfCabinetDrawers: 0,
                                    },
                                },
                            ],
                        },
                    ],
                };
            });

            it('should correctly return prep hours for cabinet doors', () => {
                projectDetails.interior[0].items[0].type = 'cabinets';
                projectDetails.interior[0].items[0].additionalDetails.numberOfCabinetDoors = 6;
                locationData.decorDetails.cabinetDoor.prepUnitsPerHour = 3;

                const resp = projectAnalyticsService.GetItemPrepHours(projectDetails, locationData, 0, 0);

                resp.should.equal(2);
            });

            it('should correctly return prep hours for cabinet drawers', () => {
                projectDetails.interior[0].items[0].type = 'cabinets';
                projectDetails.interior[0].items[0].additionalDetails.numberOfCabinetDrawers = 6;
                locationData.decorDetails.cabinetDrawer.prepUnitsPerHour = 3;

                const resp = projectAnalyticsService.GetItemPrepHours(projectDetails, locationData, 0, 0);

                resp.should.equal(2);
            });

            it('should correctly return prep hours for cabinet doors and drawers', () => {
                projectDetails.interior[0].items[0].type = 'cabinets';
                projectDetails.interior[0].items[0].additionalDetails.numberOfCabinetDoors = 6;
                locationData.decorDetails.cabinetDoor.prepUnitsPerHour = 3;
                projectDetails.interior[0].items[0].additionalDetails.numberOfCabinetDrawers = 6;
                locationData.decorDetails.cabinetDrawer.prepUnitsPerHour = 3;

                const resp = projectAnalyticsService.GetItemPrepHours(projectDetails, locationData, 0, 0);

                resp.should.equal(4);
            });

            it('should return 0 when the item is not a cabinet', () => {
                projectDetails.interior[0].items[0].type = 'wall';

                const resp = projectAnalyticsService.GetItemPrepHours(projectDetails, locationData, 0, 0);

                resp.should.equal(0);
            });
        });

        describe('GetItemPrimingHours', () => {
            const _locationData = require('../_mockData/location.mock');
            let projectDetails,
                locationData,
                roomIndex = 0,
                itemIndex = 0,
                GetTotalItemUnitsMock,
                GetTimeMultiplierStub;

            beforeEach(() => {
                projectDetails = {
                    interior: [
                        {
                            items: [
                                {
                                    additionalDetails: {
                                        conditions: [],
                                    },
                                },
                            ],
                        },
                    ],
                };
                locationData = JSON.parse(JSON.stringify(_locationData));
                GetTotalItemUnitsMock = sinon.stub(projectAnalyticsService, 'GetTotalItemUnits').returns(10);
                GetTimeMultiplierStub = sinon.stub(projectAnalyticsService, 'GetTimeMultiplier').returns(1);
            });

            afterEach(() => {
                GetTotalItemUnitsMock.restore();
                GetTimeMultiplierStub.restore();
            });

            it('Should return item priming hours for darkWalls', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'wall';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.conditions.push('darkWalls');
                locationData.decorDetails['wall'].primingUnitsPerHour = 5;

                const resp = projectAnalyticsService.GetItemPrimingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.be.above(0);
            });

            it('Should return item priming hours for unpaintedDrywall', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'wall';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.conditions.push(
                    'unpaintedDrywall'
                );

                const resp = projectAnalyticsService.GetItemPrimingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.be.above(0);
            });

            it('Should return item priming hours for unpainted cabinet doors', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetCondition = 'stained';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetTreatment = 'paint';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDoors = 4;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 0;
                locationData.decorDetails.cabinetDoor.primingUnitsPerHour = 2;

                const resp = projectAnalyticsService.GetItemPrimingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(2);
            });

            it('Should return item priming hours for unpainted cabinet drawers', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetCondition = 'stained';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetTreatment = 'paint';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDoors = 0;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 6;
                locationData.decorDetails.cabinetDrawer.primingUnitsPerHour = 3;

                const resp = projectAnalyticsService.GetItemPrimingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(2);
            });

            it('Should return 0 if item does not need primed', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'wall';
                projectDetails.interior[roomIndex].items[itemIndex].conditions = [];

                const resp = projectAnalyticsService.GetItemPrimingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(0);
            });

            it('Should return 0 for items that cannot be primed', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';

                const resp = projectAnalyticsService.GetItemPrimingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(0);
            });
        });

        describe('GetItemPaintingHours', () => {
            const _locationData = require('../_mockData/location.mock');
            let projectDetails,
                locationData,
                roomIndex = 0,
                itemIndex = 0,
                GetTotalItemUnitsStub,
                GetTimeMultiplierStub;

            beforeEach(() => {
                projectDetails = {
                    interior: [
                        {
                            items: [
                                {
                                    additionalDetails: {
                                        conditions: [],
                                    },
                                },
                            ],
                        },
                    ],
                };
                locationData = JSON.parse(JSON.stringify(_locationData));
                GetTotalItemUnitsStub = sinon.stub(projectAnalyticsService, 'GetTotalItemUnits');
                GetTimeMultiplierStub = sinon.stub(projectAnalyticsService, 'GetTimeMultiplier').returns(1);
            });

            afterEach(() => {
                GetTotalItemUnitsStub.restore();
                GetTimeMultiplierStub.restore();
            });

            it('Should return the painting hours for cabinet doors', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDoors = 6;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 0;
                locationData.decorDetails.cabinetDoor.paintingUnitsPerHour = 3;

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(2);
            });

            it('Should return the painting hours for cabinet drawers', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDoors = 0;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 6;
                locationData.decorDetails.cabinetDrawer.paintingUnitsPerHour = 3;

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(2);
            });

            it('Should return the painting hours for ceiling', () => {
                locationData.decorDetails.ceiling.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'ceiling';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });

            it('Should return the painting hours for crownMolding', () => {
                locationData.decorDetails.crownMolding.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'crownMolding';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });

            it('Should return the painting hours for wall', () => {
                locationData.decorDetails.wall.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'wall';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });

            it('Should return the painting hours for accentWall', () => {
                locationData.decorDetails.accentWall.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'accentWall';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });

            it('Should return the painting hours for door', () => {
                locationData.decorDetails.door.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'door';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });

            it('Should return the painting hours for doorFrame', () => {
                locationData.decorDetails.doorFrame.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'doorFrame';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });

            it('Should return the painting hours for baseboard', () => {
                locationData.decorDetails.baseboard.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'baseboard';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });

            it('Should return the painting hours for window', () => {
                locationData.decorDetails.window.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'window';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });

            it('Should return the painting hours for fireplaceMantel', () => {
                locationData.decorDetails.fireplaceMantel.paintingUnitsPerHour = 3;
                projectDetails.interior[roomIndex].items[itemIndex].type = 'fireplaceMantel';
                GetTotalItemUnitsStub.returns(7);

                const resp = projectAnalyticsService.GetItemPaintingHours(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(7 / 3);
            });
        });

        describe('GetItemPrimerGallons', () => {
            const _locationData = require('../_mockData/location.mock');
            let projectDetails,
                locationData,
                roomIndex = 0,
                itemIndex = 0,
                GetTotalItemUnitsStub;

            beforeEach(() => {
                projectDetails = {
                    interior: [
                        {
                            items: [
                                {
                                    additionalDetails: {
                                        conditions: [],
                                    },
                                },
                            ],
                        },
                    ],
                };
                locationData = JSON.parse(JSON.stringify(_locationData));
                GetTotalItemUnitsStub = sinon.stub(projectAnalyticsService, 'GetTotalItemUnits').returns(3);
            });

            afterEach(() => {
                GetTotalItemUnitsStub.restore();
            });

            it('Should return item priming gallons for darkWalls', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'wall';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.conditions.push('darkWalls');
                locationData.decorDetails['wall'].primingUnitsPerGallon = 3;

                const resp = projectAnalyticsService.GetItemPrimerGallons(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(1);
            });

            it('Should return item priming gallons for unpaintedDrywall', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'wall';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.conditions.push('darkWalls');
                locationData.decorDetails['wall'].primingUnitsPerGallon = 3;

                const resp = projectAnalyticsService.GetItemPrimerGallons(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(1);
            });

            it('Should return item priming gallons for unpainted cabinet doors', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDoors = 6;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 0;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetGrainType = 'smooth';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetCondition = 'bare';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetTreatment = 'paint';
                locationData.decorDetails.cabinetDoor.primingUnitsPerGallon = 3;

                const resp = projectAnalyticsService.GetItemPrimerGallons(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(2);
            });

            it('Should return item priming gallons for unpainted cabinet drawers', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDoors = 0;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 8;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetGrainType = 'smooth';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetCondition = 'bare';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetTreatment = 'paint';
                locationData.decorDetails.cabinetDrawer.primingUnitsPerGallon = 2;

                const resp = projectAnalyticsService.GetItemPrimerGallons(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(4);
            });

            it('Should return 1.25 * item priming gallons for unpainted cabinets that are grainy', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 0;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDoors = 3;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetGrainType = 'grainy';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetCondition = 'bare';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetTreatment = 'paint';
                locationData.decorDetails.cabinetDoor.primingUnitsPerGallon = 3;

                const resp = projectAnalyticsService.GetItemPrimerGallons(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(1.25);
            });

            it('Should return 0 for cabinets that dont need painting', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 3;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetGrainType = 'grainy';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetCondition = 'bare';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.cabinetTreatment = 'stain';
                locationData.decorDetails.cabinetDrawer.primingUnitsPerGallon = 3;

                const resp = projectAnalyticsService.GetItemPrimerGallons(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(0);
            });

            it('Should return 0 for wall that doesnt need priming', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'wall';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.conditions = [];

                const resp = projectAnalyticsService.GetItemPrimerGallons(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(0);
            });

            it('Should return 0 for items that dont need priming', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'fireplaceMantel';

                const resp = projectAnalyticsService.GetItemPrimerGallons(
                    projectDetails,
                    locationData,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(0);
            });
        });

        describe('GetItemPaintGallons', () => {
            const _locationData = require('../_mockData/location.mock');
            let projectDetails,
                locationMock,
                roomIndex = 0,
                itemIndex = 0,
                GetTotalItemUnitsStub;

            beforeEach(() => {
                projectDetails = {
                    interior: [
                        {
                            items: [
                                {
                                    additionalDetails: {
                                        conditions: [],
                                    },
                                },
                            ],
                        },
                    ],
                };
                locationMock = JSON.parse(JSON.stringify(_locationData));
                GetTotalItemUnitsStub = sinon.stub(projectAnalyticsService, 'GetTotalItemUnits').returns(3);
            });

            afterEach(() => {
                GetTotalItemUnitsStub.restore();
            });

            it('Should return item paint gallons', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'wall';
                locationMock.decorDetails['wall'].paintingUnitsPerGallon = 3;

                const resp = projectAnalyticsService.GetItemPaintGallons(
                    projectDetails,
                    locationMock,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(1);
            });

            it('Should return item paint gallons for cabinets', () => {
                projectDetails.interior[roomIndex].items[itemIndex].type = 'cabinets';
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDoors = 6;
                projectDetails.interior[roomIndex].items[itemIndex].additionalDetails.numberOfCabinetDrawers = 6;
                locationMock.decorDetails.cabinetDoor.paintingUnitsPerGallon = 3;
                locationMock.decorDetails.cabinetDrawer.paintingUnitsPerGallon = 3;

                const resp = projectAnalyticsService.GetItemPaintGallons(
                    projectDetails,
                    locationMock,
                    roomIndex,
                    itemIndex
                );

                resp.should.equal(4);
            });
        });

        describe('FillAnalytics', () => {
            const _locationData = require('../_mockData/location.mock');
            let GetItemRepairHoursStub,
                GetItemPrepHoursStub,
                GetItemPrimingHoursStub,
                GetItemPaintingHoursStub,
                GetItemPrimerGallonsStub,
                GetItemPaintGallonsStub,
                GetTimeMultiplierStub,
                GetRoomPrepHoursStub;
            let projectDetails, locationData, params;

            beforeEach(() => {
                GetItemRepairHoursStub = sinon.stub(projectAnalyticsService, 'GetItemRepairHours').returns(1);
                GetItemPrepHoursStub = sinon.stub(projectAnalyticsService, 'GetItemPrepHours').returns(1);
                GetItemPrimingHoursStub = sinon.stub(projectAnalyticsService, 'GetItemPrimingHours').returns(1);
                GetItemPaintingHoursStub = sinon.stub(projectAnalyticsService, 'GetItemPaintingHours').returns(1);
                GetItemPrimerGallonsStub = sinon.stub(projectAnalyticsService, 'GetItemPrimerGallons').returns(1);
                GetItemPaintGallonsStub = sinon.stub(projectAnalyticsService, 'GetItemPaintGallons').returns(1);
                GetTimeMultiplierStub = sinon.stub(projectAnalyticsService, 'GetTimeMultiplier').returns(1);
                GetRoomPrepHoursStub = sinon.stub(projectAnalyticsService, 'GetRoomPrepHours').returns(1);

                projectDetails = {
                    interior: [
                        {
                            items: [{}],
                        },
                    ],
                };

                locationData = JSON.parse(JSON.stringify(_locationData));
                params = {
                    laborRate: 40,
                    materialPricePerGallon: 35,
                    averageCoats: 1.5,
                };
            });

            afterEach(() => {
                GetItemRepairHoursStub.restore();
                GetItemPrepHoursStub.restore();
                GetItemPrimingHoursStub.restore();
                GetItemPaintingHoursStub.restore();
                GetItemPrimerGallonsStub.restore();
                GetItemPaintGallonsStub.restore();
                GetTimeMultiplierStub.restore();
                GetRoomPrepHoursStub.restore();
            });

            it('should set item.estimates.repairHours correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].items[0].estimates.repairHours).to.equal(1);
            });

            it('should set item.estimates.prepHours correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].items[0].estimates.prepHours).to.equal(1);
            });

            it('should set item.estimates.primingHours correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].items[0].estimates.primingHours).to.equal(1);
            });

            it('should set item.estimates.paintingHours correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].items[0].estimates.paintingHours).to.equal(1);
            });

            it('should set item.estimates.primerGallons correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].items[0].estimates.primerGallons).to.equal(1);
            });

            it('should set item.estimates.paintGallons correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].items[0].estimates.paintGallons).to.equal(1);
            });

            it('should set item.estimates.laborHours correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].items[0].estimates.laborHours).to.equal(4);
            });

            it('should set room.estimates.paintingPrimingTimeMultiplier correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].estimates.paintingPrimingTimeMultiplier).to.equal(1);
            });

            it('should set room.estimates.repairHours correctly', () => {
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(projectDetails.interior[0].items[0])));
                GetItemRepairHoursStub.onFirstCall().returns(2);
                GetItemRepairHoursStub.onSecondCall().returns(3);

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].estimates.repairHours).to.equal(5);
            });

            it('should set room.estimates.prepHours correctly', () => {
                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);
                expect(projectDetails.interior[0].estimates.prepHours).to.equal(1);
            });

            it('should set room.estimates.primingHours correctly', () => {
                const item = projectDetails.interior[0].items[0];
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(item)));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.interior[0].estimates.primingHours).to.equal(2);
            });

            it('should set room.estimates.paintingHours correctly', () => {
                const item = projectDetails.interior[0].items[0];
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(item)));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.interior[0].estimates.paintingHours).to.equal(2);
            });

            it('should set room.estimates.primerGallons correctly', () => {
                const item = projectDetails.interior[0].items[0];
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(item)));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.interior[0].estimates.primerGallons).to.equal(2);
            });

            it('should set room.estimates.paintGallons correctly', () => {
                const item = projectDetails.interior[0].items[0];
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(item)));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.interior[0].estimates.paintGallons).to.equal(2);
            });

            it('should reduce room.estimates.laborHours correctly', () => {
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(projectDetails.interior[0].items[0])));
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(projectDetails.interior[0].items[0])));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.interior[0].estimates.laborHours).to.equal(10);
            });

            it('should reduce primerGallons correctly', () => {
                const item = projectDetails.interior[0].items[0];
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(item)));

                const room = projectDetails.interior[0];
                projectDetails.interior.push(JSON.parse(JSON.stringify(room)));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.primerGallons).to.equal(4);
            });

            it('should reduce paintGallons correctly', () => {
                const item = projectDetails.interior[0].items[0];
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(item)));

                const room = projectDetails.interior[0];
                projectDetails.interior.push(JSON.parse(JSON.stringify(room)));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.paintGallons).to.equal(4);
            });

            it('should get the correct value for materialCost', () => {
                const item = projectDetails.interior[0].items[0];
                projectDetails.interior[0].items.push(JSON.parse(JSON.stringify(item)));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.materialCost).to.equal(210);
            });

            it('should set repairHours correctly', () => {
                projectDetails.interior.push(JSON.parse(JSON.stringify(projectDetails.interior[0])));
                GetItemRepairHoursStub.onFirstCall().returns(1);
                GetItemRepairHoursStub.onSecondCall().returns(2);

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.repairHours).to.equal(3);
            });

            it('should set prepHours correctly', () => {
                projectDetails.interior.push(JSON.parse(JSON.stringify(projectDetails.interior[0])));
                GetRoomPrepHoursStub.onFirstCall().returns(1);
                GetRoomPrepHoursStub.onSecondCall().returns(2);

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.prepHours).to.equal(3);
            });

            it('should set primingHours correctly', () => {
                projectDetails.interior.push(JSON.parse(JSON.stringify(projectDetails.interior[0])));
                GetItemPrimingHoursStub.onFirstCall().returns(1);
                GetItemPrimingHoursStub.onSecondCall().returns(2);

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.primingHours).to.equal(3);
            });

            it('should set paintingHours correctly', () => {
                projectDetails.interior.push(JSON.parse(JSON.stringify(projectDetails.interior[0])));
                GetItemPaintingHoursStub.onFirstCall().returns(1);
                GetItemPaintingHoursStub.onSecondCall().returns(2);

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.paintingHours).to.equal(3);
            });

            it('should set laborHours correctly', () => {
                projectDetails.interior.push(JSON.parse(JSON.stringify(projectDetails.interior[0])));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.laborHours).to.equal(8);
            });

            it('should set laborCost correctly', () => {
                projectDetails.interior.push(JSON.parse(JSON.stringify(projectDetails.interior[0])));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.laborCost).to.equal(320);
            });

            it('should set totalCost correctly', () => {
                projectDetails.interior.push(JSON.parse(JSON.stringify(projectDetails.interior[0])));

                projectAnalyticsService.FillAnalytics(projectDetails, locationData, params);

                expect(projectDetails.estimates.totalCost).to.equal(530);
            });
        });
    });
})();
