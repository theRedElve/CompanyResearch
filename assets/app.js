/* ==========================================================
   调研档案室 · 共享数据层
   数据存于 localStorage；首次访问写入 3 家示例企业
   ========================================================== */

const STORE_KEY = 'research_desk_companies_v1';
const PLACEHOLDER = '[待与目标公司沟通确认]';

const POSITIONS = ['ToC', 'ToB', 'ToG', 'SaaS'];

const SEED = [
  {
    id: 'catl',
    name: '宁德时代',
    en: 'CATL',
    industry: '动力电池',
    position: ['ToB'],
    region: '中国·福建宁德',
    founded: '2011 年 12 月',
    listing: '深交所 300750 / 港交所 3750',
    revenue: '4,237 亿元',
    employees: '185,839 人（全球）',
    desc: '动力电池与储能电池制造商，动力电池使用量连续九年全球第一。',
    businessLines: [
      { name: '动力电池系统', share: '74.70%', note: '2025 年营收 3,165.06 亿元，同比 +25.08%', source: '2025 年报，2026-03' },
      { name: '储能电池系统', share: '14.70%', note: '2025 年营收 624.40 亿元，毛利率 26.71%', source: '2025 年报，2026-03' },
      { name: '电池材料及回收', share: '约 5.2%', note: '2025 年营收约 219 亿元', source: '2025 年报，2026-03' }
    ],
    revenueHistory: [
      { fy: 'FY2025', amount: '4,237.02 亿元', yoy: '+17.04%', source: '年报' },
      { fy: 'FY2024', amount: '3,620.13 亿元', yoy: '−9.71%', source: '年报' },
      { fy: 'FY2023', amount: '4,009.17 亿元', yoy: '—', source: '年报' }
    ],
    brands: [
      { name: '麒麟电池', note: '第三代能量密度 280Wh/kg，支持整车 1000km 续航' },
      { name: '神行超充电池', note: '第三代常温满电约 6 分钟，神行 Pro 面向欧洲市场' },
      { name: '钠新电池', note: '全球首款大规模量产的钠离子动力电池' },
      { name: '骐骥换电 / 巧克力换电', note: '重卡与乘用车换电网络，2025 年末累计 1,325 座换电站' }
    ],
    chinaStaff: '未按地区单独披露；集团口径 185,839 人（2025-12-31）',
    chinaInvestment: '未按地区单列资本开支；济宁基地预算 140 亿元、2025 年末累计投入 87.99 亿元',
    chinaEntities: '宁德、宜宾、溧阳、肇庆、济宁、厦门、洛阳等 13 个生产基地',
    sources: ['宁德时代 2025 年年度报告（2026-03-10）', '2026 年第三季度报告（2026-10-20）', '公司官网与 ESG 报告'],
    updated: '2026-11-16'
  },
  {
    id: 'mixue',
    name: '蜜雪冰城',
    en: 'MIXUE',
    industry: '现制茶饮',
    position: ['ToC'],
    region: '中国·河南郑州',
    founded: '1997 年',
    listing: '港交所 2097',
    revenue: '248.3 亿元',
    employees: PLACEHOLDER,
    desc: '以加盟模式运营的平价现制饮品连锁，核心收入来自向加盟商销售原料与设备。',
    businessLines: [
      { name: '商品销售（原料与食材）', share: PLACEHOLDER, note: '向加盟商销售糖浆、奶浆、果酱等，为主要收入来源', source: PLACEHOLDER },
      { name: '加盟与设备销售', share: PLACEHOLDER, note: '加盟费、设备与包材销售', source: PLACEHOLDER }
    ],
    revenueHistory: [
      { fy: 'FY2024', amount: '248.3 亿元', yoy: PLACEHOLDER, source: '招股书' },
      { fy: 'FY2023', amount: PLACEHOLDER, yoy: PLACEHOLDER, source: PLACEHOLDER },
      { fy: 'FY2022', amount: PLACEHOLDER, yoy: PLACEHOLDER, source: PLACEHOLDER }
    ],
    brands: [
      { name: '蜜雪冰城', note: '客单价约 6–8 元的现制茶饮与冰淇淋' },
      { name: '幸运咖', note: '集团旗下平价现磨咖啡品牌' }
    ],
    chinaStaff: PLACEHOLDER,
    chinaInvestment: PLACEHOLDER,
    chinaEntities: '郑州总部及多地仓储物流中心',
    sources: ['港交所招股书与年报（示例数据，需复核）'],
    updated: '2026-11-16'
  },
  {
    id: 'mingyuan',
    name: '明源云',
    en: 'Ming Yuan Cloud',
    industry: '企业软件',
    position: ['ToB', 'SaaS'],
    region: '中国·深圳',
    founded: '2003 年',
    listing: '港交所 0909',
    revenue: PLACEHOLDER,
    employees: PLACEHOLDER,
    desc: '面向房地产开发商与不动产运营方的 ERP 与 SaaS 服务商。',
    businessLines: [
      { name: 'ERP 解决方案', share: PLACEHOLDER, note: '面向房企的销售、成本、采招等管理系统', source: PLACEHOLDER },
      { name: 'SaaS 产品', share: PLACEHOLDER, note: '云客、云链、云采购等订阅制产品', source: PLACEHOLDER }
    ],
    revenueHistory: [
      { fy: 'FY2024', amount: PLACEHOLDER, yoy: PLACEHOLDER, source: PLACEHOLDER },
      { fy: 'FY2023', amount: PLACEHOLDER, yoy: PLACEHOLDER, source: PLACEHOLDER }
    ],
    brands: [
      { name: '云客', note: '售楼处营销与客户管理 SaaS' },
      { name: '云链', note: '工程建造与供应链协同平台' }
    ],
    chinaStaff: PLACEHOLDER,
    chinaInvestment: PLACEHOLDER,
    chinaEntities: '深圳总部，北京、上海、广州等地分支机构',
    sources: ['港交所公告（示例数据，需复核）'],
    updated: '2026-11-16'
  }
];

/* ---------- 存储 ---------- */

function loadCompanies() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) { /* 忽略损坏数据，回落到示例 */ }
  const seeded = JSON.parse(JSON.stringify(SEED));
  saveCompanies(seeded);
  return seeded;
}

function saveCompanies(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { /* 存储不可用时不阻塞页面 */ }
}

function upsertCompany(company) {
  const list = loadCompanies();
  const idx = list.findIndex(c => c.id === company.id);
  if (idx >= 0) list[idx] = company;
  else list.unshift(company);
  saveCompanies(list);
  return list;
}

function deleteCompany(id) {
  const list = loadCompanies().filter(c => c.id !== id);
  saveCompanies(list);
  return list;
}

/* ---------- 工具 ---------- */

function uid() {
  return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function val(x) {
  return (x === undefined || x === null || x === '' || x === PLACEHOLDER) ? PLACEHOLDER : x;
}

function today() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function matchCompany(name) {
  const key = String(name || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!key) return null;
  const list = loadCompanies();
  return list.find(c => {
    const n = c.name.toLowerCase().replace(/\s+/g, '');
    const e = (c.en || '').toLowerCase().replace(/\s+/g, '');
    return n === key || e === key;
  }) || null;
}

function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2200);
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ---------- 企业卡片 ---------- */

function companyCardHtml(c, index) {
  const attachCount = (c.attachments || []).length;
  const tags = (c.position || []).map(p => '<span class="tag pos">' + escapeHtml(p) + '</span>').join('')
    + (attachCount ? '<span class="tag">附件 ' + attachCount + '</span>' : '');
  const region = c.region || '地区待确认';
  return [
    '<article class="company-card" data-id="' + escapeHtml(c.id) + '" style="animation-delay:' + (index * 45) + 'ms">',
    '  <div class="card-industry"><span>' + escapeHtml(c.industry || '未分类') + '</span><span>' + escapeHtml(region) + '</span></div>',
    '  <h3 class="card-name">' + escapeHtml(c.name) + '</h3>',
    '  <div class="card-en">' + escapeHtml(c.en || '—') + '</div>',
    '  <div class="tags">' + tags + '</div>',
    '  <div class="card-meta">',
    '    <div class="meta-row"><span>营收</span><b>' + escapeHtml(c.revenue || '待确认') + '</b></div>',
    '    <div class="meta-row"><span>员工</span><b>' + escapeHtml(c.employees || '待确认') + '</b></div>',
    '  </div>',
    '  <div class="card-foot">',
    '    <span>' + escapeHtml(c.updated || '') + '</span>',
    '    <span>',
    '      <button class="icon-btn" data-dl="' + escapeHtml(c.id) + '" title="下载 Markdown">↓ MD</button>',
    '      <button class="icon-btn" data-del="' + escapeHtml(c.id) + '" title="删除">✕</button>',
    '    </span>',
    '  </div>',
    '</article>'
  ].join('');
}

/* ---------- Markdown 生成 ---------- */

function buildMarkdown(c, hit) {
  const name = c.name || '未命名企业';
  const lines = [];

  lines.push('# ' + name + (c.en && c.en !== PLACEHOLDER ? '（' + c.en + '）' : ''));
  lines.push('');
  lines.push('> 匹配对象：' + name + '｜所属行业：' + val(c.industry) + '｜市场定位：' + (c.position && c.position.length ? c.position.join(' / ') : PLACEHOLDER));
  lines.push('> 生成时间：' + today() + '｜生成工具：调研档案室（静态版）');
  lines.push('');

  lines.push('## 一、基本信息');
  lines.push('');
  lines.push('| 项目 | 内容 |');
  lines.push('|---|---|');
  lines.push('| 企业全称 | ' + name + ' |');
  lines.push('| 所属国家/地区 | ' + val(c.region) + ' |');
  lines.push('| 成立时间 | ' + val(c.founded) + ' |');
  lines.push('| 上市情况 | ' + val(c.listing) + ' |');
  lines.push('| 所属行业 | ' + val(c.industry) + ' |');
  lines.push('');

  lines.push('## 二、业务结构');
  lines.push('');
  lines.push('**主营业务线**');
  lines.push('');
  if (c.businessLines && c.businessLines.length) {
    c.businessLines.forEach((b, i) => {
      const share = b.share && b.share !== PLACEHOLDER ? '，占比 ' + b.share : '';
      const src = b.source && b.source !== PLACEHOLDER ? '（' + b.source + '）' : '（' + PLACEHOLDER + '）';
      lines.push((i + 1) + '. **' + b.name + '**' + share + ' — ' + val(b.note) + src);
    });
  } else {
    lines.push('- ' + PLACEHOLDER);
  }
  lines.push('');
  lines.push('> 说明：公司若披露分部数据，按分部列示；未披露则标注待确认。');
  lines.push('');

  lines.push('## 三、历年总营业额');
  lines.push('');
  lines.push('| 财年 | 总营业额 | 同比 | 口径/来源 |');
  lines.push('|---|---|---|---|');
  if (c.revenueHistory && c.revenueHistory.length) {
    c.revenueHistory.forEach(r => {
      lines.push('| ' + r.fy + ' | ' + val(r.amount) + ' | ' + val(r.yoy) + ' | ' + val(r.source) + ' |');
    });
  } else {
    lines.push('| — | ' + PLACEHOLDER + ' | — | — |');
  }
  lines.push('');

  lines.push('## 四、旗下产品与品牌');
  lines.push('');
  if (c.brands && c.brands.length) {
    lines.push('| 品牌/产品 | 简要介绍 |');
    lines.push('|---|---|');
    c.brands.forEach(b => lines.push('| ' + b.name + ' | ' + val(b.note) + ' |'));
  } else {
    lines.push('- ' + PLACEHOLDER);
  }
  lines.push('');

  lines.push('## 五、中国区情况');
  lines.push('');
  lines.push('| 项目 | 内容 |');
  lines.push('|---|---|');
  lines.push('| 中国区员工人数 | ' + val(c.chinaStaff) + ' |');
  lines.push('| 中国区投资情况 | ' + val(c.chinaInvestment) + ' |');
  lines.push('| 在华主要实体 | ' + val(c.chinaEntities) + ' |');
  lines.push('');

  lines.push('## 六、数据说明');
  lines.push('');
  lines.push('- **数据时间范围**：' + (c.revenueHistory && c.revenueHistory.length ? c.revenueHistory[0].fy + ' 及其前序财年' : PLACEHOLDER));
  lines.push('- **企业简介**：' + val(c.desc));
  lines.push('- **未确认项**：文中标注「' + PLACEHOLDER + '」的字段，均未取得可核验来源。');
  lines.push('- **主要来源**：' + ((c.sources && c.sources.length) ? c.sources.join('；') : PLACEHOLDER));
  if (c.attachments && c.attachments.length) {
    lines.push('- **附件**：' + c.attachments.map(a => a.name).join('、'));
  }
  if (!hit) {
    lines.push('- **生成说明**：该企业未收录于本地企业库，本文档为结构化空白模板，请补充信息后使用。');
  }
  lines.push('- **免责声明**：本文档由静态页面基于本地数据生成，不构成投资建议，引用前请核对官方披露。');
  lines.push('');

  return lines.join('\n');
}
