import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    roll_no: {
        type: Number,
        required: true,
        // validate: {
        //     validator: (v) => {
        //         return v.toString().length === 5;
        //     },
        //     message: "Roll number must be exactly 5 digits long",
        // }
    },
    name: {
        type: String,
        required: true
    },
    mobile_no: {
        type: Number,
        validate: {
            validator: (v) => {
                return v.toString().length === 10;
            },
            message: "Mobile number must be exactly 10 digits long",
        },
        default: 1234567890,
        required: true,
    },
    hostel_name: {
        type: String,
    },
    Room_no: {
        type: Number,
        default: 1,
    },
    email: {
        type: String,
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    }
});

studentSchema.index({ roll_no: 1, organization: 1 }, { unique: true }); // Ensure unique roll_no per organization

const Student = mongoose.model("Student", studentSchema);

export default Student;
