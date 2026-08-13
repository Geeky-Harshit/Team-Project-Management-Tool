import mongoose, { Schema } from "mongoose";

interface IOrganization {
  name: string;
  slug: string;
  createdBy?: string;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "organization",
  },
);

export default mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
