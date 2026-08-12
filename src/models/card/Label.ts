import mongoose, { Schema } from "mongoose";

interface ILabel {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  color: string;
}

const LabelSchema = new Schema<ILabel>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate label names within the same organization
LabelSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.models.Label ||
  mongoose.model<ILabel>("Label", LabelSchema);
