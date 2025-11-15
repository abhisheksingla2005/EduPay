/* Socket.io client logic */
const socket = io();

// Join room by role if available from meta tag
(function(){
  const roleMeta = document.querySelector('meta[name="user-role"]');
  if (roleMeta) {
    socket.emit('join-role', roleMeta.content);
  }
})();

socket.on('student-request-notification', (data) => {
  showToast({
    title: 'New Request',
    body: `${data.title} — ₹${data.amountRequested} by ${data.studentName}`
  });
});

socket.on('request-updated', (data) => {
  // Update progress bar if present
  const card = document.querySelector(`[data-request-id="${data.id}"]`);
  if (card) {
    const bar = card.querySelector('.progress-bar');
    const targetAmt = Number(card.getAttribute('data-amount-requested'));
    if (bar && targetAmt) {
      const pct = Math.min(100, Math.round((data.amountFunded / targetAmt) * 100));
      bar.style.width = pct + '%';
      bar.title = pct + '%';
      const statusEl = card.querySelector('.status-text');
      if (statusEl) statusEl.textContent = data.status;
    }
  }
  showToast({
    title: 'Request Updated',
    body: `Progress changed (status: ${data.status})`
  });
});

// Toast helper
function showToast({ title, body }) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const wrapper = document.createElement('div');
  wrapper.className = 'toast-custom p-3';
  wrapper.innerHTML = `\n    <div class="d-flex justify-content-between align-items-start">\n      <div>\n        <div class="fw-semibold mb-1">${title}</div>\n        <div class="small">${body}</div>\n      </div>\n      <button class="btn btn-sm btn-outline-secondary border-0" aria-label="Close">&times;</button>\n    </div>\n  `;
  container.appendChild(wrapper);
  const closeBtn = wrapper.querySelector('button');
  closeBtn.addEventListener('click', () => wrapper.remove());
  setTimeout(() => { wrapper.classList.add('show'); }, 10);
  setTimeout(() => { wrapper.remove(); }, 8000);
}
