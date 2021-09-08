import AWS from 'aws-sdk';

class S3 {
  private _client?: AWS.S3;

  get client() {
    if (!this._client) {
      throw new Error("Can't access client");
    }
    return this._client;
  }

  init(key: string, secret: string, endpoint: string) {
    const spacesEndpoint = new AWS.Endpoint(endpoint);
    this._client = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: key,
      secretAccessKey: secret,
    });
  }
}
export const s3Client = new S3();
