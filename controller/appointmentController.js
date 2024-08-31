import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../middlewares/errorMiddleware.js";

import { userModel } from "../models/userSchema.js";
import { appointmentModel } from "../models/appointmentSchema.js";

// TO SEND AN APPOINTMENT (BY A PATIENT)
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctor_firstName ||
    !doctor_lastName ||
    !address
  )
    return next(new errorHandler("Please Fill Full Form", 400));

  const isConflict = await userModel.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (isConflict.length === 0) {
    return next(new errorHandler("Doctor Not Found", 404));
  }
  if (isConflict.length > 1) {
    return next(
      new errorHandler(
        "Doctors Conflict! Please Contact Through Email or Phone",
        404
      )
    );
  }

  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;

  const appointment = await appointmentModel.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited,
    address,
    doctorId,
    patientId,
  });

  //   console.log("New Appointment Received!", appointment);

  res.status(200).json({
    success: true,
    message: "Appointment Sent Successfully!",
  });
});

// GET ALL THE APPOINTMENTS (ONLY SEEN BY ADMIN)
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await appointmentModel.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});

// UPDATE APPOINTMENT STATUS
export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    let appointment = await appointmentModel.findById(id);
    if (!appointment)
      return next(new errorHandler("Appointment Not Found", 400));

    appointment = await appointmentModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      message: "Appointment Status Updated",
      appointment,
    });
  }
);

// DELETE APPOINTMENT
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await appointmentModel.findById(id);
  if (!appointment) {
    return next(new errorHandler("Appointment Not Found", 404));
  }

  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});
