document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const destination = button.dataset.action;
  if (destination) {
    window.location.href = destination;
  }
});
