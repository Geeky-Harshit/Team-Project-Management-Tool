import mongoose, { Schema } from "mongoose";

interface IOrganizationMember {
  organizationId: mongoose.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "admin" | "member" | "viewer" | "owner";
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member", "viewer", "owner"],
      default: "member",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "member",
  },
);

OrganizationMemberSchema.index(
  { organizationId: 1, userId: 1 },
  { unique: true },
);

export default mongoose.models.OrganizationMember ||
  mongoose.model<IOrganizationMember>("OrganizationMember", OrganizationMemberSchema);
