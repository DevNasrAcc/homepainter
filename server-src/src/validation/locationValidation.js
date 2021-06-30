(function () {
    'use strict';

    const validation = require('./requestValidator');

    module.exports = {
        ZipCodeProvided: ZipCodeProvided,
        ZipCodeJobTypeRoomTypeProvided: ZipCodeJobTypeRoomTypeProvided,
    };

    /**
     * Checks if a zip code was provided in the request and properly formatted.
     * @param req the request params from the controller
     * @return {Array}
     */
    function ZipCodeProvided(req) {
        return validation.Validate(req.params, {
            zipCode: {
                type: 'postalCode',
                required: true,
            },
        });
    }

    /**
     * Checks if a zip code was provided in the request and properly formatted.
     * @param params the request params from the controller
     * @return {Array}
     */
    function ZipCodeJobTypeRoomTypeProvided(req) {
        return validation.Validate(req.params, {
            zipCode: {
                type: 'postalCode',
                required: true,
            },
            jobType: {
                type: 'string',
                required: true,
                enum: ['house', 'townhouse'],
            },
            roomType: {
                type: 'string',
                required: true,
                enum: [
                    'livingRoom',
                    'bedRoom',
                    'bathroom',
                    'diningRoom',
                    'kitchen',
                    'laundryRoom',
                    'entryway',
                    'hallway',
                    'stairway',
                    'sunRoom',
                    'garage',
                    'other',
                ],
            },
        });
    }
})();
