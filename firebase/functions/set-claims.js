const admin = require('firebase-admin');
const { execSync } = require('child_process');

// Get access token from firebase CLI
let accessToken;
try {
  accessToken = execSync('firebase auth:export /dev/stdout --format=json --project santmat-satsang-prachar 2>/dev/null | head -c 1', { encoding: 'utf8' });
} catch(e) {
  // fallback: try to get token from gcloud
  try {
    accessToken = execSync('gcloud auth application-default print-access-token 2>/dev/null', { encoding: 'utf8' }).trim();
  } catch(e2) {
    console.log('Could not get access token. Run: gcloud auth application-default login');
    process.exit(1);
  }
}

if (!accessToken) {
  console.log('No access token. Please run: gcloud auth application-default login');
  process.exit(1);
}

admin.initializeApp({
  projectId: 'santmat-satsang-prachar',
  credential: admin.credential.refreshToken(accessToken),
});

async function setAdminClaim() {
  try {
    const userRecord = await admin.auth().getUserByEmail('jk7078962@gmail.com');
    console.log('Found user:', userRecord.uid, userRecord.email);
    
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'developer_super_admin',
      admin: true,
      accountStatus: 'active',
      organizationId: 'org-main',
    });
    
    console.log('Custom claims set successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log('User not found in Firebase Auth. They need to sign up first via the app.');
    }
  }
}

setAdminClaim().then(() => process.exit(0)).catch(() => process.exit(1));
