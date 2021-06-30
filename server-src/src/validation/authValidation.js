(function () {
    'use strict';

    const validation = require('./requestValidator');

    module.exports = {
        StartLoginSequence: StartLoginSequence,
        Login: Login,
        LoginWithJWT: LoginWithJWT,
        RequestPasswordReset: RequestPasswordReset,
        RequestChangePassword: RequestChangePassword,
        ResetPassword: ResetPassword,
        PasswordChange: PasswordChange,
        UpdateNotifications: UpdateNotifications,
        UpdatePersonalInformation: UpdatePersonalInformation,
        UpdateUserNotificationPreferences: UpdateUserNotificationPreferences,
    };

    function StartLoginSequence(req) {
        return validation.Validate(req.body, {
            email: {
                type: 'email',
                required: true,
            },
        });
    }

    function Login(req) {
        return validation.Validate(req.body, {
            email: {
                type: 'email',
                required: true,
            },
            password: {
                type: 'password',
                required: true,
            },
        });
    }

    function LoginWithJWT(req) {
        return validation.Validate(req.body, {
            token: {
                type: 'jwt',
                required: true,
            },
        });
    }

    function RequestPasswordReset(req) {
        return validation.Validate(req.body, {
            email: {
                type: 'email',
                required: true,
            },
        });
    }

    function ResetPassword(req) {
        return validation.Validate(req.body, {
            email: {
                type: 'email',
                required: true,
            },
            passwordResetCode: {
                type: 'string',
                minLength: 32,
                maxLength: 32,
                required: true,
            },
            password: {
                type: 'password',
                required: true,
            },
        });
    }

    /**
     * Validates the user input by verifying the email along with a changed password
     * @param req
     * @returns {Array}
     */
    function RequestChangePassword(req) {
        return validation.Validate(req.body, {
            email: {
                type: 'email',
                required: true,
            },
            currentPassword: {
                type: 'password',
                required: true,
            },
            newPassword: {
                type: 'password',
                required: true,
            },
        });
    }

    /**
     * Validates input from user verifying a password change is valid
     * @param body
     * @return {Array}
     */
    function PasswordChange(req) {
        const failures = validation.Validate(req.body, {
            oldPassword: {
                type: 'password',
                required: true,
            },
            newPassword: {
                type: 'password',
                required: true,
            },
            confirmNewPassword: {
                type: 'password',
                required: true,
            },
        });

        if (req.body.newPassword !== req.body.confirmNewPassword) {
            failures.push('[newPassword] and [confirmNewPassword] filed validation: values do not match');
        }

        return failures;
    }

    function UpdateNotifications(req) {
        return validation.Validate(req.body, {
            token: {
                type: 'jwt',
                required: true,
            },
            email: {
                type: 'object',
                required: true,
                fields: {
                    sendPromotional: {
                        type: 'boolean',
                        required: true,
                    },
                    sendProductNews: {
                        type: 'boolean',
                        required: true,
                    },
                    sendBlog: {
                        type: 'boolean',
                        required: true,
                    },
                    sendProjectNotices: {
                        type: 'boolean',
                        required: true,
                    },
                    sendMessageNotices: {
                        type: 'boolean',
                        required: true,
                    },
                },
            },
            mobile: {
                type: 'object',
                required: true,
                fields: {
                    sendProjectNotices: {
                        type: 'boolean',
                        required: true,
                    },
                    sendMessageNotices: {
                        type: 'boolean',
                        required: true,
                    },
                },
            },
        });
    }

    /**
     * Validating the request body
     * @param req
     * @returns {Array}
     */
    function UpdatePersonalInformation(req) {
        return validation.Validate(req.body, {
            firstName: {
                type: 'string',
                required: true,
            },
            lastName: {
                type: 'string',
                required: true,
            },
            email: {
                type: 'email',
                required: true,
            },
            mobile: {
                type: 'string',
                required: true,
            },
        });
    }

    /**
     * Validate request body by checking the email and mobile properties to update logged-in user notification preference
     * @param req
     * @returns {Array}
     */
    function UpdateUserNotificationPreferences(req) {
        return validation.Validate(req.body, {
            email: {
                type: 'object',
                required: true,
                fields: {
                    sendPromotional: {
                        type: 'boolean',
                        required: true,
                    },
                    sendProductNews: {
                        type: 'boolean',
                        required: true,
                    },
                    sendBlog: {
                        type: 'boolean',
                        required: true,
                    },
                    sendProjectNotices: {
                        type: 'boolean',
                        required: true,
                    },
                    sendMessageNotices: {
                        type: 'boolean',
                        required: true,
                    },
                },
            },
            mobile: {
                type: 'object',
                required: true,
                fields: {
                    sendProjectNotices: {
                        type: 'boolean',
                        required: true,
                    },
                    sendMessageNotices: {
                        type: 'boolean',
                        required: true,
                    },
                },
            },
        });
    }
})();
