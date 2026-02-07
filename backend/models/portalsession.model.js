import mongoose from "mongoose";

const portalSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    },

    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 mins
    }
});

const PortalSession = mongoose.model("PortalSession", portalSessionSchema);
export default PortalSession;