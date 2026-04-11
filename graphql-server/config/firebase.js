import admin from 'firebase-admin';

import serviceAccount from "/Users/ifeanyi/Documents/Api-Keys/portfolio-pulse-82779-firebase-adminsdk-fbsvc-047210dcc4.json" with { type: "json"};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export { admin }; 