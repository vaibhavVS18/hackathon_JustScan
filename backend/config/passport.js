import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";

import UserModel from "../models/user.model.js";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, cb)=> {
      try {
        const email = profile.emails?.[0]?.value || `google_${profile.id}@noemail.com`;

        let user = await UserModel.findOne({ googleId: profile.id });

        if (!user) {
          user = await UserModel.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
          } 
          else {
            user = await UserModel.create({
              googleId: profile.id,
              username: profile.displayName || "Unnamed User",
              email,
              profileImage: profile.photos?.[0]?.value,
            });
          }
        }

        return cb(null, user);
      } catch (err) {
        console.error("Google Auth Error:", err);
        return cb(err, null);
      }
    }
  )
);

export default passport;