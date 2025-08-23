if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { scope: '' })
      .then((registration) => {
          var newLocation = new URL(location.href)
          newLocation.search = ''
          const data = {
              type: 'CACHE_URLS',
              payload: [
                  newLocation.toString(),
                  // cache all files that were pulled in: https://stackoverflow.com/a/55543550/1569320
                  ...performance.getEntriesByType('resource').map((r) => r.name)
              ]
          };
          registration.installing.postMessage(data);
      })
      .catch((err) => console.log('SW registration FAIL:', err));
}