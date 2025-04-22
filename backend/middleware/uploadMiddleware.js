// middleware/uploadMiddleware.js
import multer from "multer";
import { v4 as uuid } from "uuid";
import { uploadBufferToDrive } from "../utils/driveUpload.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadToDrive = (fieldName) => async (req, res, next) => {
  if (!req.file) return next();

  try {
    const fileName = `${uuid()}.${req.file.originalname.split(".").pop()}`;
    const url = await uploadBufferToDrive(req.file.buffer, fileName);
    req.body[fieldName] = url;   // inject into body
    next();
  } catch (err) {
    next(err);
  }
};
