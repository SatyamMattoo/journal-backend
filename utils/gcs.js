import {Storage} from "@google-cloud/storage";

// Initialize Google Cloud Storage client
export const storage = new Storage({
  keyFilename: '/var/run/render/secrets/mykey.json', // Replace with your credentials file path
});

