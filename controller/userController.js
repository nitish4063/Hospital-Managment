import cloudinary from "cloudinary";
import { userModel } from "../models/userSchema.js";

import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../middlewares/errorMiddleware.js";

import { generateToken } from "../utils/jwtToken.js";

// FOR REGISTER A NEW PATIENT
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !role
  )
    return next(new errorHandler("Please Fill Full Form", 400));

  const user = await userModel.findOne({ email });
  if (user) return next(new errorHandler("User Already Exists!!", 400));

  const newUser = await userModel.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role,
  });

  console.log("NEW USER REGISTERED:: ", newUser);

  generateToken(newUser, "User Registered!", 200, res);
});

// LOGIN
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  if (!email || !password || !confirmPassword || !role) {
    return next(new errorHandler("Please Provide All Details", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new errorHandler("Password and confirmPassword Do Not Match", 400)
    );
  }

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return next(new errorHandler("Invalid Password or Email", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new errorHandler("Invalid Password or Email!", 400));
  }

  if (role !== user.role) {
    return next(new errorHandler("User With this Role Not Found", 400));
  }

  generateToken(user, `${user.role} LoggedIn Successfully!`, 200, res);
});

// ADDING A NEW ADMIN
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  )
    return next(new errorHandler("Please Fill Full Form", 400));

  const isRegistered = await userModel.findOne({ email });
  if (isRegistered)
    return next(
      new errorHandler(
        `A ${isRegistered.role} With This Email Already Exists!`,
        400
      )
    );

  const admin = await userModel.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Admin",
  });

  console.log("New Admin Registered!!!", admin);

  res.status(200).json({
    success: true,
    message: "New Admin Registered!",
  });
});

// GET ALL DOCTORS
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await userModel.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

// GET DETAILS OF WHICH PATIENT OR ADMIN IS CURRENTLY LOGGED IN
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// ADMIN LOGOUT
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Admin LogOut Successfully!",
    });
});

// PATIENT LOGOUT
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Patient LogOut Successfully!",
    });
});

// ADD NEW DOCTOR
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new errorHandler("Doctor Avatar Required!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new errorHandler("File Format Not Supported!", 400));
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment
  ) {
    return next(new errorHandler("Please Provide All Details", 400));
  }

  const isRegistered = await userModel.findOne({ email });
  if (isRegistered) {
    return next(
      new errorHandler(
        `A ${isRegistered.role} With This Email Already Exists!`,
        400
      )
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );

  console.log("RESPONSE FROM CLOUDINARY", cloudinaryResponse);

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error: ",
      cloudinaryResponse.error || "Unknown Cloudinary Error"
    );
  }

  const doctor = await userModel.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
    role: "Doctor",
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  console.log("NEW DOCTOR REGISTERED", doctor);

  res.status(200).json({
    success: true,
    message: "NEW DOCTOR REGISTERED!",
    doctor,
  });
});
