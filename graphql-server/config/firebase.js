import admin from 'firebase-admin';

const serviceAccount = require("/Users/ifeanyi/Documents/Api-Keys/portfolio-pulse-82779-firebase-adminsdk-fbsvc-047210dcc4.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export { admin }; 