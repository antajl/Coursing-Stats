"""Apply S3 batch uploads and deletes from newline-delimited manifest files via boto3."""

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
import sys
import boto3
from botocore.config import Config


def read_lines(path: str | None) -> list[str]:
    if not path or not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return [line.rstrip("\r\n") for line in f if line.strip()]


def make_client():
    return boto3.client(
        "s3",
        endpoint_url="https://storage.yandexcloud.net",
        config=Config(
            max_pool_connections=80,
            retries={"max_attempts": 5, "mode": "standard"},
        ),
    )


def upload_one(client, bucket: str, root_dir: str, rel_key: str, cache_control: str) -> None:
    local_path = os.path.join(root_dir, *rel_key.split("/"))
    if not os.path.isfile(local_path):
        return
    with open(local_path, "rb") as f:
        body = f.read()
    content_type = "text/html; charset=utf-8" if rel_key.endswith(".html") else "application/octet-stream"
    client.put_object(
        Bucket=bucket,
        Key=rel_key,
        Body=body,
        ACL="public-read",
        ContentType=content_type,
        CacheControl=cache_control,
    )


def delete_batch(client, bucket: str, keys: list[str]) -> int:
    deleted = 0
    for i in range(0, len(keys), 1000):
        chunk = [{"Key": k} for k in keys[i : i + 1000]]
        resp = client.delete_objects(Bucket=bucket, Delete={"Objects": chunk, "Quiet": True})
        errors = resp.get("Errors") or []
        if errors:
            raise RuntimeError(f"S3 delete_objects failed for {len(errors)} keys: {errors[:3]}")
        deleted += len(chunk)
    return deleted


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bucket", required=True)
    parser.add_argument("--root-dir", default="frontend/dist")
    parser.add_argument("--upload-list", action="append", default=[])
    parser.add_argument("--delete-list", action="append", default=[])
    parser.add_argument("--cache-control", default="public, max-age=0, must-revalidate")
    parser.add_argument("--workers", type=int, default=64)
    args = parser.parse_args()

    uploads: list[str] = []
    for p in args.upload_list:
        uploads.extend(read_lines(p))

    deletes: list[str] = []
    for p in args.delete_list:
        deletes.extend(read_lines(p))

    if not uploads and not deletes:
        print("[s3_apply_delta] Nothing to upload or delete.")
        return 0

    client = make_client()

    if uploads:
        done = 0
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futs = [
                pool.submit(upload_one, client, args.bucket, args.root_dir, key, args.cache_control)
                for key in uploads
            ]
            for fut in as_completed(futs):
                fut.result()
                done += 1
                if done % 1000 == 0:
                    print(f"[s3_apply_delta] Uploaded {done}/{len(uploads)}...", flush=True)
        print(f"[s3_apply_delta] Uploaded {done} objects.", flush=True)

    if deletes:
        removed = delete_batch(client, args.bucket, deletes)
        print(f"[s3_apply_delta] Deleted {removed} objects.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
