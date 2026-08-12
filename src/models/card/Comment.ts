import mongoose, { Schema } from "mongoose";

interface IComment {
  cardId: mongoose.Types.ObjectId;
  authorId: string;
  content: string;
  parentId: mongoose.Types.ObjectId | null;
}

const CommentSchema = new Schema<IComment>(
  {
    cardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },

    authorId: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Fetch comments for a card in chronological order
CommentSchema.index({
  cardId: 1,
  createdAt: 1,
});

// Fetch replies to a comment
CommentSchema.index({
  parentId: 1,
});

export default mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);