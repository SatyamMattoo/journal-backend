import multer from 'multer';

export const upload = multer({
    storage: multer.memoryStorage(), // Store the file in memory for now
    limits:{
        fileSize:5*1024*1024
    }
});
  
