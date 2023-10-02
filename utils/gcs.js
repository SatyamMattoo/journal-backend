import {Storage} from "@google-cloud/storage";

// Initialize Google Cloud Storage client
export const storage = new Storage({
  keyFilename: '../configs/mykey.json', // Replace with your credentials file path
});

