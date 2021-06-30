export class ImageFile {
  public createdAt: Date;
  public url: string;
  public originalName: string;
  public lastModified: number;
  public size: number;
  public uploading: boolean;
  public uploaded: boolean;
  public progress: number;

  constructor(obj?: any) {
    if (!obj) obj = {};

    this.createdAt = obj.createdAt;
    this.url = obj.url;
    this.originalName = obj.originalName;
    this.size = obj.size;
    this.uploading = obj.uploading;
    this.uploaded = obj.uploaded;
    this.progress = obj.progress;
  }
}
