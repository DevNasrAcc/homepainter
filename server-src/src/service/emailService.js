(function () {
    'use strict';

    const moment = require('moment');
    const nodeMailer = require('nodemailer');
    const jwt = require('jsonwebtoken');
    const constants = require('../config/constants');
    const config = require('../config/config');
    const userRepo = require('../repo/userRepo');
    const communicationRepo = require('../repo/communicationEventRepo');
    const h = require('../helpers/helpers');
    const taskQueueService = require('./taskQueueService');
    let transporter;

    const _this = {
        SendEmail: SendEmail,
        ConvertMailgunFields: ConvertMailgunFields,
        EmailDelivered: EmailDelivered,
        EmailOpened: EmailOpened,
        GetSubjectPrefix: GetSubjectPrefix,

        ContactUs: ContactUs,
        ContractorApproved: ContractorApproved,
        ContractorRejected: ContractorRejected,
        ContractorReminder: ContractorReminder,
        ContractorSolicitBid: ContractorSolicitBid,
        ContractorVerifyEmail: ContractorVerifyEmail,
        ContractorHired: ContractorHired,
        ContractorJobComplete: ContractorJobComplete,
        CustomerAbandonedProject: CustomerAbandonedProject,
        CustomerAbandonedProjectFeedback: CustomerAbandonedProjectFeedback,
        CustomerReminder: CustomerReminder,
        CustomerReturnToProject: CustomerReturnToProject,
        CustomerNewProposal: CustomerNewProposal,
        CustomerShareProject: CustomerShareProject,
        CustomerDownPaymentInvoice: CustomerDownPaymentInvoice,
        CustomerFinalPaymentInvoice: CustomerFinalPaymentInvoice,
        CustomerFinalPaymentNotice: CustomerFinalPaymentNotice,
        CustomerJobComplete: CustomerJobComplete,
        CustomerJobCompleteTwoWeekFeedback: CustomerJobCompleteTwoWeekFeedback,
        AgentApproved: AgentApproved,
        AgentContactReceived: AgentContactReceived,
        AgentRejected: AgentRejected,
        SupportContractorApplication: SupportContractorApplication,
        SupportContractorCompletedStripeRegistration: SupportContractorCompletedStripeRegistration,
        SupportContractorFailedToEnterDate: SupportContractorFailedToEnterDate,
        SupportContractorFailedToConfirmJobCompletion: SupportContractorFailedToConfirmJobCompletion,
        SupportGeneralFeedback: SupportGeneralFeedback,
        SupportFinalPaymentFailed: SupportFinalPaymentFailed,
        SupportAgentContactReceived: SupportAgentContactReceived,
        SupportSystemError: SupportSystemError,
        SupportTransferFailed: SupportTransferFailed,
        UserLoggedIn: UserLoggedIn,
        UserLoginLink: UserLoginLink,
        UserLockedOutOfAccount: UserLockedOutOfAccount,
        UserNewMessageReceived: UserNewMessageReceived,
        UserNotRegistered: UserNotRegistered,
        ResetPassword: ResetPassword,
        SendPasswordChangeConfirmation: SendPasswordChangeConfirmation,
    };

    module.exports = _this;

    /**
     * Sends an email to a recipient
     *
     * @param args {{type: string, from: string, to: {}, subject: string, context: any, attachments: [{filename: string, path: string}]}=}
     * @return {Promise}
     */
    async function SendEmail(args) {
        if (args.type === constants.notificationCategories.transactional) {
            // generates a message about why they can't unsubscribe in the templates
            args.context.emailUnsubscribe = { transactional: true, token: null };
        } else {
            if (args.type === constants.notificationCategories.promotional && !args.to.email.sendPromotional) return;
            if (args.type === constants.notificationCategories.productNews && !args.to.email.sendProductNews) return;
            if (args.type === constants.notificationCategories.blog && !args.to.email.sendBlog) return;
            if (args.type === constants.notificationCategories.projectNotice && !args.to.email.sendProjectNotices)
                return;
            if (args.type === constants.notificationCategories.messageNotice && !args.to.email.sendMessageNotices)
                return;

            // generates an unsubscribe view in the templates
            // creates a jwt token to verify it is a verified user
            args.context.emailUnsubscribe = {
                transactional: false,
                token: jwt.sign(
                    { __t: args.to.__t, email: args.to.email.address },
                    process.env.JWT_EMAIL_UNSUBSCRIBE_SECRET,
                    { algorithm: 'HS256' }
                ),
            };
        }

        // convert the args 'to' property to a string
        if (typeof args.to === 'object' && !Array.isArray(args.to)) {
            args.to = args.to.email.address;
        }

        await taskQueueService.getPQueue().add(async function () {
            let remainingAttempts = 3;
            const errors = [];

            while (remainingAttempts > 0) {
                try {
                    if (!transporter) transporter = config.nodemailerTransport();

                    const info = await transporter.sendMail(args);

                    if (process.env.NODE_ENV === constants.nodeEnv.dev) {
                        console.log(nodeMailer.getTestMessageUrl(info));
                    }

                    return;
                } catch (e) {
                    remainingAttempts--;
                    errors.push(e.stack);
                }
            }

            const error = new Error('SendEmail has run out of attempts');
            error.stack = errors.toString();
            throw error;
        });
    }

    function ConvertMailgunFields(data) {
        // timestamp comes in as seconds since epoc. Need to convert it to milliseconds with * 1000
        return {
            sender: data.envelope ? data.envelope.sender : undefined,
            recipient: data.recipient,
            messageId: data.message.headers['message-id'],
            subject: data.message.headers.subject || undefined,
            timestamp: new moment(data.timestamp * 1000),
        };
    }

    async function EmailDelivered(data) {
        const toUser = await userRepo.FindOneByEmail(data.recipient);
        if (!toUser) return;

        const emailEvent = {
            from: undefined,
            to: toUser._id,
            subject: data.subject,
            messageId: data.messageId,
            deliveredTimestamp: data.timestamp,
            schemaVersion: constants.schemaVersion,
        };

        const fromUser = await userRepo.FindOneByEmail(data.sender);
        emailEvent.from = fromUser ? fromUser._id : data.sender;

        return await communicationRepo.UpsertEmailEvent(emailEvent);
    }

    async function EmailOpened(data) {
        const user = await userRepo.FindOneByEmail(data.recipient);
        if (!user) return;

        let emailEvent = await communicationRepo.FindOneEmailByMessageId(data.messageId);
        if (!emailEvent) {
            emailEvent = await _this.EmailDelivered(data);
        }

        if (!emailEvent.opens) emailEvent.opens = [];

        emailEvent.opens.push(data.timestamp);
        return await communicationRepo.UpsertEmailEvent(emailEvent);
    }

    function GetSubjectPrefix() {
        if (process.env.NODE_ENV === constants.nodeEnv.qa) {
            return '(DEV) ';
        }
        return '';
    }

    async function ContactUs(contactUs) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + `${contactUs.subject} ${h.FormatDate(new moment())}`,
            template: 'contact-us',
            context: { contactUs },
        });
    }

    async function ContractorApproved(contractor) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: contractor,
            subject: _this.GetSubjectPrefix() + `You have been approved!`,
            template: 'contractor-approved',
            context: { contractor },
        });
    }

    async function ContractorRejected(contractor) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: contractor,
            subject: _this.GetSubjectPrefix() + `Application Denied`,
            template: 'contractor-rejected',
        });
    }

    async function ContractorReminder(customer, project, contractor) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.localRepEmail,
            to: contractor,
            subject: _this.GetSubjectPrefix() + `Project Reminder for your project with ${customer.firstName}`,
            template: 'contractor-reminder',
            context: { customer, project, contractor },
        });
    }

    async function ContractorSolicitBid(contractor, project) {
        return await _this.SendEmail({
            type: constants.notificationCategories.projectNotice,
            from: constants.localRepEmail,
            to: contractor,
            subject: _this.GetSubjectPrefix() + `New project from Homepainter | ${project._id}`,
            template: 'contractor-solicit-bid',
            context: { contractor, project },
        });
    }

    async function ContractorVerifyEmail(contractor) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: contractor,
            subject: _this.GetSubjectPrefix() + 'Please verify your email address',
            template: 'contractor-verify-email',
            context: { contractor },
        });
    }

    async function ContractorHired(customer, project, contractor, order) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: contractor,
            subject: _this.GetSubjectPrefix() + `You have been hired! | order ${order._id}`,
            template: 'contractor-hired',
            context: { customer, project, contractor, order },
        });
    }

    async function ContractorJobComplete(customer, contractor, order) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: contractor,
            subject: _this.GetSubjectPrefix() + `End date arrived | Order ${order._id}`,
            template: 'contractor-job-complete',
            context: { customer, contractor, order },
        });
    }

    async function CustomerAbandonedProject(customer, project) {
        return await _this.SendEmail({
            type: constants.notificationCategories.promotional,
            from: constants.localRepEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + 'Finish your paint project',
            template: 'customer-abandoned-project',
            context: { project },
        });
    }

    async function CustomerAbandonedProjectFeedback(customer) {
        return await _this.SendEmail({
            type: constants.notificationCategories.promotional,
            from: constants.localRepEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + 'Thank you for visiting with us',
            template: 'customer-abandoned-project-feedback',
            context: {},
        });
    }

    async function CustomerReminder(customer) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.localRepEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + 'Homepainter | Project Reminder',
            template: 'customer-reminder',
            context: { customer },
        });
    }

    async function CustomerReturnToProject(customer, project) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.localRepEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + 'Homepainter | Link to return to your project',
            template: 'customer-return-to-project',
            context: { customer, project },
        });
    }

    async function CustomerNewProposal(customer, project) {
        return await _this.SendEmail({
            type: constants.notificationCategories.projectNotice,
            from: constants.localRepEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + 'Homepainter | You have a new quote',
            template: 'customer-new-proposal',
            context: { customer, project },
        });
    }

    async function CustomerShareProject(user, customer, project, message, jwt) {
        const userName = h.StorageName2DisplayName(user.firstName) + ' ' + h.StorageName2DisplayName(user.lastName);
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `${userName} has shared a paint project with you`,
            template: 'customer-share-project',
            context: { user, customer, project, message, jwt },
        });
    }

    async function CustomerDownPaymentInvoice(customer, project, contractor, order, promoCode) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `Down Payment Invoice | Thank you for choosing homepainter!`,
            template: 'customer-down-payment-invoice',
            context: { customer, project, contractor, order, promoCode },
        });
    }

    async function CustomerFinalPaymentInvoice(customer, project, contractor, order, promoCode) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `Final Payment Invoice | Thank you for choosing homepainter!`,
            template: 'customer-final-payment-invoice',
            context: { customer, project, contractor, order, promoCode },
        });
    }

    async function CustomerFinalPaymentNotice(customer, contractor, order, promoCode) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `Homepainter | We will be automatically billing your account soon`,
            template: 'customer-final-payment-notice',
            context: { customer, contractor, order, promoCode },
        });
    }

    async function CustomerJobComplete(customer, contractor, order) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.localRepEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `Homepainter Project Complete`,
            template: 'customer-job-complete',
            context: { contractor, order },
        });
    }

    async function CustomerJobCompleteTwoWeekFeedback(customer, order) {
        return await _this.SendEmail({
            type: constants.notificationCategories.promotional,
            from: constants.noReplyEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `How did we do? | Action Requested`,
            template: 'customer-job-complete-two-week-feedback',
            context: { customer, order },
        });
    }

    async function AgentApproved(customer, promoCode) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `You've been approved! | Homepainter`,
            template: 'agent-approved',
            context: { promoCode },
        });
    }

    async function AgentContactReceived(customer) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `We've received your request! | Homepainter`,
            template: 'customer-contact-received',
            context: { customer },
        });
    }

    async function AgentRejected(customer) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: customer,
            subject: _this.GetSubjectPrefix() + `Partnership denied | Homepainter`,
            template: 'customer-rejected',
            context: undefined,
        });
    }

    async function SupportContractorApplication(contractor) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + `New Contractor Application | ${contractor.email.address}`,
            template: 'contractor-application',
            context: { contractor },
        });
    }

    async function SupportContractorCompletedStripeRegistration(contractor) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + `${contractor.organizationName} has completed stripe registration`,
            template: 'support-contractor-completed-stripe-registration',
            context: { contractor },
        });
    }

    async function SupportContractorFailedToEnterDate(customer, project, contractor, order) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + 'Urgent Message - Contractor failed to enter date',
            template: 'support-contractor-failed-to-enter-date',
            context: { customer, project, contractor, order },
        });
    }

    async function SupportContractorFailedToConfirmJobCompletion(customer, project, contractor, order) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + 'Urgent Message - Contractor failed to confirm job completion',
            template: 'support-contractor-failed-to-confirm-job-completion',
            context: { customer, project, contractor, order },
        });
    }

    async function SupportGeneralFeedback(customer, feedback) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + `A user has provided general feedback`,
            template: 'support-general-feedback',
            context: { customer, feedback },
        });
    }

    async function SupportFinalPaymentFailed(customer, project, contractor, order) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + 'Urgent Message - Final payment failed for customer',
            template: 'support-final-payment-failed',
            context: { customer, project, contractor, order },
        });
    }

    async function SupportAgentContactReceived(customer) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + `New agent request!`,
            template: 'support-agent-contact-received',
            context: { customer },
        });
    }

    async function SupportSystemError(slackError, systemMessage) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + `Urgent Message - System Error @ ${h.FormatDate(new moment())}`,
            template: 'support-system-error',
            context: { slackError, systemMessage },
        });
    }

    async function SupportTransferFailed(contractor, order) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: ['ahouse@thehomepainter.com', 'jacob@thehomepainter.com'],
            subject: _this.GetSubjectPrefix() + 'Urgent Message - Contractor Payout Failed',
            template: 'support-transfer-failed',
            context: { contractor, order },
        });
    }

    async function UserLoggedIn(user) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: user,
            subject: _this.GetSubjectPrefix() + 'New login for your account at homepainter',
            template: 'user-logged-in',
            context: { user },
        });
    }

    async function UserLoginLink(user, jwt) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: user,
            subject: _this.GetSubjectPrefix() + 'homepainter one-time login link | ' + h.FormatDate(new moment()),
            template: 'user-login-link',
            context: { user, jwt },
        });
    }

    async function UserLockedOutOfAccount(user) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: user,
            subject: _this.GetSubjectPrefix() + 'Your homepainter account has been locked',
            template: 'user-lockout',
            context: { user },
        });
    }

    async function UserNewMessageReceived(to, from, message) {
        return await _this.SendEmail({
            type: constants.notificationCategories.messageNotice,
            from: constants.noReplyEmail,
            to: to,
            subject: _this.GetSubjectPrefix() + `You've received new messages from ${from.firstName}`,
            template: 'user-new-message-received',
            context: { to, from, message },
        });
    }

    async function UserNotRegistered(email) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: email,
            subject: _this.GetSubjectPrefix() + 'New login attempt for your account at homepainter',
            template: 'user-not-registered',
            context: undefined,
        });
    }

    async function ResetPassword(user, authKey) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: user,
            subject: _this.GetSubjectPrefix() + `Reset Password | Expires @ ${h.FormatDate(authKey.expireAt)}`,
            template: 'user-password-reset',
            context: { user, authKey },
        });
    }

    async function SendPasswordChangeConfirmation(user) {
        return await _this.SendEmail({
            type: constants.notificationCategories.transactional,
            from: constants.noReplyEmail,
            to: user,
            subject: _this.GetSubjectPrefix() + `Homepainter Password Change Confirmation`,
            template: 'user-password-updated-notice',
            context: { user },
        });
    }
})();
