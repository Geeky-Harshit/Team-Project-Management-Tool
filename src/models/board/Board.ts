import mongoose, { Schema } from "mongoose";

interface IBoard {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  archived: boolean;
  createdBy: string;
}

const BoardSchema = new Schema<IBoard>(
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

    archived: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Used when fetching active boards for an organization
BoardSchema.index({
  organizationId: 1,
  archived: 1,
});

export default mongoose.models.Board ||
  mongoose.model<IBoard>("Board", BoardSchema);
