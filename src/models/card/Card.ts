import mongoose, { Schema } from "mongoose";

interface ICard {
  listId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assigneeId: string | null;
  dueDate: Date | null;
  position: number;
  archived: boolean;
  createdBy: string;
}

const CardSchema = new Schema<ICard>(
  {
    listId: {
      type: Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    assigneeId: {
      type: String,
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    position: {
      type: Number,
      required: true,
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

// Fetch cards in a list in display order
CardSchema.index({
  listId: 1,
  archived: 1,
  position: 1,
});

// Used for "cards per member" and assignee queries
CardSchema.index({
  assigneeId: 1,
  dueDate: 1,
});

export default mongoose.models.Card ||
  mongoose.model<ICard>("Card", CardSchema);