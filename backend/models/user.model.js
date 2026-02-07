import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type:String,
    },
    profileImage:{
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf1fiSQO7JfDw0uv1Ae_Ye-Bo9nhGNg27dwg&s"
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    // role: {
    //     type: String,
    //     enum: ["customer", "shopkeeper", "admin"],
    //     default: "customer"
    // },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    createdOrgs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }],
    joinedOrgs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }]
} , {timestamps: true});

userSchema.statics.hashPassword =async(password)=>{
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function(){
    const userObject = this.toObject();   // Convert Mongoose document to plain object
    delete userObject.password;

    return jwt.sign(
        {user: userObject},
        process.env.JWT_SECRET,
        {expiresIn:"7d"}
    )
};


const User =  mongoose.model("User", userSchema);
export default User;


