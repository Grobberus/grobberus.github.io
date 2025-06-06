// Функция форматирования даты из "YYYY-MM-DD" в "DD.MM.YYYY"
function formatDate(dateStr) {
  const parts = dateStr.split('-');
  if(parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

// Загружаем новости из news.json и отображаем в обратном порядке
fetch('news.json?v=' + new Date().getTime()) // добавлен параметр для обхода кеша
  .then(response => {
    if (!response.ok) {
      throw new Error('Ошибка загрузки новостей');
    }
    return response.json();
  })
  .then(newsData => {
    const container = document.getElementById('news-container');
    container.innerHTML = ''; // очищаем контейнер перед добавлением новостей
    newsData.reverse().forEach(item => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';

      const dateElem = document.createElement('div');
      dateElem.className = 'news-date';
      dateElem.textContent = formatDate(item.date);

      const textElem = document.createElement('p');
      textElem.textContent = item.text;

      newsItem.appendChild(dateElem);
      newsItem.appendChild(textElem);

      container.appendChild(newsItem);
    });
  })
  .catch(error => {
    const container = document.getElementById('news-container');
    container.textContent = 'Не удалось загрузить новости.';
    console.error(error);
  });
