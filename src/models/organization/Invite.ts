import mongoose, { Schema } from "mongoose";

interface IInvite {
  organizationId: mongoose.ObjectId;
  email: string;
  token: string;
  role: "admin" | "member" | "viewer";
  invitedBy: string;
  expiresAt: Date;
  usedAt: Date | null;
}

const InviteSchema = new Schema<IInvite>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
    },
    token: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      default: "member",
      required: true,
    },
    invitedBy: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Automatically remove expired invites
InviteSchema.index(
  { expiresAt: 1 }, 
  { expireAfterSeconds: 0 },
);

// unique constraint for active invites (user should not have more than one active invite)
InviteSchema.index(
  { organizationId: 1, email: 1, usedAt: 1 },
  { unique: true, partialFilterExpression: { usedAt: null } },
);

export default mongoose.models.Invite ||
  mongoose.model<IInvite>("Invite", InviteSchema);
