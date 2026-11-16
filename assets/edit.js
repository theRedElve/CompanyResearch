/* 编辑页：读取 ?id= 加载企业，实时预览，保存回写 localStorage */

(function () {
  const el = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  const original = loadCompanies().find(c => c.id === id);

  if (!original) {
    el('editForm').innerHTML = '<div class="empty">未找到这家企业，可能已被删除。<a class="linkish" href="library.html">返回企业库</a></div>';
    el('editTitle').textContent = '企业不存在';
    return;
  }

  const form = el('editForm');
  const posPicks = el('posPicks');
  const industryOptions = el('industryOptions');

  let picked = new Set(original.position || []);
  let attachments = (original.attachments || []).slice();

  const attachList = el('attachList');
  const fileInput = el('fileInput');
  const dropzone = el('dropzone');

  /* 行业下拉候选 */
  const industries = [];
  loadCompanies().forEach(c => {
    if (c.industry && industries.indexOf(c.industry) < 0) industries.push(c.industry);
  });
  industryOptions.innerHTML = industries.map(n => '<option value="' + escapeHtml(n) + '">').join('');

  /* 回填 */
  el('fName').value = original.name || '';
  el('fEn').value = original.en || '';
  el('fIndustry').value = original.industry || '';
  el('fRegion').value = original.region || '';
  el('fFounded').value = original.founded || '';
  el('fListing').value = original.listing || '';
  el('updatedAt').textContent = original.updated || '—';
  el('editTitle').textContent = original.name + ' · 编辑档案';

  /* 定位选择 */
  function renderPicks() {
    posPicks.innerHTML = POSITIONS.map(p =>
      '<button type="button" class="chip' + (picked.has(p) ? ' on' : '') + '" data-pick="' + p + '">' + p + '</button>'
    ).join('');
  }
  renderPicks();

  posPicks.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-pick]');
    if (!btn) return;
    const p = btn.dataset.pick;
    if (picked.has(p)) picked.delete(p); else picked.add(p);
    renderPicks();
  });

  /* 草稿 */
  function draft() {
    return Object.assign({}, original, {
      name: el('fName').value.trim() || original.name,
      en: el('fEn').value.trim(),
      industry: el('fIndustry').value.trim(),
      region: el('fRegion').value.trim(),
      founded: el('fFounded').value.trim(),
      listing: el('fListing').value.trim(),
      position: Array.from(picked),
      attachments: attachments,
      updated: today()
    });
  }

  function refreshTitle() {
    el('editTitle').textContent = (el('fName').value.trim() || original.name) + ' · 编辑档案';
  }

  el('fName').addEventListener('input', refreshTitle);

  /* 附件 */
  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function totalAttachSize() {
    return attachments.reduce((sum, a) => sum + (a.size || 0), 0);
  }

  function renderAttachments() {
    if (!attachments.length) {
      attachList.innerHTML = '<p class="attach-empty">暂无附件</p>';
      return;
    }
    attachList.innerHTML = attachments.map(a => [
      '<div class="attach-item">',
      '  <span class="attach-name" title="' + escapeHtml(a.name) + '">' + escapeHtml(a.name) + '</span>',
      '  <span class="attach-size">' + fmtSize(a.size || 0) + '</span>',
      '  <span class="attach-actions">',
      '    <button type="button" class="link-btn" data-attach-dl="' + escapeHtml(a.id) + '">下载</button>',
      '    <button type="button" class="link-btn danger-text" data-attach-rm="' + escapeHtml(a.id) + '">移除</button>',
      '  </span>',
      '</div>'
    ].join('')).join('');
  }

  const MAX_ONE = 2 * 1024 * 1024;
  const MAX_TOTAL = 5 * 1024 * 1024;

  function addFiles(files) {
    Array.from(files).forEach(file => {
      if (file.size > MAX_ONE) { toast(file.name + ' 超过 2 MB，未上传'); return; }
      if (totalAttachSize() + file.size > MAX_TOTAL) { toast('附件合计超过 5 MB，未上传 ' + file.name); return; }
      const reader = new FileReader();
      reader.onload = function () {
        attachments.push({
          id: uid(),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result,
          addedAt: today()
        });
        renderAttachments();
        toast('已添加附件，保存后生效');
      };
      reader.onerror = function () { toast('读取 ' + file.name + ' 失败'); };
      reader.readAsDataURL(file);
    });
  }

  fileInput.addEventListener('change', function () {
    addFiles(fileInput.files);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropzone.classList.add('drag');
    });
  });

  ['dragleave', 'drop'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropzone.classList.remove('drag');
    });
  });

  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  attachList.addEventListener('click', function (e) {
    const dl = e.target.closest('[data-attach-dl]');
    if (dl) {
      const file = attachments.find(x => x.id === dl.dataset.attachDl);
      if (!file) return;
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    const rm = e.target.closest('[data-attach-rm]');
    if (rm) {
      attachments = attachments.filter(x => x.id !== rm.dataset.attachRm);
      renderAttachments();
      toast('已移除附件，保存后生效');
    }
  });

  renderAttachments();

  /* 保存 */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const next = draft();

    const others = loadCompanies().filter(c => c.id !== next.id);
    if (JSON.stringify(others.concat([next])).length > 4.5 * 1024 * 1024) {
      toast('附件过大，超出浏览器本地存储上限');
      return;
    }

    upsertCompany(next);
    toast('已保存「' + next.name + '」');
    setTimeout(() => { location.href = 'library.html'; }, 400);
  });

  /* 下载 / 取消 / 删除 */
  el('dlBtn').addEventListener('click', function () {
    const next = draft();
    downloadFile(next.name + '-调研档案.md', buildMarkdown(next, true));
    toast('已生成 Markdown');
  });

  el('cancelBtn').addEventListener('click', function () {
    location.href = 'library.html';
  });

  el('deleteBtn').addEventListener('click', function () {
    if (confirm('确定删除「' + original.name + '」？此操作仅影响本地浏览器数据。')) {
      deleteCompany(original.id);
      location.href = 'library.html';
    }
  });
})();
