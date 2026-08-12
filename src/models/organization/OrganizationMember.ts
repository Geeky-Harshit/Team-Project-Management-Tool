import mongoose, { Schema } from "mongoose";

interface IOrganizationMember {
  organizationId: mongoose.ObjectId;
  userId: string;
  role: "admin" | "member" | "viewer";
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      default: "member",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "member",
  },
);

// Find all organizations belonging to a user
OrganizationMemberSchema.index(
  { organizationId: 1, userId: 1 },
  { unique: true },
);

export default mongoose.models.OrganizationMember ||
  mongoose.model<IOrganizationMember>("OrganizationMember", OrganizationMemberSchema);
