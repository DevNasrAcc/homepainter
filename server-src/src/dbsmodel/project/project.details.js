(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const fileModel = require('../file/file').FileModel;
    const projectEstimates = require('./project.estimates');

    const projectDetailsSchema = new Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },

            address: {
                streetAddress: { type: Schema.Types.String },
                city: { type: Schema.Types.String },
                state: { type: Schema.Types.String },
                zipCode: { type: Schema.Types.Number },
            },
            jobType: { type: Schema.Types.String, enum: ['', 'house', 'townhouse'] },
            decorType: { type: Schema.Types.String, enum: ['', 'interior', 'exterior'] },
            paintSupplier: { type: Schema.Types.String, enum: ['', 'customer', 'painter'] },
            paintBrand: { type: Schema.Types.String },
            paintProduct: { type: Schema.Types.String },
            timeFrameStart: {
                type: Schema.Types.String,
                enum: ['', 'flexibleStartDate', 'startWithinNextWeek', 'startWithinNextMonth'],
            },
            timeFrameEnd: {
                type: Schema.Types.String,
                enum: ['', 'flexibleEndDate', 'endDateInMind', 'finishWithinAMonth', 'finishWithinThreeMonths'],
            },
            expectedEndDate: { type: Schema.Types.Date },
            occupancy: {
                type: Schema.Types.String,
                enum: ['', 'furnishedAndOccupied', 'furnishedAndUnoccupied', 'emptyOfFurnishingsAndUnoccupied'],
            },
            interior: [
                {
                    defaultName: { type: Schema.Types.String, required: true },
                    type: { type: Schema.Types.String, required: true },
                    size: {
                        name: { type: Schema.Types.String, required: true },
                        length: { type: Schema.Types.Number, min: 1, max: 50 },
                        width: { type: Schema.Types.Number, min: 1, max: 50 },
                        label: { type: Schema.Types.String, required: true },
                    },
                    height: {
                        name: { type: Schema.Types.String, required: true },
                        height: { type: Schema.Types.Number, min: 6, max: 20 },
                        label: { type: Schema.Types.String, required: true },
                    },
                    items: [
                        {
                            type: { type: Schema.Types.String, required: true },
                            additionalDetails: {
                                // wall, accentWall, doorFrame, door
                                amount: { type: Schema.Types.Number, min: 0, max: 4 },
                                // wall
                                conditions: { type: [Schema.Types.String] },
                                // ceiling
                                ceilingType: { type: Schema.Types.String },
                                // cabinets
                                cabinetGrainType: { type: Schema.Types.String },
                                cabinetTreatment: { type: Schema.Types.String }, // add 'stain' later
                                cabinetCondition: { type: Schema.Types.String },
                                numberOfCabinetDrawers: { type: Schema.Types.Number, min: 0, max: 30 },
                                numberOfCabinetDoors: { type: Schema.Types.Number, min: 0, max: 30 },
                            },
                            estimates: { type: projectEstimates.schema },
                        },
                    ],
                    photos: [{ type: fileModel.schema }],
                    estimates: { type: projectEstimates.schema },
                },
            ],
            exterior: [
                {
                    defaultName: { type: Schema.Types.String, required: true },
                    type: {
                        type: Schema.Types.String,
                        required: true,
                        enum: ['house', 'detachedGarage', 'shed', 'deck'],
                    },
                    numberOfStories: { type: Schema.Types.Number, min: 0, max: 5 },
                    squareFootage: { type: Schema.Types.Number, min: 1, max: 10000 },
                    paintCondition: {
                        type: Schema.Types.String,
                        enum: ['', 'unknown', 'good', 'someFlaking', 'aLotOfFlaking'],
                    },
                    deckElevation: { type: Schema.Types.String, enum: ['', 'unknown', 'groundFloor', 'elevated'] },
                    deckTreatment: { type: Schema.Types.String, enum: ['', 'unknown', 'paint', 'stain'] },
                    deckSize: {
                        name: { type: Schema.Types.String },
                        squareFootage: { type: Schema.Types.Number, min: 0 },
                        label: { type: Schema.Types.String },
                    },
                    garageSize: {
                        label: { type: Schema.Types.String },
                        size: { type: Schema.Types.Number },
                    },
                    items: [
                        {
                            type: {
                                type: Schema.Types.String,
                                enum: [
                                    '',
                                    'unknown',
                                    'siding',
                                    'trim',
                                    'soffit',
                                    'facia',
                                    'garageDoor',
                                    'windowTrim',
                                    'gutters',
                                    'exteriorDoor',
                                ],
                            },
                            // siding
                            sidingTypes: [
                                {
                                    type: Schema.Types.String,
                                    enum: ['', 'unknown', 'brick', 'wood', 'vinyl', 'stucco', 'other'],
                                },
                            ],
                            sidesToPaint: [
                                { type: Schema.Types.String, enum: ['', 'unknown', 'front', 'back', 'left', 'right'] },
                            ],
                        },
                    ],
                    photos: [{ type: fileModel.schema, required: true }],
                },
            ],
            additionalDetailsComment: { type: Schema.Types.String },
            estimates: { type: projectEstimates.schema },
        },
        { timestamps: true }
    );

    module.exports = mongoose.model('projectDetails', projectDetailsSchema);
})();
