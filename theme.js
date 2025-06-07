// theme.js — переключение темы (сохраняет выбор в localStorage)
const themeToggle = document.getElementById('theme-toggle');
function setThemeClass(isDark) {
  document.body.classList.toggle('theme-dark', isDark);
  // Сдвиг ползунка иконки
  themeToggle.classList.toggle('dark', isDark);
}
themeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('theme-dark');
  setThemeClass(isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
(function () {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setThemeClass(saved === 'dark' || (!saved && prefersDark));
})();
