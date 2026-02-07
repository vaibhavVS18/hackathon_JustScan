import Organization from "../models/organization.model.js";
import OrganizationMember from "../models/orgmember.model.js";
import User from "../models/user.model.js";

export const addMember = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { email } = req.body;
        const adminId = req.user._id;

        // 1. Verify Organization and Permissions
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Check if requester is owner
        const isOwner = organization.createdBy.toString() === adminId.toString();

        if (!isOwner) {
            return res.status(403).json({ message: "Only the organization owner can add members" });
        }

        // 2. Find User by Email
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: "There is no user at JustScan with this email" });
        }

        // 3. Define Role
        let role = 'staff';
        // Check if user is the organization creator
        if (userToAdd._id.toString() === organization.createdBy.toString()) {
            role = 'owner';
        }

        // 4. Check if already a member and handle updates for owner
        const existingMember = await OrganizationMember.findOne({
            organizationId,
            userId: userToAdd._id
        });

        if (existingMember) {
            // If it's the owner and they have the wrong role, update it
            if (role === 'owner' && existingMember.role !== 'owner') {
                existingMember.role = 'owner';
                await existingMember.save();
                return res.status(200).json({
                    message: "Owner role restored successfully", user: {
                        _id: userToAdd._id,
                        name: userToAdd.username,
                        email: userToAdd.email,
                        profileImage: userToAdd.profileImage
                    }
                });
            }
            return res.status(400).json({ message: "Already exist as member" });
        }

        // 5. Create Membership
        await OrganizationMember.create({
            organizationId,
            userId: userToAdd._id,
            role: role
        });

        // 6. Update User's joinedOrgs
        await User.findByIdAndUpdate(userToAdd._id, {
            $addToSet: { joinedOrgs: organizationId }
        });

        res.status(200).json({
            message: "Member added successfully", user: {
                _id: userToAdd._id,
                name: userToAdd.username, // Assuming username is the name
                email: userToAdd.email,
                profileImage: userToAdd.profileImage
            }
        });

    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ message: "Server error adding member" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { organizationId, memberId } = req.params;
        const adminId = req.user._id;

        // 1. Verify Organization and Permissions
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Strict Owner Check
        if (organization.createdBy.toString() !== adminId.toString()) {
            return res.status(403).json({ message: "Only the organization owner can remove members" });
        }

        // 2. Cannot remove self (Owner) via this route (safety check)
        if (memberId === adminId.toString()) {
            return res.status(400).json({ message: "Cannot remove yourself. Delete organization instead." });
        }

        // 3. Find and Remove Membership
        const memberUser = await User.findById(memberId);
        if (!memberUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const deletedMember = await OrganizationMember.findOneAndDelete({
            organizationId,
            userId: memberId
        });

        if (!deletedMember) {
            return res.status(404).json({ message: "Member not found in this organization" });
        }

        // 4. Update User's joinedOrgs
        await User.findByIdAndUpdate(memberId, {
            $pull: { joinedOrgs: organizationId }
        });

        res.status(200).json({ message: "Member removed successfully" });

    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ message: "Server error removing member" });
    }
};

export const getOrganizationMembers = async (req, res) => {
    try {
        const { organizationId } = req.params;

        // Verify requestor has access (optional but good practice)
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const members = await OrganizationMember.find({ organizationId })
            .populate('userId', 'username email profileImage');

        const creator = await User.findById(organization.createdBy).select('username email profileImage');

        const formattedMembers = members.map(m => ({
            _id: m.userId._id,
            name: m.userId.username,
            email: m.userId.email,
            profileImage: m.userId.profileImage,
            role: m.role,
            joinedAt: m.createdAt
        }));

        // Check if creator is already in the list
        const creatorInList = formattedMembers.find(m => m._id.toString() === creator._id.toString());
        if (!creatorInList && creator) {
            formattedMembers.unshift({
                _id: creator._id,
                name: creator.username,
                email: creator.email,
                profileImage: creator.profileImage,
                role: 'owner',
                joinedAt: organization.createdAt
            });
        }

        res.status(200).json(formattedMembers);

    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).json({ message: "Server error fetching members" });
    }
};

export const checkMembership = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const userId = req.user._id;

        const isMember = await OrganizationMember.findOne({
            organizationId,
            userId
        });

        // Also check if creator (owner)
        const isOwner = await Organization.findOne({
            _id: organizationId,
            createdBy: userId
        });

        if (isMember || isOwner) {
            return res.status(200).json({ isMember: true });
        } else {
            return res.status(200).json({ isMember: false });
        }

    } catch (error) {
        console.error("Membership check error:", error);
        res.status(500).json({ message: "Server error checking membership" });
    }
};
