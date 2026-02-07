import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    destination: {
        type: String,
        default: "Una market",
    },
    leavingTime: {
        type: Date,
        default: Date.now
    },
    arrivalTime: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["Out", "In"],
        default: "Out"
    }
}, { timestamps: true });

const Entry = mongoose.model("Entry", entrySchema);
export default Entry;
