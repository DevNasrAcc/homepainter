(function () {
    'use strict';

    const mongoose = require('mongoose');
    const moment = require('moment');
    const projectModel = require('../dbsmodel/project/project');

    module.exports = {
        FindAllProjectsUserHasAccessTo: FindAllProjectsUserHasAccessTo,
        FindOneById: FindOneById,
        FindOneAndUpdate: FindOneAndUpdate,
        FindOneAndUpsert: FindOneAndUpsert,
        FindOneWeekAbandonedProjects: FindOneWeekAbandonedProjects,
        FindTwelveWeekAbandonedProjects: FindTwelveWeekAbandonedProjects,
    };

    async function FindAllProjectsUserHasAccessTo(userId, mongooseSession) {
        const query = projectModel.find({ $or: [{ owner: userId }, { invitees: { $in: [userId] } }] });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds a project by _id. Does not populate fields
     * @param _id
     * @param mongooseSession
     * @returns {Promise<void>}
     */
    async function FindOneById(_id, mongooseSession) {
        const query = projectModel.findById(_id);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds and updates a project. Project parameter must be a mongoose document
     * @param project mongoose document
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindOneAndUpdate(project, mongooseSession) {
        if (!(project instanceof mongoose.Document)) {
            const error = new Error('project is not a document');
            Error.captureStackTrace(error);
            throw error;
        }

        const query = projectModel.findOneAndUpdate({ _id: project._id }, project.getChanges(), { new: true });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds and upserts a project
     * @param project
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindOneAndUpsert(project, mongooseSession) {
        if (!project._id) project._id = mongoose.Types.ObjectId();
        const query = projectModel.findOneAndUpdate({ _id: project._id }, project, { new: true, upsert: true });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindOneWeekAbandonedProjects(mongooseSession) {
        const oneWeekAgoStart = new moment().subtract(1, 'week').startOf('day').toDate();
        const oneWeekAgoEnd = new moment().subtract(1, 'week').endOf('day').toDate();

        const query = projectModel.find({
            updatedAt: {
                $gte: oneWeekAgoStart,
                $lte: oneWeekAgoEnd,
            },
            status: 'invitingPainters',
        });
        query.populate('owner');
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindTwelveWeekAbandonedProjects(mongooseSession) {
        const twoWeeksAgoStart = new moment().subtract(12, 'weeks').startOf('day').toDate();
        const twoWeeksAgoEnd = new moment().subtract(12, 'weeks').endOf('day').toDate();

        const query = projectModel.find({
            updatedAt: {
                $gte: twoWeeksAgoStart,
                $lte: twoWeeksAgoEnd,
            },
            status: 'invitingPainters',
        });
        query.populate('owner');
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
