import mongoose, { Schema } from "mongoose";

interface ICardLabel {
  cardId: mongoose.ObjectId;
  labelId: mongoose.ObjectId;
}

const CardLabelSchema = new Schema<ICardLabel>(
  {
    cardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
    labelId: {
      type: Schema.Types.ObjectId,
      ref: "Label",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate label assignments
CardLabelSchema.index(
  {
    cardId: 1,
    labelId: 1,
  },
  { unique: true },
);

export default mongoose.models.CardLabel ||
  mongoose.model<ICardLabel>("CardLabel", CardLabelSchema);
