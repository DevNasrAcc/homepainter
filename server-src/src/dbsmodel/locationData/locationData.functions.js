(function () {
    'use strict';

    const constants = require('../../config/constants');

    module.exports = {
        preValidate: preValidate,
        updateVersionFromDBS: updateVersionFromDBS,
    };

    async function preValidate(next) {
        await this.updateVersionFromDBS();
        next();
    }

    async function updateVersionFromDBS() {
        switch (this.schemaVersion) {
            case undefined:
            case '07-08-2020':
                this.decorDetails.wall.primingUnitsPerHour = 250;
                this.decorDetails.wall.paintingUnitsPerHour = 200;
                this.decorDetails.accentWall.primingUnitsPerHour = 250;
                this.decorDetails.accentWall.paintingUnitsPerHour = 200;
        }

        this.schemaVersion = constants.schemaVersion;
        return this;
    }
})();
