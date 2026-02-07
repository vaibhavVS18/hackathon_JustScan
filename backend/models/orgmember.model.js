import mongoose from "mongoose";

const organizationMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  role: {
    type: String,
    enum: ["owner", "admin", "guard", "staff"],
    default: "admin"
  },

  permissions: {
    type: [String], // optional fine-grained permissions
    default: []
  }
}, { timestamps: true });

const OrganizationMember = mongoose.model("OrganizationMember", organizationMemberSchema);
export default OrganizationMember; 
