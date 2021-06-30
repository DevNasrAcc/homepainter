(function () {
    'use strict';

    const locationRepo = require('../repo/locationRepo');
    const h = require('../helpers/helpers');

    module.exports = {
        IsAreaServiced: IsAreaServiced,
        GetRoomHeights: GetRoomHeights,
        GetRoomSizes: GetRoomSizes,
        FindOneByZipCode: FindOneByZipCode,
    };

    /**
     * Returns true or false depending on if an area is listed under our serviceable area
     * @param zipCode zip code {number}
     * @return {Promise<boolean>}
     */
    async function IsAreaServiced(zipCode) {
        const resp = await locationRepo.FindAllServicedByZipCode(zipCode);
        return resp.length > 0;
    }

    async function GetRoomHeights(zipCode, jobType, roomType) {
        let resp = await locationRepo.FindOneByZipCode(zipCode);
        if (h.isNull(resp)) return null;
        resp[jobType][roomType]['height'].sort((a, b) => {
            return a.height < b.height ? -1 : a.height > b.height ? 1 : 0;
        });
        return resp[jobType][roomType]['height'];
    }

    async function GetRoomSizes(zipCode, jobType, roomType) {
        let resp = await locationRepo.FindOneByZipCode(zipCode);
        if (h.isNull(resp)) return null;
        resp[jobType][roomType]['size'].sort((a, b) => {
            return a.length + a.width < b.length + b.width ? -1 : a.length + a.width > b.length + b.width ? 1 : 0;
        });
        return resp[jobType][roomType]['size'];
    }

    async function FindOneByZipCode(zipCode) {
        return await locationRepo.FindOneByZipCode(zipCode);
    }
})();
