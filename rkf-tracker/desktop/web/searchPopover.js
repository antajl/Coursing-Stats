// searchPopover.js — Expandable ToolbarSearch Popover Controller
// Matches site ToolbarSearch.tsx interaction (closed pill -> opens floating search input on click)

export function setupSearchPopover({
  wrapperId,
  triggerBtnId,
  dropdownId,
  inputId,
  activeTextId,
  clearTriggerId,
  clearDdId,
  onSearch
}) {
  const wrapper = document.getElementById(wrapperId);
  const triggerBtn = document.getElementById(triggerBtnId);
  const dropdown = document.getElementById(dropdownId);
  const input = document.getElementById(inputId);
  const activeText = document.getElementById(activeTextId);
  const clearTrigger = document.getElementById(clearTriggerId);
  const clearDd = document.getElementById(clearDdId);

  if (!wrapper || !triggerBtn || !dropdown || !input) return;

  function openDropdown() {
    dropdown.style.display = 'block';
    triggerBtn.classList.add('cs-glass-pill-active');
    setTimeout(() => {
      input.focus();
      if (input.value) input.select();
    }, 40);
  }

  function closeDropdown() {
    dropdown.style.display = 'none';
    if (!input.value.trim()) {
      triggerBtn.classList.remove('cs-glass-pill-active', 'has-value');
    }
  }

  function syncValue(val) {
    const q = (val || '').trim();
    if (q) {
      triggerBtn.classList.add('has-value', 'cs-glass-pill-active');
      if (activeText) {
        activeText.textContent = q;
        activeText.style.display = 'inline-block';
      }
      if (clearTrigger) clearTrigger.style.display = 'inline-flex';
      if (clearDd) clearDd.style.display = 'inline-flex';
    } else {
      triggerBtn.classList.remove('has-value');
      if (!dropdown || dropdown.style.display === 'none') {
        triggerBtn.classList.remove('cs-glass-pill-active');
      }
      if (activeText) activeText.style.display = 'none';
      if (clearTrigger) clearTrigger.style.display = 'none';
      if (clearDd) clearDd.style.display = 'none';
    }
    if (typeof onSearch === 'function') onSearch(q);
  }

  triggerBtn.addEventListener('click', (e) => {
    if (e.target.closest('#' + clearTriggerId)) return;
    const isOpen = dropdown.style.display !== 'none';
    if (isOpen) closeDropdown();
    else openDropdown();
  });

  if (clearTrigger) {
    clearTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      input.value = '';
      syncValue('');
      closeDropdown();
    });
  }

  if (clearDd) {
    clearDd.addEventListener('click', () => {
      input.value = '';
      syncValue('');
      input.focus();
    });
  }

  input.addEventListener('input', () => {
    syncValue(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      closeDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      closeDropdown();
    }
  });
}
