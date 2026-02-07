import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    try {
        // const token = req.cookies.token || req.headers.authorization.split(" ")[1];  // must use cookie-parser in app.js
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            res.status(401).send({ error: "Unauthorized error" });
        }

        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) {
            // res.cookie("token", "");
            return res.status(401).send({ error: "unauthorized user" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    }
    catch (err) {
        res.status(401).send({ error: "unauthorized error" });
    }
}

export const optionalAuthUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];
        if (!token) return next();

        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    }
    catch (err) {
        // If token is invalid (expired/malformed), just proceed as anonymous
        // functionality that requires auth will fail later or be limited
        next();
    }
}