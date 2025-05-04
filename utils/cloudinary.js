// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      )
      .end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

// import { v2 as cloudinary } from "cloudinary";

// const uploadImageToCloudinary = async (filePath, name) => {
//   const cloudRes = await cloudinary.uploader.upload(filePath, {
//     folder: name,
//     resource_type: "auto",
//   });
//   return {
//     public_id: cloudRes.public_id,
//     url: cloudRes.secure_url,
//   };
// };

// const deleteImageFromCloudinary = async (public_id) => {
//   await cloudinary.uploader.destroy(public_id);
// };

// export { uploadImageToCloudinary, deleteImageFromCloudinary };
