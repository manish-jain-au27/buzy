export class FileUpload {
 
    key: string;
    name: string;
    url: string;
    file: File;
    ref_name: string;
    
    constructor(file: File) {
        this.file = file;
    }
}