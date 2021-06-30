(async function () {
    "use strict";

    const argon2 = require('../../server-src/node_modules/argon2');

    const usage = function() {
        console.log('Usage:');
        console.log('    node tools/argon2id/app.js [PASSWORD] [OPTIONS...]');
        console.log('Options:');
        console.log('    -p, --parallelism [number]');
        console.log('    -m, --memory-cost [number]');
        console.log('    -t, --time-cost   [number]');
        process.exit(1);
    };

    const numberCheck = function(number) {
        if (isNaN(number)) usage();
        return parseInt(number);
    }

    let password;
    let parallelism;
    let memoryCost;
    let timeCost;

    if (process.argv.length < 3)
        usage();

    password = process.argv[2];
    for (let i = 0; i < process.argv.length; ++i) {
        if (process.argv[i] === '-p' || process.argv[i] === '--parallelism')
            parallelism = numberCheck(process.argv[++i]);
        if (process.argv[i] === '-m' || process.argv[i] === '--memory-cost')
            memoryCost = numberCheck(process.argv[++i]);
        if (process.argv[i] === '-t' || process.argv[i] === '--time-cost')
            timeCost = numberCheck(process.argv[++i]);
    }

    const start = new Date().getTime();
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        parallelism: parallelism || 8,
        memoryCost: memoryCost || (2 ** 20),
        timeCost: timeCost || 3,
    });
    const end = new Date().getTime();

    console.log('');
    console.log('Time to hash: %d seconds', (end - start) / 1000);
    console.log('Output hash: ' + hash);
    process.exit(0);
})();
