const tg = window.Telegram?.WebApp; const pId = tg?.initDataUnsafe?.user?.id || Math.floor(100000 + Math.random() * 900000);

const CROPS = [{ id: 'c1', name: "🌾 Пшеница", income: 10, time: 5 }, { id: 'c2', name: "🌽 Кукуруза", income: 30, time: 12, cost: 150 }, { id: 'c3', name: "🌱 Сено", income: 90, time: 25, cost: 600 }, { id: 'c4', name: "🍬 Сахар", income: 250, time: 50, cost: 2000 }];
const ANIMALS = [{ id: 'a1', name: "🐓 Курица", income: 20, time: 8 }, { id: 'a2', name: "🐄 Корова", income: 60, time: 18, cost: 300 }, { id: 'a3', name: "🐑 Овечка", income: 180, time: 35, cost: 1000 }, { id: 'a4', name: "🐖 Свинья", income: 500, time: 70, cost: 4000 }];

window.state = { coins: 50, cropMultiplier: 1, animMultiplier: 1, maxOpenCropIdx: 0, maxOpenAnimIdx: 0, timers: {}, statuses: {}, hasTractor: false, hasIncubator: false, hasGreenhouse: false, hasFactory: false, refViews: 0, adViews: 0 };

window.saveGame = function() {
    document.getElementById('coins').innerText = Math.floor(window.state.coins);
    
    document.getElementById('btn-up-crop').innerText = `↑ (${window.state.cropMultiplier * 100}💰)`;
    document.getElementById('btn-up-anim').innerText = `↑ (${window.state.animMultiplier * 150}💰)`;
    
    let nC = CROPS[window.state.maxOpenCropIdx + 1]; document.getElementById('btn-next-crop').innerText = nC ? `${nC.name} (${nC.cost}💰)` : "Все открыты";
    let nA = ANIMALS[window.state.maxOpenAnimIdx + 1]; document.getElementById('btn-next-anim').innerText = nA ? `${nA.name} (${nA.cost}💰)` : "Все открыты";
    
    updateBtnState('b-tr', window.state.hasTractor, "2000 💰"); updateBtnState('b-ic', window.state.hasIncubator, "3500 💰");
    updateBtnState('b-gh', window.state.hasGreenhouse, "200 💰"); updateBtnState('b-fc', window.state.hasFactory, "500 💰");
    
    let personalUsd = (window.state.adViews || 0) * 0.0020; let refUsd = (window.state.refViews || 0) * 0.0004; let totalUsd = personalUsd + refUsd;
    document.getElementById('usd-balance').innerText = `$${totalUsd.toFixed(4)}`;
    let el = document.getElementById('ref-usd'); if(el) el.innerText = `$${refUsd.toFixed(4)}`;
    const wEl = document.getElementById('withdraw-info'); if (wEl) wEl.innerText = totalUsd >= 10 ? "🔓 Кнопка вывода активна!" : `🔒 Вывод от $10.0000 (Осталось: $${(10 - totalUsd).toFixed(4)})`;
}

function updateBtnState(id, purchased, priceText) { let b = document.getElementById(id); if (!b) return; if (purchased) { b.innerText = "Куплено ✅"; b.style.background = "#10b981"; b.disabled = true; } else { b.innerText = priceText; b.style.background = "#4338ca"; b.disabled = false; } }
function showError(id) { let b = document.getElementById(id); if (!b) return; b.innerText = "Мало 💰"; b.style.background = "#ef4444"; setTimeout(() => { b.style.background = ""; window.saveGame(); }, 1200); }

window.upgradeCropMult = function() { let c = window.state.cropMultiplier * 100; if (window.state.coins >= c) { window.state.coins -= c; window.state.cropMultiplier++; window.saveGame(); window.render(); } else showError('btn-up-crop'); }
window.upgradeAnimMult = function() { let c = window.state.animMultiplier * 150; if (window.state.coins >= c) { window.state.coins -= c; window.state.animMultiplier++; window.saveGame(); window.render(); } else showError('btn-up-anim'); }
window.unlockNextCrop = function() { let n = CROPS[window.state.maxOpenCropIdx + 1]; if (!n) return; if (window.state.coins >= n.cost) { window.state.coins -= n.cost; window.state.maxOpenCropIdx++; window.saveGame(); window.render(); } else showError('btn-next-crop'); }
window.unlockNextAnim = function() { let n = ANIMALS[window.state.maxOpenAnimIdx + 1]; if (!n) return; if (window.state.coins >= n.cost) { window.state.coins -= n.cost; window.state.maxOpenAnimIdx++; window.saveGame(); window.render(); } else showError('btn-next-anim'); }

window.buyAutomation = function(type) {
    let cost = type === 'tractor' ? 2000 : type === 'incubator' ? 3500 : type === 'greenhouse' ? 200 : 500;
    let flag = type === 'tractor' ? 'hasTractor' : type === 'incubator' ? 'hasIncubator' : type === 'greenhouse' ? 'hasGreenhouse' : 'hasFactory';
    let btnId = type === 'tractor' ? 'b-tr' : type === 'incubator' ? 'b-ic' : type === 'greenhouse' ? 'b-gh' : 'b-fc';
    if (window.state.coins >= cost && !window.state[flag]) { window.state.coins -= cost; window.state[flag] = true; window.saveGame(); window.render(); } else if (!window.state[flag]) showError(btnId);
}

window.handleAction = function(id, baseIncome, time, type) {
    let s = window.state.statuses[id] || 'empty';
    if (s === 'empty') { window.state.statuses[id] = 'active'; window.state.timers[id] = type === 'crop' && window.state.hasGreenhouse ? Math.ceil(time / 2) : time; }
    else if (s === 'ready') { window.state.coins += baseIncome * (type === 'crop' ? window.state.cropMultiplier : (window.state.animMultiplier * (window.state.hasFactory ? 2 : 1))); window.state.statuses[id] = 'empty'; }
    window.saveGame(); window.render();
}

window.spinWheel = function() {
    let b = document.getElementById('btn-spin'); if (b && b.disabled) return; if (b) b.disabled = true;
    const deg = Math.floor(Math.random() * 360) + 1800; const w = document.getElementById('wheel'); if (w) w.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
        let prizes = [10, 5, 20, 15]; let win = prizes[Math.floor((deg % 360) / 90)] || 5; window.state.coins += win; window.saveGame();
        let old = b.innerText; b.innerText = `+${win}💰`; b.style.background = "#10b981"; setTimeout(() => { b.innerText = old; b.style.background = ""; b.disabled = false; }, 1500);
    }, 3000);
}

window.simulateInvite = function() { let b = document.getElementById('btn-ref'); let link = `https://t.me{pId}`; navigator.clipboard.writeText(link).then(() => { let old = b.innerText; b.innerText = "Скопировано! ✅"; b.style.background = "#10b981"; setTimeout(() => { b.innerText = old; b.style.background = ""; }, 1500); }); }
window.simulateFriendWatchedAd = function() { window.state.refViews = (window.state.refViews || 0) + 1; window.state.coins += 20; window.saveGame(); }

window.renderGrid = function(type, data, maxIdx, targetId) {
    let html = ''; data.forEach((item, idx) => {
        if (idx > maxIdx) return;
        let s = window.state.statuses[item.id] || 'empty', timer = window.state.timers[item.id] || 0, pct = s === 'active' ? ((item.time - timer) / item.time) * 100 : 0, isReady = s === 'ready';
        let btnText = s === 'active' ? `Растет (${timer}с)` : isReady ? '🚜 Собрать' : '🧬 Запустить';
        html += `<div class="card ${isReady?'active-border':''}"><span class="card-icon-wrapper">${type==='crop'?'🌱':'🐾'}</span><div class="card-title">${item.name}</div><div class="progress-container"><div class="progress-bar ${type==='anim'?'breeding':''}" style="width:${pct}%"></div></div><button class="btn ${isReady?'collect':''}" ${s==='active'?'disabled':''} onclick="window.handleAction('${item.id}',${item.income},${item.time},'${type}')">${btnText}</button></div>`;
    }); const el = document.getElementById(targetId); if(el) el.innerHTML = html;
}
window.render = function() { window.renderGrid('crop', CROPS, window.state.maxOpenCropIdx, 'plots-grid'); window.renderGrid('anim', ANIMALS, window.state.maxOpenAnimIdx, 'animals-grid'); window.saveGame(); }

setInterval(() => {
    CROPS.forEach((item, idx) => { if (idx > window.state.maxOpenCropIdx) return; let id = item.id; if (window.state.statuses[id] === 'empty' && window.state.hasTractor) { window.state.statuses[id] = 'active'; window.state.timers[id] = window.state.hasGreenhouse ? Math.ceil(item.time / 2) : item.time; } if (window.state.statuses[id] === 'active' && window.state.timers[id] > 0) window.state.timers[id]--; if (window.state.statuses[id] === 'active' && window.state.timers[id] === 0) window.state.statuses[id] = 'ready'; if (window.state.statuses[id] === 'ready' && window.state.hasTractor) window.handleAction(id, item.income, item.time, 'crop'); });
    ANIMALS.forEach((item, idx) => { if (idx > window.state.maxOpenAnimIdx) return; let id = item.id; if ((!window.state.statuses[id] || window.state.statuses[id] === 'empty') && window.state.hasIncubator) { window.state.statuses[id] = 'active'; window.state.timers[id] = item.time; } if (window.state.statuses[id] === 'active' && window.state.timers[id] > 0) window.state.timers[id]--; if (window.state.statuses[id] === 'active' && window.state.timers[id] === 0) window.state.statuses[id] = 'ready'; if (window.state.statuses[id] === 'ready' && window.state.hasIncubator) window.handleAction(id, item.income, item.time, 'anim'); });
    window.render();
}, 1000);

window.watchAdBonus = function() {
    if (window.AdGram) {
        AdGram.showRewardedVideo({
            blockId: "ВАШ_БЛОК_РЕКЛАМЫ_ИЗ_ЛИЧНОГО_КАБИНЕТА",
            onReward: function() { window.state.coins += 50; window.state.adViews = (window.state.adViews || 0) + 1; window.saveGame(); },
            onError: function(err) { alert("Реклама временно не загрузилась."); }
        });
    } else { window.state.coins += 50; window.state.adViews = (window.state.adViews || 0) + 1; window.saveGame(); }
}
window.render();
