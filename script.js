import { debounce } from 'lodash-es'; // Importa a função debounce da biblioteca lodash-es

// --- Constantes ---

const LOCAL_STORAGE_CART_KEY = 'lojaJoiasReal'; // Nome da chave usada para armazenar o carrinho no localStorage

// --- Dados dos Produtos ---

const products = [

    // Lista de produtos disponíveis na loja

    { id: 1, name: "Bracelete Prata Multi Fios Em Trama E Fecho Redondo", price: 1429.00 },

    { id: 2, name: "Anel Prata Coração Rosa Brilhante Elevado", price: 1429.00 },

    { id: 3, name: "Colar de Prata Disney Lâmpada Mágica do Aladdin", price: 2199.00 },

    { id: 4, name: "Brinco de Diamante 0,50 quilates em Ouro Branco", price: 9900.00 },

    { id: 5, name: "Charm Prata Pendente Libelula Azul", price: 1209.00 },

];

// --- Seleção de Elementos do DOM ---

const productListContainer = document.getElementById('product-list');

const cartItemsContainer = document.getElementById('cart-items');

const cartTotalElement = document.getElementById('cart-total');

const checkoutButton = document.getElementById('checkout-button');

const exitIntentModal = document.getElementById('exit-intent-modal');

const closeModalButton = exitIntentModal.querySelector('.close-modal-btn');

const modalActionBtn = exitIntentModal.querySelector('.modal-action-btn');

// --- Estado da Aplicação ---

let cart = []; // Carrinho de compras

let modalShown = false; // Se o modal de saída já foi exibido

// --- Funções Utilitárias ---

// Cria elementos HTML com atributos e conteúdo de texto

function createElement(tag, attributes = {}, textContent = '') {

    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {

        element.setAttribute(key, value);

    });

    if (textContent) element.textContent = textContent;

    return element;

}

// Formata valores para moeda brasileira (R$)

function formatCurrency(value) {

    return `R$ ${value.toFixed(2).replace('.', ',')}`;

}

// --- LocalStorage ---

// Carrega o carrinho do localStorage

function loadCartFromLocalStorage() {

    try {

        const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);

        if (storedCart) {

            const parsedCart = JSON.parse(storedCart);

            return Array.isArray(parsedCart) ? parsedCart : [];

        }

    } catch (error) {

        console.error("Erro ao carregar carrinho do localStorage:", error);

        return [];

    }

    return [];

}

// Salva o carrinho atual no localStorage

function saveCartToLocalStorage() {

    try {

        localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));

    } catch (error) {

        console.error("Erro ao salvar carrinho no localStorage:", error);

    }

}

// --- Renderização de Produtos ---

// Exibe os produtos na tela

function renderProducts() {

    productListContainer.innerHTML = '';

    products.forEach(product => {

        const card = createElement('div', { class: 'product-card' });

        const iconPlaceholder = createElement('div', { class: 'product-icon-placeholder', 'aria-hidden': 'true' });

        const name = createElement('h3', {}, product.name);

        const price = createElement('p', { class: 'price' }, formatCurrency(product.price));

        const addButton = createElement('button', {

            class: 'add-to-cart-btn',

            'data-id': product.id

        }, 'Adicionar ao Carrinho');

        addButton.addEventListener('click', handleAddToCart);

        card.appendChild(iconPlaceholder);

        card.appendChild(name);

        card.appendChild(price);

        card.appendChild(addButton);

        productListContainer.appendChild(card);

    });

}

// Lida com o clique no botão de adicionar produto ao carrinho

function handleAddToCart(event) {

    const productId = parseInt(event.target.dataset.id, 10);

    if (!isNaN(productId)) {

        addToCart(productId);

    } else {

        console.error("ID do produto inválido no botão:", event.target);

    }

}

// Adiciona um item ao carrinho (ou incrementa se já existir)

function addToCart(productId) {

    const productToAdd = products.find(p => p.id === productId);

    if (!productToAdd) {

        console.error("Produto não encontrado:", productId);

        return;

    }

    const existingCartItemIndex = cart.findIndex(item => item.id === productId);

    if (existingCartItemIndex > -1) {

        cart[existingCartItemIndex].quantity++;

    } else {

        cart.push({ ...productToAdd, quantity: 1 });

    }

    saveCartToLocalStorage();

    debouncedUpdateCartDisplay();

}

// Remove completamente um item do carrinho

function removeFromCart(productId) {

    cart = cart.filter(item => item.id !== productId);

    saveCartToLocalStorage();

    updateCartDisplay();

}

// Atualiza a exibição dos itens do carrinho e o valor total

function updateCartDisplay() {

    cartItemsContainer.innerHTML = '';

    let total = 0;

    if (cart.length === 0) {

        const emptyMessage = createElement('li', { class: 'empty-cart-message' }, 'Seu carrinho está vazio.');

        cartItemsContainer.appendChild(emptyMessage);

        checkoutButton.disabled = true;

    } else {

        cart.forEach(item => {

            const quantity = Number(item.quantity) || 0;

            const price = Number(item.price) || 0;

            if (quantity <= 0 || price <= 0) {

                console.warn("Item inválido no carrinho, será ignorado:", item);

                return;

            }

            const li = createElement('li');

            const itemTotal = price * quantity;

            total += itemTotal;

            const itemDetails = createElement('div', { class: 'item-details' });

            const itemName = createElement('span', { class: 'item-name' }, item.name);

            const itemInfo = createElement('span', { class: 'item-info' }, `${quantity} x ${formatCurrency(price)}`);

            itemDetails.appendChild(itemName);

            itemDetails.appendChild(itemInfo);

            const itemTotalPrice = createElement('span', { class: 'item-total-price' }, formatCurrency(itemTotal));

            const removeButton = createElement('button', {

                class: 'remove-item-btn',

                'data-id': item.id,

                title: 'Remover Item',

                'aria-label': `Remover ${item.name} do carrinho`

            }, '×');

            removeButton.addEventListener('click', () => {

                removeFromCart(item.id);

            });

            li.appendChild(itemDetails);

            li.appendChild(itemTotalPrice);

            li.appendChild(removeButton);

            cartItemsContainer.appendChild(li);

        });

        checkoutButton.disabled = false;

    }

    cartTotalElement.textContent = formatCurrency(total);

}

// Função de debounce para evitar muitas atualizações seguidas no DOM

const debouncedUpdateCartDisplay = debounce(updateCartDisplay, 150);

// --- Modal de Exit Intent ---

function showExitIntentModal() {

    if (!modalShown) {

        exitIntentModal.style.display = 'flex';

        void exitIntentModal.offsetWidth; // Força reflow para garantir animação

        exitIntentModal.classList.add('show');

        modalShown = true;

    }

}

function hideExitIntentModal() {

    exitIntentModal.classList.remove('show');

    setTimeout(() => {

        exitIntentModal.style.display = 'none';

    }, 300);

}

// Detecta quando o mouse sai da janela para mostrar o modal

function handleMouseOut(event) {

    if (event.clientY <= 0 && !modalShown && !event.relatedTarget && event.target.nodeName !== 'HTML') {

        showExitIntentModal();

    }

}

// --- Inicialização da Página ---

document.addEventListener('DOMContentLoaded', () => {

    console.log("DOM carregado. Inicializando a loja...");

    // Carrega o carrinho salvo

    cart = loadCartFromLocalStorage();

    console.log("Carrinho carregado do localStorage:", cart);

    renderProducts(); // Mostra os produtos

    updateCartDisplay(); // Atualiza o carrinho

    // Finalizar Compra

    checkoutButton.addEventListener('click', () => {

        if (cart.length > 0) {

            alert(`Compra (simulada) finalizada! Total: ${cartTotalElement.textContent}\n\nItens:\n${cart.map(item => `- ${item.name} (x${item.quantity})`).join('\n')}`);

        } else {

            alert("Seu carrinho está vazio!");

        }

    });

    // Configuração de listeners do modal

    document.addEventListener('mouseout', handleMouseOut);

    closeModalButton.addEventListener('click', hideExitIntentModal);

    modalActionBtn.addEventListener('click', hideExitIntentModal);

    exitIntentModal.addEventListener('click', (event) => {

        if (event.target === exitIntentModal) hideExitIntentModal();

    });

    document.addEventListener('keydown', (event))

});
 
