'use strict'

const lastModif = document.querySelector('#lastModified')

// Отображение даты и времени последнего изменения документа с секундами, днями недели, 24-часовым форматом и часовым поясом на английском языке
const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', hour12: false};
lastModif.textContent = new Date(document.lastModified).toLocaleString('en-US', options);

lastModif.setAttribute("data-time", document.lastModified)

lastModif.addEventListener('click', function (event) {
  let ago = new Date(document.lastModified)
  let diff = new Date().getTime() - ago.getTime();

  let progress = new Date(diff)
  if (progress.getUTCFullYear() - 1970) {
    event.target.textContent = progress.getUTCFullYear() - 1970 + ' year' + (progress.getUTCFullYear() - 1971 > -1 ? 's' : '') + ' ago';
  } else if (progress.getUTCMonth()) {
    event.target.textContent = progress.getUTCMonth() + ' month' + (progress.getUTCMonth() > 1 ? 's' : '') + ' ago';
  } else if (progress.getUTCDate() - 1) {
    event.target.textContent = progress.getUTCDate() - 1 + ' day' + (progress.getUTCDate() - 2 > 0 ? 's' : '') + ' ago';
  } else if (progress.getUTCHours()) {
    event.target.textContent = progress.getUTCHours() + ' hour' + (progress.getUTCHours() > 1 ? 's' : '') + ' ago';
  } else if (progress.getUTCMinutes()) {
    event.target.textContent = progress.getUTCMinutes() + ' minute' + (progress.getUTCMinutes() > 1 ? 's' : '') + ' ago';
  } else {
    event.target.textContent = 'Now';
  }
}, false)