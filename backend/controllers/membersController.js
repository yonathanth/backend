const asyncHandler = require("express-async-handler");
const prisma = require("../../prisma/client");

// Helper function to validate date format (YYYY-MM-DD)
const isValidDate = (dateStr) => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && dateStr === date.toISOString().split("T")[0];
};

// Get all users
const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json({ success: true, data: { users } });
});

// Add a new user
const addUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    gender,
    phoneNumber,
    email,
    address,
    dob,
    emergencyContact,
    startDate,
    countDown,
    height,
    weight,
    bmi,
    healthConditions,
    level,
    goal,
    status,
    freezeDate,
    serviceId,
  } = req.body;

  // Validation for required fields
  if (
    !fullName ||
    !gender ||
    !phoneNumber ||
    !address ||
    !dob ||
    !emergencyContact
  ) {
    return res.status(400).json({
      success: false,
      message:
        "All required fields (fullName, gender, phoneNumber, address, dob, emergencyContact) must be provided.",
    });
  }

  // Validation for phone number format
  if (!/^\d{10}$/.test(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be exactly 10 digits.",
    });
  }

  // Check if the phone number is already taken
  const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number is already taken." });
  }

  // Validation for date of birth format
  if (!isValidDate(dob)) {
    return res.status(400).json({
      success: false,
      message: "Date of birth must be in YYYY-MM-DD format.",
    });
  }

  const newUser = await prisma.user.create({
    data: {
      fullName,
      gender,
      phoneNumber,
      email: email || null,
      address,
      dob: new Date(dob),
      emergencyContact,
      startDate: startDate ? new Date(startDate) : undefined,
      countDown,
      height,
      weight,
      bmi,
      healthConditions: healthConditions
        ? JSON.parse(healthConditions)
        : undefined,
      level,
      goal,
      status,
      freezeDate: freezeDate ? new Date(freezeDate) : undefined,
      serviceId,
    },
  });

  res.status(201).json({
    success: true,
    message: "User added successfully.",
    data: newUser,
  });
});

// Edit a user by ID
const editUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    gender,
    phoneNumber,
    email,
    address,
    dob,
    emergencyContact,
    startDate,
    countDown,
    height,
    weight,
    bmi,
    healthConditions,
    level,
    goal,
    status,
    freezeDate,
    serviceId,
  } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  // Validate date format if dob is provided
  if (dob && !isValidDate(dob)) {
    return res.status(400).json({
      success: false,
      message: "Date of birth must be in YYYY-MM-DD format.",
    });
  }

  // Check if the phone number is already taken by another user (excluding the current user)
  if (phoneNumber && phoneNumber !== user.phoneNumber) {
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is already taken." });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      fullName: fullName || user.fullName,
      gender: gender || user.gender,
      phoneNumber: phoneNumber || user.phoneNumber,
      email: email || user.email,
      address: address || user.address,
      dob: dob ? new Date(dob) : user.dob,
      emergencyContact: emergencyContact || user.emergencyContact,
      startDate: startDate ? new Date(startDate) : user.startDate,
      countDown: countDown ?? user.countDown,
      height: height ?? user.height,
      weight: weight ?? user.weight,
      bmi: bmi ?? user.bmi,
      healthConditions: healthConditions
        ? JSON.parse(healthConditions)
        : user.healthConditions,
      level: level || user.level,
      goal: goal || user.goal,
      status: status || user.status,
      freezeDate: freezeDate ? new Date(freezeDate) : user.freezeDate,
      serviceId: serviceId || user.serviceId,
    },
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    data: updatedUser,
  });
});

// Delete a user by ID
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  await prisma.user.delete({ where: { id } });
  res
    .status(200)
    .json({ success: true, message: "User deleted successfully." });
});

module.exports = { getUsers, addUser, editUser, deleteUser };
