import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Card from "../models/Card.js";

const router = express.Router();

// 🔹 Get all cards for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id });
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cards" });
  }
});

// 🔹 Add a new card
router.post("/", authMiddleware, async (req, res) => {
  const { cardNumber, nameOnCard, expDate, cvc, country } = req.body;
  try {
    const card = new Card({
      user: req.user._id,
      cardNumber,
      expDate,
      nameOnCard,
      cvc,
      country,
    });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: "Failed to add card" });
  }
});

// 🔹 Delete a card
// 🔹 Delete a card by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({ message: "Card deleted" });
  } catch (err) {
    console.error("Delete Card Error:", err);
    res.status(500).json({ message: "Failed to delete card" });
  }
});

export default router;
