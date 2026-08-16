/**
 * Set custom claims for admin user.
 * Run after: gcloud auth application-default login
 * Then: node set-admin-claim.js
 */

const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'santmat-satsang-prachar',
  // Uses Application Default Credentials (gcloud auth application-default login)
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
    
    console.log('✅ Custom claims set successfully!');
    console.log('Claims: { role: "developer_super_admin", admin: true, accountStatus: "active" }');
    console.log('\nNow restart the frontend and log in with real Firebase auth.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log('\nUser not found in Firebase Auth.');
      console.log('They need to sign up first via the app (click "Sign Up" or use the login form).');
    } else if (error.code === 'app/no-credential') {
      console.log('\nNo credentials found. Run:');
      console.log('  gcloud auth application-default login');
      console.log('Then re-run this script.');
    }
  }
}

setAdminClaim().then(() => process.exit(0)).catch(() => process.exit(1));
