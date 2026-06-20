#!/usr/bin/env bash
# Run from the repo root (daily-bread-handoff-2026-06-07/)
set -euo pipefail

PROJECT="project-9d30c65c-aa31-4030-aa7"
REGION="us-central1"
TAG="us-central1-docker.pkg.dev/${PROJECT}/gcr-repo/daily-bread-api:$(date +%s)"

echo "==> 1. Build & push via Cloud Build (no local Docker needed)..."
gcloud builds submit --config backend/cloudbuild.yaml \
  --substitutions=_TAG="${TAG}" .

echo "==> 2. Install Pulumi (if missing)..."
if ! command -v pulumi &>/dev/null; then
  curl -fsSL https://get.pulumi.com | sh
  export PATH="$HOME/.pulumi/bin:$PATH"
fi

echo "==> 3. Update image & deploy..."
cd backend/pulumi
pulumi config set daily-bread-api:imageName "${TAG}"
PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-daily-bread-deploy-2026}" pulumi up --yes

echo ""
echo "Done! Service URL:"
pulumi stack output serviceUrl
