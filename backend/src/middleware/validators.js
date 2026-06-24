import { body, param, validationResult } from "express-validator";


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};


export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function normalizeDate(input) {
  if (!input) return new Date().toISOString().split('T')[0];
  // ISO format: YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    const year = parseInt(yyyy, 10);
    const month = parseInt(mm, 10);
    const day = parseInt(dd, 10);
    
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month in ISO date: ${input}`);
    }
    if (day < 1 || day > daysInMonth(year, month)) {
      throw new Error(`Invalid day in ISO date: ${input}`);
    }
    return input;
  }
  
  // DMY format: DD-MM-YYYY
  const dmyMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(input);
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch;
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10);
    const year = parseInt(yyyy, 10);
    
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month in DMY date: ${input}. Expected DD-MM-YYYY or YYYY-MM-DD`);
    }
    if (day < 1 || day > daysInMonth(year, month)) {
      throw new Error(`Invalid day in DMY date: ${input}. Expected DD-MM-YYYY or YYYY-MM-DD`);
    }
    
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }
  
  // Detect potential MM-DD-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
    throw new Error(`Unsupported date format (looks like MM-DD-YYYY): ${input}. Use DD-MM-YYYY or YYYY-MM-DD`);
  }
  
  throw new Error(`Unsupported date format: ${input}. Expected DD-MM-YYYY or YYYY-MM-DD`);
}

export const validateRegisterBatch = [
  body("batchName")
    .trim()
    .notEmpty().withMessage("Batch name is required")
    .isLength({ max: 100 }).withMessage("Batch name must be under 100 characters")
    .escape(),
  body("location")
    .trim()
    .notEmpty().withMessage("Location is required")
    .isLength({ max: 200 }).withMessage("Location must be under 200 characters")
    .escape(),
  body("photoUrl")
    .trim()
    .notEmpty().withMessage("Photo URL is required")
    .isLength({ max: 2000 }).withMessage("Photo URL must be under 2000 characters"),
  body("productType")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Product type must be under 100 characters")
    .escape(),
  body("quantity")
    .optional()
    .custom((value) => {
      if (value !== undefined && value !== null && value !== "") {
        const parsed = parseFloat(value);
        if (isNaN(parsed) || parsed < 0) {
          throw new Error("Quantity must be a positive number");
        }
      }
      return true;
    }),
  body("harvestDate")
    .optional()
    .trim()
    .custom((value) => {
      if (value) {
        try {
          normalizeDate(value);
        } catch (err) {
          throw new Error(err.message);
        }
      }
      return true;
    }),
  validate,
];

export const validateTokenizeBatch = [
  body("batchId")
    .optional()
    .trim()
    .isUUID().withMessage("Batch ID must be a valid UUID"),
  body("hcsTransactionIds")
    .optional()
    .isArray().withMessage("hcsTransactionIds must be an array"),
  validate,
];


export const validateVerifyBatch = [
  param("tokenId")
    .trim()
    .notEmpty().withMessage("Token ID is required")
    .matches(/^0\.0\.\d+$/).withMessage("Token ID must be a valid Hedera token ID (e.g. 0.0.12345)"),
  param("serialNumber")
    .notEmpty().withMessage("Serial number is required")
    .isInt({ min: 1 }).withMessage("Serial number must be a positive integer"),
  validate,
];

export const validateAIRequest = [
  body("prompt")
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage("Prompt must be under 2000 characters")
    .escape(),
  body("batchId")
    .optional()
    .trim()
    .isUUID().withMessage("Batch ID must be a valid UUID"),
  validate,
];
