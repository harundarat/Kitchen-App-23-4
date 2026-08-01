import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

function firebaseOptions(): FirebaseOptions {
  const required = {
    apiKey: env.FB_API_KEY,
    authDomain: env.FB_AUTH_DOMAIN,
    projectId: env.FB_PROJECT_ID,
    storageBucket: env.FB_STORAGE_BUCKET,
    messagingSenderId: env.FB_MESSAGING_SENDER_ID,
    appId: env.FB_APP_ID,
  };

  if (Object.values(required).some((value) => !value)) {
    throw new ApiError(503, "Image storage is not configured", "STORAGE_NOT_CONFIGURED");
  }

  return required as FirebaseOptions;
}

export async function uploadImage(
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const app = getApps()[0] ?? initializeApp(firebaseOptions());
  const imageRef = ref(getStorage(app), path);
  const snapshot = await uploadBytes(imageRef, buffer, { contentType });
  return getDownloadURL(snapshot.ref);
}
