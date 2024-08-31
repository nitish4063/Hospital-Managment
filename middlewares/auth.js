import jwt from "jsonwebtoken";

import { catchAsyncErrors } from "./catchAsyncErrors.js";
import errorHandler from "./errorMiddleware.js";
import { userModel } from "../models/userSchema.js";

// CHECK IF THE ADMIN IS AUTHENTICATED OR NOT
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) return next(new errorHandler("Admin Not Authenticated!", 400));

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await userModel.findById(decoded.id);
  if (req.user.role !== "Admin") {
    return next(
      new errorHandler(
        `${req.user.role} is not authorized for this resource`,
        403
      )
    );
  }

  next();
});

// CHECK IF THE PATIENT IS AUTHENTICATED OR NOT
export const isPatientAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token = req.cookies.patientToken;
    if (!token)
      return next(new errorHandler("Patient Not Authenticated!", 400));

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await userModel.findById(decoded.id);

    if (req.user.role !== "Patient") {
      return next(
        new errorHandler(
          `${req.user.role} is not authorized for this resource`,
          403
        )
      );
    }

    next();
  }
);
