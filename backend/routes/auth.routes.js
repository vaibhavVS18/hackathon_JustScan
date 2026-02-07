import { Router } from "express";
import passport from "passport";

const router = Router();

router.get("/google", (req, res, next) => {
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
        state: req.query.state     //redirectPage passing in state
    })(req, res, next);  // Fixed: Now properly invokes the middleware
});


router.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false,
    }),
    async (req, res) => {
        console.log("OAuth Callback - User:", req.user?.email);
        console.log("OAuth Callback - State:", req.query.state);
        console.log("OAuth Callback - FRONTEND_URL:", process.env.FRONTEND_URL);

        const token = req.user.generateJWT();
        const redirectPage = req.query.state || "/";
        const redirectUrl = `${process.env.FRONTEND_URL}?token=${token}&redirectPage=${redirectPage}`;

        console.log("OAuth Callback - Redirecting to:", redirectUrl);
        res.redirect(redirectUrl);
    }
);

export default router;