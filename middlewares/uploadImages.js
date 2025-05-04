import multer from "multer";

const storage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new Error("Not an image"), false);
};

export const upload = multer({
  storage,
  fileFilter: multerFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export default upload


// import multer from "multer";
// import sharp from "sharp";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// import fs from "fs";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../public/images"));
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
//   },
// });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Not an image! Please upload only images."), false);
//   }
// };

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
//   limits: {
//     fieldSize: "2000000", // 2MB
//   },
// });

// const productImageResize = async (req, res, next) => {
//   if (!req.files) return next();
//   await Promise.all(
//     req.files.map(async (file) => {
//       await sharp(file.path)
//         .resize(500, 500)
//         .toFormat("jpeg")
//         .jpeg({ quality: 90 })
//         .toFile(`public/images/products/${file.filename}`);
//       fs.unlinkSync(`public/images/products/${file.filename}`);
//     })
//   );
//   next();
// };

// // const blogImageResize = async (req, res, next) => {
// //   if (!req.files) return next();
// //   await Promise.all(
// //     req.files.map(async (file) => {
// //       await sharp(file.path)
// //         .resize(500, 500)
// //         .toFormat("jpeg")
// //         .jpeg({ quality: 90 })
// //         .toFile(`public/images/blogs/${file.filename}`);
// //       fs.unlinkSync(`public/images/blogs/${file.filename}`);
// //     })
// //   );
// //   next();
// // };

// const blogImageResize = async (req, res, next) => {
//   if (!req.files) return next();

//   await Promise.all(
//     req.files.map(async (file) => {
//       const resizedPath = `public/images/blogs/resized-${file.filename}`;
//       await sharp(file.path)
//         .resize(500, 500)
//         .toFormat("jpeg")
//         .jpeg({ quality: 90 })
//         .toFile(resizedPath);

//       // Save path to resized file so we can use it in the controller
//       file.resizedPath = resizedPath;
//     })
//   );

//   next();
// };

// export { upload, productImageResize, blogImageResize };
