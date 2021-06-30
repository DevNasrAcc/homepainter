(function () {
    'use strict';

    const moment = require('moment');
    const mongoose = require('mongoose');
    const config = require('../../config/config');
    const constants = require('../../config/constants');

    module.exports = {
        preValidate: preValidate,
        preSaveUpdate: preSaveUpdate,
        toFrontEnd: toFrontEnd,
        toContractorVisibleFields: toContractorVisibleFields,
        updateVersionFromDBS: updateVersionFromDBS,
        updateVersionFromObject: updateVersionFromObject,
    };

    async function preValidate(next) {
        await this.updateVersionFromDBS();
        next();
    }

    async function preSaveUpdate(next) {
        // do nothing
        next();
    }

    function toFrontEnd() {
        const project = this.toObject();
        delete project.invitees;

        if (!(this.owner instanceof mongoose.Types.ObjectId)) {
            project.owner = this.owner.toFrontEnd();
        }

        for (let i = 0; i < this.proposals.length; i++) {
            if (!(this.proposals[i].contractor instanceof mongoose.Types.ObjectId)) {
                project.proposals[i].contractor = this.proposals[i].contractor.toFrontEnd();
            }
        }

        project.proposals = project.proposals.filter((obj) => !obj.declined);

        return project;
    }

    function toContractorVisibleFields() {
        const project = this.toObject();
        delete project.details.address.streetAddress;
        delete project.details.address.city;
        delete project.details.address.state;
        delete project.invitees;
        delete project.promoCode;
        delete project.selectedProposal;
        delete project.invitedContractors;

        if (!(this.owner instanceof mongoose.Types.ObjectId)) {
            project.owner = this.owner.toContractorVisibleFields();
        }

        return project;
    }

    async function updateVersionFromDBS() {
        // noinspection FallThroughInSwitchStatementJS
        switch (this.schemaVersion) {
            case undefined:
                const oldExterior = this.details.exterior;

                const newExterior = [];
                if (this.details.decorType !== 'interior') {
                    newExterior.push({
                        defaultName: 'House',
                        type: 'house',
                        numberOfStories: oldExterior[0].numberOfStories,
                        paintCondition: 'unknown',
                        items: [],
                        photos: [],
                    });
                }

                for (let itemType of oldExterior[0].items) {
                    const type = Object.values(itemType.toObject()).join('');
                    if (type === 'garage') {
                        newExterior.push({
                            defaultName: 'Detached Garage',
                            type: 'detachedGarage',
                            numberOfStories: 1,
                            paintCondition: 'unknown',
                            items: [
                                {
                                    type: 'unknown',
                                    sidingType: 'unknown',
                                },
                            ],
                            photos: [],
                        });
                    } else if (type === 'deck-deckStaining') {
                        newExterior.push({
                            defaultName: 'Deck',
                            type: 'deck',
                            paintCondition: 'unknown',
                            deckElevation: 'unknown',
                            deckTreatment: 'unknown',
                            deckSize: { name: 'unknown', squareFootage: 1, label: 'unknown' },
                            items: [
                                {
                                    type: 'unknown',
                                    sidingType: 'unknown',
                                },
                            ],
                            photos: [],
                        });
                    } else {
                        newExterior[0].items.push({
                            type: type,
                            sidingType: 'unknown',
                            sidesToPaint: ['unknown'],
                        });
                    }
                }

                // if a user selected only garage or deck-deckStaining, items will be empty. Delete if that's the case
                if (newExterior.length > 0 && newExterior[0].items.length === 0) {
                    newExterior.splice(0, 1);
                }

                const s3 = config.getS3();
                const s3Params = {
                    Bucket: process.env.S3_BUCKET,
                    Range: 'bytes=0-0',
                    Key: undefined,
                };

                for (let photo of oldExterior[0].photos) {
                    // photo was converted to an object incorrectly. Fix that object
                    photo = photo.toObject();
                    delete photo.createdAt;
                    const url = Object.values(photo).join('');
                    let fileName = url.split('/');
                    fileName = fileName[fileName.length - 1];

                    // get the file
                    s3Params.Key = fileName;
                    const file = await s3.getObject(s3Params).promise();

                    // save the file
                    newExterior[0].photos.push({
                        createdAt: file.LastModified,
                        url: url,
                        originalName:
                            file.Metadata && file.Metadata.originalname !== undefined
                                ? file.Metadata.originalname
                                : 'unknown_filename',
                        size: parseInt(file.ContentRange.split('/')[1]),
                    });
                }

                for (let interior of this.details.interior) {
                    for (let photo of interior.photos) {
                        // get doc and delete wrongly converted values
                        const doc = photo._doc;
                        delete doc.createdAt;
                        const url = Object.values(doc).join('');
                        for (let key of Object.keys(doc)) {
                            delete doc[key];
                        }

                        // get the file and update the doc
                        let fileName = url.split('/');
                        fileName = fileName[fileName.length - 1];
                        s3Params.Key = fileName;
                        const file = await s3.getObject(s3Params).promise();
                        doc.createdAt = file.LastModified;
                        doc.url = url;
                        doc.originalName =
                            file.Metadata && file.Metadata.originalname !== undefined
                                ? file.Metadata.originalname
                                : 'unknown_filename';
                        doc.size = parseInt(file.ContentRange.split('/')[1]);
                    }
                    interior.markModified('photos');
                }

                // unknown photo
                const photoUnknown = {
                    createdAt: '2020-06-11T00:00:00.000Z',
                    url:
                        'https://us-east-1.linodeobjects.com/homepainter-images/' +
                        '1e046cd6-f9e5-4ac5-a638-818931e940e8.jpg',
                    originalName: 'photo_unknown.jpg',
                    size: 13982,
                };
                // if no photos were added to an exterior project
                for (let exterior of newExterior) {
                    if (exterior.photos.length === 0) {
                        exterior.photos.push(photoUnknown);
                    }
                }

                this.details.exterior = newExterior;
            case '06-01-2020':
                for (let exterior of this.details.exterior) {
                    if (!exterior.squareFootage && exterior.type === 'house') {
                        exterior.squareFootage = 1;
                    }
                }
            case '07-08-2020':
                if (this.details._doc.timeFrame === '') {
                    this.details.timeFrameStart = '';
                    this.details.timeFrameEnd = '';
                } else {
                    this.details.timeFrameStart =
                        this.details._doc.timeFrame === 'lessThan1Month' ? 'startWithinNextMonth' : 'flexibleStartDate';
                    this.details.timeFrameEnd = 'flexibleEndDate';
                }
                delete this.details._doc.timeFrame;
                this.markModified('details');
            case '08-05-2020':
                for (let proposal of this.proposals) {
                    const createdAt = new moment(proposal.createdAt);
                    proposal.earliestStartDate = createdAt.format('MMM DD, YYYY');
                }
                if (this.selectedProposal) {
                    const createdAt = new moment(this.selectedProposal.createdAt);
                    this.selectedProposal.earliestStartDate = createdAt.format('MMM DD, YYYY');
                }
            case '09-02-2020':
                // manual steps required for this update.
                if (this.details.paintSupplier === 'homeowner') this.details.paintSupplier = 'customer';
                if (!this.status) this.status = 'expired';
                this.owner = this._doc.homeowner;
                delete this._doc.homeowner;
                delete this._doc.uuid;
                this.markModified('homeowner');
                this.markModified('uuid');
            case '09-11-2020':
                for (const structure of this.details.exterior) {
                    for (const item of structure.items) {
                        if (item._doc.sidingType) {
                            item._doc.sidingTypes = [item._doc.sidingType];
                        } else {
                            item._doc.sidingTypes = [];
                        }
                        delete item._doc.sidingType;
                        item.markModified('sidingTypes');
                        item.markModified('sidingType');
                    }
                }
        }

        this.schemaVersion = constants.schemaVersion;
        return this;
    }

    async function updateVersionFromObject(obj) {
        switch (obj.schemaVersion) {
            case undefined:
                const oldExterior = obj.details.exterior;

                const newExterior = [];
                if (obj.details.decorType !== 'interior') {
                    newExterior.push({
                        defaultName: 'House',
                        type: 'house',
                        numberOfStories: oldExterior.numberOfStories,
                        paintCondition: '',
                        items: [],
                        photos: [],
                    });
                }

                for (let itemType of oldExterior.items) {
                    if (itemType === 'garage') {
                        newExterior.push({
                            defaultName: 'Detached Garage',
                            type: 'detachedGarage',
                            numberOfStories: 1,
                            paintCondition: '',
                            items: [],
                            photos: [],
                        });
                    } else if (itemType === 'deck-deckStaining') {
                        newExterior.push({
                            defaultName: 'Deck',
                            type: 'deck',
                            paintCondition: '',
                            deckElevation: '',
                            deckTreatment: '',
                            deckSize: { name: '', squareFootage: '', label: '' },
                            items: [],
                            photos: [],
                        });
                    } else {
                        newExterior[0].items.push({
                            type: itemType,
                            sidingType: '',
                            sidesToPaint: [],
                        });
                    }
                }

                // if a user selected only garage or deck-deckStaining, items will be empty. Delete if that's the case
                if (newExterior.length > 0 && newExterior[0].items.length === 0) {
                    newExterior.splice(0, 1);
                }

                const s3 = config.getS3();
                const s3Params = {
                    Bucket: process.env.S3_BUCKET,
                    Range: 'bytes=0-0',
                    Key: undefined,
                };

                for (let photo of oldExterior.photos) {
                    let fileName = photo.split('/');
                    fileName = fileName[fileName.length - 1];

                    // get the file
                    s3Params.Key = fileName;
                    const file = await s3.getObject(s3Params).promise();

                    // save the file
                    newExterior[0].photos.push({
                        createdAt: file.LastModified,
                        url: photo,
                        originalName:
                            file.Metadata && file.Metadata.originalname !== undefined
                                ? file.Metadata.originalname
                                : 'unknown_filename',
                        size: parseInt(file.ContentRange.split('/')[1]),
                    });
                }

                for (let interior of obj.details.interior) {
                    for (let photoIndex = 0; photoIndex < interior.photos.length; ++photoIndex) {
                        let fileName = interior.photos[photoIndex].split('/');
                        fileName = fileName[fileName.length - 1];
                        s3Params.Key = fileName;
                        const file = await s3.getObject(s3Params).promise();
                        interior.photos[photoIndex] = {
                            createdAt: file.LastModified,
                            url: interior.photos[photoIndex],
                            originalName:
                                file.Metadata && file.Metadata.originalname !== undefined
                                    ? file.Metadata.originalname
                                    : 'unknown_filename',
                            size: parseInt(file.ContentRange.split('/')[1]),
                        };
                    }
                }

                obj.details.exterior = newExterior;
            case '06-01-2020':
                for (let exterior of obj.details.exterior) {
                    if (!exterior.squareFootage && exterior.type === 'house') {
                        exterior.squareFootage = 1;
                    }
                }
            case '07-08-2020':
                if (obj.details.timeFrame === '') {
                    obj.details.timeFrameStart = '';
                    obj.details.timeFrameEnd = '';
                } else {
                    obj.details.timeFrameStart =
                        obj.details.timeFrame === 'lessThan1Month' ? 'startWithinNextMonth' : 'flexibleStartDate';
                    obj.details.timeFrameEnd = 'flexibleEndDate';
                }
                delete obj.details.timeFrame;
            case '09-11-2020':
                let garage = obj.details.exterior.find((e) => e.type === 'detachedGarage');
                if (garage) {
                    garage.garageSize = { label: '2 Car', size: 2 };
                }
                for (const structure of obj.details.exterior) {
                    for (const item of structure.items) {
                        if (item.sidingType) {
                            item.sidingTypes = [item.sidingType];
                        } else {
                            item.sidingTypes = [];
                        }
                        delete item.sidingType;
                    }
                }
        }

        obj.schemaVersion = constants.schemaVersion;
        return obj;
    }
})();
