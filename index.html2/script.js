/* ===== Dados ===== */
const CATS = ['Transparentes', 'Coloridas', 'Estampadas', 'Silicone', 'Anti-impacto', 'Com carteira'];
const MODELS = ['iPhone 15', 'iPhone 14', 'Galaxy S23', 'Galaxy A54', 'Moto G84'];
const STEPS = ['Pedido confirmado', 'Pagamento aprovado', 'Em transporte', 'Entregue'];
const PRODUCTS = [
  { id: 1, name: 'Cristal Clear', cat: 'Transparentes', kind: 'clear', color: '#FFFFFF', price: 39.9 },
  { id: 2, name: 'Lilás Suave', cat: 'Silicone', kind: 'solid', color: '#B9A7FF', price: 34.9 },
  { id: 3, name: 'Pôr do Sol', cat: 'Coloridas', kind: 'grad', color: '#FF6B6B', c2: '#FFC857', price: 49.9 },
  { id: 4, name: 'Bolinhas Menta', cat: 'Estampadas', kind: 'dots', color: '#7BDCB5', price: 44.9 },
  { id: 5, name: 'Listras Marinho', cat: 'Estampadas', kind: 'stripes', color: '#2C3E73', price: 44.9 },
  { id: 6, name: 'Armadura Preta', cat: 'Anti-impacto', kind: 'impact', color: '#25223A', price: 69.9 },
  { id: 7, name: 'Rosa Chiclete', cat: 'Silicone', kind: 'solid', color: '#FF9EC4', price: 34.9 },
  { id: 8, name: 'Amarelo Sol', cat: 'Coloridas', kind: 'solid', color: '#FFD15C', price: 39.9 },
  { id: 9, name: 'Carteira Café', cat: 'Com carteira', kind: 'solid', color: '#A06A4B', price: 79.9 },
  { id: 10, name: 'Cristal Fosco', cat: 'Transparentes', kind: 'clear', color: '#FFFFFF', price: 42.9 },
  { id: 11, name: 'Oceano', cat: 'Coloridas', kind: 'grad', color: '#3AA6FF', c2: '#6C4CF1', price: 49.9 },
  { id: 12, name: 'Bolinhas Rosa', cat: 'Estampadas', kind: 'dots', color: '#FF8FB1', price: 44.9 },
];

/* ===== Estado ===== */
const state = {
  cur: 'login', hist: [], cart: [], favs: new Set(), user: { name: '', email: '' },
  signup: false, cat: '', q: '', filt: { cats: [], max: 100, sort: 'rel' },
  prod: null, model: MODELS[0], ship: 'std', pay: 'pix', track: null,
  orders: [
    { id: 'CAPI-1041', date: '28/10/2026', total: 84.8, status: 3, items: 'Armadura Preta' },
    { id: 'CAPI-1042', date: '08/11/2026', total: 57.8, status: 2, items: 'Bolinhas Menta' },
  ],
};
const TABS = ['home', 'categories', 'favorites', 'cart', 'profile'];

/* ===== Utilidades ===== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => 'R$ ' + n.toFixed(2).replace('.', ',');
const prod = id => PRODUCTS.find(p => p.id === id);
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
}
// mostra ou limpa a mensagem de erro de um campo; retorna true se estiver válido
function setErr(input, msg) {
  const f = input.closest('.f');
  f.classList.toggle('bad', !!msg);
  f.querySelector('small').textContent = msg || '';
  return !msg;
}

/* ===== Ilustração da capinha (SVG gerado em código) ===== */
function caseSvg(p) {
  const u = p.id + Math.random().toString(36).slice(2, 6);
  let fill = p.color, extra = '', defs = '', stroke = '';
  if (p.kind === 'clear') { fill = '#fff" fill-opacity=".45'; stroke = ' stroke="#B9B2E8" stroke-width="2"'; }
  if (p.kind === 'grad') {
    fill = `url(#g${u})`;
    defs = `<linearGradient id="g${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.color}"/><stop offset="1" stop-color="${p.c2}"/></linearGradient>`;
  }
  if (p.kind === 'dots') for (let y = 62; y < 156; y += 18) for (let x = 22; x < 90; x += 18)
    extra += `<circle cx="${x + (y % 36 ? 9 : 0)}" cy="${y}" r="4" fill="#fff" opacity=".7"/>`;
  if (p.kind === 'stripes') for (let y = 56; y < 156; y += 14)
    extra += `<rect x="8" y="${y}" width="84" height="6" fill="#fff" opacity=".6"/>`;
  if (p.kind === 'impact') extra =
    '<rect x="8" y="4" width="20" height="20" opacity=".3"/><rect x="72" y="4" width="20" height="20" opacity=".3"/>' +
    '<rect x="8" y="136" width="20" height="20" opacity=".3"/><rect x="72" y="136" width="20" height="20" opacity=".3"/>';
  const lens = [[26, 22], [40, 22], [33, 36]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#555"/>`).join('');
  return `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">
    <defs>${defs}<clipPath id="c${u}"><rect x="8" y="4" width="84" height="152" rx="18"/></clipPath></defs>
    <rect x="8" y="4" width="84" height="152" rx="18" fill="${fill}"${stroke}/>
    <g clip-path="url(#c${u})">${extra}</g>
    <rect x="16" y="12" width="34" height="34" rx="9" fill="#1B1633" opacity=".85"/>${lens}</svg>`;
}

/* ===== Componentes ===== */
const card = p => `<article class="card" data-open="${p.id}">
  <div class="img">${caseSvg(p)}<button class="fav ${state.favs.has(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="Favoritar">♥</button></div>
  <h4>${p.name}</h4><p>${p.cat}</p><b>${money(p.price)}</b></article>`;

function totals() {
  const sub = state.cart.reduce((s, i) => s + prod(i.id).price * i.qty, 0);
  const ship = !state.cart.length ? 0 : state.ship === 'exp' ? 24.9 : sub >= 100 ? 0 : 12.9;
  return { sub, ship, total: sub + ship };
}
function sumHtml() {
  const t = totals();
  return `<div><span>Subtotal</span><span>${money(t.sub)}</span></div>
    <div><span>Frete</span><span>${t.ship ? money(t.ship) : 'Grátis'}</span></div>
    <div class="t"><span>Total</span><span>${money(t.total)}</span></div>`;
}
const emptyState = (msg, btn) => `<div class="empty">${caseSvg(PRODUCTS[0])}<h2>${msg}</h2>${btn || ''}</div>`;

/* ===== Navegação ===== */
function go(name, isBack) {
  if (!isBack && name !== state.cur) TABS.includes(name) ? (state.hist = []) : state.hist.push(state.cur);
  state.cur = name;
  $$('.screen').forEach(s => s.classList.toggle('on', s.id === name));
  $('#nav').hidden = !TABS.includes(name);
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.go === name));
  (RENDER[name] || (() => {}))();
  $('#' + name).scrollTop = 0;
}
const back = () => go(state.hist.pop() || 'home', true);
function updateBadge() {
  const n = state.cart.reduce((s, i) => s + i.qty, 0);
  $('#badge').textContent = n; $('#badge').hidden = !n;
}

/* ===== Telas (cada função desenha o conteúdo da sua tela) ===== */
const RENDER = {
  home() {
    $('#hi').textContent = state.user.name ? `Olá, ${state.user.name.split(' ')[0]}!` : 'Olá!';
    $('#bannerImg').innerHTML = caseSvg(PRODUCTS[2]);
    $('#homeChips').innerHTML = CATS.map(c => `<button class="chip" data-cat="${c}">${c}</button>`).join('');
    $('#homeGrid').innerHTML = PRODUCTS.slice(0, 4).map(card).join('');
    $('#homeNew').innerHTML = PRODUCTS.slice(8).map(card).join('');
  },
  categories() {
    $('#catList').innerHTML = CATS.map(c => {
      const sample = PRODUCTS.find(p => p.cat === c), n = PRODUCTS.filter(p => p.cat === c).length;
      return `<div class="row" data-cat="${c}"><div class="thumb">${caseSvg(sample)}</div>
        <div class="info"><b>${c}</b><br><span class="mut">${n} modelos</span></div><span>›</span></div>`;
    }).join('');
  },
  search() {
    $('#q').value = '';
    $('#suggest').innerHTML = ['Transparente', 'Bolinhas', 'Silicone', 'Anti-impacto', 'Carteira'].map(s => `<button class="chip" data-chip="${s}">${s}</button>`).join('');
  },
  results() {
    const f = state.filt;
    let l = PRODUCTS.filter(p =>
      (!state.cat || p.cat === state.cat) &&
      (!state.q || norm(p.name + ' ' + p.cat).includes(norm(state.q))) &&
      p.price <= f.max && (!f.cats.length || f.cats.includes(p.cat)));
    if (f.sort === 'asc') l.sort((a, b) => a.price - b.price);
    if (f.sort === 'desc') l.sort((a, b) => b.price - a.price);
    $('#resTitle').textContent = state.q ? `“${state.q}”` : state.cat || 'Todas as capinhas';
    $('#resCount').textContent = `${l.length} resultado(s)`;
    $('#resGrid').innerHTML = l.length ? l.map(card).join('') : '';
    $('#resGrid').style.display = l.length ? '' : 'block';
    if (!l.length) $('#resGrid').innerHTML = emptyState('Nada encontrado', '<button class="btn ghost" data-act="clearFilters">Limpar filtros</button>');
  },
  filters() {
    $('#fCats').innerHTML = CATS.map(c => `<button class="chip ${state.filt.cats.includes(c) ? 'on' : ''}" data-fcat="${c}">${c}</button>`).join('');
    $('#fMax').value = state.filt.max; $('#fMaxOut').textContent = money(state.filt.max);
    $('#fSort').value = state.filt.sort;
  },
  detail() {
    const p = state.prod;
    $('#detailBody').innerHTML = `<div class="big">${caseSvg(p)}<button class="fav ${state.favs.has(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="Favoritar">♥</button></div>
      <h2>${p.name}</h2><p class="mut">${p.cat}</p><p class="price">${money(p.price)}</p>
      <h3 class="sec">Modelo do celular</h3>
      <div class="chips wrap">${MODELS.map(m => `<button class="chip ${m === state.model ? 'on' : ''}" data-model="${m}">${m}</button>`).join('')}</div>
      <button class="btn" data-act="addToCart">Adicionar à sacola</button>`;
  },
  favorites() {
    const l = PRODUCTS.filter(p => state.favs.has(p.id));
    $('#favGrid').style.display = l.length ? '' : 'block';
    $('#favGrid').innerHTML = l.length ? l.map(card).join('') : emptyState('Nenhum favorito ainda', '<button class="btn ghost" data-cat="">Explorar capinhas</button>');
  },
  cart() {
    if (!state.cart.length) { $('#cartBody').innerHTML = emptyState('Sua sacola está vazia', '<button class="btn" data-cat="">Ver capinhas</button>'); return; }
    $('#cartBody').innerHTML = state.cart.map((i, idx) => {
      const p = prod(i.id);
      return `<div class="row" style="cursor:default"><div class="thumb">${caseSvg(p)}</div>
        <div class="info"><b>${p.name}</b><br><span class="mut">${i.model}</span><br><b style="color:var(--p)">${money(p.price * i.qty)}</b>
        <div class="qty"><button data-qty="${idx}" data-d="-1" aria-label="Menos">−</button>${i.qty}<button data-qty="${idx}" data-d="1" aria-label="Mais">+</button>
        <button class="del" data-del="${idx}">Remover</button></div></div></div>`;
    }).join('') + `<div class="sum">${sumHtml()}</div><button class="btn" data-go="checkout">Finalizar compra</button>`;
  },
  checkout() { $('#coSum').innerHTML = sumHtml(); },
  payment() {
    $('#paySum').innerHTML = sumHtml();
    $$('#payTabs .chip').forEach(b => b.classList.toggle('on', b.dataset.pay === state.pay));
    $('#payPix').hidden = state.pay !== 'pix'; $('#payCard').hidden = state.pay !== 'card'; $('#payBoleto').hidden = state.pay !== 'boleto';
  },
  confirmed() { $('#okId').textContent = '#' + state.track.id; },
  orders() {
    $('#orderList').innerHTML = state.orders.map(o => `<div class="row" data-order="${o.id}">
      <div class="info"><b>#${o.id}</b> <span class="tag ${o.status === 3 ? 'ok' : ''}">${STEPS[o.status]}</span><br>
      <span class="mut">${o.date} · ${o.items}</span><br><b>${money(o.total)}</b></div><span>›</span></div>`).join('');
  },
  tracking() {
    const o = state.track || state.orders[0];
    $('#trackInfo').innerHTML = `<div><span>Pedido</span><b>#${o.id}</b></div><div><span>Data</span><span>${o.date}</span></div><div><span>Total</span><span>${money(o.total)}</span></div>`;
    $('#steps').innerHTML = STEPS.map((s, i) => `<div class="step ${i <= o.status ? 'done' : ''}"><div class="dot">${i <= o.status ? '✓' : ''}</div><div><b>${s}</b><small>${i <= o.status ? 'Concluído' : 'Aguardando'}</small></div></div>`).join('');
  },
  profile() {
    const n = state.user.name || 'Cliente Capi.';
    $('#avatar').textContent = n[0].toUpperCase(); $('#pName').textContent = n; $('#pEmail').textContent = state.user.email;
  },
};

/* ===== Ações dos botões (data-act) ===== */
const ACTIONS = {
  addToCart() {
    const found = state.cart.find(i => i.id === state.prod.id && i.model === state.model);
    found ? found.qty++ : state.cart.push({ id: state.prod.id, model: state.model, qty: 1 });
    updateBadge(); toast('Adicionado à sacola');
  },
  applyFilters() { state.filt.max = +$('#fMax').value; state.filt.sort = $('#fSort').value; back(); },
  clearFilters() { state.filt = { cats: [], max: 100, sort: 'rel' }; state.cat = ''; state.q = ''; go(state.cur === 'filters' ? 'filters' : 'results', true); },
  logout() { state.cart = []; updateBadge(); state.hist = []; go('login'); },
};

/* ===== Cliques (um único ouvinte para o app todo) ===== */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-back],[data-fav],[data-open],[data-cat],[data-chip],[data-fcat],[data-model],[data-qty],[data-del],[data-pay],[data-order],[data-toast],[data-act]');
  if (!t) return;
  const d = t.dataset;
  if ('fav' in d) {
    const id = +d.fav; state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
    toast(state.favs.has(id) ? 'Salvo nos favoritos' : 'Removido dos favoritos');
    return RENDER[state.cur]();
  }
  if ('open' in d) { state.prod = prod(+d.open); return go('detail'); }
  if ('cat' in d) { state.cat = d.cat; state.q = ''; return go('results'); }
  if ('chip' in d) { state.q = d.chip; state.cat = ''; return go('results'); }
  if ('fcat' in d) { const l = state.filt.cats; l.includes(d.fcat) ? l.splice(l.indexOf(d.fcat), 1) : l.push(d.fcat); return RENDER.filters(); }
  if ('model' in d) { state.model = d.model; return RENDER.detail(); }
  if ('qty' in d) { const i = state.cart[+d.qty]; i.qty = Math.max(1, i.qty + +d.d); updateBadge(); return RENDER.cart(); }
  if ('del' in d) { state.cart.splice(+d.del, 1); updateBadge(); return RENDER.cart(); }
  if ('pay' in d) { state.pay = d.pay; return RENDER.payment(); }
  if ('order' in d) { state.track = state.orders.find(o => o.id === d.order); return go('tracking'); }
  if ('toast' in d) return toast(d.toast);
  if ('act' in d) return ACTIONS[d.act]();
  if ('back' in d) return back();
  if ('go' in d) return go(d.go);
});

/* ===== Formulários ===== */
// Login e cadastro
$('#switchMode').onclick = () => {
  state.signup = !state.signup;
  $('#nameBox').hidden = !state.signup;
  $('#loginTitle').textContent = $('#loginBtn').textContent = state.signup ? 'Criar conta' : 'Entrar';
  $('#switchMode').textContent = state.signup ? 'Já tenho conta' : 'Criar uma conta';
};
$('#loginForm').onsubmit = e => {
  e.preventDefault();
  const ok = [
    state.signup ? setErr($('#lName'), $('#lName').value.trim() ? '' : 'Digite seu nome') : true,
    setErr($('#lEmail'), /^\S+@\S+\.\S+$/.test($('#lEmail').value) ? '' : 'Digite um e-mail válido'),
    setErr($('#lPass'), $('#lPass').value.length >= 6 ? '' : 'A senha precisa ter 6 ou mais caracteres'),
  ].every(Boolean);
  if (!ok) return;
  // TODO backend: POST /auth/login (ou /auth/register) e guardar o token
  state.user = { name: state.signup ? $('#lName').value.trim() : $('#lEmail').value.split('@')[0], email: $('#lEmail').value };
  go('home');
};

// Busca
$('#searchForm').onsubmit = e => {
  e.preventDefault();
  state.q = $('#q').value.trim(); state.cat = '';
  state.q ? go('results') : toast('Digite o que você procura');
};
$('#fMax').oninput = e => ($('#fMaxOut').textContent = money(+e.target.value));

// Endereço de entrega
$('#cep').oninput = e => {
  const v = e.target.value.replace(/\D/g, '').slice(0, 8);
  e.target.value = v.length > 5 ? v.slice(0, 5) + '-' + v.slice(5) : v;
};
$$('input[name=ship]').forEach(r => (r.onchange = () => { state.ship = r.value; RENDER.checkout(); }));
$('#addrForm').onsubmit = e => {
  e.preventDefault();
  const ok = [
    setErr($('#cep'), $('#cep').value.replace(/\D/g, '').length === 8 ? '' : 'CEP com 8 números'),
    setErr($('#street'), $('#street').value.trim() ? '' : 'Informe a rua'),
    setErr($('#num'), $('#num').value.trim() ? '' : 'Informe o número'),
    setErr($('#city'), $('#city').value.trim() ? '' : 'Informe a cidade'),
  ].every(Boolean);
  if (!state.cart.length) return toast('Sua sacola está vazia');
  if (ok) go('payment'); // TODO backend: salvar endereço e calcular frete pelo CEP
};

// Pagamento
$('#cNum').oninput = e => (e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '));
$('#cExp').oninput = e => {
  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
  e.target.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
};
$('#payForm').onsubmit = e => {
  e.preventDefault();
  if (state.pay === 'card') {
    const mm = +$('#cExp').value.slice(0, 2);
    const ok = [
      setErr($('#cNum'), $('#cNum').value.replace(/\s/g, '').length === 16 ? '' : 'O cartão tem 16 números'),
      setErr($('#cName'), $('#cName').value.trim() ? '' : 'Digite o nome impresso no cartão'),
      setErr($('#cExp'), /^\d\d\/\d\d$/.test($('#cExp').value) && mm >= 1 && mm <= 12 ? '' : 'Use o formato MM/AA'),
      setErr($('#cCvv'), /^\d{3,4}$/.test($('#cCvv').value) ? '' : 'CVV com 3 ou 4 números'),
    ].every(Boolean);
    if (!ok) return;
  }
  // TODO backend: POST /orders com itens, endereço e forma de pagamento
  const order = {
    id: 'CAPI-' + (1043 + state.orders.length - 2), date: new Date().toLocaleDateString('pt-BR'),
    total: totals().total, status: 0, items: state.cart.map(i => prod(i.id).name).join(', '),
  };
  state.orders.unshift(order); state.track = order; state.cart = []; updateBadge();
  go('confirmed');
};

// Suporte
$('#helpForm').onsubmit = e => {
  e.preventDefault();
  if (!setErr($('#hMsg'), $('#hMsg').value.trim().length >= 10 ? '' : 'Escreva pelo menos 10 caracteres')) return;
  // TODO backend: POST /support
  $('#hMsg').value = ''; toast('Mensagem pronta para envio ao backend');
};

go('login');