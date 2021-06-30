(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const functions = require('./locationData.functions');

    const locationDataSchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            zipCode: {
                type: Schema.Types.Number,
                unique: true,
                index: true,
                required: true,
            },
            salesTaxRate: { type: Schema.Types.Number, required: true },
            country: { type: Schema.Types.String, required: true, uppercase: true },
            state: { type: Schema.Types.String, required: true, uppercase: true },
            city: [{ type: Schema.Types.String, required: true, lowercase: true }],
            serviced: { type: Schema.Types.Boolean, required: true },
            laborRate: { type: Schema.Types.Number, required: true },
            markup: { type: Schema.Types.Number, required: true },
            depositPercent: { type: Schema.Types.Number, required: true },
            house: {
                livingRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                bedRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                bathroom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                diningRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                kitchen: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                laundryRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                entryway: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                hallway: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                stairway: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                sunRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                garage: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                other: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
            },
            townhouse: {
                livingRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                bedRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                bathroom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                diningRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                kitchen: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                laundryRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                entryway: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                hallway: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                stairway: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                sunRoom: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                garage: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
                other: {
                    size: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            length: { type: Schema.Types.Number, required: true },
                            width: { type: Schema.Types.Number, required: true },
                            prepHours: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    height: [
                        {
                            name: { type: Schema.Types.String, required: true },
                            height: { type: Schema.Types.Number, required: true },
                            label: { type: Schema.Types.String, required: true },
                        },
                    ],
                    paintingPrimingTimeMultiplier: { type: Schema.Types.Number, required: true },
                },
            },
            decorDetails: {
                cabinetDoor: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                cabinetDrawer: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                ceiling: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                crownMolding: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                wall: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                accentWall: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                door: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                doorFrame: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                baseboard: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                window: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
                fireplaceMantel: {
                    prepUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    primingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerHour: { type: Schema.Types.Number, required: true },
                    paintingUnitsPerGallon: { type: Schema.Types.Number, required: true },
                    itemMarkup: { type: Schema.Types.Number, required: true },
                },
            },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    locationDataSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    locationDataSchema.pre('validate', functions.preValidate);

    module.exports = mongoose.model('locationData', locationDataSchema);
})();
