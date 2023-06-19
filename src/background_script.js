// comment to enable debug logging
console.log = () => {};

function getDomains() {
  return browser.storage.local.get('config')
    .then(({ config }) => {
      if (config === undefined || config.domains === undefined) {
        return [];
      } else {
        return config.domains;
      }
    });
}

function getContainerCookieStores() {
  return browser.contextualIdentities.query({})
    .then(containers => containers.map(el => el.cookieStoreId));
}

function syncCookie(removed, cookie) {
  console.log('syncing', cookie.domain);
  getContainerCookieStores()
    .then(stores => stores.forEach(storeId => {
      if(removed) {
        console.log(`removing cookie ${cookie.name} from store ${storeId}`);
        browser.cookies.remove({
          url: `https://${cookie.domain}${cookie.path}`,
          name: cookie.name,
        });
      } else {
        console.log(`copying cookie ${cookie.name} to store ${storeId}`);

        browser.cookies.set({
          url: `https://${cookie.strippedDomain}${cookie.path}`,
          domain: cookie.domain,
          expirationDate: cookie.expirationDate,
          firstPartyDomain: cookie.firstPartyDomain,
          httpOnly: cookie.httpOnly,
          name: cookie.name,
          partitionKey: cookie.partitionKey,
          path: cookie.path,
          sameSite: cookie.sameSite,
          secure: cookie.secure,
          value: cookie.value,
          storeId,
        });
      }
    }));
}

function cookieChangeHandler(event) {
  getDomains()
    .then(domains =>  {
      if (event.cookie.storeId !== 'firefox-default') {
        return;
      }
      const { domain } = event.cookie;
      const strippedDomain = domain.startsWith('.') ? domain.substring(1) : domain;
      if (domains.includes(strippedDomain)) {
        syncCookie(event.removed, {
          ...event.cookie,
          strippedDomain,
        });
      }
    })
    .catch(err => console.error('error while syncing cookies:', err));
}

// Debugging
//browser.cookies.onChanged.addListener((event) => {
//  console.log(event);
//  browser.cookies.getAll({
//  }).then(console.log).catch(console.error);
//});

browser.cookies.onChanged.addListener(cookieChangeHandler);
