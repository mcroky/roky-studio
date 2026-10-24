(() => {
  const account = document.getElementById('bank-account-number');
  const button = document.getElementById('bank-account-copy');
  const status = document.getElementById('bank-copy-status');
  if (!account || !button || !status) return;
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(account.textContent.trim());
      status.textContent = '계좌번호를 복사했습니다. 은행 앱에서 붙여넣어주세요.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(account);
      selection?.removeAllRanges();
      selection?.addRange(range);
      status.textContent = '자동 복사를 사용할 수 없습니다. 선택된 계좌번호를 직접 복사해주세요.';
    } finally {
      button.disabled = false;
    }
  });
})();
