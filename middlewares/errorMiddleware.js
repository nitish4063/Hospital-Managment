class errorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "INTERNAL SERVER ERROR";
  err.statusCode = err.statusCode || 500;

  // WHEN DUPLICATE DATA IS SENT, LIKE EMAIL THAT ALREADY EXISTS
  if (err.code === 11000) {
    const message = `DUPLICATE ${Object.keys(err.keyValue)} ENTERED`;
    err = new errorHandler(message, 400);
  }
  // AUTHENTICATION
  if (err.name === "JsonWebTokenError") {
    const message = `JSON WEB TOKEN IS INVALID, TRY AGAIN!`;
    err = new errorHandler(message, 400);
  }
  // TOKEN EXPIRED
  if (err.name === "TokenExpiredError") {
    const message = `JSON WEB TOKEN IS EXPIRED, TRY AGAIN!`;
    err = new errorHandler(message, 400);
  }
  // WHEN TYPE OF DATA SENT IS NOT MATCHING OR VALID
  if (err.name === "CastError") {
    const message = `INVALID ${err.path}`;
    err = new errorHandler(message, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default errorHandler;
