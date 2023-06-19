function isValidUrl(url) {
  try {
    const parsedUrl = new URL(`https://${url}`);
    if (parsedUrl.hostname !== url) {
      throw new Error(`URL is not correctly parsed: ${parsedUrl.hostname} vs ${url}`);
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
}

document.getElementById('button-url-save').addEventListener('click', (event) => {
  const urls = document.getElementById('input-url-list').value.split('\n');
  const fbEl = document.getElementById('url-fb');
  if (urls.every(el => {
    if (!isValidUrl(el)) {
      fbEl.textContent = `invalid url: ${el}`;
      fbEl.classList.add('alert-danger');
      fbEl.classList.remove('invisible');
      return false;
    }
    return true;
  })) {
    fbEl.textContent = 'Settings saved successfully!';
    fbEl.classList.add('alert-success');
    fbEl.classList.remove('invisible');
    browser.storage.local.set({ config: { domains: urls }, });
  }
});

// init url list in textfield
browser.storage.local.get('config').then(({ config }) => {
  const textfield = document.getElementById('input-url-list')
  if (config === undefined || config.domains === undefined) {
    textfield.textContent = 'example.com';
  } else {
    textfield.textContent = config.domains.join('\n');
  }
});
