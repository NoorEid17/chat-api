import multer from "multer";

const allowedMIMETypes = ["image/jpeg", "image/png"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 10 ** 6 /* 1 MB */,
  },
  fileFilter(req, file, callback) {
    if (!allowedMIMETypes.includes(file.mimetype)) {
      callback(null, false);
    } else {
      callback(null, true);
    }
  },
});

export default upload;
