// scripts.js

// Функция форматирования даты из "YYYY-MM-DD" в "DD.MM.YYYY"
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if(parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

// Функция преобразования ссылки Google Drive в прямую ссылку для <img>
function convertDriveLinkToDirect(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url; // если не совпало, возвращаем как есть
}

// Загружаем новости из news.json и отображаем в обратном порядке
fetch('news.json?v=' + new Date().getTime()) // параметр для обхода кеша
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
      textElem.className = 'news-text';
      // заменяем переносы строк на <br> для корректного отображения
      textElem.innerHTML = item.text.replace(/\n/g, '<br>');

      newsItem.appendChild(dateElem);

      // Если есть картинки, создаём контейнер и добавляем все картинки
      if (item.image) {
        const imgUrls = item.image.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        if (imgUrls.length > 0) {
          const imagesWrapper = document.createElement('div');
          imagesWrapper.className = 'news-images-wrapper';

          imgUrls.forEach(imgUrl => {
            const directUrl = convertDriveLinkToDirect(imgUrl);
            const img = document.createElement('img');
            img.src = directUrl;
            img.alt = 'Изображение новости';
            imagesWrapper.appendChild(img);
          });

          newsItem.appendChild(imagesWrapper);
        }
      }

      newsItem.appendChild(textElem);
      container.appendChild(newsItem);
    });

    // Обработчик клика для приближения картинки
    container.addEventListener('click', function(event) {
      if (event.target.tagName === 'IMG' && event.target.closest('.news-images-wrapper')) {
        event.target.classList.toggle('zoomed');
      }
    });
  })
  .catch(error => {
    const container = document.getElementById('news-container');
    container.textContent = 'Не удалось загрузить новости.';
    console.error(error);
  });
