(function () {
    'use strict';

    const moment = require('moment');
    const uuid = require('uuid');
    const config = require('../config/config');

    module.exports = {
        UploadPublicFile: UploadPublicFile,
        UploadPublicPdfFile: UploadPublicPdfFile,
    };

    /**
     * Uploads a file to s3 storage and returns an object representing the data
     * @param file
     * @returns {Promise<string>}
     */
    async function UploadPublicFile(file) {
        const s3 = config.getS3();

        // TODO: vary colors by +- 1 to stop steganographic exploits
        // TODO: Remove EXIF (metadata) from image files

        const fileName = uuid.v4() + '.jpg';
        const fileBuffer = await config.imageToJpg(file.data);
        file.size = Buffer.byteLength(fileBuffer);

        const s3Object = {
            Bucket: process.env.S3_BUCKET,
            Key: fileName,
            Body: fileBuffer,
            ACL: 'public-read',
            Metadata: {
                createdAt: new moment().toString(),
                originalName: file.name,
            },
        };
        await s3.putObject(s3Object).promise();
        return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${fileName}`;
    }

    /**
     * Uploads a pdf file to s3 storage and returns an object representing the data
     * @param file
     * @returns {Promise<string>}
     */
    async function UploadPublicPdfFile(file) {
        const s3 = config.getS3();

        const fileName = uuid.v4() + '.pdf';

        const s3Object = {
            Bucket: process.env.S3_BUCKET,
            Key: fileName,
            Body: file.data,
            ACL: 'public-read',
            Metadata: {
                createdAt: new moment().toString(),
                originalName: file.name,
            },
        };

        await s3.putObject(s3Object).promise();
        return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${fileName}`;
    }
})();
