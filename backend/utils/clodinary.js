import { v2 as cloudinary } from 'cloudinary';

 // Configuration
 cloudinary.config({ 
    cloud_name: 'do2d2pclb', 
    api_key: '765617265967851', 
    api_secret: 'AslyGDScICGteRfsS0Wiek85qpc' // Click 'View API Keys' above to copy your API secret
});


export const uploadImage = async (imagePath) => {
   const uploadResult = await cloudinary.uploader
   .upload(imagePath)
   .catch((error) => {
       console.log(error);
   });
   return uploadResult.secure_url;
//    console.log(uploadResult.secure_url)
};