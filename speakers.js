{
  const preview = document.getElementById('hku-preview');
  for (const button of preview.querySelectorAll('[data-speaker]')) {
    const dialog = document.getElementById(button.dataset.speaker);
    button.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => button.focus({preventScroll: true}));
  }
}
