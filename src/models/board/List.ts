import mongoose, { Schema } from "mongoose";

interface IList {
  boardId: mongoose.Types.ObjectId;
  name: string;
  position: number;
  archived: boolean;
}

const ListSchema = new Schema<IList>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    position: {
      type: Number,
      required: true,
    },

    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Fetch lists of a board in their display order
ListSchema.index({
  boardId: 1,
  archived: 1,
  position: 1,
});

export default mongoose.models.List ||
  mongoose.model<IList>("List", ListSchema);