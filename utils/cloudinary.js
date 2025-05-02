import { v2 as cloudinary } from "cloudinary";

const uploadImageToCloudinary = async (filePath, name) => {
  const cloudRes = await cloudinary.uploader.upload(filePath, {
    folder: name,
    resource_type: "auto",
  });
  return {
    public_id: cloudRes.public_id,
    url: cloudRes.secure_url,
  };
};

const deleteImageFromCloudinary = async (public_id) => {
  await cloudinary.uploader.destroy(public_id);
};

export { uploadImageToCloudinary, deleteImageFromCloudinary };
