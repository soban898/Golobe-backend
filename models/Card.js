import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cardNumber: { type: String, required: true },
  nameOnCard: { type: String, required: true },
  expDate: { type: String, required: true }, // e.g. MM/YY
  cvc: { type: String, required: true },
  country: { type: String, required: true }, // NOTE: Usually CVV shouldn't be stored (for real production use)
}, { timestamps: true });

const Card = mongoose.model("Card", cardSchema);
export default Card;
