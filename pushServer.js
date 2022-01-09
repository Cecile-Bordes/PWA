const webPush = require('web-push');
const pushServerKeys = require('./pushServerKeys');
const pushClientSubscription = require('./pushClientSubscription');

webPush.setVapidDetails('mailto:bordes_cecile@hotmail.com', pushServerKeys.publicKey, pushServerKeys.privateKey);

const subscription = {
    endpoint: pushClientSubscription.endpoint,
    keys: {
        auth: pushClientSubscription.keys.auth,
        p256dh: pushClientSubscription.keys.p256dh
    }
};

webPush.sendNotification(subscription, 'Notification envoyée depuis le serveur push node :)')
.then(res => console.log('ma push notif a bien été poussée', res))
.catch(err => console.error);

console.log(pushServerKeys,pushClientSubscription);