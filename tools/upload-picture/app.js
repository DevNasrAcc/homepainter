(async function () {
    "use strict";

    const dotEnv = require('../../server-src/node_modules/dotenv').config({path: `${__dirname}/../../server-src/.env`});
    if(dotEnv.error) throw dotEnv.error;

    const fs = require('fs');
    const objectStorageService = require('../../server-src/src/service/objectStorageService');

    let file;
    for (let i = 0; i < process.argv.length; ++i) {
        if (process.argv[i] === '--file') file = process.argv[++i];
    }

    if (!file) {
        console.error('--file is required');
        process.exit(1);
    }

    const data = fs.readFileSync(file);
    const url = await objectStorageService.UploadPublicFile({
        data: data,
        name: file,
        size: Buffer.byteLength(data)
    });
    console.log(url);
    process.exit(0);

})();
