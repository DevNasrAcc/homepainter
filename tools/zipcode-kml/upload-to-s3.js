(async function () {
    "use strict";

    const dotEnv = require('../../server-src/node_modules/dotenv').config({path: `${__dirname}/../../server-src/.env`});
    if(dotEnv.error) throw dotEnv.error;

    const fs = require('fs');
    const path = require('path');
    const AWS = require('../../server-src/node_modules/aws-sdk');
    const s3 = new AWS.S3({
        region: 'us-east-1',
        endpoint: 'https://us-east-1.linodeobjects.com',
        apiVersion: 'latest',
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    });

    const fileList = fs.readdirSync(path.join(__dirname, 'all-zips-hp'));

    for (let i = 0; i < fileList.length; ++i) {
        console.log(fileList[i]);

        const file = fs.readFileSync(path.join(__dirname, 'all-zips-hp', fileList[i]), {encoding: 'UTF-8'});

        try {
            await s3
                .putObject({
                    Bucket: 'homepainter-kml-storage',
                    Key: fileList[i],
                    Body: file,
                    ACL: 'public-read'
                })
                .promise();
        } catch (e) {
            Error.captureStackTrace(e);
            throw e;
        }
    }

    process.exit(0);
})();