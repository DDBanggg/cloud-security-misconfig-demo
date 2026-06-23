set -eu

until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
  sleep 2
done

mc mb --ignore-existing local/public-customer-data
mc cp --recursive /sample-data/ local/public-customer-data/

# Vulnerable default: public read policy.
mc anonymous set download local/public-customer-data

echo "MinIO demo bucket is ready."
