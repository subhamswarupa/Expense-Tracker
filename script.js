(function () {
  'use strict';

  var DEFAULT_CATEGORIES = [
    { id: 'food', name: 'Food', icon: '\uD83C\uDF54', color: '#10b981' },
    { id: 'travel', name: 'Travel', icon: '\uD83D\uDE97', color: '#06b6d4' },
    { id: 'shopping', name: 'Shopping', icon: '\uD83D\uDED2', color: '#8b5cf6' },
    { id: 'entertainment', name: 'Entertainment', icon: '\uD83C\uDFAE', color: '#ec4899' },
    { id: 'bills', name: 'Bills', icon: '\uD83C\uDFE0', color: '#f59e0b' },
    { id: 'education', name: 'Education', icon: '\uD83C\uDF93', color: '#3b82f6' },
    { id: 'health', name: 'Health', icon: '\u2764\uFE0F', color: '#ef4444' },
    { id: 'tech', name: 'Tech', icon: '\uD83D\uDCBB', color: '#14b8a6' },
  ];

  var state = {};

  function _toArray(nl) {
    var arr = [];
    for (var i = 0; i < nl.length; i++) arr.push(nl[i]);
    return arr;
  }

  function defaultState() {
    return {
      expenses: [],
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
      budget: 0,
      currency: '$',
      income: 0,
      name: 'User',
      theme: 'dark',
      accent: 'emerald',
      streak: 0,
      lastActive: null,
    };
  }

  function loadState() {
    try {
      var saved = localStorage.getItem('finwise_state');
      if (saved) {
        var parsed = JSON.parse(saved);
        state = _extend(defaultState(), parsed);
        if (!Array.isArray(state.expenses)) state.expenses = [];
        if (!Array.isArray(state.categories) || state.categories.length === 0) {
          state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        }
      } else {
        state = defaultState();
        state.expenses = [
          { id: 's1', amount: 24.50, category: 'food', date: _dateStr(-1), description: 'Lunch at Cafe' },
          { id: 's2', amount: 45.00, category: 'travel', date: _dateStr(-2), description: 'Uber ride' },
          { id: 's3', amount: 120.00, category: 'shopping', date: _dateStr(-3), description: 'New headphones' },
          { id: 's4', amount: 15.99, category: 'entertainment', date: _dateStr(-4), description: 'Netflix subscription' },
          { id: 's5', amount: 89.00, category: 'bills', date: _dateStr(-5), description: 'Electricity bill' },
          { id: 's6', amount: 35.00, category: 'food', date: _dateStr(-6), description: 'Groceries' },
          { id: 's7', amount: 200.00, category: 'tech', date: _dateStr(-7), description: 'Cloud storage yearly' },
        ];
        state.budget = 2500;
        state.income = 5000;
        state.streak = 5;
        saveState();
      }
      applyTheme();
      applyAccent();
    } catch (_) {
      state = defaultState();
    }
  }

  function saveState() {
    try { localStorage.setItem('finwise_state', JSON.stringify(state)); } catch (_) {}
  }

  function _extend(base, overrides) {
    for (var key in overrides) {
      if (overrides.hasOwnProperty(key)) base[key] = overrides[key];
    }
    return base;
  }

  function _dateStr(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.getFullYear() + '-' + _pad(d.getMonth() + 1) + '-' + _pad(d.getDate());
  }

  function _pad(n) { return n < 10 ? '0' + n : '' + n; }

  function _today() { return _dateStr(0); }

  function _weekBounds() {
    var now = new Date();
    var day = now.getDay();
    var start = new Date(now);
    start.setDate(now.getDate() - ((day + 6) % 7));
    start.setHours(0, 0, 0, 0);
    var end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: _toDateStr(start), end: _toDateStr(end) };
  }

  function _toDateStr(d) {
    return d.getFullYear() + '-' + _pad(d.getMonth() + 1) + '-' + _pad(d.getDate());
  }

  function _monthBounds() {
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth();
    var start = y + '-' + _pad(m + 1) + '-01';
    var end = new Date(y, m + 1, 0);
    var endStr = end.getFullYear() + '-' + _pad(end.getMonth() + 1) + '-' + _pad(end.getDate());
    return { start: start, end: endStr, month: m, year: y };
  }

  function _genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function _getCat(catId) {
    for (var i = 0; i < state.categories.length; i++) {
      if (state.categories[i].id === catId) return state.categories[i];
    }
    return { id: 'other', name: 'Other', icon: '\uD83D\uDCE6', color: '#94a3b8' };
  }

  function _$(id) { return document.getElementById(id); }

  function _qs(sel) { return document.querySelector(sel); }

  function _qsa(sel) { return _toArray(document.querySelectorAll(sel)); }

  function _esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _fmtDate(dateStr) {
    var parts = dateStr.split('-');
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function _totalExpenses() {
    var t = 0;
    for (var i = 0; i < state.expenses.length; i++) t += state.expenses[i].amount;
    return t;
  }

  /* ---- RIPPLE ---- */
  function _ripple(e) {
    var btn = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    var y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', function () { ripple.remove(); });
  }

  /* ---- TOAST ---- */
  function showToast(message, type) {
    if (!type) type = 'success';
    var container = _$('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    var iconMap = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    toast.innerHTML = (iconMap[type] || iconMap.success) + '<span class="toast-message">' + _esc(message) + '</span><button class="toast-close">&times;</button>';
    container.appendChild(toast);
    function close() {
      toast.classList.add('toast-out');
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }
    toast.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, 3500);
  }

  /* ---- COUNTER ---- */
  function _animateCounters() {
    var els = _qsa('.count-up');
    for (var ci = 0; ci < els.length; ci++) {
      (function (el) {
        var target = parseFloat(el.getAttribute('data-target')) || 0;
        var startVal = parseFloat(el.getAttribute('data-current')) || 0;
        var duration = 800;
        var startTime = performance.now();
        function update(now) {
          var p = Math.min((now - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = startVal + (target - startVal) * eased;
          el.textContent = val.toFixed(2);
          if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      })(els[ci]);
    }
  }

  function _setCounter(sel, value) {
    var el = _qs(sel);
    if (el) {
      el.setAttribute('data-current', parseFloat(el.getAttribute('data-target')) || 0);
      el.setAttribute('data-target', value.toFixed(2));
    }
  }

  /* ---- CHARTS ---- */
  function _drawDonut(canvasId, data, colors) {
    var canvas = _$(canvasId);
    if (!canvas || !data.length) return;
    var parent = canvas.parentElement;
    var pWidth = parent ? parent.clientWidth : 240;
    var size = Math.min(pWidth - 40, 240);
    if (size < 40) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var cx = size / 2, cy = size / 2;
    var outerR = size * 0.42, innerR = size * 0.28;
    var total = 0;
    for (var di = 0; di < data.length; di++) total += data[di];
    if (total === 0) total = 1;
    ctx.clearRect(0, 0, size, size);
    var angle = -Math.PI / 2;
    for (var si = 0; si < data.length; si++) {
      var slice = (data[si] / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, angle, angle + slice);
      ctx.arc(cx, cy, innerR, angle + slice, angle, true);
      ctx.closePath();
      ctx.fillStyle = colors[si % colors.length] || '#10b981';
      ctx.fill();
      angle += slice;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10,10,15,0.6)';
    ctx.fill();
  }

  function _drawBarChart(canvasId, labels, data, color) {
    var canvas = _$(canvasId);
    if (!canvas) return;
    var parent = canvas.parentElement;
    var parentW = parent ? parent.clientWidth : 400;
    var w = Math.max(parentW - 40, 200);
    var h = 220;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var pad = { top: 20, bottom: 30, left: 10, right: 10 };
    var chartW = w - pad.left - pad.right;
    var chartH = h - pad.top - pad.bottom;
    var maxVal = 1;
    for (var bi = 0; bi < data.length; bi++) if (data[bi] > maxVal) maxVal = data[bi];
    ctx.clearRect(0, 0, w, h);
    var barCount = data.length;
    if (barCount === 0) return;
    var barGap = chartW / barCount;
    var barW = Math.min(barGap * 0.6, 30);
    var barOff = (barGap - barW) / 2;
    for (var bj = 0; bj < data.length; bj++) {
      var val = data[bj];
      var barH = (val / maxVal) * chartH;
      var x = pad.left + bj * barGap + barOff;
      var y = h - pad.bottom - barH;
      var rad = Math.min(barW / 2, 4);
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.lineTo(x + barW - rad, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + rad);
      ctx.lineTo(x + barW, h - pad.bottom - rad);
      ctx.quadraticCurveTo(x + barW, h - pad.bottom, x + barW - rad, h - pad.bottom);
      ctx.lineTo(x + rad, h - pad.bottom);
      ctx.quadraticCurveTo(x, h - pad.bottom, x, h - pad.bottom - rad);
      ctx.lineTo(x, y + rad);
      ctx.quadraticCurveTo(x, y, x + rad, y);
      ctx.closePath();
      var grad = ctx.createLinearGradient(x, y, x, h - pad.bottom);
      grad.addColorStop(0, color || '#10b981');
      grad.addColorStop(1, (color || '#10b981') + '40');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(labels[bj] || '', x + barW / 2, h - pad.bottom + 6);
      if (val > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('$' + val.toFixed(0), x + barW / 2, y - 4);
      }
    }
  }

  function _drawRing(canvas, percent, color) {
    if (!canvas) return;
    var size = 100;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var cx = size / 2, cy = size / 2, r = size * 0.38, lw = 6;
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = lw;
    ctx.stroke();
    var start = -Math.PI / 2;
    var end = start + (Math.min(percent, 100) / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.strokeStyle = color || '#10b981';
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function _drawBudgetCircle(percent) {
    var canvas = _$('budgetCircleCanvas');
    if (!canvas) return;
    var size = 200;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = '200px';
    canvas.style.height = '200px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    var cx = 100, cy = 100, r = 80, lw = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = lw;
    ctx.stroke();
    var start = -Math.PI / 2;
    var end = start + (percent / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    var color = '#10b981';
    if (percent >= 100) color = '#ef4444';
    else if (percent >= 80) color = '#f59e0b';
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  /* ---- PAGES ---- */
  var _editingId = null;

  function navigateTo(pageId) {
    var pages = _qsa('.page');
    for (var pi = 0; pi < pages.length; pi++) pages[pi].classList.remove('active');
    var navs = _qsa('.nav-item');
    for (var ni = 0; ni < navs.length; ni++) navs[ni].classList.remove('active');
    var page = _$('page-' + pageId);
    if (page) page.classList.add('active');
    var nav = _qs('.nav-item[data-page="' + pageId + '"]');
    if (nav) nav.classList.add('active');
    var titles = {
      dashboard: ['Dashboard', 'Welcome back'],
      expenses: ['Expenses', 'Manage your transactions'],
      analytics: ['Analytics', 'Insights and statistics'],
      budget: ['Budget', 'Track your spending limits'],
      settings: ['Settings', 'Customize your experience'],
    };
    var t = titles[pageId] || ['', ''];
    var titleEl = _$('page-title');
    var subEl = _$('page-subtitle');
    if (titleEl) titleEl.textContent = t[0];
    if (subEl) subEl.textContent = t[1];
    if (pageId === 'dashboard') renderDashboard();
    if (pageId === 'expenses') renderExpenses();
    if (pageId === 'analytics') renderAnalytics();
    if (pageId === 'budget') renderBudget();
    if (pageId === 'settings') renderSettings();
  }

  function openModal(id) {
    _editingId = id || null;
    var modal = _$('expense-modal');
    if (!modal) return;
    modal.classList.add('active');
    var titleEl = _$('modal-title');
    var saveBtn = _$('modal-save-btn');
    if (id) {
      if (titleEl) titleEl.textContent = 'Edit Expense';
      if (saveBtn) saveBtn.textContent = 'Update Expense';
      var exp = null;
      for (var ei = 0; ei < state.expenses.length; ei++) {
        if (state.expenses[ei].id === id) { exp = state.expenses[ei]; break; }
      }
      if (exp) {
        var amtEl = _$('expense-amount');
        var catEl = _$('expense-category');
        var dateEl = _$('expense-date');
        var descEl = _$('expense-description');
        if (amtEl) amtEl.value = exp.amount;
        if (catEl) catEl.value = exp.category;
        if (dateEl) dateEl.value = exp.date;
        if (descEl) descEl.value = exp.description || '';
      }
    } else {
      if (titleEl) titleEl.textContent = 'Add Expense';
      if (saveBtn) saveBtn.textContent = 'Save Expense';
      var amtEl2 = _$('expense-amount');
      var catEl2 = _$('expense-category');
      var dateEl2 = _$('expense-date');
      var descEl2 = _$('expense-description');
      if (amtEl2) amtEl2.value = '';
      if (catEl2) catEl2.value = state.categories[0] ? state.categories[0].id : '';
      if (dateEl2) dateEl2.value = _today();
      if (descEl2) descEl2.value = '';
    }
    var prefix = _$('modal-currency-prefix');
    if (prefix) prefix.textContent = state.currency;
  }

  function closeModal() {
    var modal = _$('expense-modal');
    if (modal) modal.classList.remove('active');
    _editingId = null;
  }

  function openBudgetModal() {
    var amtEl = _$('budget-amount');
    if (amtEl) amtEl.value = state.budget || '';
    var prefix = _$('budget-modal-prefix');
    if (prefix) prefix.textContent = state.currency;
    var modal = _$('budget-modal');
    if (modal) modal.classList.add('active');
  }

  function closeBudgetModal() {
    var modal = _$('budget-modal');
    if (modal) modal.classList.remove('active');
  }

  function openConfirm(title, message, onConfirm) {
    var dialog = _$('confirm-dialog');
    if (!dialog) return;
    var titleEl = _$('confirm-title');
    var msgEl = _$('confirm-message');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    dialog.classList.add('active');
    var ok = _$('confirm-ok');
    var cancel = _$('confirm-cancel');
    function cleanup() {
      dialog.classList.remove('active');
      if (ok) ok.removeEventListener('click', handler);
      if (cancel) cancel.removeEventListener('click', cleanup);
    }
    function handler() { cleanup(); if (onConfirm) onConfirm(); }
    if (ok) ok.addEventListener('click', handler);
    if (cancel) cancel.addEventListener('click', cleanup);
  }

  /* ---- DASHBOARD ---- */
  function renderDashboard() {
    var exps = state.expenses;
    var total = 0;
    for (var i = 0; i < exps.length; i++) total += exps[i].amount;
    var income = state.income;
    var balance = income - total;
    var savings = Math.max(balance, 0);
    var budgetRemain = Math.max((state.budget || 0) - total, 0);
    var dm = new Date();
    var dayOfMonth = dm.getDate();
    var dailyAvg = dayOfMonth > 0 ? total / dayOfMonth : 0;

    _setCounter('.stat-card[data-stat="balance"] .count-up', balance);
    _setCounter('.stat-card[data-stat="income"] .count-up', income);
    _setCounter('.stat-card[data-stat="expenses-total"] .count-up', total);
    _setCounter('.stat-card[data-stat="savings"] .count-up', savings);
    _setCounter('.stat-card[data-stat="budget-remain"] .count-up', budgetRemain);
    _setCounter('.stat-card[data-stat="daily-avg"] .count-up', dailyAvg);
    _animateCounters();

    var budgetStatus = _$('budget-status-text');
    if (budgetStatus) {
      if (state.budget > 0) {
        var pct = (total / state.budget) * 100;
        if (pct >= 100) budgetStatus.textContent = 'Exceeded!';
        else if (pct >= 80) budgetStatus.textContent = 'Almost there!';
        else budgetStatus.textContent = 'On track';
      } else {
        budgetStatus.textContent = 'Set a budget';
      }
    }

    var week = _weekBounds();
    var weekExps = [];
    for (var wi = 0; wi < exps.length; wi++) {
      if (exps[wi].date >= week.start && exps[wi].date <= week.end) weekExps.push(exps[wi]);
    }
    var weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var weekData = [];
    for (var wd = 0; wd < 7; wd++) {
      var d = new Date(week.start);
      d.setDate(d.getDate() + wd);
      var ds = d.getFullYear() + '-' + _pad(d.getMonth() + 1) + '-' + _pad(d.getDate());
      var dayTotal = 0;
      for (var we = 0; we < weekExps.length; we++) {
        if (weekExps[we].date === ds) dayTotal += weekExps[we].amount;
      }
      weekData.push(dayTotal);
    }
    _drawBarChart('weeklyChart', weekDays, weekData, '#10b981');

    var catTotals = {};
    for (var ci = 0; ci < exps.length; ci++) {
      catTotals[exps[ci].category] = (catTotals[exps[ci].category] || 0) + exps[ci].amount;
    }
    var catEntries = [];
    for (var key in catTotals) {
      if (catTotals.hasOwnProperty(key)) catEntries.push([key, catTotals[key]]);
    }
    catEntries.sort(function (a, b) { return b[1] - a[1]; });
    var topCats = catEntries.slice(0, 6);
    var donutColors = [];
    for (var dc = 0; dc < topCats.length; dc++) {
      donutColors.push(_getCat(topCats[dc][0]).color);
    }
    var donutData = [];
    for (var dd = 0; dd < topCats.length; dd++) donutData.push(topCats[dd][1]);
    _drawDonut('donutChart', donutData.length ? donutData : [1], donutColors.length ? donutColors : ['#10b981']);

    var sorted = [];
    for (var si = 0; si < exps.length; si++) sorted.push(exps[si]);
    sorted.sort(function (a, b) {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.id.localeCompare(a.id);
    });
    var recent = sorted.slice(0, 5);
    var list = _$('recent-activity-list');
    if (list) {
      if (recent.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:40px 20px"><p class="text-muted">No recent activity</p></div>';
      } else {
        var html = '';
        for (var ri = 0; ri < recent.length; ri++) {
          var e = recent[ri];
          var cat = _getCat(e.category);
          html += '<div class="activity-item">' +
            '<div class="activity-icon" style="border-color:' + cat.color + '33">' + cat.icon + '</div>' +
            '<div class="activity-info">' +
            '<h4>' + _esc(e.description || cat.name) + '</h4>' +
            '<p>' + _fmtDate(e.date) + ' \u00B7 ' + cat.name + '</p>' +
            '</div>' +
            '<div class="activity-amount" style="color:' + cat.color + '">' + state.currency + e.amount.toFixed(2) + '</div>' +
            '</div>';
        }
        list.innerHTML = html;
      }
    }

    var greet = _$('user-name');
    if (greet) {
      var hour = new Date().getHours();
      var prefix = 'Good evening';
      if (hour < 12) prefix = 'Good morning';
      else if (hour < 17) prefix = 'Good afternoon';
      greet.textContent = prefix + ', ' + state.name;
    }
  }

  /* ---- EXPENSES ---- */
  function renderExpenses() {
    var catFilter = _$('filter-category');
    var monthFilter = _$('filter-month');
    var sortEl = _$('filter-sort');
    var searchEl = _$('global-search');
    var catVal = catFilter ? catFilter.value : 'all';
    var monthVal = monthFilter ? parseInt(monthFilter.value, 10) : NaN;
    var sortVal = sortEl ? sortEl.value : 'newest';
    var searchTerm = searchEl ? (searchEl.value || '').toLowerCase() : '';

    var filtered = [];
    for (var i = 0; i < state.expenses.length; i++) {
      var e = state.expenses[i];
      if (catVal !== 'all' && e.category !== catVal) continue;
      if (!isNaN(monthVal) && monthVal >= 0) {
        var parts = e.date.split('-');
        var em = parseInt(parts[1], 10) - 1;
        if (em !== monthVal) continue;
      }
      if (searchTerm) {
        var cat = _getCat(e.category);
        var desc = (e.description || '').toLowerCase();
        var catName = cat.name.toLowerCase();
        var amtStr = e.amount.toString();
        if (desc.indexOf(searchTerm) === -1 && catName.indexOf(searchTerm) === -1 && amtStr.indexOf(searchTerm) === -1) continue;
      }
      filtered.push(e);
    }

    filtered.sort(function (a, b) {
      if (sortVal === 'oldest') return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
      if (sortVal === 'highest') return b.amount - a.amount;
      if (sortVal === 'lowest') return a.amount - b.amount;
      return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
    });

    var container = _$('expenses-list');
    if (!container) return;
    if (filtered.length === 0) {
      var empty = _$('expenses-empty');
      if (empty) {
        container.innerHTML = '';
        var clone = empty.cloneNode(true);
        clone.style.display = 'flex';
        container.appendChild(clone);
        var emptyBtn = clone.querySelector('#empty-add-btn');
        if (emptyBtn) emptyBtn.addEventListener('click', function () { openModal(null); });
      }
    } else {
      var html = '';
      for (var fi = 0; fi < filtered.length; fi++) {
        var exp = filtered[fi];
        var cat2 = _getCat(exp.category);
        html += '<div class="expense-card" style="border-left: 3px solid ' + cat2.color + '">' +
          '<div class="expense-cat-icon" style="border-color:' + cat2.color + '44">' + cat2.icon + '</div>' +
          '<div class="expense-info">' +
          '<h4>' + _esc(exp.description || cat2.name) + '</h4>' +
          '<div class="expense-meta">' +
          '<span>' + cat2.name + '</span>' +
          '<span>\u00B7</span>' +
          '<span>' + _fmtDate(exp.date) + '</span>' +
          '</div>' +
          '</div>' +
          '<div class="expense-amount" style="color:' + cat2.color + '">' + state.currency + exp.amount.toFixed(2) + '</div>' +
          '<div class="expense-actions">' +
          '<button class="icon-btn edit-btn" data-id="' + exp.id + '" title="Edit">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          '</button>' +
          '<button class="icon-btn delete-btn" data-id="' + exp.id + '" title="Delete">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
          '</button>' +
          '</div>' +
          '</div>';
      }
      container.innerHTML = html;

      var editBtns = container.querySelectorAll('.edit-btn');
      for (var eb = 0; eb < editBtns.length; eb++) {
        (function (btn) {
          btn.addEventListener('click', function () { openModal(btn.getAttribute('data-id')); });
        })(editBtns[eb]);
      }
      var delBtns = container.querySelectorAll('.delete-btn');
      for (var db = 0; db < delBtns.length; db++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-id');
            openConfirm('Delete Expense?', 'This expense will be permanently removed.', function () {
              var newExps = [];
              for (var xi = 0; xi < state.expenses.length; xi++) {
                if (state.expenses[xi].id !== id) newExps.push(state.expenses[xi]);
              }
              state.expenses = newExps;
              saveState();
              renderExpenses();
              showToast('Expense deleted', 'error');
            });
          });
        })(delBtns[db]);
      }
    }
  }

  function _populateFilters() {
    var catSel = _$('filter-category');
    var expCatSel = _$('expense-category');
    if (catSel) {
      catSel.innerHTML = '<option value="all">All Categories</option>';
      for (var ci = 0; ci < state.categories.length; ci++) {
        catSel.innerHTML += '<option value="' + state.categories[ci].id + '">' + state.categories[ci].icon + ' ' + state.categories[ci].name + '</option>';
      }
    }
    if (expCatSel) {
      expCatSel.innerHTML = '';
      for (var ei = 0; ei < state.categories.length; ei++) {
        expCatSel.innerHTML += '<option value="' + state.categories[ei].id + '">' + state.categories[ei].icon + ' ' + state.categories[ei].name + '</option>';
      }
    }
  }

  /* ---- ANALYTICS ---- */
  function renderAnalytics() {
    var exps = state.expenses;
    var total = 0;
    for (var i = 0; i < exps.length; i++) total += exps[i].amount;
    var income = state.income;
    var month = _monthBounds();
    var monthTotal = 0;
    for (var mi = 0; mi < exps.length; mi++) {
      if (exps[mi].date >= month.start && exps[mi].date <= month.end) monthTotal += exps[mi].amount;
    }
    var highest = 0, lowest = Infinity;
    for (var hi = 0; hi < exps.length; hi++) {
      if (exps[hi].amount > highest) highest = exps[hi].amount;
      if (exps[hi].amount < lowest) lowest = exps[hi].amount;
    }
    if (exps.length === 0) { highest = 0; lowest = 0; }
    var dm = new Date();
    var dayOfMonth = dm.getDate();
    var dailyAvg = dayOfMonth > 0 ? total / dayOfMonth : 0;
    var week = _weekBounds();
    var weekTotal = 0;
    for (var wi = 0; wi < exps.length; wi++) {
      if (exps[wi].date >= week.start && exps[wi].date <= week.end) weekTotal += exps[wi].amount;
    }

    var catTotals = {};
    for (var ci = 0; ci < exps.length; ci++) {
      catTotals[exps[ci].category] = (catTotals[exps[ci].category] || 0) + exps[ci].amount;
    }
    var mostUsed = { name: 'N/A', amount: 0 };
    for (var mk in catTotals) {
      if (catTotals.hasOwnProperty(mk) && catTotals[mk] > mostUsed.amount) {
        mostUsed = { name: _getCat(mk).name, amount: catTotals[mk] };
      }
    }
    var savingsRate = income > 0 ? ((income - total) / income * 100) : 0;

    var statsEl = _$('stats-details');
    if (statsEl) {
      statsEl.innerHTML =
        '<div class="stat-detail-item"><span class="stat-detail-label">Total Expenses</span><span class="stat-detail-value">' + state.currency + total.toFixed(2) + '</span></div>' +
        '<div class="stat-detail-item"><span class="stat-detail-label">This Month</span><span class="stat-detail-value">' + state.currency + monthTotal.toFixed(2) + '</span></div>' +
        '<div class="stat-detail-item"><span class="stat-detail-label">This Week</span><span class="stat-detail-value">' + state.currency + weekTotal.toFixed(2) + '</span></div>' +
        '<div class="stat-detail-item"><span class="stat-detail-label">Average Daily</span><span class="stat-detail-value">' + state.currency + dailyAvg.toFixed(2) + '</span></div>' +
        '<div class="stat-detail-item"><span class="stat-detail-label">Highest Expense</span><span class="stat-detail-value">' + state.currency + highest.toFixed(2) + '</span></div>' +
        '<div class="stat-detail-item"><span class="stat-detail-label">Lowest Expense</span><span class="stat-detail-value">' + state.currency + lowest.toFixed(2) + '</span></div>' +
        '<div class="stat-detail-item"><span class="stat-detail-label">Most Used Category</span><span class="stat-detail-value">' + mostUsed.name + '</span></div>' +
        '<div class="stat-detail-item"><span class="stat-detail-label">Savings Rate</span><span class="stat-detail-value" style="color:' + (savingsRate >= 0 ? '#10b981' : '#ef4444') + '">' + savingsRate.toFixed(1) + '%</span></div>' +
        '<div class="stat-detail-item"><span class="stat-detail-label">Transactions</span><span class="stat-detail-value">' + exps.length + '</span></div>';
    }

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var monthlyData = [];
    for (var mm = 0; mm < 12; mm++) {
      var y = month.year;
      var ms = y + '-' + _pad(mm + 1) + '-01';
      var me = new Date(y, mm + 1, 0);
      var meStr = me.getFullYear() + '-' + _pad(me.getMonth() + 1) + '-' + _pad(me.getDate());
      var mt = 0;
      for (var mx = 0; mx < exps.length; mx++) {
        if (exps[mx].date >= ms && exps[mx].date <= meStr) mt += exps[mx].amount;
      }
      monthlyData.push(mt);
    }
    _drawBarChart('monthlyBarChart', months, monthlyData, '#06b6d4');

    var catEntries = [];
    for (var ck in catTotals) {
      if (catTotals.hasOwnProperty(ck)) catEntries.push([ck, catTotals[ck]]);
    }
    catEntries.sort(function (a, b) { return b[1] - a[1]; });
    var catColors = [];
    var catData = [];
    for (var ce = 0; ce < catEntries.length; ce++) {
      catColors.push(_getCat(catEntries[ce][0]).color);
      catData.push(catEntries[ce][1]);
    }
    _drawDonut('analyticsDonutChart', catData.length ? catData : [1], catColors.length ? catColors : ['#10b981']);

    var ringsEl = _$('category-rings');
    if (ringsEl) {
      var ringsHtml = '';
      for (var ri = 0; ri < catEntries.length; ri++) {
        var cat = _getCat(catEntries[ri][0]);
        var pct = total > 0 ? (catEntries[ri][1] / total) * 100 : 0;
        ringsHtml += '<div class="category-ring-item">' +
          '<canvas id="ring-' + cat.id + '" width="100" height="100"></canvas>' +
          '<span class="category-ring-label">' + cat.icon + ' ' + cat.name + '</span>' +
          '<span class="category-ring-value">' + pct.toFixed(0) + '%</span>' +
          '</div>';
      }
      ringsEl.innerHTML = ringsHtml;
      for (var rj = 0; rj < catEntries.length; rj++) {
        var pct2 = total > 0 ? (catEntries[rj][1] / total) * 100 : 0;
        _drawRing(_$('ring-' + catEntries[rj][0]), pct2, _getCat(catEntries[rj][0]).color);
      }
    }
  }

  /* ---- BUDGET ---- */
  function renderBudget() {
    var total = _totalExpenses();
    var budget = state.budget || 0;
    var percent = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
    var remaining = Math.max(budget - total, 0);
    var dm = new Date();
    var dayOfMonth = dm.getDate();
    var daily = dayOfMonth > 0 ? total / dayOfMonth : 0;

    var amtDisp = _$('budget-amount-display');
    var spentDisp = _$('budget-spent-display');
    var remainDisp = _$('budget-remaining-display');
    var dailyDisp = _$('budget-daily-display');
    var pctText = _$('budget-percent-text');
    if (amtDisp) amtDisp.textContent = state.currency + budget.toFixed(2);
    if (spentDisp) spentDisp.textContent = state.currency + total.toFixed(2);
    if (remainDisp) remainDisp.textContent = state.currency + remaining.toFixed(2);
    if (dailyDisp) dailyDisp.textContent = state.currency + daily.toFixed(2);
    if (pctText) pctText.textContent = percent.toFixed(0) + '%';

    _drawBudgetCircle(percent);

    var fill = _$('budget-progress-fill');
    var actualPct = budget > 0 ? (total / budget) * 100 : 0;
    if (fill) {
      fill.style.width = percent + '%';
      fill.classList.remove('warning', 'danger');
      if (actualPct >= 100) fill.classList.add('danger');
      else if (actualPct >= 80) fill.classList.add('warning');
    }

    var catBudgets = _$('category-budgets');
    if (catBudgets) {
      var catTotals = {};
      for (var i = 0; i < state.expenses.length; i++) {
        catTotals[state.expenses[i].category] = (catTotals[state.expenses[i].category] || 0) + state.expenses[i].amount;
      }
      var keys = Object.keys(catTotals);
      if (keys.length === 0) {
        catBudgets.innerHTML = '<p class="text-muted" style="padding:12px;text-align:center">No expenses yet</p>';
      } else {
        var entries = [];
        for (var k = 0; k < keys.length; k++) entries.push([keys[k], catTotals[keys[k]]]);
        entries.sort(function (a, b) { return b[1] - a[1]; });
        var html = '';
        for (var ej = 0; ej < entries.length; ej++) {
          var cat = _getCat(entries[ej][0]);
          var pct2 = budget > 0 ? (entries[ej][1] / budget) * 100 : 0;
          html += '<div style="margin-bottom: 14px;">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.85rem">' +
            '<span>' + cat.icon + ' ' + cat.name + '</span>' +
            '<span style="font-weight:600">' + state.currency + entries[ej][1].toFixed(2) + ' <span style="font-weight:400;color:var(--text-muted);font-size:0.75rem">(' + pct2.toFixed(0) + '%)</span></span>' +
            '</div>' +
            '<div class="budget-progress-bar">' +
            '<div class="budget-progress-fill" style="width:' + pct2 + '%;background:' + cat.color + '"></div>' +
            '</div>' +
            '</div>';
        }
        catBudgets.innerHTML = html;
      }
    }
  }

  /* ---- SETTINGS ---- */
  function renderSettings() {
    var nameEl = _$('settings-name');
    var dispName = _$('settings-display-name');
    var setAvatar = _$('settings-avatar');
    var sideAvatar = _$('sidebar-avatar');
    var currEl = _$('currency-select');
    var incEl = _$('income-input');

    if (nameEl) nameEl.value = state.name;
    if (dispName) dispName.textContent = state.name;
    var initial = state.name.charAt(0).toUpperCase();
    if (setAvatar) setAvatar.textContent = initial;
    if (sideAvatar) sideAvatar.textContent = initial;
    if (currEl) currEl.value = state.currency;
    if (incEl) incEl.value = state.income || '';

    var swatches = _qsa('.swatch');
    for (var si = 0; si < swatches.length; si++) {
      var sw = swatches[si];
      if (sw.getAttribute('data-color') === state.accent) {
        sw.classList.add('active');
      } else {
        sw.classList.remove('active');
      }
    }
  }

  /* ---- EXPORT / IMPORT ---- */
  function exportCSV() {
    if (state.expenses.length === 0) {
      showToast('No expenses to export', 'error');
      return;
    }
    var rows = ['Amount,Category,Date,Description'];
    for (var i = 0; i < state.expenses.length; i++) {
      var e = state.expenses[i];
      var cat = _getCat(e.category);
      var desc = (e.description || '').replace(/"/g, '""');
      rows.push(e.amount + ',"' + cat.name + '",' + e.date + ',"' + desc + '"');
    }
    var csv = rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'finwise_expenses_' + _today() + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Expenses exported successfully');
  }

  function importCSV(file) {
    var reader = new FileReader();
    reader.onload = function (evt) {
      try {
        var text = evt.target.result;
        var lines = [];
        var allLines = text.split('\n');
        for (var li = 0; li < allLines.length; li++) {
          if (allLines[li].trim()) lines.push(allLines[li]);
        }
        if (lines.length < 2) { showToast('Invalid CSV file', 'error'); return; }
        var imported = [];
        for (var r = 1; r < lines.length; r++) {
          var line = lines[r];
          var fields = [];
          var current = '';
          var inQuotes = false;
          for (var ch = 0; ch < line.length; ch++) {
            var c = line[ch];
            if (c === '"') { inQuotes = !inQuotes; }
            else if (c === ',' && !inQuotes) { fields.push(current); current = ''; }
            else { current += c; }
          }
          fields.push(current);
          if (fields.length >= 3) {
            var amount = parseFloat(fields[0].trim());
            var catName = fields[1].trim();
            var date = fields[2].trim();
            var desc = fields.slice(3).join(',').trim();
            var cat = null;
            for (var cx = 0; cx < state.categories.length; cx++) {
              if (state.categories[cx].name.toLowerCase() === catName.toLowerCase()) { cat = state.categories[cx]; break; }
            }
            if (!cat) cat = state.categories[0];
            if (!isNaN(amount) && date && cat) {
              imported.push({ id: _genId(), amount: amount, category: cat.id, date: date, description: desc });
            }
          }
        }
        if (imported.length === 0) { showToast('No valid expenses found in CSV', 'error'); return; }
        state.expenses = state.expenses.concat(imported);
        saveState();
        var active = _qs('.page.active');
        if (active) navigateTo(active.id.replace('page-', ''));
        showToast('Imported ' + imported.length + ' expenses');
      } catch (err) {
        showToast('Error importing CSV', 'error');
      }
    };
    reader.readAsText(file);
  }

  /* ---- THEME / ACCENT ---- */
  function applyTheme() {
    document.body.classList.toggle('light', state.theme === 'light');
  }

  function applyAccent() {
    var colors = {
      emerald: '#10b981', cyan: '#06b6d4', blue: '#3b82f6',
      purple: '#8b5cf6', gold: '#f59e0b', pink: '#ec4899',
    };
    var c = colors[state.accent] || '#10b981';
    document.documentElement.style.setProperty('--accent', c);
    document.documentElement.style.setProperty('--accent-hover', c + 'cc');
  }

  /* ---- STREAK ---- */
  function updateStreak() {
    var today = _today();
    if (state.lastActive !== today) {
      var hasToday = false;
      for (var i = 0; i < state.expenses.length; i++) {
        if (state.expenses[i].date === today) { hasToday = true; break; }
      }
      if (hasToday) {
        state.lastActive = today;
        state.streak = (state.streak || 0) + 1;
        saveState();
      }
    }
  }

  /* ---- INIT ---- */
  function init() {
    try {
      loadState();

      populateCategoryFilterFallback: _populateFilters();

      setTimeout(function () {
        var loader = _$('app-loader');
        var app = _$('app');
        if (loader) loader.classList.add('hidden');
        if (app) {
          app.classList.remove('hidden');
          app.classList.add('visible');
        }
      }, 600);

      navigateTo('dashboard');

      updateStreak();

      /* ---- ATTACH ALL EVENT LISTENERS ---- */
      var navItems = _qsa('.nav-item');
      for (var ni = 0; ni < navItems.length; ni++) {
        (function (item) {
          item.addEventListener('click', function (e) {
            e.preventDefault();
            var page = item.getAttribute('data-page');
            navigateTo(page);
            if (window.innerWidth <= 768) {
              var sb = _$('sidebar');
              if (sb) sb.classList.remove('open');
            }
          });
        })(navItems[ni]);
      }

      var menuBtn = _$('mobile-menu-btn');
      if (menuBtn) {
        menuBtn.addEventListener('click', function () {
          var sb = _$('sidebar');
          if (sb) sb.classList.toggle('open');
        });
      }

      var themeBtn = _$('theme-switch');
      if (themeBtn) {
        themeBtn.addEventListener('click', function () {
          state.theme = state.theme === 'dark' ? 'light' : 'dark';
          applyTheme();
          saveState();
          if (_qs('#page-settings.active')) renderSettings();
        });
      }

      var quickAdd = _$('quick-add-btn');
      var addExp = _$('add-expense-btn');
      var emptyAdd = _$('empty-add-btn');
      if (quickAdd) quickAdd.addEventListener('click', function () { openModal(null); });
      if (addExp) addExp.addEventListener('click', function () { openModal(null); });
      if (emptyAdd) emptyAdd.addEventListener('click', function () { openModal(null); });

      var modalCloses = _qsa('.modal-close');
      for (var mc = 0; mc < modalCloses.length; mc++) {
        modalCloses[mc].addEventListener('click', function () {
          closeModal();
          closeBudgetModal();
        });
      }

      var modalCancel = _$('modal-cancel-btn');
      var budgetCancel = _$('budget-cancel-btn');
      if (modalCancel) modalCancel.addEventListener('click', closeModal);
      if (budgetCancel) budgetCancel.addEventListener('click', closeBudgetModal);

      var modalSave = _$('modal-save-btn');
      if (modalSave) {
        modalSave.addEventListener('click', function () {
          var amtEl = _$('expense-amount');
          var catEl = _$('expense-category');
          var dateEl = _$('expense-date');
          var descEl = _$('expense-description');
          var amount = parseFloat(amtEl ? amtEl.value : '');
          var category = catEl ? catEl.value : '';
          var date = dateEl ? dateEl.value : '';
          var description = descEl ? descEl.value.trim() : '';

          if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
          if (!date) { showToast('Please select a date', 'error'); return; }

          if (_editingId) {
            var idx = -1;
            for (var si = 0; si < state.expenses.length; si++) {
              if (state.expenses[si].id === _editingId) { idx = si; break; }
            }
            if (idx >= 0) {
              state.expenses[idx].amount = amount;
              state.expenses[idx].category = category;
              state.expenses[idx].date = date;
              state.expenses[idx].description = description;
              showToast('Expense updated');
            }
          } else {
            state.expenses.push({ id: _genId(), amount: amount, category: category, date: date, description: description });
            showToast('Expense added');
          }
          saveState();
          closeModal();
          var active = _qs('.page.active');
          if (active) navigateTo(active.id.replace('page-', ''));
        });
      }

      var budgetSave = _$('budget-save-btn');
      if (budgetSave) {
        budgetSave.addEventListener('click', function () {
          var amtEl = _$('budget-amount');
          var amt = parseFloat(amtEl ? amtEl.value : '');
          if (isNaN(amt) || amt < 0) { showToast('Please enter a valid budget amount', 'error'); return; }
          state.budget = amt;
          saveState();
          closeBudgetModal();
          navigateTo('budget');
          showToast('Budget updated');
        });
      }

      var setBudget = _$('set-budget-btn');
      if (setBudget) setBudget.addEventListener('click', openBudgetModal);

      var settingsName = _$('settings-name');
      if (settingsName) {
        settingsName.addEventListener('input', function (e) {
          state.name = e.target.value.trim() || 'User';
          saveState();
          renderSettings();
        });
      }

      var currencySel = _$('currency-select');
      if (currencySel) {
        currencySel.addEventListener('change', function (e) {
          state.currency = e.target.value;
          saveState();
          var active = _qs('.page.active');
          if (active) navigateTo(active.id.replace('page-', ''));
          showToast('Currency updated');
        });
      }

      var incomeInput = _$('income-input');
      if (incomeInput) {
        incomeInput.addEventListener('change', function (e) {
          state.income = parseFloat(e.target.value) || 0;
          saveState();
          var active = _qs('.page.active');
          if (active) navigateTo(active.id.replace('page-', ''));
        });
      }

      var swatches = _qsa('.swatch');
      for (var swi = 0; swi < swatches.length; swi++) {
        (function (sw) {
          sw.addEventListener('click', function () {
            state.accent = sw.getAttribute('data-color');
            applyAccent();
            saveState();
            renderSettings();
            showToast('Accent color updated');
          });
        })(swatches[swi]);
      }

      var exportBtn = _$('export-csv-btn');
      var exportDataBtn = _$('export-data-btn');
      if (exportBtn) exportBtn.addEventListener('click', exportCSV);
      if (exportDataBtn) exportDataBtn.addEventListener('click', exportCSV);

      var importBtn = _$('import-csv-btn');
      var csvInput = _$('csv-input');
      if (importBtn && csvInput) {
        importBtn.addEventListener('click', function () { csvInput.click(); });
        csvInput.addEventListener('change', function (e) {
          if (e.target.files && e.target.files.length) {
            importCSV(e.target.files[0]);
            e.target.value = '';
          }
        });
      }

      var resetBtn = _$('reset-data-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          openConfirm('Reset All Data?', 'This will permanently delete all expenses and settings.', function () {
            localStorage.removeItem('finwise_state');
            state = defaultState();
            saveState();
            navigateTo('dashboard');
            showToast('All data reset', 'info');
          });
        });
      }

      var filterCat = _$('filter-category');
      var filterMonth = _$('filter-month');
      var filterSort = _$('filter-sort');
      if (filterCat) filterCat.addEventListener('change', renderExpenses);
      if (filterMonth) filterMonth.addEventListener('change', renderExpenses);
      if (filterSort) filterSort.addEventListener('change', renderExpenses);

      var searchEl = _$('global-search');
      var searchTimeout;
      if (searchEl) {
        searchEl.addEventListener('input', function () {
          if (searchTimeout) clearTimeout(searchTimeout);
          searchTimeout = setTimeout(function () {
            var active = _qs('.page.active');
            if (active && active.id === 'page-expenses') renderExpenses();
          }, 200);
        });
      }

      /* Close modals on overlay click */
      var overlays = _qsa('.modal-overlay');
      for (var oi = 0; oi < overlays.length; oi++) {
        (function (overlay) {
          overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
              closeModal();
              closeBudgetModal();
            }
          });
        })(overlays[oi]);
      }

      /* Close confirm on overlay click */
      document.addEventListener('click', function (e) {
        var dialog = _$('confirm-dialog');
        if (dialog && e.target.classList.contains('confirm-overlay') && e.target === dialog) {
          dialog.classList.remove('active');
        }
      });

      /* Close sidebar on outside click */
      document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          var sb = _$('sidebar');
          var btn = _$('mobile-menu-btn');
          if (sb && btn && !sb.contains(e.target) && !btn.contains(e.target)) {
            sb.classList.remove('open');
          }
        }
      });

      /* View-all link */
      var viewAll = _qs('.view-all');
      if (viewAll) {
        viewAll.addEventListener('click', function (e) {
          e.preventDefault();
          navigateTo('expenses');
        });
      }

      /* Window resize */
      var resizeTimer;
      window.addEventListener('resize', function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          var active = _qs('.page.active');
          if (active) navigateTo(active.id.replace('page-', ''));
        }, 200);
      });

      /* Keyboard shortcuts (single handler) */
      document.addEventListener('keydown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.key) {
          case 'n': case 'N':
            e.preventDefault();
            openModal(null);
            break;
          case '/':
            e.preventDefault();
            if (searchEl) searchEl.focus();
            break;
          case 'Escape':
            closeModal();
            closeBudgetModal();
            var dialog2 = _$('confirm-dialog');
            if (dialog2) dialog2.classList.remove('active');
            break;
          case 't': case 'T':
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            applyTheme();
            saveState();
            if (_qs('#page-settings.active')) renderSettings();
            break;
          case 'e': case 'E':
            e.preventDefault();
            exportCSV();
            break;
        }
      });

      /* Attach ripple to all .btn elements */
      var allBtns = _qsa('.btn');
      for (var ab = 0; ab < allBtns.length; ab++) {
        allBtns[ab].addEventListener('click', _ripple);
      }

    } catch (err) {
      console.error('Finwise init error:', err);
      showToast('Something went wrong. Please refresh the page.', 'error');
    }
  }

  /* Boot: check if DOM is already ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('pageshow', function () {
    if (document.readyState !== 'loading') init();
  });

})();
