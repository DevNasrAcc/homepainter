(function() {
    'use strict';

    const constants = require('../config/constants');

    module.exports = {
        CatchAll: CatchAll
    };

    function CatchAll(req, res) {
        res.status(constants._4xx._405.status).send(constants._4xx._405.reason);
    }
})();
