const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSCuP7luNbTXwzyoU7OuAjF8rsyvKg22xYvXS6r2FTVwN0N3vfC0cI_oMsa9Xr0Z3Icdp8j8FQN4wj/pub?output=csv';

function formatDate(dateStr) {
  if (!dateStr) return '';
  // Если формат "ДД.ММ.ГГ" или "ДД.ММ.ГГГГ"
  if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(dateStr)) {
    let [d, m, y] = dateStr.split('.');
    d = d.padStart(2, '0');
    m = m.padStart(2, '0');
    if (y.length === 2) y = '20' + y; // 23 -> 2023
    return `${d}.${m}.${y}`;
  }
  // Если формат "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  }
  // Если формат "MM/DD/YYYY"
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [m, d, y] = dateStr.split('/');
    return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
  }
  // Если не распознано — вернуть как есть
  return dateStr;
}


function convertDriveLinkToDirect(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
}

async function loadNews() {
  const container = document.getElementById('news-container');
  container.textContent = 'Загрузка новостей...';

  try {
    const url = CSV_URL + '&_=' + new Date().getTime();
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Ошибка загрузки CSV');
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const news = parsed.data;

    if (news.length === 0) {
      container.textContent = 'Новостей пока нет.';
      return;
    }

    container.innerHTML = '';
    news.reverse().forEach(item => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';

      const dateDiv = document.createElement('div');
      dateDiv.className = 'news-date';
      dateDiv.textContent = formatDate(item.date || item.Date || item.DATE);

      newsItem.appendChild(dateDiv);

      const imgUrlsRaw = item.image || item.img || item.IMAGE || '';
      const imgUrls = imgUrlsRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);

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

      const textP = document.createElement('p');
      textP.className = 'news-text';

      let rawText = item.text || item.Text || item.TEXT || '';
      rawText = rawText.replace(/\n{2,}/g, '\n');
      textP.innerHTML = rawText.replace(/\n/g, '<br>');

      newsItem.appendChild(textP);
      container.appendChild(newsItem);
    });

    container.addEventListener('click', function(event) {
      if (event.target.tagName === 'IMG' && event.target.closest('.news-images-wrapper')) {
        openImageLightbox(event.target.src, event.target.alt);
      }
    });

  } catch (e) {
    container.textContent = 'Не удалось загрузить новости.';
    console.error(e);
  }
}

function openImageLightbox(src, alt) {
  if (document.querySelector('.image-lightbox-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'image-lightbox-overlay';

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || 'Увеличенное изображение';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => {
    overlay.remove();
  });

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', onKeyDown);
    }
  }
  document.addEventListener('keydown', onKeyDown);
}

loadNews();
