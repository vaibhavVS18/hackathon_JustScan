import PortalSession from "../models/portalsession.model.js";

export const requirePortalSession = async (req, res, next) => {
    const sessionId = req.headers['portal-session-id'];

    if (!sessionId) {
        return res.status(403).json({ message: "Portal session required" });
    }

    try {
        const session = await PortalSession.findById(sessionId).populate('organizationId');

        if (!session) {
            return res.status(403).json({ message: "Invalid portal session" });
        }

        if (session.expiresAt < new Date()) {
            return res.status(403).json({ message: "Portal session expired" });
        }

        req.organization = session.organizationId;
        req.portalSession = session;
        next();
    } catch (error) {
        console.error("Portal Middleware Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
