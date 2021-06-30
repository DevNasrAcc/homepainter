# HomePainter-Dev
## Getting Started

To get started, you need to install these programs.
* [NodeJS](https://nodejs.org/dist/latest-v10.x) - Runs Everything
* [Git](https://git-scm.com/downloads) - Source Control
* [Stripe CLI](https://github.com/stripe/stripe-cli/tags) - Retrieve Stripe Events Locally
* [MongoDB](https://www.mongodb.com/download-center/community) - Local Database
  * Follow link and navigate to 'Server' on the tab list.
  
Some additional dependencies are recommended as well:
* [IntelliJ](https://www.jetbrains.com/idea/download) - IDE
* [MongoDB Compass](https://www.mongodb.com/download-center/compass) - GUI for MongoDB
* [Slack](https://slack.com/downloads) - Communication Tool
* [Adobe XD](https://www.adobe.com/products/xd.html) - Company Design Tool
* [Insomnia](https://insomnia.rest/download/) - REST Api Caller
* [TortoiseGit](https://tortoisegit.org/download/) - Windows Shell Interface to Git
* [Google Chrome](https://www.google.com/chrome/) - Browser for testing
* [Mozilla Firefox](https://www.mozilla.org/en-US/firefox/new/) - Browser for testing

## MongoDB replica sets (REQUIRED)
To run transactions in mongo, we need to set up replica sets in mongodb. To do this, mongodb
must be installed and you need to run the following commands in an elevated command prompt. 
Then you need to restart the mongod service.
```$xslt
mongod --remove
mongod --logpath "C:\Program Files\MongoDB\Server\{MONGODB_VERSION}\log\mongod.log" --port 27017 --dbpath "C:\Program Files\MongoDB\Server\{MONGODB_VERSION}\data" --replSet rs0 --bind_ip localhost --install
```

Once restarted, you will need to go into the mongo shell and run the rs.initiate() command.
```$xslt
mongo
rs.initiate()
exit
```

## Building For The First Time
Building the initial project has been automated.
The build process is safe to run multiple times, so don't worry!
To start the build process, open a terminal and navigate to your working directory.

Then enter the following command
```$xslt
node ./tools/init-project/init-project.js
```

This will build everything you need to get started quickly.



## Stripe CLI
Stripe sends event notifications over through the use of webhooks. You will need to configure
the stripe cli to receive events by logging in via oauth. This 
[document](https://stripe.com/docs/stripe-cli) outlines in detail the process of logging in
and configuring the stripe cli. Follow steps 1, 2 & 4 to setup your work station.

*Note: You will need to paste the given STRIPE_WEBHOOK_SECRET into the .env file*

Step 2
```$xslt
stripe login
> Your pairing code is: humour-nifty-finer-magic
> Press Enter to open up the browser (^C to quit)
``` 

Step 4
```$xslt
stripe listen --forward-to localhost:5000/hooks
> Ready! Your webhook signing secret is '{{STRIPE_WEBHOOK_SECRET}}' (^C to quit)
```

## Finished!
That's it! There should not have been any errors, and your environment should be set up.

To run the program, open a terminal from the root directory and enter the command:
```$xslt
cd server-src && npm start
```

## Next Steps
If you are new to the company and have not been set up with the following access, 
you should ask your supervisor to set you up with the following accounts.
* [GMail](https://mail.google.com) - Email Provider
* [Jira](https://thedesignguis.atlassian.net/jira/software/projects/HP/boards/10) - Issue Tracking
* [Slack](https://homepainter.slack.com) - Communication Channel
* [Github](https://github.com/tuffant21/HomePainter-Dev) - Source Control Repository
* [Stripe](https://stripe.com) - Online Payment Processing


## Noteworthy Information
### Commit Messages
We use the following seven rules to write good commit messages. We create well-crafted Git commit messages to 
communicate context about a change to fellow developers and to our future selves. Use the following link to learn how 
to write proper git commit messages. 
* [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

### Emails
To send test emails, we use [Ethereal](https://ethereal.email/). You do not need to set anything up. The init-project
handles all of this for you. However, if you ever need to change your test account, go to the website listed above and
create an account. Once you create an ethereal account, you will be given a host name, port number, username, and 
password. Enter these values into your dotenv file under the following variables.
```$xslt
SMTP_HOST=host
SMTP_PORT=port
SMTP_USERNAME=username
SMTP_PASSWORD=password
```

### Dot Env
[DotEnv](https://www.npmjs.com/package/dotenv) is a module that loads environment variables from a .env file into 
process.env at runtime.
The init-project program will make a copy of the local .env-sample file and set all of the variables.

To view your DotEnv file, open the following file.
```$xslt
./server-src/.env
```

### Twilio CLI
[Twilio Cli](https://www.twilio.com/docs/sms/quickstart/node#install-the-twilio-cli) is a command line interface that
can redirect text messages to the local host. This isn't needed unless you are testing the twilio routes.

Here are some important links for setting up the twilio cli to receive texts
* [Install Twilio CLI](https://www.twilio.com/docs/sms/quickstart/node#install-the-twilio-cli)
* [Configure Local Webhook](https://www.twilio.com/docs/sms/quickstart/node#configure-your-webhook-url)

Use this command to forward twilio routers
```$xslt
twilio phone-numbers:update "+15155188810" --sms-url="http://localhost/twilio/sms"
```
