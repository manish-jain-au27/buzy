// task.service.ts
import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAMXPdMHxBNySjj8mZb1XJB0nLphs_2y0g",
  authDomain: "myteam-d13ad.firebaseapp.com",
  databaseURL: "https://myteam-d13ad.firebaseio.com",
  projectId: "myteam-d13ad",
  storageBucket: "gs://myteam-d13ad.appspot.com",
  messagingSenderId: "531214457857"
};

const firebaseApp = initializeApp(firebaseConfig);

@Injectable({
  providedIn: 'root',
})

export class FileUploadService {
  private storage = getStorage(firebaseApp);

  async uploadFile(file: File): Promise<string> {
    const storageRef = ref(this.storage, `${file.name}`);
    await uploadBytes(storageRef, file);

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  }
}
