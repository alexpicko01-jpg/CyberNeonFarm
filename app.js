// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Сообщаем Telegram, что приложение готово и принудительно раскрываем его на максимум
tg.ready();
tg.expand();

// Настройка цветов интерфейса под тему Telegram (опционально)
tg.setHeaderColor('secondary_bg_color');

// Логика игры (Базовые переменные)
let coins = 50;
let dollars = 0.0000;

// Получение элементов интерфейса
const coinsDisplay = document.getElementById('coins-count');
const dollarsDisplay = document.getElementById('dollars-count');
const btnWatchAds = document.getElementById('btn-watch-ads');
const btnSpinWheel = document.getElementById('btn-spin-wheel');
const btnCopyLink = document.getElementById('btn-copy-link');

// Функция обновления интерфейса
function updateUI() {
    coinsDisplay.textContent = coins;
    dollarsDisplay.textContent = dollars.toFixed(4);
}

// Обработчик кнопки "Смотреть рекламу"
btnWatchAds.addEventListener('click', () => {
    coins += 50;
    dollars += 0.0020;
    updateUI();
    
    // Легкая вибрация телефона при клике (работает в Telegram на смартфонах)
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
});

// Обработчик "Крутить Колесо"
btnSpinWheel.addEventListener('click', () => {
    tg.showAlert("Колесо Удачи запустится в следующем обновлении!");
});

// Обработчик "Скопировать ссылку"
btnCopyLink.addEventListener('click', () => {
    const inviteLink = "https://t.me"; // Замените на ссылку вашего бота
    
    navigator.clipboard.writeText(inviteLink).then(() => {
        tg.showPopup({
            title: 'Успешно',
            message: 'Реферальная ссылка скопирована в буфер обмена!',
            buttons: [{type: 'ok'}]
        });
    }).catch(err => {
        alert('Не удалось скопировать');
    });
});
