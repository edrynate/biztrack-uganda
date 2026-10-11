/* BizTrack Uganda v0.2 — local-first shop ledger */
(() => {
'use strict';
const DB_KEY='biztrack_uganda_v02';
const $=id=>document.getElementById(id);
const today=()=>new Date().toLocaleDateString('en-CA');
const money=n=>'UGX '+Math.round(Number(n)||0).toLocaleString('en-US');
const makeId=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
let state={products:[],transactions:[]};
let toastTimer;
function toast(msg){const el=$('toast');el.textContent=msg;el.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.style.display='none',2800)}
function load(){
 try{const raw=localStorage.getItem(DB_KEY);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed.products)&&Array.isArray(parsed.transactions))state=parsed;}}
 catch(e){toast('Could not read saved data. Export/restore backups if available.');}
}
function save(){try{localStorage.setItem(DB_KEY,JSON.stringify(state));return true}catch(e){toast('Could not save. Your browser storage may be full or disabled. Export a backup and free space.');return false}}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function addTx(type,amount,description,extra={}){state.transactions.push({id:makeId(),type,amount:Math.round(amount),description:String(description).trim(),date:new Date().toISOString(),day:today(),...extra});save();render()}
function sum(list,type){return list.filter(t=>t.type===type).reduce((s,t)=>s+t.amount,0)}
function cogs(list){return sum(list,'sale') ? list.filter(t=>t.type==='sale').reduce((s,t)=>s+(Number(t.cogs)||0),0):0}
function profit(list){return sum(list,'sale')+sum(list,'income')-sum(list,'expense')-cogs(list)}
function getProduct(id){return state.products.find(p=>p.id===id)}
function optionList(selectId,selected){const sel=$(selectId);const old=selected||sel.value;sel.innerHTML='<option value="">Choose a product</option>'+state.products.map(p=>`<option value="${p.id}">${escapeHtml(p.name)} — ${p.qty} in stock</option>`).join('');if(state.products.some(p=>p.id===old))sel.value=old}
function render(){
 const todays=state.transactions.filter(t=>t.day===today());
 $('heroProfit').textContent=money(profit(todays));$('heroDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short',year:'numeric'});
 $('todaySales').textContent=money(sum(todays,'sale'));$('todayExpenses').textContent=money(sum(todays,'expense'));$('todayProfit').textContent=money(profit(todays));
 $('stockValue').textContent=money(state.products.reduce((s,p)=>s+p.qty*p.cost,0));
 const lows=state.products.filter(p=>p.qty<=p.low);
 $('lowStock').innerHTML=lows.length?`<div class="list">${lows.map(p=>`<div class="item"><div class="item-main"><div class="item-title">${escapeHtml(p.name)}</div><div class="item-meta">Stock remaining: ${p.qty}</div></div><span class="pill low">Restock soon</span></div>`).join('')}</div>`:'<div class="empty">No low-stock items. Add products in Stock to get started.</div>';
 const recent=[...state.transactions].reverse().slice(0,5);
 $('recent').innerHTML=recent.length?`<div class="list">${recent.map(txHtml).join('')}</div>`:'<div class="empty">No transactions yet. Record your first sale or expense.</div>';
 $('productList').innerHTML=state.products.length?`<div class="list">${state.products.map(p=>`<div class="item"><div class="item-main"><div class="item-title">${escapeHtml(p.name)}</div><div class="item-meta">Cost ${money(p.cost)} · Price ${money(p.price)}</div><div class="item-meta">Stock: ${p.qty} · Value: ${money(p.qty*p.cost)}</div><div class="actions"><button class="small-btn" data-adjust="${p.id}" data-delta="1">+1 stock</button><button class="small-btn" data-edit="${p.id}">Edit details</button><button class="small-btn" data-delete="${p.id}">Delete</button></div></div><span class="pill ${p.qty<=p.low?'low':''}">${p.qty<=p.low?'Low stock':'In stock'}</span></div>`).join('')}</div>`:'<div class="empty">No products yet. Add the items your shop sells.</div>';
 optionList('saleProduct');optionList('restockProduct');
 renderReports();updateSaleTotal();
}
function txHtml(t){const label={sale:'Sale',expense:'Expense',income:'Other income',restock:'Restock'}[t.type]||t.type;const sign=['expense','restock'].includes(t.type)?'−': '+';const cls=t.type==='expense'?'red':'green';return `<div class="item"><div class="item-main"><div class="item-title">${escapeHtml(t.description||label)}</div><div class="item-meta">${label} · ${new Date(t.date).toLocaleString()}</div>${t.type==='sale'?`<div class="item-meta">Cost of goods: ${money(t.cogs||0)}</div>`:''}</div><div class="item-value ${cls}">${sign}${money(t.amount).replace('UGX ','UGX ')}</div></div>`}
function renderReports(){
 const period=$('reportPeriod').value;const now=new Date();let list=state.transactions;
 if(period==='today')list=list.filter(t=>t.day===today());
 else if(period!=='all'){const days=Number(period);const from=new Date();from.setHours(0,0,0,0);from.setDate(from.getDate()-(days-1));list=list.filter(t=>new Date(t.date)>=from)}
 $('rSales').textContent=money(sum(list,'sale'));$('rExpenses').textContent=money(sum(list,'expense'));$('rCogs').textContent=money(cogs(list));$('rProfit').textContent=money(profit(list));
 const all=[...state.transactions].reverse();$('transactionList').innerHTML=all.length?`<div class="list">${all.map(t=>txHtml(t)+`<div style="text-align:right;margin-top:-5px"><button class="small-btn" data-undo="${t.id}">Delete record</button></div>`).join('')}</div>`:'<div class="empty">Your transaction history will appear here.</div>';
}
function updateSaleTotal(){const p=getProduct($('saleProduct').value);const q=Number($('saleQty').value)||0;const price=Number($('salePrice').value)||0;$('saleTotal').textContent=money(q*price);if(p&&$('salePrice').dataset.auto!=='no')$('salePrice').value=p.price}
function showTab(tab){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));['home','sale','stock','records'].forEach(v=>$('view-'+v).classList.toggle('hide',v!==tab));if(tab==='records')renderReports();if(tab==='sale')updateSaleTotal();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const go=b.dataset.go;showTab(go==='expense'?'sale':go==='reports'?'records':go)}));
$('productForm').addEventListener('submit',e=>{e.preventDefault();const name=$('pName').value.trim(),cost=Number($('pCost').value),price=Number($('pPrice').value),qty=Number($('pQty').value),low=Number($('pLow').value);if(!name||cost<0||price<=0||qty<0||!Number.isInteger(qty)||low<0||!Number.isInteger(low))return toast('Check product details and quantities.');if(state.products.some(p=>p.name.toLowerCase()===name.toLowerCase()))return toast('A product with that name already exists.');state.products.push({id:makeId(),name,cost,price,qty,low});save();e.target.reset();$('pQty').value=1;$('pLow').value=3;render();toast('Product saved on this device.');});
$('saleProduct').addEventListener('change',()=>{const p=getProduct($('saleProduct').value);if(p){$('salePrice').value=p.price;$('salePrice').dataset.auto='yes'}updateSaleTotal()});
$('salePrice').addEventListener('input',()=>{$('salePrice').dataset.auto='no';updateSaleTotal()});$('saleQty').addEventListener('input',updateSaleTotal);
$('saleForm').addEventListener('submit',e=>{e.preventDefault();const p=getProduct($('saleProduct').value),q=Number($('saleQty').value),price=Number($('salePrice').value);if(!p)return toast('Choose a product first.');if(!Number.isInteger(q)||q<1||q>p.qty)return toast('Quantity must be a whole number no greater than stock available.');if(!Number.isFinite(price)||price<=0)return toast('Enter a valid selling price.');const total=Math.round(q*price),cost=Math.round(q*p.cost);p.qty-=q;addTx('sale',total,$('saleNote').value.trim()||`${q} × ${p.name}`,{productId:p.id,quantity:q,unitPrice:price,cogs:cost});e.target.reset();$('saleQty').value=1;$('salePrice').dataset.auto='yes';render();toast('Sale saved and stock updated.');});
$('expenseForm').addEventListener('submit',e=>{e.preventDefault();const amount=Number($('expenseAmount').value),desc=$('expenseDesc').value.trim();if(!desc||!Number.isFinite(amount)||amount<=0)return toast('Enter an expense description and positive amount.');addTx('expense',amount,desc);e.target.reset();toast('Expense saved.');});
$('incomeForm').addEventListener('submit',e=>{e.preventDefault();const amount=Number($('incomeAmount').value),desc=$('incomeDesc').value.trim();if(!desc||!Number.isFinite(amount)||amount<=0)return toast('Enter a description and positive amount.');addTx('income',amount,desc);e.target.reset();toast('Other income saved.');});
$('restockForm').addEventListener('submit',e=>{e.preventDefault();const p=getProduct($('restockProduct').value),q=Number($('restockQty').value),cost=Number($('restockCost').value);if(!p)return toast('Choose a product.');if(!Number.isInteger(q)||q<1||cost<0||!Number.isFinite(cost))return toast('Enter a valid quantity and cost.');const oldQty=p.qty,oldCost=p.cost,newQty=oldQty+q;p.cost=newQty?((oldQty*oldCost+q*cost)/newQty):cost;p.qty=newQty;addTx('restock',q*cost,`Restock: ${p.name}`,{productId:p.id,quantity:q,unitCost:cost});e.target.reset();render();toast('Stock and average cost updated.');});
$('productList').addEventListener('click',e=>{const a=e.target.closest('[data-adjust]'),ed=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(a){const p=getProduct(a.dataset.adjust);if(p){p.qty+=Number(a.dataset.delta);save();render();toast('Stock quantity updated.')}}if(ed){const p=getProduct(ed.dataset.edit);if(!p)return;const price=prompt('New selling price (UGX):',p.price);if(price===null)return;const n=Number(price);if(!Number.isFinite(n)||n<=0)return toast('Price must be positive.');const low=prompt('Low-stock alert quantity:',p.low);if(low===null)return;const l=Number(low);if(!Number.isInteger(l)||l<0)return toast('Low-stock level must be a whole number.');p.price=n;p.low=l;save();render();toast('Product details updated.')}if(del){const p=getProduct(del.dataset.delete);if(!p)return;if(!confirm(`Delete ${p.name} from the product list? Existing transactions remain.`))return;state.products=state.products.filter(x=>x.id!==p.id);save();render();toast('Product removed.');}});
$('reportPeriod').addEventListener('change',renderReports);
$('transactionList').addEventListener('click',e=>{const b=e.target.closest('[data-undo]');if(!b)return;if(!confirm('Delete this transaction? If it is a sale, stock will not automatically be restored. Adjust stock manually if needed.'))return;state.transactions=state.transactions.filter(t=>t.id!==b.dataset.undo);save();render();toast('Record deleted. Check stock if it was a sale.');});
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
$('exportBackup').addEventListener('click',()=>download(`biztrack-backup-${today()}.json`,JSON.stringify({app:'BizTrack Uganda',version:2,exportedAt:new Date().toISOString(),...state},null,2),'application/json'));
$('exportCsv').addEventListener('click',()=>{const rows=[['date','type','description','amount_UGX','cost_of_goods_UGX','quantity','product_id'],...state.transactions.map(t=>[t.date,t.type,t.description,t.amount,t.cogs||0,t.quantity||'',t.productId||''])];const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');download(`biztrack-transactions-${today()}.csv`,csv,'text/csv;charset=utf-8')});
$('importBackup').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.products)||!Array.isArray(data.transactions))throw new Error('Invalid backup');if(!confirm('Restore this backup? Current data on this device will be replaced.'))return;state={products:data.products,transactions:data.transactions};save();render();toast('Backup restored.');}catch(err){toast('Backup could not be read. Choose a valid BizTrack JSON backup.')}finally{e.target.value=''}});
$('clearAll').addEventListener('click',()=>{if(!confirm('Delete ALL local BizTrack products and transactions? Export a backup first if you need these records.'))return;if(!confirm('Final confirmation: permanently clear this browser’s BizTrack data?'))return;state={products:[],transactions:[]};save();render();toast('Local data cleared.');});
function online(){const el=$('netStatus');el.textContent=navigator.onLine?'ONLINE':'OFFLINE';el.style.borderColor=navigator.onLine?'#9bc9aa':'#f0c878';}
window.addEventListener('online',online);window.addEventListener('offline',online);
load();render();online();
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();