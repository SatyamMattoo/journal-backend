//Class extends Error to handle errors
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

//Middleware for handling errors
export const error = (err, req, res, next) => {
  err.message = err.message || "Internal server errror";
  err.statusCode = err.statusCode || 500;

  //Mongodb duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }
  
  //Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again`;
    err = new ErrorHandler(message, 400);
  }

  //JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, Try again`;
    err = new ErrorHandler(message, 400);
  }

  //Wrong Mongodb Id error--Cast error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    console.log(err)
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;
