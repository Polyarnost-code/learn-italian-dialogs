for (const button of document.querySelectorAll('.copy-dialog')) {
 button.addEventListener('click', async () => {
  const card = button.closest('.dialog-template');
  const text = card.querySelector('pre');
  const status = card.querySelector('.copy-status');
  try {
   await navigator.clipboard.writeText(text.textContent);
   status.textContent = 'Скопійовано! Вставте діалог у поле вище.';
  } catch {
   const selection = window.getSelection();
   if (selection) {
    const range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
   }
   status.textContent = 'Не вдалося скопіювати автоматично. Скопіюйте виділений текст вручну.';
  }
 });
}
