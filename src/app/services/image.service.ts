import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private http: HttpClient) {}

  uploadImage(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post('https://beta.buzy.team/api/upload-image', formData);
  }
}
