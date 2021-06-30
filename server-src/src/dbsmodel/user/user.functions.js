(function () {
    'use strict';

    const crypto = require('crypto');
    const uuidV4 = require('uuid').v4;
    const argon2 = require('argon2');
    const helpers = require('../../helpers/helpers');
    const constants = require('../../config/constants');

    module.exports = {
        preValidate: preValidate,
        preSaveUpdate: preSaveUpdate,
        matchesPassword: matchesPassword,
        toFrontEnd: toFrontEnd,
        toContractorVisibleFields: toContractorVisibleFields,
        updateVersionFromDBS: updateVersionFromDBS,
    };

    async function preValidate(next) {
        await this.updateVersionFromDBS();
        next();
    }

    async function preSaveUpdate(next) {
        if (!!this.mobile.number) this.mobile.number = helpers.ToE164(this.mobile.number);

        if (this.isModified('password')) {
            this.password = await argon2.hash(this.password, {
                type: argon2.argon2id,
                parallelism: 8,
                memoryCost: 2 ** 20,
                timeCost: 3,
            });
        }

        next();
    }

    async function matchesPassword(password) {
        return await argon2.verify(this.password, password);
    }

    function toFrontEnd() {
        const user = this.toObject();

        delete user.createdAt;
        delete user.locked;
        delete user.password;

        if (user.__t === 'contractor') {
            delete user.email.sendPromotional;
            delete user.mobile;
            delete user.acceptedTermsAndPrivacy;
            delete user.timezone;
            delete user.title;
            delete user.approvalDate;
            delete user.completedStripeConnectDate;
            delete user.stripeConnectAccountId;
            delete user.insurance;
        } else if (user.__t === 'customer') {
            delete user.stripeCustomerId;
        }

        return user;
    }

    function toContractorVisibleFields() {
        const user = this.toObject();

        delete user.createdAt;
        delete user.password;

        if (user.__t === 'contractor') {
            delete user.stripeConnectAccountId;
        }

        return user;
    }

    async function updateVersionFromDBS() {
        // noinspection FallThroughInSwitchStatementJS
        switch (this.schemaVersion) {
            case undefined:
                if (this.__t === 'realtor' && !this.sessionId) {
                    // make sure session id exists save it so it doesn't keep regenerating
                    this.sessionId = uuidV4();
                }
            case '06-01-2020':
                if (this.__t === 'realtor') {
                    this.__t = 'agent';
                    delete this._doc.website;
                    delete this._doc.address;
                    this._doc.companyName = 'unknown';
                    this.markModified('website');
                    this.markModified('address');
                    this.markModified('companyName'); // we have to mark this as modified because we did a __t change
                }
                // if document has a realtor associated with it, convert it to be an customer
                if (this._doc.realtor) {
                    this.agent = this._doc.realtor;
                    delete this._doc.realtor;
                    this.markModified('realtor');
                    this.markModified('agent');
                }
            case '07-29-2020':
                if (this.__t === 'contractor' || this.__t === 'agent') {
                    this.password = crypto.randomBytes(8).toString('hex');
                }
                if (this.__t === 'agent') {
                    delete this._doc.sessionId;
                    this.markModified('sessionId');
                }
            case '09-02-2020':
                delete this._doc.accountId;
                this.markModified('accountId');
                this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.substr(1);
                this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.substr(1);

                if (this.__t === 'contractor') {
                    this.roles = ['contractor'];
                } else if (this.__t === 'agent') {
                    this.__t = 'customer';
                    this.roles = ['customer', 'agent'];
                    delete this._doc.accountStatus;
                    this.markModified('accountStatus');
                } else {
                    this.__t = 'customer';
                    this.roles = ['customer'];
                    delete this._doc.sessionId;
                    delete this._doc.agent;
                    delete this._doc.cart;
                    this.markModified('sessionId');
                    this.markModified('agent');
                    this.markModified('cart');
                }
            case '12-01-2020':
                if (this.__t === 'contractor' && this.picture === 'http://replace.me') {
                    this.picture = '';
                }
            case '12-22-2020':
                this.email.sendProductNews = this._doc.email.sendMarketing;
                this.email.sendBlog = true;
                this.email.sendProjectNotices = true;
                this.email.sendMessageNotices = true;
                delete this._doc.email.sendMarketing;
                this.markModified('email');
                this.mobile.sendProjectNotices = this._doc.mobile.sendMessages;
                this.mobile.sendMessageNotices = false;
                delete this._doc.mobile.sendMessages;
                this.markModified('mobile');
        }

        this.schemaVersion = constants.schemaVersion;
        return this;
    }
})();
