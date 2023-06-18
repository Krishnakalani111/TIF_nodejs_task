class ErrorHandler extends Error {
  constructor(statusCode, message, code) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.code = code;
  }
}

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ErrorHandler) {
    res.status(err.statusCode).json({
      status: false,
      errors: [
        {
          param: err.param,
          message: err.message,
          code: err.code,
        },
      ],
    });
  } else {
    res.status(500).json({
      status: false,
      errors: [
        {
          message: 'Internal Server Error',
        },
      ],
    });
  }
};


