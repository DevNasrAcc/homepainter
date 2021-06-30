(async function () {
    "use strict";

    const fs = require('fs');
    const crypto = require('crypto');

    const usage = function() {
        console.log('Usage:');
        console.log('    node app.js [PASSWORD] -e [FILE]');
        console.log('    node app.js [PASSWORD] -d [FILE] [IV] [MAC]');
        process.exit(1);
    };

    if (process.argv.length < 5 || (process.argv[3] !== '-e' && process.argv.length < 7))
        usage();

    const password = process.argv[2];
    const encrypt = process.argv[3] === '-e' ? true : process.argv[3] === '-d' ? false : undefined;
    const file = process.argv[4];
    const initializationVector = encrypt === false ? process.argv[5] : crypto.randomBytes(12).toString('hex');
    let mac = encrypt === false ? process.argv[6] : undefined;

    const stats = fs.statSync(file);
    const hash = crypto.createHash('sha256').update(password).digest('base64').substring(0, 32);

    if (encrypt === undefined || !stats.isFile())
        usage();

    if (encrypt) {
        const cipher = crypto.createCipheriv('aes-256-gcm', hash, initializationVector);
        const unencryptedInput = fs.createReadStream(file);
        const encryptedOutput = fs.createWriteStream(file + '.enc');
        await (() => {
            return new Promise((resolve, reject) => {
                cipher.on('error', reject);
                encryptedOutput.on('error', reject);
                encryptedOutput.on('finish', resolve);
                unencryptedInput.pipe(cipher).pipe(encryptedOutput);
            });
        })();
        mac = cipher.getAuthTag().toString('hex');
    }
    else {
        const decipher = crypto.createDecipheriv('aes-256-gcm', hash, initializationVector);
        decipher.setAuthTag(Buffer.from(mac, 'hex'));
        const encryptedInput = fs.createReadStream(file);
        const unencryptedOutput = fs.createWriteStream(file.substring(0, file.length - 4));
        await (() => {
            return new Promise((resolve, reject) => {
                decipher.on('error', reject);
                unencryptedOutput.on('error', reject);
                unencryptedOutput.on('finish', resolve);
                encryptedInput.pipe(decipher).pipe(unencryptedOutput);
            });
        })();
    }

    console.log('File saved!');
    if (encrypt) {
        console.log('IV: %s', initializationVector);
        console.log('MAC: %s', mac);
    }

    process.exit(0);
})();
