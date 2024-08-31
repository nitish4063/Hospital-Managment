import { messageModel } from "../models/messageSchema.js";

import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../middlewares/errorMiddleware.js";

// SEND A MESSAGE TO OUR SERVER
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, message } = req.body;
  if (!firstName || !lastName || !email || !phone || !message)
    return next(new errorHandler("Please Fill Full Form", 400));

  const newMsg = await messageModel.create({
    firstName,
    lastName,
    email,
    phone,
    message,
  });
  console.log("NEW MESSAGE RECEIVED: ", newMsg);

  return res.status(200).json({
    success: true,
    message: "MESSAGE SENT SUCCESSFULLY",
  });
});

// GET ALL THE MESSAGES
export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await messageModel.find();
  res.status(200).json({
    success: true,
    messages,
  });
});
