fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const infoSection = document.getElementById('info');

    const serverName = document.createElement('h2');
    serverName.textContent = data.serverName;
    infoSection.appendChild(serverName);

    const description = document.createElement('p');
    description.textContent = data.description;
    infoSection.appendChild(description);

    const ip = document.createElement('p');
    ip.innerHTML = `<strong>IP сервера:</strong> ${data.ip}`;
    infoSection.appendChild(ip);

    const newsTitle = document.createElement('h3');
    newsTitle.textContent = 'Новости сервера:';
    infoSection.appendChild(newsTitle);

    const newsList = document.createElement('ul');
    data.news.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      newsList.appendChild(li);
    });
    infoSection.appendChild(newsList);
  })
  .catch(err => {
    console.error('Ошибка загрузки данных:', err);
  });
