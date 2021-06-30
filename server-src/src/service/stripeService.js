(function () {
    'use strict';

    let _stripe;

    const _this = {
        InitializeStripe: InitializeStripe,
        VerifyEvent: VerifyEvent,
        UpsertPaymentIntent: UpsertPaymentIntent,
        UpsertStripeCustomer: UpsertStripeCustomer,
        GetPaymentMethod: GetPaymentMethod,
        ConfirmPaymentIntent: ConfirmPaymentIntent,
        CreateConnectAccount: CreateConnectAccount,
        PayoutContractor: PayoutContractor,
        GetAccountLink: GetAccountLink,
    };

    module.exports = _this;

    /**
     * stripe is a singleton object that must be initialized after environment variables are populated
     * @returns <obj>
     */
    function InitializeStripe() {
        if (!_stripe) {
            _stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        }

        return _stripe;
    }

    /**
     * This is a request validator from stripe. It validates a request that is send is something they sent to us.
     * @param reqBody
     * @param reqSignature
     * @param secretKey
     * @return {Stripe.Event}
     */
    function VerifyEvent(reqBody, reqSignature, secretKey) {
        const stripe = _this.InitializeStripe();
        return stripe.webhooks.constructEvent(reqBody, reqSignature, process.env[secretKey]);
    }

    /**
     * creates or updates a payment intent for the customer
     * @param paymentIntentId
     * @param amount
     * @param metadata
     * @param stripeCustomerId - not required for initial payment intent
     * @param paymentMethod - not required for initial payment intent
     * @return {Promise<Stripe.PaymentIntent>}
     */
    async function UpsertPaymentIntent(paymentIntentId, amount, metadata, stripeCustomerId, paymentMethod) {
        const stripe = _this.InitializeStripe();
        const data = {
            amount: (amount * 100).toFixed(0),
            currency: 'usd',
            metadata: metadata,
        };

        // final payment
        if (stripeCustomerId && paymentMethod) {
            data.customer = stripeCustomerId;
            data.payment_method = paymentMethod;
        }
        // down payment
        else {
            data.setup_future_usage = 'off_session';
        }

        return paymentIntentId
            ? await stripe.paymentIntents.update(paymentIntentId, data)
            : await stripe.paymentIntents.create(data);
    }

    /**
     * If customer already contains a stripeCustomerId, associate the new payment token with the existing customer.
     * Otherwise, create a new stripeCustomerId, and save it inside of customer
     * @param customer
     * @param project
     * @param paymentMethod
     * @returns {Promise<String>}
     */
    async function UpsertStripeCustomer(customer, project, paymentMethod) {
        const stripe = _this.InitializeStripe();

        if (!customer.stripeCustomerId) {
            let stripeCustomer = await stripe.customers.create({
                name: customer.firstName + ' ' + customer.lastName,
                address: {
                    line1: project.details.address.streetAddress,
                    city: project.details.address.city,
                    state: project.details.address.state,
                    country: 'US',
                    postal_code: project.details.address.zipCode,
                },
                email: customer.email.address,
                phone: customer.mobile.number,
                payment_method: paymentMethod,
            });
            return stripeCustomer.id;
        }

        return customer.stripeCustomerId;
    }

    /**
     * Gets a payment method for a customer
     * @param stripeCustomerId
     * @return {Promise<void>}
     */
    async function GetPaymentMethod(stripeCustomerId) {
        const stripe = _this.InitializeStripe();

        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: 'card',
        });

        return paymentMethods.data[0].id;
    }

    /**
     * Charges a customer card
     * @param paymentIntentId
     * @param paymentMethod
     * @return {Promise<Stripe.PaymentIntent>}
     */
    async function ConfirmPaymentIntent(paymentIntentId, paymentMethod) {
        const stripe = _this.InitializeStripe();
        return await stripe.paymentIntents.confirm(paymentIntentId, {
            off_session: true,
            payment_method: paymentMethod,
        });
    }

    /**
     * Creates a contractor connect account
     * @param stripeCode
     * @return {Promise<string>}
     */
    async function CreateConnectAccount(stripeCode) {
        const stripe = _this.InitializeStripe();

        const resp = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code: stripeCode,
        });

        if (resp.error) throw resp.error_description;

        return resp.stripe_user_id;
    }

    /**
     *
     * @param stripePaymentIntentId
     * @param stripeConnectAccountId
     * @param amount
     * @param metadata
     * @returns {Promise<Stripe.Transfer>}
     */
    async function PayoutContractor(stripePaymentIntentId, stripeConnectAccountId, amount, metadata) {
        const stripe = _this.InitializeStripe();

        const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
        const chargeId = paymentIntent.charges.data[0].id;

        return await stripe.transfers.create({
            amount: (amount * 100).toFixed(0),
            currency: 'usd',
            source_transaction: chargeId,
            destination: stripeConnectAccountId,
            metadata: metadata,
        });
    }

    /**
     * Get stripe account link from the Stripe itself by passing the id and type onboarding
     * @param stripeAccountId
     * @returns {Promise<*>}
     */
    async function GetAccountLink(stripeAccountId) {
        const stripe = _this.InitializeStripe();

        const resp = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: 'https://thehomepainter.com/account-settings/stripe',
            return_url: 'https://thehomepainter.com/account-settings/stripe',
            type: 'account_onboarding',
        });

        if (resp.error) throw resp.error_description;

        return resp.url;
    }
})();
