(function () {
    'use strict';

    const promoCodeModel = require('../dbsmodel/promoCode/promoCode');

    module.exports = {
        UpsertUserPromoCode: UpsertUserPromoCode,
        FindPromoCodeByCode: FindPromoCodeByCode,
    };

    async function UpsertUserPromoCode(userId, code, mongooseSession) {
        const query = promoCodeModel.findOneAndUpdate(
            { code },
            {
                user: userId,
                type: 'serviceFeePromo',
                code: code,
            },
            {
                new: true,
                upsert: true,
            }
        );
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindPromoCodeByCode(code, mongooseSession) {
        code = code.toLowerCase();
        const query = promoCodeModel.findOne({
            code: code,
        });

        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
