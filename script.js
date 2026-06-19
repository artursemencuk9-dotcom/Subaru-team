const tg = window.Telegram.WebApp;
if (typeof tg.expand === 'function') tg.expand();

// ТВОЙ ЛИЧНЫЙ ID ДЛЯ АДМИНКИ
const ADMIN_ID = 572925145;

// Переменные бортового журнала
let globalOdometer = 152300;
let journalData = {
    oil: { name: "🛢️ Моторное масло", lastChange: 148000, interval: 5000, color: "#0070FF" },
    coolant: { name: "🧪 Антифриз", lastChange: 110000, interval: 40000, color: "#34C759" },
    pads: { name: "🛞 Тормозные колодки", lastChange: 135000, interval: 20000, color: "#FFC72C" }
};

// Переменные сходок (Базовая афиша)
let eventsList = [
    { id: 1, date: "Завтра, 19:00", title: "Большая летняя сходка Subaru Team VTB", geo: "📍 Парковка ТЦ, сектор Б", rsvp: false, count: 14 }
];

// Полный расширенный список вопросов в Инфо (FAQ)
const faqList = [
    { q: "Какое масло лить в турбо-мотор EJ205 / EJ257? 📦", a: "Большинство участников клуба рекомендуют вязкость 5W-40 или 10W-60 для жестких режимов трека. Популярные бренды в сообществе: Bardahl, Liqui Moly, Idemitsu Racing. Меняйте каждые 5000 км." },
    { q: "Горит Check Engine: ошибка P0420 ⚠️", a: "Это классическая ошибка по низкой эффективности катализатора. Решается либо установкой механической обманки на вторую лямбду, либо программным отключением при чип-тюнинге." },
    { q: "Стук в четвертом цилиндре: миф или реальность? 🔧", a: "Реальность, обусловленная конструктивной особенностью охлаждения старых блоков EJ. Профилактика: установка дополнительного охлаждения 4-го цилиндра и контроль за чистотой радиаторов." },
    { q: "Каковы признаки умирающей турбины? 💨", a: "Основные симптомы: появление сизого или белого дыма из выхлопной трубы при перегазовках, заметный жор масла через турбину, посторонние звуки (вой, скрежет, металлический свист), а также падение максимального давления наддува (недодув)." },
    { q: "Как часто нужно менять ремень ГРМ на моторах EJ? ⏱️", a: "Заводской регламент рекомендует замену каждые 100 000 км. Однако в клубе советуют проверять состояние ремня каждые 50 000 км, особенно если машина используется для активной езды, и менять комплект при малейших трещинах." }
];

// Инициализация профиля
function initProfile() {
    let userId = 7777777;
    let userName = "subaru_owner";
    let fullName = "АРТУР СЕМЕНЧУК";

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        userId = user.id;
        userName = user.username || "subaru_user";
        fullName = (user.first_name + " " + (user.last_name || "")).trim();
    }

    document.getElementById('username').innerText = "@" + userName;
    document.getElementById('card-owner').innerText = fullName.toUpperCase();
    document.getElementById('card-id').innerText = "#" + userId.toString().substring(0, 4) + "-VTB";
    document.getElementById('card-qr-img').src = "https://qrserver.com_" + userId;

    // ПРОВЕРКА НА АДМИНА
    if (userId === ADMIN_ID) {
        document.getElementById('admin-menu-item').style.display = "flex";
        document.getElementById('user-status-text').innerText = "Создатель клуба";
    }
}

// Переключение табов
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
    try { tg.HapticFeedback.impactOccurred('light'); } catch(e) {}
}

// Отрендерить сходки
function renderEvents() {
    const container = document.getElementById('events-container');
    container.innerHTML = "";
    
    eventsList.forEach(ev => {
        const card = document.createElement('div');
        card.className = "event-card";
        card.innerHTML = `
            <div class="event-date">${ev.date}</div>
            <div class="event-name">${ev.title}</div>
            <div class="event-geo" onclick="window.open('https://yandex.ru', '_blank')">📍 ${ev.geo}</div>
            <div class="event-counter">Поедут: <strong>${ev.count}</strong> экипажей</div>
            <button class="event-action-btn ${ev.rsvp ? 'active' : ''}" onclick="toggleRSVP(${ev.id})">
                ${ev.rsvp ? 'Я ПОЕДУ ✓' : 'Я ПОЕДУ 🏎️'}
            </button>
        `;
        container.appendChild(card);
    });
}

function toggleRSVP(id) {
    const ev = eventsList.find(e => e.id === id);
    if (!ev) return;
    if (!ev.rsvp) {
        ev.rsvp = true; ev.count++;
        try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
    } else {
        ev.rsvp = false; ev.count--;
        try { tg.HapticFeedback.impactOccurred('medium'); } catch(e) {}
    }
    renderEvents();
}

// Админка: создание сходки
function adminCreateEvent() {
    const dateInput = document.getElementById('adm-date').value;
    const titleInput = document.getElementById('adm-title').value;
    const geoInput = document.getElementById('adm-geo').value;

    if (!dateInput || !titleInput || !geoInput) {
        if(typeof tg.showAlert === 'function') tg.showAlert("Заполните все поля афиши!");
        return;
    }

    const newEv = { id: Date.now(), date: dateInput, title: titleInput, geo: geoInput, rsvp: false, count: 0 };
    eventsList.unshift(newEv);
    renderEvents();

    document.getElementById('adm-date').value = "";
    document.getElementById('adm-title').value = "";
    document.getElementById('adm-geo').value = "";

    if(typeof tg.showAlert === 'function') tg.showAlert("Новое мероприятие успешно добавлено в общую афишу клуба!");
}

// Одометр и Расходники
function updateOdometer() {
    const val = parseInt(document.getElementById('current-odo').value);
    if (!isNaN(val) && val > 0) {
        globalOdometer = val;
        renderJournal();
    }
}

function renderJournal() {
    const list = document.getElementById('journal-items-list');
    list.innerHTML = "";
    document.getElementById('current-odo').value = globalOdometer;

    for (let key in journalData) {
        let item = journalData[key];
        let driven = globalOdometer - item.lastChange;
        let progress = Math.max(0, Math.min(100, 100 - (driven / item.interval * 100)));
        let leftKm = Math.max(0, item.interval - driven);

        const box = document.createElement('div');
        box.className = "m-box";
        box.innerHTML = `
            <div class="m-top">
                <span>${item.name}</span>
                <span style="color: ${progress < 20 ? 'var(--danger)' : '#FFF'}">Осталось: ${leftKm} км</span>
            </div>
            <div class="m-bar">
                <div class="m-fill" style="width: ${progress}%; background: ${progress < 20 ? 'var(--danger)' : item.color}"></div>
            </div>
            <div class="m-info-row">
                <span class="m-last-change">Замена на: ${item.lastChange} км</span>
                <button class="m-reset-btn" onclick="resetMaintenance('${key}')">Обновить ТО</button>
            </div>
        `;
        list.appendChild(box);
    }
}

function resetMaintenance(key) {
    journalData[key].lastChange = globalOdometer;
    renderJournal();
    try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
}

// Отрендерить FAQ
function renderFaq() {
    const container = document.getElementById('faq-container');
    container.innerHTML = "";
    faqList.forEach(faq => {
        const item = document.createElement('div');
        item.className = "faq-item";
        item.onclick = () => { item.classList.toggle('open'); try { tg.HapticFeedback.impactOccurred('light'); } catch(e) {} };
        item.innerHTML = `<div class="faq-question">${faq.q}</div><div class="faq-answer">${faq.a}</div>`;
        container.appendChild(item);
    });
}

// Запуск при старте
initProfile();
renderEvents();
renderJournal();
renderFaq();
