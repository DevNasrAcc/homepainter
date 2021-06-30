(function () {
    'use strict';

    const jwt = require('jsonwebtoken');
    const moment = require('moment');

    const chargeDetailsModel = require('../dbsmodel/order/order.chargeDetails');
    const contractorRepo = require('../repo/contractorRepo');
    const emailService = require('../service/emailService');
    const customerRepo = require('../repo/customerRepo');
    const projectRepo = require('../repo/projectRepo');
    const promoCodeRepo = require('../repo/promoCodeRepo');
    const tempPhotoRepo = require('../repo/tempPhotoRepo');
    const userRepo = require('../repo/userRepo');
    const authKeyRepo = require('../repo/authKeyRepo');

    const _this = {
        GetProject: GetProject,
        SaveProject: SaveProject,
        GetDiscount: GetDiscount,
        InvitePainter: InvitePainter,
        AcceptDeclineProposal: AcceptDeclineProposal,
        GetChargeDetails: GetChargeDetails,
        GetAllProjects: GetAllProjects,
        ShareProject: ShareProject,
    };

    module.exports = _this;

    async function GetProject(projectId) {
        return await projectRepo.FindOneById(projectId);
    }

    async function SaveProject(project, ownerId) {
        const existingProject = await projectRepo.FindOneById(project._id);

        if (!existingProject) {
            project.owner = ownerId;
        } else {
            delete project.owner;
        }

        // customers are not able to make changes to proposals
        delete project.proposals;

        if (project.selectedProposal) {
            // set uni-directional link
            const selProId = project.selectedProposal.contractor._id;
            const contractor = await contractorRepo.FindOneById(selProId);
            project.selectedProposal.contractor = contractor._id;

            // check if for unauthorized modifications
            const found = existingProject.proposals.find(
                (obj) =>
                    obj.contractor.equals(project.selectedProposal.contractor) &&
                    obj.price === project.selectedProposal.price
            );

            if (!found) {
                const error = new Error(
                    `Customer [${ownerId}] has modified the contractor price for project [${project._id}]`
                );
                Error.captureStackTrace(error);
                throw error;
            }
        }

        for (let room of project.details.interior) {
            for (let photo of room.photos) {
                await tempPhotoRepo.Delete(photo.url);
            }
        }
        for (let structure of project.details.exterior) {
            for (let photo of structure.photos) {
                await tempPhotoRepo.Delete(photo.url);
            }
        }

        return await projectRepo.FindOneAndUpsert(project);
    }

    /**
     * @return {number}
     */
    async function GetDiscount(chargeDetails, promoCodeString) {
        if (!promoCodeString) return 0;
        const promoCodeObj = await promoCodeRepo.FindPromoCodeByCode(promoCodeString);

        if (!promoCodeObj) {
            return 0;
        }
        if (promoCodeObj.starts) {
            const starts = new moment(promoCodeObj.starts);
            const now = new moment();
            if (starts.isAfter(now)) {
                return 0;
            }
        }
        if (promoCodeObj.ends) {
            const ends = new moment(promoCodeObj.ends);
            const now = new moment();
            if (ends.isBefore(now)) {
                return 0;
            }
        }

        switch (promoCodeObj.type) {
            case 'amount':
                return promoCodeObj.discount;
            case 'percent':
                return parseFloat((promoCodeObj.discount * chargeDetails.contractPrice).toFixed(2));
            case 'serviceFeePromo':
                return chargeDetails.serviceFee;
            default:
                const err = new Error(`promoCode.type [${promoCodeObj.type}] is not a valid type`);
                Error.captureStackTrace(err);
                throw err;
        }
    }

    /**
     * Saves the contractor’s id inside of invitedContractors for a project, sends the email
     * contractor-invite-to-project to the contractor, and returns true. If that contractor has already been
     * invited, it will return false and do nothing
     * @param contractorId
     * @param projectId
     * @returns {Promise<any>}
     */
    async function InvitePainter(contractorId, projectId) {
        const project = await projectRepo.FindOneById(projectId);
        if (!project) {
            const error = new Error(`project with _id [${projectId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const contractor = await contractorRepo.FindOneById(contractorId);
        if (!contractor) {
            const error = new Error(`Contractor with _id [${contractorId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        // prevent duplicate invites
        const invitedContractor = project.invitedContractors.find((ic) => ic.toString() === contractorId);
        if (invitedContractor) return project;

        project.invitedContractors.push(contractor._id);
        return await project.save();
    }

    /**
     * Creates a proposal in the project database that is linked to the contractor
     * @param userId
     * @param reqBody information from the controller to create the entry
     * @param accepted true if contractor accepts, false otherwise
     * @return {Promise<Object>} returns customer upon success
     */
    async function AcceptDeclineProposal(userId, reqBody, accepted) {
        const project = await projectRepo.FindOneById(reqBody.projectId);
        if (!project) {
            const error = new Error(`project with id [${reqBody.projectId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        if (project.proposals.find((p) => p.contractor.toString() === userId)) return project;

        const proposal = {
            contractor: userId,
            price: reqBody.price || undefined,
            message: reqBody.message || undefined,
            earliestStartDate: reqBody.earliestStartDate || undefined,
            declined: accepted ? undefined : true,
            reason: reqBody.reason || undefined,
            feedback: reqBody.feedback || undefined,
        };
        project.proposals.push(proposal);

        return await project.save();
    }

    async function GetChargeDetails(proposal, promoCodeString) {
        const chargeDetails = {};
        chargeDetails.contractPrice = proposal.price;

        if (chargeDetails.contractPrice < 1000) {
            chargeDetails.serviceFee = 0;
        } else if (chargeDetails.contractPrice < 2500) {
            chargeDetails.serviceFee = 50;
        } else if (chargeDetails.contractPrice < 4000) {
            chargeDetails.serviceFee = 75;
        } else {
            chargeDetails.serviceFee = 100;
        }

        chargeDetails.discount = await _this.GetDiscount(chargeDetails, promoCodeString);
        chargeDetails.subtotal = chargeDetails.contractPrice + chargeDetails.serviceFee - chargeDetails.discount;
        chargeDetails.taxRate = 0.07;
        // don't use subtotal to calculate tax. service fee is not taxable
        chargeDetails.tax = parseFloat((chargeDetails.contractPrice * chargeDetails.taxRate).toFixed(2));
        chargeDetails.total = chargeDetails.subtotal + chargeDetails.tax;
        chargeDetails.stripeServiceFees = parseFloat((chargeDetails.total * 0.029 + 0.6).toFixed(2));
        chargeDetails.downPaymentPercent = 0.1;
        // Don't charge tax on the deposit. It will be collected once a job is complete. Total - depositAmount
        chargeDetails.downPaymentAmount = parseFloat(
            (chargeDetails.total * chargeDetails.downPaymentPercent).toFixed(2)
        );

        chargeDetails.payoutPercent = 0.85;
        chargeDetails.payoutAmount = parseFloat((chargeDetails.contractPrice * chargeDetails.payoutPercent).toFixed(2));
        chargeDetails.stripeConnectServiceFees = parseFloat((chargeDetails.payoutAmount * 0.0025 + 0.5).toFixed(2));
        chargeDetails.downPaymentPayoutAmount = parseFloat(
            (chargeDetails.payoutAmount * chargeDetails.downPaymentPercent).toFixed(2)
        );

        return new chargeDetailsModel(chargeDetails);
    }

    async function GetAllProjects(userId) {
        const projects = await projectRepo.FindAllProjectsUserHasAccessTo(userId);
        for (let i = 0; i < projects.length; ++i) {
            projects[i] = projects[i].toFrontEnd();
        }
        return projects;
    }

    /**
     *
     * @param userId _id of the owner of the project
     * @param firstName first name of the invitee
     * @param lastName last name of the invitee
     * @param email email address of the invitee
     * @param message message from the owner to the invitee
     * @param projectId id of the project to be shared
     * @returns {Promise<void>}
     */
    async function ShareProject(userId, firstName, lastName, email, message, projectId) {
        let newUser = false;
        let invitee = await customerRepo.FindOneByEmail(email);
        if (!invitee) {
            invitee = await customerRepo.FindOneAndUpsert({
                firstName: firstName,
                lastName: lastName,
                roles: ['customer'],
                email: {
                    address: email,
                    sendPromotional: true,
                },
                mobile: {},
                acceptedTermsAndPrivacy: true,
            });
            newUser = true;
        }

        const owner = await userRepo.FindOneById(userId);
        if (!owner) {
            const error = new Error(`user with _id [${userId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const project = await projectRepo.FindOneById(projectId);
        if (!project || !project.owner.equals(owner._id)) {
            const error = new Error(`project with id [${projectId}] for user [${userId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        project.invitees.push(invitee._id);
        await project.save();

        let token;
        if (newUser) {
            const authKey = await authKeyRepo.CreateLoginAuthKey(invitee._id);
            const payload = { authKey: authKey.key };

            token = jwt.sign(payload, process.env.JWT_ACCOUNT_SECURITY_SECRET, {
                algorithm: 'HS256',
                expiresIn: '30 days',
            });
        }

        await emailService.CustomerShareProject(
            owner.toObject(),
            invitee.toObject(),
            project.toObject(),
            { message },
            { token }
        );
    }
})();
