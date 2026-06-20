import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();
const project = gcp.config.project;
const region = gcp.config.region || 'us-central1';
const imageName = config.require('imageName');
const dbUrl = config.requireSecret('supabaseUrl');
const dbKey = config.requireSecret('supabaseServiceKey');
const dbAnonKey = config.requireSecret('supabaseAnonKey');
const jwtSecret = config.requireSecret('appJwtSecret');

const eventsBucket = new gcp.storage.Bucket('daily-bread-events', {
  location: 'US',
  uniformBucketLevelAccess: true,
  versioning: { enabled: false },
  lifecycleRules: [
    {
      action: { type: 'Delete' },
      condition: { age: 365 },
    },
  ],
});

const service = new gcp.cloudrun.Service('daily-bread-api', {
  location: region,
  template: {
    spec: {
      containers: [
        {
          image: imageName,
          ports: [{ containerPort: 8080 }],
          envs: [
            { name: 'SUPABASE_URL', value: dbUrl },
            { name: 'SUPABASE_SERVICE_KEY', value: dbKey },
            { name: 'SUPABASE_ANON_KEY', value: dbAnonKey },
            { name: 'APP_JWT_SECRET', value: jwtSecret },
            { name: 'GCS_EVENTS_BUCKET', value: eventsBucket.name },
          ],
          resources: {
            limits: { memory: '256Mi', cpu: '1' },
          },
        },
      ],
    },
    metadata: {
      annotations: {
        'autoscaling.knative.dev/maxScale': '5',
        'autoscaling.knative.dev/minScale': '0',
      },
    },
  },
});

const iam = new gcp.cloudrun.IamMember('daily-bread-invoker', {
  service: service.name,
  location: region,
  role: 'roles/run.invoker',
  member: 'allUsers',
});

export const serviceUrl = service.statuses.apply((s) => s?.[0]?.url ?? '');
export const bucketName = eventsBucket.name;
