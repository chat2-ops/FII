const STORAGE_KEY='renda-fii-v1';
const today=new Date();
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
let data=loadData();
function loadData(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{funds:[],dividends:[]}}catch{return{funds:[],dividends:[]}}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));render()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dateFmt(s){if(!s)return '';const [y,m,d]=s.split('-');return `${d}/${m}/${y}`}
function render(){
 const fundRows=document.getElementById('fundRows'),empty=document.getElementById('emptyFunds');
 fundRows.innerHTML=data.funds.map(f=>`<tr><td><span class="ticker-pill">${esc(f.ticker)}</span></td><td>${Number(f.shares).toLocaleString('pt-BR')}</td><td>${brl.format(f.avgPrice)}</td><td><strong>${brl.format(f.shares*f.avgPrice)}</strong></td><td><button class="delete-btn" title="Remover ${esc(f.ticker)}" aria-label="Remover ${esc(f.ticker)}" data-delete-fund="${esc(f.id)}">×</button></td></tr>`).join('');
 empty.hidden=data.funds.length>0;
 document.getElementById('totalInvested').textContent=brl.format(data.funds.reduce((n,f)=>n+f.shares*f.avgPrice,0));
 document.getElementById('fundCount').textContent=data.funds.length;
 const month=String(today.getMonth()+1).padStart(2,'0'),year=String(today.getFullYear());
 const isMonth=d=>d.startsWith(`${year}-${month}`),isYear=d=>d.startsWith(`${year}-`);
 document.getElementById('monthlyIncome').textContent=brl.format(data.dividends.filter(d=>isMonth(d.date)).reduce((n,d)=>n+d.amount,0));
 document.getElementById('yearIncome').textContent=brl.format(data.dividends.filter(d=>isYear(d.date)).reduce((n,d)=>n+d.amount,0));
 const select=document.getElementById('divFund'),old=select.value;
 select.innerHTML='<option value="">Selecione um FII</option>'+data.funds.map(f=>`<option value="${esc(f.id)}">${esc(f.ticker)}</option>`).join('');
 if(data.funds.some(f=>f.id===old))select.value=old;
 const divs=[...data.dividends].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8),list=document.getElementById('dividendList');
 list.innerHTML=divs.length?divs.map(d=>{const f=data.funds.find(x=>x.id===d.fundId);return `<div class="dividend-item"><div><strong>${esc(f?.ticker||'FII removido')}</strong><small>${dateFmt(d.date)}</small></div><span class="dividend-amount">+ ${brl.format(d.amount)}</span></div>`}).join(''):'<p class="empty-inline">Nenhum dividendo registrado ainda.</p>';
}
const dialog=document.getElementById('fundDialog');
document.getElementById('openFundForm').addEventListener('click',()=>dialog.showModal());
function closeDialog(){dialog.close()}
document.getElementById('closeDialog').addEventListener('click',closeDialog);document.getElementById('cancelDialog').addEventListener('click',closeDialog);
document.getElementById('fundForm').addEventListener('submit',e=>{e.preventDefault();const ticker=document.getElementById('ticker').value.trim().toUpperCase();if(data.funds.some(f=>f.ticker===ticker)){alert('Esse FII já está na carteira.');return}data.funds.push({id:crypto.randomUUID(),ticker,shares:Number(document.getElementById('shares').value),avgPrice:Number(document.getElementById('avgPrice').value)});e.target.reset();closeDialog();save()});
document.getElementById('divDate').value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
document.getElementById('dividendForm').addEventListener('submit',e=>{e.preventDefault();data.dividends.push({id:crypto.randomUUID(),fundId:document.getElementById('divFund').value,amount:Number(document.getElementById('divAmount').value),date:document.getElementById('divDate').value});document.getElementById('divAmount').value='';save()});
document.getElementById('fundRows').addEventListener('click',e=>{const id=e.target.dataset.deleteFund;if(!id)return;const f=data.funds.find(x=>x.id===id);if(!confirm(`Remover ${f?.ticker} da carteira? Os dividendos já registrados serão mantidos.`))return;data.funds=data.funds.filter(x=>x.id!==id);save()});
document.getElementById('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='renda-fii-dados.json';a.click();URL.revokeObjectURL(url)});
render();
