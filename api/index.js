const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGO_URL);
  isConnected = db.connections[0].readyState;
  console.log("MongoDB connected");
}

const UserDataSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  userName: { type: String },
  userSurName: { type: String },
  userHeight: { type: Number },
  userWeight: { type: Number },
  userBMI: { type: String },
  userEmergencyNumber: { type: String },
  userNumber: { type: Number },
  userGender: { type: String },
  userPassword: {type: String},
});

const UserData =
  mongoose.models.UserData || mongoose.model("UserData", UserDataSchema);

app.get("/", (req, res) => {
  res.status(200).json({ message: "UserData API is running 🚀" });
});

// ✅ GET USER BY EMAIL
app.get("/user/:email", async (req, res) => {
  try {
    await connectDB();

    const record = await UserData.findOne({
      userEmail: req.params.email,
    });

    if (!record) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching record",
      error: error.message,
    });
  }
});

// ✅ Add user 
app.post("/user", async (req, res) => {
  try {
    await connectDB();
    const newData = new UserData(req.body);
    const saveData = await newData.save();
    res.status(201).json(saveData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ UPDATE USER BY EMAIL
app.patch("/user/:email", async (req, res) => {
  try {
    await connectDB();

    const updated = await UserData.findOneAndUpdate(
      { userEmail: req.params.email },
      req.body,
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({
      message: "Update failed",
      error: error.message,
    });
  }
});

// ✅ DELETE USER BY EMAIL
app.delete("/user/:email", async (req, res) => {
  try {
    await connectDB();

    const deleted = await UserData.findOneAndDelete({
      userEmail: req.params.email,
    });

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;
