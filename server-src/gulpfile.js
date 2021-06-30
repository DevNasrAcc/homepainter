const gulpfile = require('gulp');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const execSync = require('child_process').execSync;
const webp = require('gulp-webp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment');
const dotenv = require('dotenv');
const constants = require('./src/config/constants');
const config = require('./src/config/config');
const h = require('./src/helpers/helpers');
const BACKUP_BUCKET = 'homepainter-dbs-backup';

gulpfile.task(
    'cleanPublicFiles',
    gulpfile.parallel(
        function () {
            return gulpfile.src('./src/public', { read: false, allowEmpty: true }).pipe(clean({ force: true }));
        },
        function () {
            return gulpfile.src('../angular-src/dist', { read: false, allowEmpty: true }).pipe(clean({ force: true }));
        }
    )
);

gulpfile.task(
    'cleanReportFiles',
    gulpfile.parallel(
        function () {
            return gulpfile.src('.nyc_output', { read: false, allowEmpty: true }).pipe(clean({ force: true }));
        },
        function () {
            return gulpfile.src('report', { read: false, allowEmpty: true }).pipe(clean({ force: true }));
        }
    )
);

gulpfile.task('buildEmailSrc', function () {
    return gulpfile.src('../email-src/src/views/**/*').pipe(gulpfile.dest('./src/public/email-src'));
});

gulpfile.task('buildSitemap', async function (done) {
    let dotenvLocation;
    for (let i = 0; i < process.argv.length; ++i) {
        if (process.argv[i] === '--dotenv') dotenvLocation = process.argv[++i];
    }

    const result = dotenv.config({ path: dotenvLocation || path.join(__dirname, '.env') });
    if (result.error) {
        const error = new Error('Error setting environment variables: ' + result.error);
        console.log(error);
        return done(error);
    }

    const siteProperties = {
        sitemapLocation: '../angular-src/src/sitemap.xml',
        files: [
            { url: '/', changeFreq: 'monthly', priority: '1.0', path: '../angular-src/src/app/static/home' },
            {
                url: '/contact-us',
                changeFreq: 'monthly',
                priority: '0.9',
                path: '../angular-src/src/app/static/contact-us',
            },
            { url: '/messages', changeFreq: 'monthly', priority: '0.9', path: '../angular-src/src/app/messages' },
            {
                url: '/login',
                changeFreq: 'monthly',
                priority: '0.9',
                path: '../angular-src/src/app/user-management/log-in',
            },
            {
                url: '/forgot-password',
                changeFreq: 'monthly',
                priority: '0.9',
                path: '../angular-src/src/app/user-management/reset-password',
            },
            {
                url: '/painter-signup',
                changeFreq: 'monthly',
                priority: '0.5',
                path: '../angular-src/src/app/static/become-a-pro',
            },
            {
                url: '/realtor-signup',
                changeFreq: 'monthly',
                priority: '0.5',
                path: '../angular-src/src/app/static/become-an-agent',
            },
            {
                url: '/privacy-policy',
                changeFreq: 'monthly',
                priority: '0.1',
                path: '../angular-src/src/app/static/privacy-policy/components',
            },
            {
                url: '/terms-and-conditions',
                changeFreq: 'monthly',
                priority: '0.1',
                path: '../angular-src/src/app/static/terms-and-conditions/components',
            },
            {
                url: '/project/details',
                changeFreq: 'monthly',
                priority: '0.9',
                path: '../angular-src/src/app/project/dashboard/components/details',
            },
            {
                url: '/project/hire',
                changeFreq: 'monthly',
                priority: '0.9',
                path: '../angular-src/src/app/project/dashboard/components/hire',
            },
            {
                url: '/project/explore-painters',
                changeFreq: 'monthly',
                priority: '0.9',
                path: '../angular-src/src/app/project/dashboard/components/explore-painters',
            },
            {
                url: '/project/view-quotes',
                changeFreq: 'monthly',
                priority: '0.9',
                path: '../angular-src/src/app/project/dashboard/components/quotes',
            },
        ],
    };

    const ContractorDiscriminator = require('./src/dbsmodel/user/user').ContractorDiscriminator;
    const mongooseConfig = require('./src/config/mongoose');
    await mongooseConfig.connect();
    const contractors = await ContractorDiscriminator.find({
        $or: [{ accountStatus: 'active' }, { accountStatus: 'approved' }, { accountStatus: 'restricted' }],
    });
    await mongooseConfig.close();

    const newLine = '\r\n';
    const getLastMod = (path, contractor) => {
        let lastMod;
        const files = fs.readdirSync(path);
        for (const file of files) {
            const cmd = `git log -1 --format=%cI "${path}/${file}"`;
            const date = new Date(execSync(cmd).toString().trim());
            if (!lastMod || date.getTime() > lastMod.getTime()) {
                lastMod = date;
            }
        }

        if (contractor && contractor.updatedAt.getTime() > lastMod.getTime()) {
            lastMod = contractor.updatedAt;
        }

        return lastMod.toISOString().split('T')[0];
    };

    let contents = '';
    contents += '<?xml version="1.0" encoding="UTF-8"?>' + newLine;
    contents += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + newLine;

    for (let i = 0; i < siteProperties.files.length; i++) {
        contents += `  <url>${newLine}`;
        contents += `    <loc>${process.env.BASE_URL}${siteProperties.files[i].url}</loc>${newLine}`;
        contents += `    <lastmod>${getLastMod(siteProperties.files[i].path)}</lastmod>${newLine}`;
        contents += `    <changefreq>${siteProperties.files[i].changeFreq}</changefreq>${newLine}`;
        contents += `    <priority>${siteProperties.files[i].priority}</priority>${newLine}`;
        contents += `  </url>${newLine}`;
    }

    for (const contractor of contractors) {
        contents += `  <url>${newLine}`;
        contents += `    <loc>${process.env.BASE_URL}/u/${contractor._id.toString()}</loc>${newLine}`;
        contents += `    <lastmod>${getLastMod(
            '../angular-src/src/app/painter-profile',
            contractor
        )}</lastmod>${newLine}`;
        contents += `    <changefreq>monthly</changefreq>${newLine}`;
        contents += `    <priority>0.9</priority>${newLine}`;
        contents += `  </url>${newLine}`;
    }

    contents += '</urlset>';

    fs.writeFileSync(siteProperties.sitemapLocation, contents);
    done();
});

gulpfile.task('minifyImageFiles', function () {
    return gulpfile
        .src('../angular-src/src/assets/images/**/*')
        .pipe(
            imagemin([
                imagemin.mozjpeg({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                }),
            ])
        )
        .pipe(gulpfile.dest('../angular-src/src/assets/images/'));
});

gulpfile.task(
    'copyAngularFiles',
    gulpfile.parallel(
        function () {
            return gulpfile.src('../angular-src/dist/server/**').pipe(gulpfile.dest('./src/public/server'));
        },
        function () {
            return gulpfile.src('../angular-src/dist/browser/**').pipe(gulpfile.dest('./src/public/browser'));
        }
    )
);

gulpfile.task(
    'buildAngularFiles',
    gulpfile.series(function (done) {
        execSync('cd .. && cd angular-src && npm run build && cd .. && cd server-src');
        done();
    }, 'copyAngularFiles')
);

gulpfile.task(
    'buildAngularFilesQualityAssurance',
    gulpfile.series(function (done) {
        execSync('cd .. && cd angular-src && npm run build-qa && cd .. && cd server-src');
        done();
    }, 'copyAngularFiles')
);

gulpfile.task(
    'buildAngularFilesDevelopment',
    gulpfile.series(function (done) {
        execSync('cd .. && cd angular-src && npm run build-dev && cd .. && cd server-src');
        done();
    }, 'copyAngularFiles')
);

gulpfile.task('convertToWebp', () => {
    let file = '*.{jpg,png}';

    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '--file') {
            file = process.argv[i + 1];
            i++;
        }
    }

    return gulpfile
        .src(`../angular-src/src/assets/images/**/${file}`)
        .pipe(
            webp({
                quality: 85,
            })
        )
        .pipe(gulpfile.dest('../angular-src/src/assets/images/'));
});

gulpfile.task('backupDatabase', async function (done) {
    try {
        let dotenvLocation;
        for (let i = 0; i < process.argv.length; ++i) {
            if (process.argv[i] === '--dotenv') dotenvLocation = process.argv[++i];
        }

        const result = dotenv.config({ path: dotenvLocation || path.join(__dirname, '.env') });
        if (result.error) {
            const error = new Error('Error setting environment variables: ' + result.error);
            console.log(error);
            return done(error);
        }

        // create a mongo backup
        process.env.NODE_ENV === constants.nodeEnv.prod
            ? execSync(`mongodump --quiet --uri="${process.env.MONGO_CONNECTION}"`)
            : execSync('mongodump --quiet');

        const filename = `bak.${new moment().unix()}.tgz`;
        const encFilename = filename + '.enc';

        // create a tar file from the mongo back up
        execSync(`tar -czf ${filename} ./dump`);

        // create a cipher to encrypt the file with
        const iv = crypto.randomBytes(12).toString('hex');
        const cipher = crypto.createCipheriv('aes-256-gcm', process.env.DATABASE_BACKUP_PASSWORD, iv);

        // encrypt the file and save to system
        const unencryptedInput = fs.createReadStream(filename);
        const encryptedOutput = fs.createWriteStream(encFilename);

        await (() => {
            return new Promise((resolve, reject) => {
                cipher.on('error', reject);
                encryptedOutput.on('error', reject);
                encryptedOutput.on('finish', resolve);
                unencryptedInput.pipe(cipher).pipe(encryptedOutput);
            });
        })();

        const s3 = config.getS3();
        const s3Object = {
            Bucket: BACKUP_BUCKET,
            Key: encFilename,
            Body: fs.readFileSync(encFilename),
            ACL: 'private',
            Metadata: {
                iv: iv,
                mac: cipher.getAuthTag().toString('hex'),
            },
        };
        await s3.putObject(s3Object).promise();

        // delete the created files
        process.platform === 'win32' ? fs.rmdirSync('./dump', { recursive: true }) : execSync('rm -rf ./dump');

        fs.unlinkSync(filename);
        fs.unlinkSync(encFilename);
        done();
    } catch (e) {
        done(new Error(e));
    }
});

gulpfile.task('restoreDatabase', async function (done) {
    try {
        let filename, dotenvLocation;
        for (let i = 0; i < process.argv.length; ++i) {
            if (process.argv[i] === '--file') filename = process.argv[++i];
            if (process.argv[i] === '--dotenv') dotenvLocation = process.argv[++i];
        }

        const result = dotenv.config({ path: dotenvLocation || path.join(__dirname, '.env') });
        if (result.error) {
            const error = new Error('Error setting environment variables: ' + result.error);
            console.log(error);
            return done(error);
        }

        if (!filename) {
            console.error('restoreDatabase is a tool for restoring a database from an encrypted backup in s3 storage.');
            console.error('Usage: gulp restoreDatabase [option] [filename]');
            console.error('--file restore the database from the file in s3 storage');
            return done(new Error('Invalid Arguments'));
        }

        const s3 = config.getS3();
        const s3Params = {
            Bucket: BACKUP_BUCKET,
            Key: filename,
        };
        // collect metadata quickly by using limited range
        const metadata = (await s3.headObject(s3Params).promise()).Metadata;
        const s3ReadStreamObject = s3.getObject(s3Params).createReadStream();

        // create decipher using metadata
        const decipher = crypto.createDecipheriv('aes-256-gcm', process.env.DATABASE_BACKUP_PASSWORD, metadata.iv);
        decipher.setAuthTag(Buffer.from(metadata.mac, 'hex'));

        // write the decrypted file to system
        const writeStream = fs.createWriteStream(filename);

        await (() => {
            return new Promise((resolve, reject) => {
                decipher.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('finish', resolve);
                s3ReadStreamObject.pipe(decipher).pipe(writeStream);
            });
        })();

        // extract the decrypted tgz file
        execSync(`tar -xzf ${filename}`);

        // restore the database
        process.env.NODE_ENV === constants.nodeEnv.prod
            ? execSync(`mongorestore --quiet --uri="${process.env.MONGO_CONNECTION}"`)
            : execSync('mongorestore --quiet');

        // delete the downloaded and saved files
        process.platform === 'win32' ? fs.rmdirSync('./dump', { recursive: true }) : execSync('rm -rf ./dump');

        fs.unlinkSync(filename);
        done();
    } catch (e) {
        done(new Error(e));
    }
});

gulpfile.task('updateDatabaseKeys', async function (done) {
    try {
        let dotenvLocation;
        for (let i = 0; i < process.argv.length; ++i) {
            if (process.argv[i] === '--dotenv') dotenvLocation = process.argv[++i];
        }

        const result = dotenv.config({ path: dotenvLocation || path.join(__dirname, '.env') });
        if (result.error) {
            const error = new Error('Error setting environment variables: ' + result.error);
            console.log(error);
            return done(error);
        }

        let oldKey, newKey;
        for (let i = 0; i < process.argv.length; ++i) {
            if (process.argv[i] === '--oldKey') oldKey = process.argv[++i];
            if (process.argv[i] === '--newKey') newKey = process.argv[++i];
        }

        if (!oldKey || oldKey.length !== 32 || !newKey || newKey.length !== 32) {
            console.error('updateDatabaseKeys is a tool for updating encrypted backup private keys');
            console.error('Usage: gulp updateDatabaseKeys --oldKey OLDKEY --newKey NEWKEY');
            console.error('--oldKey the old encryption key used to decrypt. Length needs to be 32');
            console.error('--newKey the new encryption key used to encrypt. Length needs to be 32');
            return done(new Error('Invalid arguments'));
        }

        const s3 = config.getS3();
        const objectList = await s3.listObjectsV2({ Bucket: BACKUP_BUCKET }).promise();

        for (let content of objectList.Contents) {
            const s3Params = { Bucket: BACKUP_BUCKET, Key: content.Key };
            const metadata = (await s3.headObject(s3Params).promise()).Metadata;

            const decipher = crypto.createDecipheriv('aes-256-gcm', oldKey, metadata.iv);
            decipher.setAuthTag(Buffer.from(metadata.mac, 'hex'));

            const iv = crypto.randomBytes(12).toString('hex');
            const cipher = crypto.createCipheriv('aes-256-gcm', newKey, iv);

            const oldObject = s3.getObject(s3Params).createReadStream();
            const writeStream = fs.createWriteStream(content.Key);
            oldObject.pipe(decipher).pipe(cipher).pipe(writeStream);
            await (() => {
                return new Promise((resolve, reject) => {
                    writeStream.on('error', reject);
                    writeStream.on('finish', resolve);
                });
            })();

            s3Params.Key = content.Key;
            s3Params.ACL = 'private';
            s3Params.Body = fs.readFileSync(content.Key);
            s3Params.Metadata = {
                iv: iv,
                mac: cipher.getAuthTag().toString('hex'),
            };
            await s3.putObject(s3Params).promise();
            fs.unlinkSync(content.Key);
        }

        done();
    } catch (e) {
        done(new Error(e));
    }
});

gulpfile.task('updateSchemaVersions', async function (done) {
    try {
        let dotenvLocation;
        for (let i = 0; i < process.argv.length; ++i) {
            if (process.argv[i] === '--dotenv') dotenvLocation = process.argv[++i];
        }

        const result = dotenv.config({ path: dotenvLocation || path.join(__dirname, '.env') });
        if (result.error) {
            const error = new Error('Error setting environment variables: ' + result.error);
            console.log(error);
            return done(error);
        }

        const initialPath = path.join(__dirname, 'src', 'dbsmodel');
        let files = fs.readdirSync(initialPath).map((o) => {
            return { contents: o, path: initialPath };
        });

        for (let i = 0; i < files.length; ++i) {
            const filePath = path.join(files[i].path, files[i].contents);

            // filter out function files and dependent children like order.chargeDetails.js
            if (files[i].contents.split('.').length > 2) {
                files.splice(i, 1);
                --i;
            }

            // read directories and append them to later continue directory check
            else if (fs.lstatSync(filePath).isDirectory()) {
                files.splice(i, 1);
                const dirFiles = fs.readdirSync(filePath).map((o) => {
                    return { contents: o, path: filePath };
                });
                files = files.concat(dirFiles);
                --i;
            }
        }

        const models = [];
        for (let file of files) {
            const model = require(path.join(file.path, file.contents));

            // if it's of type object, we are exporting several models
            if (typeof model === 'object') {
                // only add models that have children. i.e. we don't want models that are discriminators
                const keys = Object.keys(model);
                for (let key of keys) {
                    if (model[key].discriminators !== undefined) models.push(model[key]);
                }
            } else {
                models.push(model);
            }
        }

        // run all of the saves
        const mongooseConfig = require('./src/config/mongoose');
        await mongooseConfig.connect();
        try {
            const promises = [];
            for (let model of models) {
                const documents = await model.find({});
                documents.forEach((document) => {
                    promises.push(document.save());
                });
            }
            await h.PromiseAll(promises);
        } catch (e) {
            console.error(e);
            await mongooseConfig.close();
            return done(new Error(e));
        }

        await mongooseConfig.close();
        done();
    } catch (e) {
        done(new Error(e));
    }
});

gulpfile.task('runLighthouse', (done) => {
    if (!fs.existsSync('lighthouse')) fs.mkdirSync('lighthouse');

    let lighthouseArgs = '--output html --output-path ./lighthouse/report.html --view';
    let url = 'https://thehomepainter.com/';

    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '--mobile') {
            lighthouseArgs += ' --chrome-flags="--window-size=360,740"';
        }

        if (process.argv[i] === '--tablet') {
            lighthouseArgs += ' --emulated-form-factor=none --chrome-flags="--window-size=768,1024"';
        }

        if (process.argv[i] === '--desktop-sm') {
            lighthouseArgs +=
                ' --emulated-form-factor=none --throttling-method=provided --chrome-flags="--window-size=1280,720"';
        }

        if (process.argv[i] === '--desktop-md') {
            lighthouseArgs +=
                ' --emulated-form-factor=none --throttling-method=provided --chrome-flags="--window-size=1680,1050"';
        }

        if (process.argv[i] === '--desktop' || process.argv[i] === '--desktop-lg') {
            lighthouseArgs +=
                ' --emulated-form-factor=none --throttling-method=provided --chrome-flags="--window-size=1920,1080"';
        }

        if (process.argv[i] === '--url') {
            url = process.argv[i + 1];
            i++;
        }
    }

    const query = `lighthouse ${url} ${lighthouseArgs}`;
    console.log('Executing: ' + query);
    execSync(query);
    done();
});

gulpfile.task('cleanLighthouse', () => {
    return gulpfile.src('lighthouse', { read: false, allowEmpty: true }).pipe(clean({ force: true }));
});

gulpfile.task(
    'buildDevelopment',
    gulpfile.series(
        'cleanPublicFiles',
        gulpfile.parallel('buildEmailSrc', 'buildSitemap', 'minifyImageFiles'),
        'buildAngularFilesDevelopment'
    )
);
gulpfile.task(
    'buildQualityAssurance',
    gulpfile.series(
        'cleanPublicFiles',
        gulpfile.parallel('buildEmailSrc', 'buildSitemap', 'minifyImageFiles'),
        'buildAngularFilesQualityAssurance'
    )
);
gulpfile.task(
    'default',
    gulpfile.series(
        'cleanPublicFiles',
        gulpfile.parallel('buildEmailSrc', 'buildSitemap', 'minifyImageFiles'),
        'buildAngularFiles'
    )
);
