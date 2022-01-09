const cacheName = 'veille-techno-1.0';

console.log("Hello du service worker");

self.addEventListener('install', evt => {
    console.log('install evt', evt);
    caches.open(cacheName).then(cache => {
        return cache.addAll([
            'index.html',
            'idb.js',
            'database.js',
            'main.js',
            'style.css',
            'vendors/bootstrap4.min.css',
            'add_techno.html',
            'add_techno.js',
            'contact.html',
            'contact.js',
        ])
    })
});

self.addEventListener('activate', evt => {
    console.log('activer evt', evt);
});

self.addEventListener('fetch', evt => {
    //if (!navigator.online) {
        //const headers = { headers: {'Content-Type': 'text/html;charset=utf-8'}};
        //evt.respondWith(new Response('<h1>Pas de connexion internet</h1><p>Essayez de rétablir votre connexion</p>'));
    //}
    //console.log('fetch event sur url', evt.request.url);

    //evt.respondWith(
        //caches.match(evt.request).then(res => {
            //if (res) {
                //return res;
            //}
            //return fetch(evt.request).then(newResponse => {
                //caches.open(cacheName).then(cache => cache.put(evt.request, newResponse));
                //return newResponse.clone();
        //})
        //})
    //)


    fetch(evt.request).then(res => {
        console.log (`${evt.request.url} fetchée depuis le réseau`);
        caches.open(cacheName).then(cache => cache.put(evt.request,res));
        return res.clone();
    }).catch(err => {
        console.log(`${evt.request.url} fetchée depuis le cache`);
        return catches.match(evt.request);
    })
});

self.registration.showNotification('Notif depuis le sw', {
    body: 'je suis une notification dite "persistante"',
    actions: [
        { action: 'accept', title: 'accepter' },
        { action: 'refuse', title: 'refuser' }
    ]
});

self.addEventListener('notificationclose', evt => {
    console.log('notification fermée', evt);
});

self.addEventListener('notificationclick', evt => {
    if(evt.action === 'accept') {
        console.log('vous avez accepté')
    } else if (evt.action === 'refuse') {
        console.log('vous avez refusé')
    } else {
        console.log ('vous avez cliqué sur la notification (pas sur 1 des boutons)');
    }
    evt.notification.close();
})

self.addEventListener('push', evt => {
    console.log('push event', evt);
    console.log('data envoyée par la push notif des devs tools',evt.data.text());
    const title = evt.data.text();
    evt.waitUntil(self.registration.showNotification(title, {
        body : 'ça marche', 
        image : 'images/icons/icon-152x152.png'
    }));
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-technos') {
        console.log('attempting sync', event.tag);
        console.log('syncing', event.tag);
        event.waitUntil(
            getAllTechnos().then(technos => {
                console.log('got technos from sync callback', technos);
                const unsynced = technos.filter(techno => techno.unsynced);
                // Sauvegarde de ce qui n'est pas encore dans la base
                console.log('pending sync', unsynced);

                return Promise.all(unsynced.map(techno => {
                    console.log('Attempting fetch', techno);
                    fetch('https://nodetestapi-thyrrtzgdz.now.sh/technos', { 
                        method: 'POST', 
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })
                    .then(() => {
                        console.log('Sent to server');
                        console.log('id passé à putTechno', techno.id);
                        return putTechno(Object.assign({}, techno, {unsynced: false}), techno.id);
                    })
                }))
            })
        )
    }
});