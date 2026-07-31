const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

async function findDeadCollections() {
  console.log("Analyzing Firestore for dead/empty collections...");
  try {
    const collections = await db.listCollections();
    const deadCollections = [];

    for (const collection of collections) {
      const snapshot = await collection.limit(1).get();
      if (snapshot.empty) {
        deadCollections.push(collection.id);
      }
    }

    if (deadCollections.length > 0) {
      console.log("Found potentially dead/empty collections:");
      deadCollections.forEach(c => console.log(`- ${c}`));
    } else {
      console.log("No dead/empty collections found at the root level.");
    }
  } catch (error) {
    console.error("Error analyzing collections:", error);
  }
}

findDeadCollections();
