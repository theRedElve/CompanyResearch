/* 企业信息库：筛选、网格渲染、添加弹窗 */

(function () {
  const state = { industry: 'all', position: 'all' };

  const grid = document.getElementById('grid');
  const industryBox = document.getElementById('industryFilters');
  const positionBox = document.getElementById('positionFilters');
  const countEl = document.getElementById('count');
  const totalEl = document.getElementById('total');
  const overlay = document.getElementById('overlay');
  const form = document.getElementById('companyForm');
  const posPicks = document.getElementById('posPicks');
  const industryOptions = document.getElementById('industryOptions');

  let pickedPositions = new Set();

  /* ---------- 筛选器 ---------- */

  function renderFilters(list) {
    const industries = [];
    list.forEach(c => { if (c.industry && industries.indexOf(c.industry) < 0) industries.push(c.industry); });

    if (state.industry !== 'all' && industries.indexOf(state.industry) < 0) state.industry = 'all';

    const indChips = ['<button class="chip' + (state.industry === 'all' ? ' on' : '') + '" data-ind="all">全部</button>'];
    industries.forEach(name => {
      indChips.push('<button class="chip' + (state.industry === name ? ' on' : '') + '" data-ind="' + escapeHtml(name) + '">' + escapeHtml(name) + '</button>');
    });
    industryBox.innerHTML = indChips.join('');

    const posChips = ['<button class="chip' + (state.position === 'all' ? ' on' : '') + '" data-pos="all">全部</button>'];
    POSITIONS.forEach(p => {
      posChips.push('<button class="chip' + (state.position === p ? ' on' : '') + '" data-pos="' + p + '">' + p + '</button>');
    });
    positionBox.innerHTML = posChips.join('');

    industryOptions.innerHTML = industries.map(n => '<option value="' + escapeHtml(n) + '">').join('');
  }

  industryBox.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-ind]');
    if (!btn) return;
    state.industry = btn.dataset.ind;
    render();
  });

  positionBox.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-pos]');
    if (!btn) return;
    state.position = btn.dataset.pos;
    render();
  });

  /* ---------- 卡片 ---------- */

  function addCardHtml() {
    return [
      '<button class="add-card" id="addCard" type="button">',
      '  <span class="add-plus">+</span>',
      '  <span>添加企业</span>',
      '</button>'
    ].join('');
  }

  function filtered(list) {
    return list.filter(c => {
      const okInd = state.industry === 'all' || c.industry === state.industry;
      const okPos = state.position === 'all' || (c.position || []).indexOf(state.position) >= 0;
      return okInd && okPos;
    });
  }

  function render() {
    const all = loadCompanies();
    renderFilters(all);

    const list = filtered(all);
    totalEl.textContent = all.length;
    countEl.textContent = list.length;

    if (!list.length) {
      grid.innerHTML = addCardHtml() + '<div class="empty">当前筛选下没有企业，换个行业或定位试试。</div>';
    } else {
      grid.innerHTML = addCardHtml() + list.map((c, i) => companyCardHtml(c, i)).join('');
    }

    const addBtn = document.getElementById('addCard');
    if (addBtn) addBtn.addEventListener('click', openModal);
  }

  /* ---------- 卡片操作 ---------- */

  grid.addEventListener('click', function (e) {
    const dl = e.target.closest('[data-dl]');
    if (dl) {
      const c = loadCompanies().find(x => x.id === dl.dataset.dl);
      if (c) {
        downloadFile(c.name + '-调研档案.md', buildMarkdown(c, true));
        toast('已下载 ' + c.name + ' 的档案');
      }
      return;
    }

    const del = e.target.closest('[data-del]');
    if (del) {
      const c = loadCompanies().find(x => x.id === del.dataset.del);
      if (!c) return;
      if (confirm('确定删除「' + c.name + '」？此操作仅影响本地浏览器数据。')) {
        deleteCompany(c.id);
        render();
        toast('已删除');
      }
      return;
    }

    const card = e.target.closest('.company-card');
    if (card && card.dataset.id) {
      location.href = 'edit.html?id=' + encodeURIComponent(card.dataset.id);
    }
  });

  /* ---------- 弹窗 ---------- */

  function renderPosPicks() {
    posPicks.innerHTML = POSITIONS.map(p =>
      '<button type="button" class="chip' + (pickedPositions.has(p) ? ' on' : '') + '" data-pick="' + p + '">' + p + '</button>'
    ).join('');
  }

  posPicks.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-pick]');
    if (!btn) return;
    const p = btn.dataset.pick;
    if (pickedPositions.has(p)) pickedPositions.delete(p);
    else pickedPositions.add(p);
    renderPosPicks();
  });

  function openModal() {
    form.reset();
    pickedPositions = new Set();
    renderPosPicks();
    overlay.hidden = false;
    setTimeout(() => document.getElementById('fName').focus(), 60);
  }

  function closeModal() { overlay.hidden = true; }

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    if (!name) return;

    const existing = loadCompanies().find(c => c.name === name);
    const brands = String(fd.get('brands') || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
    const revenue = String(fd.get('revenue') || '').trim();

    const company = {
      id: existing ? existing.id : uid(),
      name: name,
      en: String(fd.get('en') || '').trim(),
      industry: String(fd.get('industry') || '').trim(),
      position: Array.from(pickedPositions),
      region: String(fd.get('region') || '').trim(),
      founded: String(fd.get('founded') || '').trim(),
      listing: String(fd.get('listing') || '').trim(),
      revenue: revenue,
      employees: String(fd.get('employees') || '').trim(),
      desc: String(fd.get('desc') || '').trim(),
      businessLines: [],
      revenueHistory: revenue ? [{ fy: '最新财年', amount: revenue, yoy: PLACEHOLDER, source: PLACEHOLDER }] : [],
      brands: brands.map(b => ({ name: b, note: PLACEHOLDER })),
      chinaStaff: PLACEHOLDER,
      chinaInvestment: PLACEHOLDER,
      chinaEntities: PLACEHOLDER,
      sources: [PLACEHOLDER],
      updated: today()
    };

    upsertCompany(company);
    closeModal();
    render();
    toast(existing ? '已更新「' + name + '」' : '已添加「' + name + '」');
  });

  render();
})();
