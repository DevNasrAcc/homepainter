(function () {
    "use strict";

    const dotEnv = require('../../server-src/node_modules/dotenv').config({path: `${__dirname}/../../server-src/.env`});
    if(dotEnv.error) throw dotEnv.error;

    const fs = require('fs');
    const path = require('path');
    const constants = require('../../server-src/src/config/constants');
    const contractorRepo = require('../../server-src/src/repo/contractorRepo');
    const objectStorageService = require('../../server-src/src/service/objectStorageService');
    require('../mongooseConnector')(start);

    async function start() {
        let contractorId;
        for (let i = 0; i < process.argv.length; ++i) {
            if (process.argv[i] === '--contractorID') contractorId = process.argv[++i];
        }

        if (!contractorId) {
            console.error('--contractorID is required');
            process.exit(1);
        }

        const imageFolder = path.join(__dirname, 'images');
        if (!fs.existsSync(imageFolder)) {
            console.error('images folder does not exist [%s]', imageFolder);
            process.exit(2);
        }

        const fileNames = fs.readdirSync(imageFolder);
        if (fileNames.length < 1) {
            console.error('no images found in [%s]. 1 photo minimum required', imageFolder);
            process.exit(3);
        }

        const contractor = await contractorRepo.FindOneById(contractorId);
        if (!contractor.photosOfPastWork) contractor.photosOfPastWork = [];

        for (let fileName of fileNames) {
            const filePath = path.join(imageFolder, fileName);
            const fileStats = fs.lstatSync(filePath)
            const fileContents = fs.readFileSync(filePath);

            const file = {
                data: fileContents,
                name: fileName,
                size: fileStats.size
            };

            contractor.photosOfPastWork.push({
                url: await objectStorageService.UploadPublicFile(file),
                originalName: file.name,
                size: file.size,
                schemaVersion: constants.schemaVersion
            });
        }

        await contractor.save();
        process.exit(0);
    }

})();
