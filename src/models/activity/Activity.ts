import mongoose, { Schema } from "mongoose";

interface IActivity {
  organizationId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId | null;
  cardId: mongoose.Types.ObjectId | null;

  actorId: string;

  type:
    | "BOARD_CREATED"
    | "BOARD_RENAMED"
    | "BOARD_ARCHIVED"
    | "LIST_CREATED"
    | "LIST_RENAMED"
    | "LIST_DELETED"
    | "CARD_CREATED"
    | "CARD_UPDATED"
    | "CARD_MOVED"
    | "CARD_ASSIGNED"
    | "CARD_DELETED"
    | "COMMENT_ADDED"
    | "MEMBER_INVITED"
    | "MEMBER_JOINED";

  message: string;
}

const ActivitySchema = new Schema<IActivity>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      default: null,
    },

    cardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      default: null,
    },

    actorId: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "BOARD_CREATED",
        "BOARD_RENAMED",
        "BOARD_ARCHIVED",
        "LIST_CREATED",
        "LIST_RENAMED",
        "LIST_DELETED",
        "CARD_CREATED",
        "CARD_UPDATED",
        "CARD_MOVED",
        "CARD_ASSIGNED",
        "CARD_DELETED",
        "COMMENT_ADDED",
        "MEMBER_INVITED",
        "MEMBER_JOINED",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Organization activity feed
ActivitySchema.index({
  organizationId: 1,
  createdAt: -1,
});

// Board activity
ActivitySchema.index({
  boardId: 1,
  createdAt: -1,
});

// Card activity
ActivitySchema.index({
  cardId: 1,
  createdAt: -1,
});

export default mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);
