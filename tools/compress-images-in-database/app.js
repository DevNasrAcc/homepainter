(function () {
    'use strict';

    const path = require('path');
    const fs = require('fs');
    const validator = require('../../server-src/node_modules/validator');
    const fileModel = require('../../server-src/src/dbsmodel/file/file');
    const contractorModel = require('../../server-src/src/dbsmodel/user/user').ContractorDiscriminator;
    const projectModel = require('../../server-src/src/dbsmodel/project/project');
    const config = require('../../server-src/src/config/config');

    const dotEnv = require('../../server-src/node_modules/dotenv')
        .config({
            path: path.join(__dirname, '..', '..', 'server-src', '.env')
        });

    if(dotEnv.error)
        throw dotEnv.error;

    require('../mongooseConnector')(start);

    async function start() {
        const s3 = config.getS3();
        const objectList = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET }).promise();

        let totalOld = 0;
        let totalNew = 0;

        for (let content of objectList.Contents) {
            if (!validator.isUUID(content.Key.split('.')[0])) {
                continue;
            }

            const s3Params = { Bucket: process.env.S3_BUCKET, Key: content.Key };
            const metadata = (await s3.headObject(s3Params).promise()).Metadata;

            const oldObject = s3.getObject(s3Params).createReadStream();
            const writeStream = fs.createWriteStream(content.Key);
            oldObject.pipe(writeStream);
            await (() => {
                return new Promise((resolve, reject) => {
                    writeStream.on('error', reject);
                    writeStream.on('finish', resolve);
                });
            })();

            const buffer = fs.readFileSync(content.Key);
            const oldSize = Buffer.byteLength(buffer);

            const compressedBuffer = await config.imageToJpg(buffer);
            const newSize = Buffer.byteLength(compressedBuffer);

            if (newSize > oldSize) {
                fs.unlinkSync(content.Key);
                continue;
            }

            const url = `https://us-east-1.linodeobjects.com/${process.env.S3_BUCKET}/${content.Key}`;
            const file = await fileModel.TempPhotoDiscriminator.findOneAndUpdate(
                { url: url },
                { size: newSize }
            );
            const interior = await projectModel.findOneAndUpdate(
                {'details.interior.photos.url': url},
                {'details.interior.$[].photos.$[p].size': newSize},
                {
                    arrayFilters: [
                        {'p.url': url}
                    ]
                }
            );
            const exterior = await projectModel.findOneAndUpdate(
                {'details.exterior.photos.url': url},
                {'details.exterior.$[].photos.$[p].size': newSize},
                {
                    arrayFilters: [
                        {'p.url': url}
                    ]
                }
            );

            const photosOfPastWork = await contractorModel.findOneAndUpdate(
                {'photosOfPastWork.url': url},
                {'photosOfPastWork.$.size': newSize}
            );

            const profilePicture = await contractorModel.findOne({'picture': url});

            if (!file && !interior && !exterior && !photosOfPastWork && !profilePicture) {
                console.error('No database entry found for %s', url);
            }

            let success = false;
            let tries = 0;
            while (!success) {
                if (tries >= 3) {
                    console.error('Failed to upload %s', url);
                    break;
                }
                try {
                    const s3Object = {
                        Bucket: process.env.S3_BUCKET,
                        Key: content.Key,
                        Body: compressedBuffer,
                        ACL: 'public-read',
                        Metadata: metadata
                    };
                    await s3.putObject(s3Object).promise();
                    success = true;
                } catch (ignored) {
                    ++tries;
                }
            }
            fs.unlinkSync(content.Key);

            totalOld += oldSize;
            totalNew += newSize;
            console.log(content.Key);
            console.log('%d %d %s', oldSize, newSize, (((newSize - oldSize) / oldSize) * 100).toFixed(2) + "%");
        }

        console.log('Total compressed');
        console.log('%d %d %s', totalOld, totalNew, (((totalNew - totalOld) / totalOld) * 100).toFixed(2) + "%");

        process.exit(0);
    }
})();
