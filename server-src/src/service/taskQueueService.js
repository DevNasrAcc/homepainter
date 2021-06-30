(function () {
    const { default: PQueue } = require('p-queue');

    module.exports = {
        getPQueue: getPQueue,
    };

    /*
        timeout is necessary to ensure that the tasks isn't executed immediately, allowing the calling thread to
        continue execution, and allowing the api to return 200 before the email is sent
     */
    const pQueue = new PQueue({
        concurrency: 1,
        timeout: 10,
    });

    function getPQueue() {
        return pQueue;
    }
})();
