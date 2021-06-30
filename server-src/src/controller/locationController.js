(function () {
    'use strict';

    const h = require('../helpers/helpers');
    const constants = require('../config/constants');
    const locationService = require('../service/locationService');

    module.exports = {
        IsAreaServiced: IsAreaServiced,
        GetRoomHeights: GetRoomHeights,
        GetRoomSizes: GetRoomSizes,
    };

    /**
     * Controller for checking if an area is serviced.
     *
     * @param req request from client
     * @param res response to client
     * @returns {Promise<*>} 200 if ok, 400 if malformed req, 500, if there is an error getting the info
     */
    async function IsAreaServiced(req) {
        const resp = await locationService.IsAreaServiced(req.params.zipCode);
        return { status: constants._2xx._200.status, content: resp };
    }

    /**
     * Controller for getting room sizes. This should only return room sizes and nothing else.
     *
     * @param req request from the client
     * @returns {Promise<*>}
     */
    async function GetRoomHeights(req) {
        const resp = await locationService.GetRoomHeights(req.params.zipCode, req.params.jobType, req.params.roomType);

        return h.isNull(resp)
            ? { status: constants._4xx._404.status, content: constants._4xx._404.reason }
            : { status: constants._2xx._200.status, content: resp };
    }

    /**
     * Controller for getting room sizes. This should only return room sizes and nothing else.
     *
     * @param req request from the client
     * @returns {Promise<*>}
     */
    async function GetRoomSizes(req) {
        const resp = await locationService.GetRoomSizes(req.params.zipCode, req.params.jobType, req.params.roomType);

        return h.isNull(resp)
            ? { status: constants._4xx._404.status, content: constants._4xx._404.reason }
            : { status: constants._2xx._200.status, content: resp };
    }
})();
