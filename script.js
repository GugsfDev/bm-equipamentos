const imageCatalog = {
 default: "https://www.trupply.com/cdn/shop/articles/The_Importance_of_Safety_Gear.jpg?v=1769596426",
 catalog: "https://misacorpperu.com/cdn/shop/collections/Seguridad_industrial.png?v=1778893915",
 worker: "https://5s.shop/cdn/shop/files/5s-warehouse-worker-high-vis-safety-gear.jpg?v=1746094466&width=1800"
};

const products = [
 {id:1,name:"Luva de Proteção Anticorte",category:"Luvas",price:29.90,image:imageCatalog.catalog},

 {id:2,name:"Luva Nitrílica de Proteção",category:"Luvas",price:18.90,image:imageCatalog.catalog},
 {id:3,name:"Luva de Vaqueta",category:"Luvas",price:24.90,image:imageCatalog.default},
 {id:4,name:"Capacete de Segurança",category:"Capacetes",price:39.90,image:imageCatalog.default},
 {id:5,name:"Capacete com Aba Frontal",category:"Capacetes",price:44.90,image:imageCatalog.catalog},
 {id:6,name:"Óculos de Proteção Incolor",category:"Óculos",price:14.90,image:imageCatalog.catalog},
 {id:7,name:"Óculos de Proteção Fumê",category:"Óculos",price:17.90,image:imageCatalog.catalog},
 {id:8,name:"Protetor Auditivo Tipo Concha",category:"Auditivo",price:54.90,image:imageCatalog.default},
 {id:9,name:"Protetor Auricular Plug",category:"Auditivo",price:6.90,image:imageCatalog.default},
 {id:10,name:"Botina de Segurança",category:"Calçados",price:89.90,image:imageCatalog.default},
 {id:11,name:"Bota de PVC de Segurança",category:"Calçados",price:69.90,image:imageCatalog.default},
 {id:12,name:"Colete de Alta Visibilidade",category:"Vestimentas",price:34.90,image:imageCatalog.worker}
];

const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let cart = JSON.parse(localStorage.getItem("bm-cart") || "[]");
let currentCategory = "Todos";
let paymentMethod = "pix";

const grid = document.getElementById("productGrid");
const search = document.getElementById("search");

function save(){localStorage.setItem("bm-cart",JSON.stringify(cart));}
function count(){return cart.reduce((sum,item)=>sum+item.qty,0);}
function total(){return cart.reduce((sum,item)=>{const p=products.find(x=>x.id===item.id);return sum+(p?p.price*item.qty:0)},0);}

function renderProducts(){
 const q=search.value.trim().toLowerCase();
 const list=products.filter(p=>(currentCategory==="Todos"||p.category===currentCategory)&&p.name.toLowerCase().includes(q));
 grid.innerHTML=list.length?list.map(p=>`
  <article class="product-card">
   <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
   <div class="product-info">
    <span class="product-category">${p.category.toUpperCase()}</span>
    <h3 class="product-name">${p.name}</h3>
    <div class="product-bottom">
      <div class="product-price">${money(p.price)}</div>
      <button class="add-button" data-add="${p.id}">Adicionar ao carrinho</button>
    </div>
   </div>
  </article>`).join(""):`<div class="empty-cart">Nenhum produto encontrado.</div>`;
 document.querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>add(Number(btn.dataset.add))));
}

function renderCart(){
 document.getElementById("cartCount").textContent=count();
 const box=document.getElementById("cartItems");
 if(!cart.length){
   box.innerHTML='<div class="empty-cart">Seu carrinho está vazio.<br>Adicione um produto para continuar.</div>';
 } else {
   box.innerHTML=cart.map(item=>{
     const p=products.find(x=>x.id===item.id);
     return `<div class="cart-item">
       <div class="cart-thumb">BM</div>
       <div><div class="cart-name">${p.name}</div><div class="cart-price">${money(p.price)} cada</div>
       <div class="quantity"><button data-minus="${p.id}">−</button><span>${item.qty}</span><button data-plus="${p.id}">+</button></div></div>
       <div class="cart-item-total">${money(p.price*item.qty)}</div>
     </div>`;
   }).join("");
   document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.minus),-1));
   document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.plus),1));
 }
 document.getElementById("cartTotal").textContent=money(total());
 document.getElementById("goPayment").disabled=!cart.length;
}

function add(id){
 const item=cart.find(x=>x.id===id);
 if(item)item.qty++;else cart.push({id,qty:1});
 save();renderCart();openModal("cartModal");
}
function changeQty(id,delta){
 const item=cart.find(x=>x.id===id);if(!item)return;
 item.qty+=delta;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);
 save();renderCart();updatePayment();
}

function openModal(id){document.getElementById(id).classList.add("open");document.getElementById(id).setAttribute("aria-hidden","false");}
function closeModal(id){document.getElementById(id).classList.remove("open");document.getElementById(id).setAttribute("aria-hidden","true");}

function updatePayment(){
 const subtotal=total();
 let final=subtotal, desc="";
 const inst=Number(document.getElementById("installments").value);
 const wrap=document.getElementById("installmentsWrap");
 if(paymentMethod==="pix"){
   final=subtotal*.95;wrap.style.display="none";desc=`5% de desconto no PIX. Economia de ${money(subtotal-final)}.`;
 }else if(paymentMethod==="boleto"){
   wrap.style.display="none";desc="Pagamento à vista via boleto bancário.";
 }else{
   wrap.style.display="block";
   final=inst>=6?subtotal*1.08:subtotal;
   desc=inst>=6?`${inst}x de ${money(final/inst)} com juros.`:`${inst}x de ${money(final/inst)} sem juros.`;
 }
 document.getElementById("paymentTotal").textContent=money(final);
 document.getElementById("paymentDescription").textContent=desc||"Adicione produtos ao carrinho.";
}

document.querySelectorAll(".category").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".category").forEach(x=>x.classList.remove("active"));
 btn.classList.add("active");currentCategory=btn.dataset.category;renderProducts();
}));
search.addEventListener("input",renderProducts);

document.getElementById("openCart").onclick=()=>{renderCart();openModal("cartModal")};
document.getElementById("closeCart").onclick=()=>closeModal("cartModal");
document.getElementById("goPayment").onclick=()=>{if(cart.length){closeModal("cartModal");updatePayment();openModal("paymentModal")}};
document.getElementById("closePayment").onclick=()=>closeModal("paymentModal");
document.getElementById("installments").onchange=updatePayment;

document.querySelectorAll(".payment-method").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".payment-method").forEach(x=>x.classList.remove("active"));
 btn.classList.add("active");paymentMethod=btn.dataset.method;updatePayment();
}));

document.getElementById("finishSimulation").onclick=()=>{
 alert("Simulação concluída. Nenhuma cobrança foi realizada.");
 closeModal("paymentModal");
};

document.querySelectorAll(".modal-backdrop").forEach(bg=>bg.addEventListener("click",e=>{if(e.target===bg)closeModal(bg.id)}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal("cartModal");closeModal("paymentModal")}});

renderProducts();renderCart();updatePayment();

document.querySelectorAll(".nav-tab").forEach(link=>{
 link.addEventListener("click",()=>{
   document.querySelectorAll(".nav-tab").forEach(x=>x.classList.remove("active"));
   link.classList.add("active");
 });
});
