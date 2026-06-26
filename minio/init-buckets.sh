set -eu

until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
  sleep 2
done

mc mb --ignore-existing local/public-customer-data
mc cp --recursive /sample-data/ local/public-customer-data/

if [ "${APP_MODE:-vulnerable}" = "vulnerable" ]; then
  # Vulnerable default: public read policy.
  mc anonymous set download local/public-customer-data
  echo "MinIO demo bucket is public."
else
  # Fixed mode: disable anonymous access.
  mc anonymous set none local/public-customer-data
  echo "MinIO demo bucket is private."
fi

echo "MinIO demo bucket is ready."
