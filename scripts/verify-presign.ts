/**
 * Verifies the SigV4 presigner against the example in the AWS documentation
 * ("Authenticating Requests: Using Query Parameters"). Run: npm run verify:presign
 */
import { presignS3Url } from "../src/lib/server/storage";

const url = presignS3Url({
  endpoint: "https://s3.amazonaws.com",
  bucket: "examplebucket",
  key: "test.txt",
  region: "us-east-1",
  accessKeyId: "AKIAIOSFODNN7EXAMPLE",
  secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  expiresIn: 86400,
  pathStyle: false,
  now: new Date("2013-05-24T00:00:00Z"),
});

const expected = "aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404";
const actual = new URL(url).searchParams.get("X-Amz-Signature");
if (actual !== expected) {
  console.error(`✗ presign signature mismatch\n  expected ${expected}\n  actual   ${actual}`);
  process.exit(1);
}
console.log("✓ SigV4 presigned URL matches the AWS test vector");
