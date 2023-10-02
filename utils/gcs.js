import {Storage} from "@google-cloud/storage";

// Initialize Google Cloud Storage client
export const storage = new Storage({
  keyFilename: './backend/mykey.json', // Replace with your credentials file path
});

