'use strict'

const lastModif = document.querySelector('#lastModified')
lastModif.textContent = new Date(document.lastModified)
lastModif.setAttribute("data-time", document.lastModified)

lastModif.addEventListener('click', function (event) {
  let ago = new Date(document.lastModified)
  let diff = new Date().getTime() - ago.getTime();

  let progress = new Date(diff)
  if (progress.getUTCFullYear() - 1970) {
    event.target.textContent = progress.getUTCFullYear() - 1970 + ' year ago';
  } else if (progress.getUTCMonth()) {
    event.target.textContent = progress.getUTCMonth() + ' month ago';
  } else if (progress.getUTCDate() - 1) {
    event.target.textContent = progress.getUTCDate() - 1 + ' day ago';
  } else if (progress.getUTCHours()) {
    event.target.textContent = progress.getUTCHours() + ' hour ago';
  } else if (progress.getUTCMinutes()) {
    event.target.textContent = progress.getUTCMinutes() + ' minute ago';
  } else {
    event.target.textContent = 'Now';
  }
}, false)