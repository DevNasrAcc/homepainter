/**
 * Initiates the project for new devs or rebuilding from scratch.
 */
(async function() {
    'use strict';

    const fs = require('fs');
    const execSync = require('child_process').execSync;
    const root = require('path').join(__dirname, '../../');
    const crypto = require('crypto');

    console.log('\x1b[35m%s\x1b[0m', 'Starting task [Initiate Project]');

    // Install global packages
    console.log('Installing global packages');
    execSync('npm install --silent -g @angular/cli gulp-cli lighthouse npm-check-updates node-gyp');

    // Npm install packages
    console.log('Running `npm install` in angular-src');
    execSync(`cd ${root}/angular-src && npm install --silent && cd ${root}/tools/init-project`);

    console.log('Running `npm install` in email-src');
    execSync(`cd ${root}/email-src && npm install --silent && cd ${root}/tools/init-project`);

    console.log('Running `npm install` in server-src');
    execSync(`cd ${root}/server-src && npm install --silent && cd ${root}/tools/init-project`);

    // Duplicate .env file
    if(fs.existsSync(`${root}/server-src/.env`)) {
        console.log('\x1b[33m%s\x1b[0m', 'Dot Env file for server-src exists, skipping...');
    }
    else {
        console.log('Creating an ethereal account');
        const nodemailer = require('../../server-src/node_modules/nodemailer');
        let credentials;

        try {
            credentials = await nodemailer.createTestAccount();
        } catch (err) {
            console.error('Failed to create a testing account. ' + err.message);
            process.exit(1);
        }

        console.log('Reading sample.env file');
        const sampleEnv = fs.readFileSync(`${root}/server-src/sample.env`, 'utf-8');
        const env = sampleEnv
            .replace('NODE_ENV=your_env_here', 'NODE_ENV=development')
            .replace('PORT=enter_the_port_to_run_on_here', 'PORT=80')
            .replace('LOG_DIRECTORY=enter_directory', 'LOG_DIRECTORY=')
            .replace('LOG_FILENAME=enter_filename', 'LOG_FILENAME=')
            .replace('MONGO_DATABASE=your_database_here', 'MONGO_DATABASE=homepainter')
            .replace('MONGO_CONNECTION=your_connection_here', 'MONGO_CONNECTION=mongodb://localhost:27017/?replicaSet=rs')
            .replace('EXPRESS_SESSION_SECRET=rand_secret_here', `EXPRESS_SESSION_SECRET=${crypto.randomBytes(32).toString('base64')}`)
            .replace('JWT_ACCOUNT_SECURITY_SECRET=rand_secret_here', `JWT_ACCOUNT_SECURITY_SECRET=${crypto.randomBytes(32).toString('base64')}`)
            .replace('JWT_EMAIL_UNSUBSCRIBE_SECRET=rand_secret_here', `JWT_EMAIL_UNSUBSCRIBE_SECRET=${crypto.randomBytes(32).toString('base64')}`)
            .replace('SMTP_HOST=host', `SMTP_HOST=${credentials.smtp.host}`)
            .replace('SMTP_PORT=port', `SMTP_PORT=${credentials.smtp.port}`)
            .replace('SMTP_USERNAME=username', `SMTP_USERNAME=${credentials.user}`)
            .replace('SMTP_PASSWORD=password', `SMTP_PASSWORD=${credentials.pass}`)
            .replace('MAILGUN_WEBHOOK_SIGNING_API_KEY=api_key', 'MAILGUN_WEBHOOK_SIGNING_API_KEY=')
            .replace('BASE_URL=base_url', 'BASE_URL=')
            .replace('STRIPE_EXECUTABLE=/usr/local/bin/stripe', 'STRIPE_EXECUTABLE=')
            .replace('STRIPE_PUBLISHABLE_KEY=api_key', 'STRIPE_PUBLISHABLE_KEY=')
            .replace('STRIPE_SECRET_KEY=api_key', 'STRIPE_SECRET_KEY=')
            .replace('STRIPE_CLIENT_ID=api_key', 'STRIPE_CLIENT_ID=')
            .replace('STRIPE_WEBHOOK_SECRET=webhook_key', 'STRIPE_WEBHOOK_SECRET=')
            .replace('STRIPE_WEBHOOK_CONNECT_SECRET=webhook_key', 'STRIPE_WEBHOOK_CONNECT_SECRET=')
            .replace('SLACK_WEBHOOK_URL=enter_url', 'SLACK_WEBHOOK_URL=')
            .replace('S3_REGION=region', 'S3_REGION=')
            .replace('S3_BUCKET=bucket_name', 'S3_BUCKET=')
            .replace('S3_ENDPOINT=https://region.domain.com', 'S3_ENDPOINT=')
            .replace('S3_ACCESS_KEY=access_key', 'S3_ACCESS_KEY=')
            .replace('S3_SECRET_KEY=secret_key', 'S3_SECRET_KEY=')
            .replace('TWILIO_ACCOUNT_SID=account_sid', 'TWILIO_ACCOUNT_SID=')
            .replace('TWILIO_AUTH_TOKEN=auth_token', 'TWILIO_AUTH_TOKEN=')
            .replace('TWILIO_PHONE_NUMBER=phone_number', 'TWILIO_PHONE_NUMBER=')
            .replace('DATABASE_BACKUP_PASSWORD=some_password', 'DATABASE_BACKUP_PASSWORD=');

        console.log('Writing .env file');
        fs.writeFileSync(`${root}/server-src/.env`, env);
    }

    if(fs.existsSync(`${root}/email-src/.env`)) {
        console.log('\x1b[33m%s\x1b[0m', 'Dot Env file for email-src exists, skipping...');
    }
    else {
        const sampleEnv = fs.readFileSync(`${root}/email-src/.env-sample`, 'utf-8');
        console.log('Writing .env file');
        fs.writeFileSync(`${root}/email-src/.env`, sampleEnv);
    }

    // Create mongo database
    console.log('Setting up local database');

    console.log('Creating Collection - location data');
    execSync(`cd ${root}/tools/location-data-builder && node app.js --silent && cd ${root}/tools/init-project`);

    // Build angular files
    console.log('Building Angular Quality Assurance');
    execSync(`cd ${root}/server-src && gulp buildQualityAssurance && cd ${root}/tools/init-project`);

    console.log('\x1b[35m%s\x1b[0m', 'Finished task [Initiate Project]');
})();
