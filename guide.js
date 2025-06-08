const GUIDE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8MHFjkuPlvjctHFmRf1VEmJ0C1xjF4M9DzVEkg2PtxhjcOCzDleTcvPsebZnsey3rYbUfv5uN7qM9/pub?output=csv';

let guideData = [];
let loadedCount = 0;
const LOAD_STEP = 10;

function convertDriveLinkToDirect(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
}

async function loadGuide() {
  const container = document.getElementById('guide-container');
  container.textContent = 'Загрузка гайдов...';

  try {
    const url = GUIDE_CSV_URL + '&_=' + new Date().getTime();
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Ошибка загрузки CSV');
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    guideData = parsed.data.reverse();
    loadedCount = 0;
    container.innerHTML = '';

    if (guideData.length === 0) {
      container.textContent = 'Нет записей.';
      return;
    }

    loadMoreGuide();

    container.addEventListener('click', function(event) {
      if (event.target.tagName === 'IMG' && event.target.closest('.news-images-wrapper')) {
        openImageLightbox(event.target.src, event.target.alt);
      }
    });

    window.addEventListener('scroll', onScrollLoadMoreGuide);

  } catch (e) {
    container.textContent = 'Не удалось загрузить данные.';
    console.error(e);
  }
}

function loadMoreGuide() {
  const container = document.getElementById('guide-container');
  const nextItems = guideData.slice(loadedCount, loadedCount + LOAD_STEP);
  nextItems.forEach(item => {
    const guideItem = document.createElement('div');
    guideItem.className = 'news-item';

    // Один гвоздик (левый верхний угол)
    const nailTL = document.createElement('span');
    nailTL.className = 'nail';
    guideItem.appendChild(nailTL);

    const nameDiv = document.createElement('div');
    nameDiv.className = 'news-date';
    nameDiv.textContent = item.name || item.Name || item.NAME || '';

    guideItem.appendChild(nameDiv);

    const imgUrlsRaw = item.image || item.img || item.IMAGE || '';
    const imgUrls = imgUrlsRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    if (imgUrls.length > 0) {
      const imagesWrapper = document.createElement('div');
      imagesWrapper.className = 'news-images-wrapper';

      imgUrls.forEach(imgUrl => {
        const directUrl = convertDriveLinkToDirect(imgUrl);
        const img = document.createElement('img');
        img.src = directUrl;
        img.alt = 'Изображение мода';
        imagesWrapper.appendChild(img);
      });

      guideItem.appendChild(imagesWrapper);
    }

    const textP = document.createElement('p');
    textP.className = 'news-text';

    let rawText = item.text || item.Text || item.TEXT || '';
    rawText = rawText.replace(/\n{2,}/g, '\n');
    textP.innerHTML = rawText.replace(/\n/g, '<br>');

    guideItem.appendChild(textP);
    container.appendChild(guideItem);
  });
  loadedCount += nextItems.length;
}

function onScrollLoadMoreGuide() {
  if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
    if (loadedCount < guideData.length) {
      loadMoreGuide();
    } else {
      window.removeEventListener('scroll', onScrollLoadMoreGuide);
    }
  }
}

// Лайтбокс для изображений
function openImageLightbox(src, alt) {
  const oldOverlay = document.querySelector('.image-lightbox-overlay');
  if (oldOverlay) oldOverlay.remove();

  const overlay = document.createElement('div');
  overlay.className = 'image-lightbox-overlay';

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || 'Увеличенное изображение';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', onKeyDown);
    }
  }
  document.addEventListener('keydown', onKeyDown);
}

if (document.getElementById('guide-container')) {
  loadGuide();
}