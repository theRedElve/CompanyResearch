/* 生成页交互：输入企业名 → 命中企业库则填充，否则生成待确认模板 */

(function () {
  const form = document.getElementById('genForm');
  const input = document.getElementById('companyInput');
  const result = document.getElementById('result');
  const resultName = document.getElementById('resultName');
  const badge = document.getElementById('resultBadge');
  const mdView = document.getElementById('mdView');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  let current = { name: '', text: '' };

  function run(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return;

    const hit = matchCompany(trimmed);
    const company = hit || { name: trimmed, position: [] };
    const md = buildMarkdown(company, !!hit);

    current = { name: company.name, text: md };

    resultName.textContent = company.name;
    badge.textContent = hit ? '已收录' : '未收录 · 空白模板';
    badge.className = 'badge ' + (hit ? 'hit' : 'miss');
    mdView.textContent = md;

    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    run(input.value);
  });

  document.querySelectorAll('.linkish').forEach(function (btn) {
    btn.addEventListener('click', function () {
      input.value = btn.dataset.name;
      run(btn.dataset.name);
    });
  });

  copyBtn.addEventListener('click', function () {
    if (!current.text) return;
    const done = function () { toast('已复制到剪贴板'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(current.text).then(done).catch(function () { fallbackCopy(current.text, done); });
    } else {
      fallbackCopy(current.text, done);
    }
  });

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) { toast('复制失败，请手动选择'); }
    ta.remove();
  }

  downloadBtn.addEventListener('click', function () {
    if (!current.text) return;
    downloadFile(current.name + '-调研档案.md', current.text);
    toast('已生成 Markdown 文件');
  });
})();
