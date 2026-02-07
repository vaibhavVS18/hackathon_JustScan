import mongoose from "mongoose";
import bcrypt from "bcrypt";

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    accessCodeHash: {
        type: String,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    validationKeywords: {
        type: [String],
        default: [],
        validate: {
            validator: function (v) {
                // Allow empty array (during creation), but if provided, must be at least 6
                return v.length === 0 || v.length >= 6;
            },
            message: "You must provide at least 6 validation keywords for security."
        }
    },

    rollNoLength: {
        type: Number,
        default: 5
    },

    isSetup: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

organizationSchema.methods.setAccessCode = async function (code) {
    this.accessCodeHash = await bcrypt.hash(code, 10);
};

organizationSchema.methods.verifyAccessCode = async function (code) {
    return await bcrypt.compare(code, this.accessCodeHash);
};

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
