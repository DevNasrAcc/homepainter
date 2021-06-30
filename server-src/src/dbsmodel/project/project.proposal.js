(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const projectProposalSchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            contractor: { type: Schema.Types.ObjectId, ref: 'user', required: true },
            // decline
            declined: { type: Schema.Types.Boolean },
            reason: { type: Schema.Types.String },
            feedback: { type: Schema.Types.String },
            // accept
            price: { type: Schema.Types.Number },
            message: { type: Schema.Types.String },
            earliestStartDate: { type: Schema.Types.String },
        },
        { timestamps: true }
    );
    module.exports = mongoose.model('projectProposal', projectProposalSchema);
})();
