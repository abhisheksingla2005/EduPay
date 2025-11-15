// Dashboard UX helpers and socket visuals
(function(){
  const bell = document.getElementById('notifBell');
  const dot = document.getElementById('notifDot');
  if (!bell || !dot) return;
  const socket = window.socket || io();
  socket.on('student-request-notification', () => {
    dot.classList.remove('hidden');
    bell.classList.add('ring');
    setTimeout(()=> bell.classList.remove('ring'), 1500);
  });
})();

// Loading helpers
window.showLoading = function(button){
  if (!button) return;
  button.dataset.originalText = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<svg class="animate-spin h-5 w-5 inline mr-1" viewBox="0 0 24 24">\n    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>\n    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg> Loading';
}
window.hideLoading = function(button){
  if (!button) return;
  button.disabled = false;
  button.innerHTML = button.dataset.originalText || 'Submit';
}
