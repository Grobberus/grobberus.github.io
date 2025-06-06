<?php
session_start();

define('ACCESS_CODE', '1029384756'); // Замените на ваш код доступа
define('NEWS_FILE', 'news.json');

function load_news() {
    if (!file_exists(NEWS_FILE)) {
        file_put_contents(NEWS_FILE, json_encode([], JSON_UNESCAPED_UNICODE));
    }
    $json = file_get_contents(NEWS_FILE);
    return json_decode($json, true);
}

function save_news($news) {
    file_put_contents(NEWS_FILE, json_encode($news, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function sort_news(&$news) {
    usort($news, function($a, $b) {
        $dateA = strtotime($a['date']);
        $dateB = strtotime($b['date']);
        return $dateA - $dateB;
    });
}

// Обработка выхода
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// Обработка входа
if (isset($_POST['access_code'])) {
    if ($_POST['access_code'] === ACCESS_CODE) {
        $_SESSION['logged_in'] = true;
    } else {
        $error = "Неверный код доступа";
    }
}

// Проверка авторизации
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    ?>
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8" />
        <title>Вход в админку - Добавление новостей</title>
        <style>
            body { font-family: Arial, sans-serif; background: #2c1a0f; color: #f5e6c4; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            form { background: rgba(60,30,10,0.9); padding: 20px; border-radius: 12px; box-shadow: 0 0 20px #ff8c00; }
            input[type="password"] { padding: 10px; border-radius: 6px; border: none; width: 200px; }
            input[type="submit"] { padding: 10px 20px; margin-left: 10px; border: none; border-radius: 6px; background: #ff8c00; color: #3b1f00; font-weight: bold; cursor: pointer; }
            .error { color: #ff4d4d; margin-top: 10px; }
        </style>
    </head>
    <body>
        <form method="post" action="admin.php">
            <label>Введите код доступа: <input type="password" name="access_code" required /></label>
            <input type="submit" value="Войти" />
            <?php if (!empty($error)) echo '<div class="error">'.htmlspecialchars($error).'</div>'; ?>
        </form>
    </body>
    </html>
    <?php
    exit;
}

// Обработка добавления новости
if (isset($_POST['date'], $_POST['text'])) {
    $date = trim($_POST['date']);
    $text = trim($_POST['text']);

    // Валидация даты
    $d = DateTime::createFromFormat('Y-m-d', $date);
    if (!$d || $d->format('Y-m-d') !== $date) {
        $msg = "Неверный формат даты. Используйте ГГГГ-ММ-ДД.";
    } elseif (empty($text)) {
        $msg = "Текст новости не может быть пустым.";
    } else {
        $news = load_news();
        $news[] = ['date' => $date, 'text' => $text];
        sort_news($news);
        save_news($news);
        $msg = "Новость успешно добавлена.";
    }
}

$news = load_news();
?>

<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Админка - Добавление новостей</title>
  <link rel="stylesheet" href="style.css" />
  <style>
    body { background: #2c1a0f; color: #f5e6c4; font-family: Georgia, serif; margin: 0; }
    .container { max-width: 800px; margin: 40px auto; background: rgba(60,30,10,0.9); padding: 30px 40px; border-radius: 12px; box-shadow: 0 0 20px #ff8c00; }
    h1 { margin-top: 0; }
    form { margin-bottom: 30px; }
    label { display: block; margin-bottom: 10px; font-weight: bold; }
    input[type="date"], textarea { width: 100%; padding: 10px; border-radius: 8px; border: none; font-family: Georgia, serif; font-size: 1em; }
    textarea { height: 100px; resize: vertical; }
    input[type="submit"] { background: linear-gradient(135deg, #ff8c00, #ffa733); color: #3b1f00; font-weight: bold; padding: 14px 28px; border-radius: 12px; border: none; cursor: pointer; box-shadow: 0 4px 10px rgba(255,140,0,0.6); }
    input[type="submit"]:hover { background: linear-gradient(135deg, #ffa733, #ffb84d); box-shadow: 0 6px 15px rgba(255,183,77,0.8); }
    .message { margin-bottom: 20px; font-weight: bold; color: #ffb84d; }
    .news-item { padding: 15px 0; border-bottom: 2px solid rgba(255, 140, 0, 0.4); }
    .news-date { font-size: 1.1em; color: #ffb84d; margin-bottom: 10px; font-weight: 700; text-shadow: 0 0 4px #ffb84d; }
    footer { text-align: center; padding: 20px 10px; font-size: 0.9em; color: #d9c9a3; text-shadow: 0 0 3px #ff8c00; }
    .logout { text-align: right; margin-bottom: 20px; }
    .logout a { color: #ff8c00; text-decoration: none; font-weight: bold; }
    .logout a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logout"><a href="admin.php?logout=1">Выйти</a></div>
    <h1>Добавить новость</h1>
    <?php if (!empty($msg)) echo '<div class="message">'.htmlspecialchars($msg).'</div>'; ?>
    <form method="post" action="admin.php">
      <label for="date">Дата новости (ГГГГ-ММ-ДД):</label>
      <input type="date" id="date" name="date" required value="<?php echo date('Y-m-d'); ?>" />
      <label for="text">Текст новости:</label>
      <textarea id="text" name="text" required></textarea>
      <input type="submit" value="Добавить" />
    </form>

    <h2>Текущие новости</h2>
    <?php foreach ($news as $item): ?>
      <div class="news-item">
        <div class="news-date"><?php echo htmlspecialchars($item['date']); ?></div>
        <p><?php echo nl2br(htmlspecialchars($item['text'])); ?></p>
      </div>
    <?php endforeach; ?>

    <footer>
      <p>© Любители приключений, 2025</p>
    </footer>
  </div>
</body>
</html>
