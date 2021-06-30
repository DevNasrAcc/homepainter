(function () {
    'use strict';

    // We need to do it this way for unit tests. Some of these functions are referenced internally, so to mock the
    // object we must use this variable to reference the functions.
    const _this = {
        GetTimeMultiplier: GetTimeMultiplier,
        GetTotalItemUnits: GetTotalItemUnits,
        GetRoomPrepHours: GetRoomPrepHours,
        GetItemRepairHours: GetItemRepairHours,
        GetItemPrepHours: GetItemPrepHours,
        GetItemPrimingHours: GetItemPrimingHours,
        GetItemPaintingHours: GetItemPaintingHours,
        GetItemPrimerGallons: GetItemPrimerGallons,
        GetItemPaintGallons: GetItemPaintGallons,
        FillAnalytics: FillAnalytics,
    };

    module.exports = _this;

    /**
     * Gets the amount of an item to paint by converting the length, width, and heights to a value.
     *  - For ceilings, walls, and accent walls, the value is area, measured in square feet,
     *  - for baseboard, the value is length, measured in linear feet,
     *  - for doors, the value is the number of doors,
     * This function is invalid for cabinets and returns 0 in that case.
     * @param projectDetails input from the customer
     * @param locationInfo database information about the zip code entered
     * @param roomIndex the room index number
     * @param itemIndex the item index number
     * @returns {number}
     */
    function GetTotalItemUnits(projectDetails, roomIndex, itemIndex) {
        const itemType = projectDetails.interior[roomIndex].items[itemIndex].type;
        const itemDetails = projectDetails.interior[roomIndex].items[itemIndex].additionalDetails;

        const size = projectDetails.interior[roomIndex].size;
        const height = projectDetails.interior[roomIndex].height.height;

        let area;

        switch (itemType) {
            case 'cabinets':
                // invalid type
                return 0;
            case 'ceiling':
                area = size.length * size.width;
                // if vaulted ceiling, apply 25% more
                area = itemDetails.ceilingType === 'vaulted' ? area * 1.25 : area;
                return area;
            case 'wall':
            case 'accentWall':
                const largerWall = Math.max(size.length, size.width);
                const smallerWall = Math.min(size.length, size.width);
                area = largerWall * height * (itemDetails.amount > 2 ? 2 : 1);

                let remainingWalls = itemDetails.amount - 2;
                if (remainingWalls > 0) area += smallerWall * height * remainingWalls;

                return area;
            case 'crownMolding':
            case 'baseboard':
                return (size.length + size.width) * 2;
            case 'door':
            case 'doorFrame':
                return itemDetails.amount;
            case 'window':
                return 2;
            case 'fireplaceMantel':
                return 1;
        }
    }

    /**
     * Retrieves the total number of hours required to prepare a room such as:
     * - how long it will take to cover the room with either cloth or plastic
     * - taping off the walls or other items
     * - calculating specific use cases that may take longer than average
     * Room Prep Hours is defined by the sum of prep hours for individual items in the room plus the base prep
     * hours for the room type times a multiplier
     * @param projectDetails input from the customer
     * @param locationInfo database information about the zip code entered
     * @param roomIndex the index of the room to get
     * @return {number}
     */
    function GetRoomPrepHours(projectDetails, locationInfo, roomIndex) {
        let room = projectDetails.interior[roomIndex];
        // There are different cases where extra prep needs to be accounted for. We calculate this extra time
        // by increasing a multiplier
        let multiplier = 1;
        let sumOfItemPrepHours = 0;

        // create some flags for common extra prep time
        let paintingBaseboard = false;
        let paintingCeiling = false;
        let paintingCrownMolding = false;
        let paintingWall = false;

        // for each item in room, check item type and set flags
        for (let itemIndex = 0; itemIndex < room.items.length; itemIndex++) {
            const item = room.items[itemIndex];

            // set painting flags
            if (item.type === 'baseboard') paintingBaseboard = true;
            else if (item.type === 'ceiling') paintingCeiling = true;
            else if (item.type === 'crownMolding') paintingCrownMolding = true;
            else if (item.type === 'accentWall' || item.type === 'wall') paintingWall = true;

            // add up item prep hours
            sumOfItemPrepHours += item.estimates.prepHours;
        }

        // We only want a multiplier of * 2 once. So we use this else if to ensure it only happens once.
        if (paintingCeiling && !paintingWall) multiplier *= 2;
        else if (paintingBaseboard && !paintingWall) multiplier *= 2;
        else if (paintingCrownMolding && !paintingWall) multiplier *= 2;
        else if (paintingCrownMolding && !paintingCeiling) multiplier *= 2;

        let projectRoomArea =
            projectDetails.interior[roomIndex].size.length * projectDetails.interior[roomIndex].size.width;
        let selectedSizeInfo;
        let selectedSizeInfoArea = 0;
        for (let sizeInfo of locationInfo[projectDetails.jobType][room.type].size) {
            let sizeInfoArea = sizeInfo.length * sizeInfo.width;
            if (projectRoomArea <= sizeInfoArea && projectRoomArea >= selectedSizeInfoArea) {
                selectedSizeInfo = sizeInfo;
                selectedSizeInfoArea = selectedSizeInfo.length * selectedSizeInfo.width;
            }
        }

        selectedSizeInfo =
            selectedSizeInfo || locationInfo[projectDetails.jobType][room.type].size.find((e) => e.name === 'large');

        return selectedSizeInfo.prepHours * multiplier + sumOfItemPrepHours;
    }

    /**
     * Wrapper for this time multiplier so we can mock it in unit tests
     * @param projectDetails input from the customer
     * @param locationInfo database information about the zip code entered
     * @param roomIndex the index of the room to get
     * @return {*}
     */
    function GetTimeMultiplier(projectDetails, locationInfo, roomIndex) {
        // locationInfo[   'house'  ][         'bedRoom'           ].paintingPrimingTimeMultiplier
        // locationInfo[projectDetails.jobType][projectDetails.interior[roomIndex].type].paintingPrimingTimeMultiplier
        return locationInfo[projectDetails.jobType][projectDetails.interior[roomIndex].type]
            .paintingPrimingTimeMultiplier;
    }

    /**
     * Gets the amount of time, in hours, a contractor will need to repair an
     * item. Returns 0 if the item does not need any repairs.
     * @param projectDetails input from the customer
     * @param roomIndex the room index number
     * @param itemIndex the item index number
     * @returns {number} in hours
     */
    function GetItemRepairHours(projectDetails, roomIndex, itemIndex) {
        let item = projectDetails.interior[roomIndex].items[itemIndex];
        let itemRepairHours = 0;

        switch (item.type) {
            case 'wall':
                if (item.additionalDetails.conditions.indexOf('drywallRepair') !== -1) {
                    itemRepairHours = 0.5;
                }
                break;
            // add more cases as necessary
        }

        return itemRepairHours;
    }

    /**
     * Gets the prep hours associated with one item. Currently, cabinets are the only item that have a
     * prep time associated with them. Other items factor into the room's prep time.
     * @param projectDetails input from the customer
     * @param locationInfo
     * @param roomIndex the room index number
     * @param itemIndex the item index number
     * @returns {number} in Hours
     */
    function GetItemPrepHours(projectDetails, locationInfo, roomIndex, itemIndex) {
        let item = projectDetails.interior[roomIndex].items[itemIndex];
        let itemPrepHours = 0;

        switch (item.type) {
            case 'cabinets':
                itemPrepHours +=
                    item.additionalDetails.numberOfCabinetDoors /
                    locationInfo.decorDetails.cabinetDoor.prepUnitsPerHour;
                itemPrepHours +=
                    item.additionalDetails.numberOfCabinetDrawers /
                    locationInfo.decorDetails.cabinetDrawer.prepUnitsPerHour;
                break;
            // add more cases later as the algorithm changes
            default:
                itemPrepHours += 0;
        }

        return itemPrepHours;
    }

    /**
     * Retrieves the total number of hours required to prime an item
     * @param projectDetails input from the customer
     * @param locationInfo database information about the zip code entered
     * @param roomIndex the index of the room to get
     * @param itemIndex the index of the item to get
     * @return {number}
     */
    function GetItemPrimingHours(projectDetails, locationInfo, roomIndex, itemIndex) {
        const item = projectDetails.interior[roomIndex].items[itemIndex];
        let itemPrimingHours = 0;
        switch (item.type) {
            case 'cabinets':
                const notPainted = item.additionalDetails.cabinetCondition !== 'painted';
                const paint = item.additionalDetails.cabinetTreatment === 'paint';
                // cabinets only need primed if they are unpainted and if the customer wants them painted
                if (notPainted && paint) {
                    const numberOfDoors = item.additionalDetails.numberOfCabinetDoors;
                    const doorsPrimedPerHour = locationInfo.decorDetails.cabinetDoor.primingUnitsPerHour;

                    itemPrimingHours += numberOfDoors / doorsPrimedPerHour;

                    const numberOfDrawers = item.additionalDetails.numberOfCabinetDrawers;
                    const drawersPrimedPerHour = locationInfo.decorDetails.cabinetDrawer.primingUnitsPerHour;

                    itemPrimingHours += numberOfDrawers / drawersPrimedPerHour;
                }
                break;
            case 'wall':
                const primingUnitsPerHour = locationInfo.decorDetails[item.type].primingUnitsPerHour;
                const itemUnits = _this.GetTotalItemUnits(projectDetails, roomIndex, itemIndex);
                const darkWalls = item.additionalDetails.conditions.indexOf('darkWalls') >= 0;
                const unpaintedDrywall = item.additionalDetails.conditions.indexOf('unpaintedDrywall') >= 0;

                // wall only need primed if they are painted a dark color or if they are new drywall
                if (darkWalls || unpaintedDrywall) {
                    itemPrimingHours += itemUnits / primingUnitsPerHour;
                }

                break;
            // more cases here later
        }

        return itemPrimingHours * _this.GetTimeMultiplier(projectDetails, locationInfo, roomIndex);
    }

    /**
     * Retrieves the total number of hours required to paint an item
     * @param projectDetails input from the customer
     * @param locationInfo database information about the zip code entered
     * @param roomIndex the index of the room to get
     * @param itemIndex the index of the item to get
     * @return {number}
     */
    function GetItemPaintingHours(projectDetails, locationInfo, roomIndex, itemIndex) {
        const item = projectDetails.interior[roomIndex].items[itemIndex];
        let itemPaintingHours = 0;

        switch (item.type) {
            case 'cabinets':
                const numberOfDoors = item.additionalDetails.numberOfCabinetDoors;
                const doorsPaintedPerHour = locationInfo.decorDetails.cabinetDoor.paintingUnitsPerHour;

                itemPaintingHours += numberOfDoors / doorsPaintedPerHour;

                const numberOfDrawers = item.additionalDetails.numberOfCabinetDrawers;
                const drawersPaintedPerHour = locationInfo.decorDetails.cabinetDrawer.paintingUnitsPerHour;

                itemPaintingHours += numberOfDrawers / drawersPaintedPerHour;

                break;
            default:
                // Get the primingUnitsPerHour
                // locationInfo.decorDetails[  'bedRoom'  ].paintingUnitsPerHour
                // locationInfo.decorDetails[  item.type  ].paintingUnitsPerHour
                const paintingUnitsPerHour = locationInfo.decorDetails[item.type].paintingUnitsPerHour;
                // get the total number of units to paint in the room
                const totalUnits = _this.GetTotalItemUnits(projectDetails, roomIndex, itemIndex);

                itemPaintingHours += totalUnits / paintingUnitsPerHour;
        }

        return itemPaintingHours * _this.GetTimeMultiplier(projectDetails, locationInfo, roomIndex);
    }

    /**
     * Gets the number of gallons needed to prime an item
     * @param projectDetails input from the customer
     * @param locationInfo database information about the zip code entered
     * @param roomIndex the index of the room to get gallons for
     * @param itemIndex the index of the item to get gallons for
     * @return {number}
     */
    function GetItemPrimerGallons(projectDetails, locationInfo, roomIndex, itemIndex) {
        const item = projectDetails.interior[roomIndex].items[itemIndex];
        let itemPrimerGallons = 0;

        switch (item.type) {
            case 'wall':
                const itemUnits = _this.GetTotalItemUnits(projectDetails, roomIndex, itemIndex);
                const unitsPerGallon = locationInfo.decorDetails[item.type].primingUnitsPerGallon;

                const darkWalls = item.additionalDetails.conditions.indexOf('darkWalls') >= 0;
                const unpaintedDrywall = item.additionalDetails.conditions.indexOf('unpaintedDrywall') >= 0;

                if (darkWalls || unpaintedDrywall) itemPrimerGallons = itemUnits / unitsPerGallon;
                break;
            case 'cabinets':
                const grainy = item.additionalDetails.cabinetGrainType === 'grainy';
                const notPainted = item.additionalDetails.cabinetCondition !== 'painted';
                const paint = item.additionalDetails.cabinetTreatment === 'paint';

                if (notPainted && paint) {
                    const numberOfDrawers = item.additionalDetails.numberOfCabinetDrawers;
                    const cabinetDrawersPerGallon = locationInfo.decorDetails.cabinetDrawer.primingUnitsPerGallon;
                    itemPrimerGallons += numberOfDrawers / cabinetDrawersPerGallon;

                    const numberOfDoors = item.additionalDetails.numberOfCabinetDoors;
                    const cabinetDoorsPerGallon = locationInfo.decorDetails.cabinetDoor.primingUnitsPerGallon;
                    itemPrimerGallons += numberOfDoors / cabinetDoorsPerGallon;

                    if (grainy) itemPrimerGallons *= 1.25;
                }
                break;
            // other cases in the future
        }

        return itemPrimerGallons;
    }

    /**
     * Gets the number of gallons needed to paint an item
     * @param projectDetails input from the customer
     * @param locationInfo database information about the zip code entered
     * @param roomIndex the index of the room to get gallons for
     * @param itemIndex the index of the item to get gallons for
     * @return {number}
     */
    function GetItemPaintGallons(projectDetails, locationInfo, roomIndex, itemIndex) {
        const item = projectDetails.interior[roomIndex].items[itemIndex];
        let itemPaintGallons = 0;

        switch (item.type) {
            case 'cabinets':
                const numberOfDrawers = item.additionalDetails.numberOfCabinetDrawers;
                const cabinetDrawersPerGallon = locationInfo.decorDetails.cabinetDrawer.paintingUnitsPerGallon;
                itemPaintGallons += numberOfDrawers / cabinetDrawersPerGallon;

                const numberOfDoors = item.additionalDetails.numberOfCabinetDoors;
                const cabinetDoorsPerGallon = locationInfo.decorDetails.cabinetDoor.paintingUnitsPerGallon;
                itemPaintGallons += numberOfDoors / cabinetDoorsPerGallon;

                break;
            default:
                const itemUnits = _this.GetTotalItemUnits(projectDetails, roomIndex, itemIndex);
                const unitsPerGallon = locationInfo.decorDetails[item.type].paintingUnitsPerGallon;

                itemPaintGallons += itemUnits / unitsPerGallon;

                break;
        }

        return itemPaintGallons;
    }

    /**
     * Fills in all of the fields for an projectDetails
     * @param projectDetails projectModel built from user input
     * @param locationInfo locationInfo for the given zipCode
     * @param params object with fields: laborRate, materialPricePerGallon
     */
    function FillAnalytics(projectDetails, locationInfo, params) {
        for (let roomIndex = 0; roomIndex < projectDetails.interior.length; roomIndex++) {
            for (let itemIndex = 0; itemIndex < projectDetails.interior[roomIndex].items.length; itemIndex++) {
                const item = projectDetails.interior[roomIndex].items[itemIndex];
                item.estimates = {};
                item.estimates.primerGallons = _this.GetItemPrimerGallons(
                    projectDetails,
                    locationInfo,
                    roomIndex,
                    itemIndex
                );
                item.estimates.paintGallons = _this.GetItemPaintGallons(
                    projectDetails,
                    locationInfo,
                    roomIndex,
                    itemIndex
                );
                item.estimates.totalGallons = item.estimates.primerGallons + item.estimates.paintGallons;
                item.estimates.repairHours = _this.GetItemRepairHours(projectDetails, roomIndex, itemIndex);
                item.estimates.prepHours = _this.GetItemPrepHours(projectDetails, locationInfo, roomIndex, itemIndex);
                item.estimates.primingHours = _this.GetItemPrimingHours(
                    projectDetails,
                    locationInfo,
                    roomIndex,
                    itemIndex
                );
                item.estimates.paintingHours = _this.GetItemPaintingHours(
                    projectDetails,
                    locationInfo,
                    roomIndex,
                    itemIndex
                );
                item.estimates.laborHours =
                    item.estimates.repairHours +
                    item.estimates.prepHours +
                    item.estimates.primingHours +
                    item.estimates.paintingHours;
            }

            const room = projectDetails.interior[roomIndex];
            room.estimates = {};
            room.estimates.primerGallons = room.items.reduce((total, elm) => total + elm.estimates.primerGallons, 0);
            room.estimates.paintGallons = room.items.reduce((total, elm) => total + elm.estimates.paintGallons, 0);
            room.estimates.totalGallons = room.items.reduce((total, elm) => total + elm.estimates.totalGallons, 0);
            room.estimates.repairHours = room.items.reduce((total, elm) => total + elm.estimates.repairHours, 0);
            room.estimates.prepHours = _this.GetRoomPrepHours(projectDetails, locationInfo, roomIndex);
            room.estimates.primingHours = room.items.reduce((total, elm) => total + elm.estimates.primingHours, 0);
            room.estimates.paintingHours = room.items.reduce((total, elm) => total + elm.estimates.paintingHours, 0);
            room.estimates.laborHours =
                room.estimates.repairHours +
                room.estimates.prepHours +
                room.estimates.primingHours +
                room.estimates.paintingHours;
            room.estimates.paintingPrimingTimeMultiplier = _this.GetTimeMultiplier(
                projectDetails,
                locationInfo,
                roomIndex
            );
        }

        projectDetails.estimates = {};
        projectDetails.estimates.primerGallons = projectDetails.interior.reduce(
            (total, elm) => total + elm.estimates.primerGallons,
            0
        );
        projectDetails.estimates.paintGallons = projectDetails.interior.reduce(
            (total, elm) => total + elm.estimates.paintGallons,
            0
        );
        projectDetails.estimates.totalGallons = projectDetails.interior.reduce(
            (total, elm) => total + elm.estimates.totalGallons,
            0
        );
        projectDetails.estimates.repairHours = projectDetails.interior.reduce(
            (total, elm) => total + elm.estimates.repairHours,
            0
        );
        projectDetails.estimates.prepHours = projectDetails.interior.reduce(
            (total, elm) => total + elm.estimates.prepHours,
            0
        );
        projectDetails.estimates.primingHours = projectDetails.interior.reduce(
            (total, elm) => total + elm.estimates.primingHours,
            0
        );
        projectDetails.estimates.paintingHours = projectDetails.interior.reduce(
            (total, elm) => total + elm.estimates.paintingHours,
            0
        );
        projectDetails.estimates.laborHours = projectDetails.interior.reduce(
            (total, elm) => total + elm.estimates.laborHours,
            0
        );

        projectDetails.estimates.laborCost = projectDetails.estimates.laborHours * params.laborRate;
        projectDetails.estimates.materialCost =
            projectDetails.estimates.totalGallons * params.materialPricePerGallon * params.averageCoats;
        projectDetails.estimates.totalCost = projectDetails.estimates.laborCost + projectDetails.estimates.materialCost;

        return projectDetails;
    }
})();
