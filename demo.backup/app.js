const menu = [
  { id: 'm1', name: 'Margherita Pizza', desc: 'Classic tomato, mozzarella, basil', price: 9.5 },
  { id: 'm2', name: 'Spicy Chicken Wings', desc: '6 pcs, hot & crispy', price: 7.0 },
  { id: 'm3', name: 'Caesar Salad', desc: 'Romaine, parmesan, anchovy dressing', price: 6.5 },
  { id: 'm4', name: 'Paneer Tikka', desc: 'Grilled spiced paneer', price: 8.0 },
  { id: 'm5', name: 'Chocolate Brownie', desc: 'Warm, with ice cream', price: 4.5 },
];

const state = { cart: {} };
const API_BASE = 'http://127.0.0.1:8001';
function getToken(){ return localStorage.getItem('session_token') }
function setToken(t){ if(t) localStorage.setItem('session_token', t); else localStorage.removeItem('session_token'); updateUserLabel(); }
function updateUserLabel(){ const lbl = document.getElementById('userLabel'); if(!lbl) return; const t = getToken(); lbl.textContent = t? 'Logged in' : ''; }
function updateAccountButton(){ const b = document.getElementById('accountBtn'); if(!b) return; b.style.display = getToken()? 'inline-block' : 'none'; }

function fmt(n){return '$' + n.toFixed(2)}

function renderMenu(items){
  const el = document.getElementById('menu-list');
  el.innerHTML = '';
  items.forEach(it=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `
      <h4>${it.name}</h4>
      <p>${it.desc}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="price">${fmt(it.price)}</div>
        <div>
          <button class="btn secondary" onclick="addToCart('${it.id}')">Add</button>
        </div>
      </div>
    `;
    el.appendChild(card);
  })
}

function addToCart(id){
  const item = menu.find(m=>m.id===id);
  if(!item) return;
  state.cart[id] = state.cart[id] || { ...item, qty:0 };
  state.cart[id].qty += 1;
  showToast(`${item.name} added to cart`);
  renderCart();
  saveCartToServer();
}

function removeFromCart(id){
  delete state.cart[id];
  renderCart();
  saveCartToServer();
}

function changeQty(id, delta){
  const row = state.cart[id];
  if(!row) return;
  row.qty += delta;
  if(row.qty <= 0) removeFromCart(id);
  renderCart();
  saveCartToServer();
}

function renderCart(){
  const el = document.getElementById('cart-items');
  const checkoutBtn = document.getElementById('checkout');
  el.innerHTML = '';
  const keys = Object.keys(state.cart);
  if(keys.length===0){ el.textContent='(empty)'; checkoutBtn.disabled = true; document.getElementById('subtotal').textContent = fmt(0); return }
  let subtotal=0;
  keys.forEach(k=>{
    const it = state.cart[k];
    subtotal += it.price * it.qty;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div>
        <strong>${it.name}</strong>
        <div><small>${fmt(it.price)} × ${it.qty}</small></div>
      </div>
      <div style="text-align:right">
        <div>${fmt(it.price * it.qty)}</div>
        <div style="margin-top:6px">
          <button class="btn secondary" onclick="changeQty('${k}',1)">+</button>
          <button class="btn secondary" onclick="changeQty('${k}',-1)">-</button>
          <button class="btn secondary" onclick="removeFromCart('${k}')">Remove</button>
        </div>
      </div>
    `;
    el.appendChild(row);
  })
  document.getElementById('subtotal').textContent = fmt(subtotal);
  checkoutBtn.disabled = false;
}

function showToast(txt){
  const t = document.getElementById('toast');
  t.textContent = txt; t.classList.remove('hidden');
  setTimeout(()=>t.classList.add('hidden'),1500);
}

function placeOrder(){
  const keys = Object.keys(state.cart);
  if(keys.length===0) return;
  const order = keys.map(k=>({ id:k, name: state.cart[k].name, qty: state.cart[k].qty, price: state.cart[k].price }));
  // Try to POST to server checkout endpoint; fallback to local demo behavior
  const payload = {
    customer_name: prompt('Your name (for demo)', 'Guest') || 'Guest',
    customer_email: prompt('Email (optional)', '') || null,
    customer_phone: prompt('Phone (optional)', '') || null,
    delivery_address: prompt('Delivery address (optional)', '') || null,
    payment_method: 'card',
    items: order
  };

  fetch(API_BASE + '/order/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(r=>{
    if(!r.ok) throw new Error('server error');
    return r.json();
  }).then(data=>{
    // attempt payment simulation
    fetch(API_BASE + `/payment/process?order_id=${data.order_id}&amount=${data.total}&method=${payload.payment_method}`, { method: 'POST' }).then(p=>p.json()).then(px=>{
      alert('Order placed!\nOrder ID: ' + data.order_id + '\nTotal: $' + data.total + '\nPayment: ' + px.status);
      state.cart = {};
      renderCart();
      saveCartToServer();
    }).catch(e=>{
      alert('Order placed! Order ID: ' + data.order_id + '\nBut payment failed');
      state.cart = {}; renderCart(); saveCartToServer();
    })
  }).catch(err=>{
    // fallback
    alert('Demo order (offline) placed!\n' + JSON.stringify(order, null, 2));
    state.cart = {};
    renderCart();
  })
}

window.addEventListener('load',()=>{
  renderMenu(menu);
  document.getElementById('checkout').addEventListener('click', placeOrder);
  document.getElementById('search').addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = menu.filter(m=>m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
    renderMenu(filtered);
  })
  const loginBtn = document.getElementById('loginBtn');
  if(loginBtn){
    loginBtn.addEventListener('click', async ()=>{
      const username = prompt('username','guest');
      const password = prompt('password','pass');
      if(!username || !password) return;
      // try register silently
      try{ await fetch(`${API_BASE}/auth/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`); }catch(e){}
      try{
        const res = await fetch(`${API_BASE}/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
        if(!res.ok) throw new Error('login failed');
        const j = await res.json(); setToken(j.token); alert('logged in');
        updateAccountButton();
        // load cart from server
        const cartRes = await fetch(`${API_BASE}/cart?token=${j.token}`);
        if(cartRes.ok){ const cj = await cartRes.json(); if(cj.cart){ state.cart = cj.cart; renderCart(); } }
      }catch(e){ alert('login failed: '+e) }
    });
  }
  updateUserLabel();
  updateAccountButton();
  // try to load saved cart if token exists
  const t = getToken(); if(t){ fetch(API_BASE+`/cart?token=${t}`).then(r=>r.json()).then(j=>{ if(j && j.cart){ state.cart = j.cart; renderCart(); } }).catch(()=>{}); }
})

async function saveCartToServer(){ const t=getToken(); if(!t) return; try{ await fetch(API_BASE+'/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:t,cart:state.cart})}); }catch(e){} }

// Account / order history
async function showAccount(){ const t=getToken(); if(!t){ alert('not logged in'); return; } try{ const res = await fetch(API_BASE+`/user/orders?token=${t}`); if(!res.ok) throw new Error('failed'); const j = await res.json(); const orders = j.orders || []; if(orders.length===0){ alert('no orders yet'); return } let out = '';
    orders.forEach(o=>{
      out += `Order ${o.order_id} — ${o.status} — ${o.created_at}\nTotal: $${o.total}\nItems:\n`;
      o.items.forEach(it=> out += `  - ${it.name} x${it.qty} (${it.total_price})\n`);
      out += '\n';
    })
    alert(out);
  }catch(e){ alert('could not load orders: '+e) } }

window.addEventListener('load', ()=>{
  const acct = document.getElementById('accountBtn'); if(acct) acct.addEventListener('click', showAccount);
});
