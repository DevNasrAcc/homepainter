(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const projectEstimatesSchema = new Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            // material
            primerGallons: { type: Schema.Types.Number, default: 0 },
            paintGallons: { type: Schema.Types.Number, default: 0 },
            totalGallons: { type: Schema.Types.Number, default: 0 },
            // labor
            repairHours: { type: Schema.Types.Number, default: 0 },
            prepHours: { type: Schema.Types.Number, default: 0 },
            primingHours: { type: Schema.Types.Number, default: 0 },
            paintingHours: { type: Schema.Types.Number, default: 0 },
            laborHours: { type: Schema.Types.Number, default: 0 },
            // cost
            laborCost: { type: Schema.Types.Number },
            materialCost: { type: Schema.Types.Number },
            totalCost: { type: Schema.Types.Number },
        },
        { timestamps: true }
    );

    module.exports = mongoose.model('projectEstimates', projectEstimatesSchema);
})();
