import multer from "multer";

import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    files: 12,
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new ApiError(400, "Only image uploads are supported", "INVALID_FILE_TYPE"));
      return;
    }
    callback(null, true);
  },
});
