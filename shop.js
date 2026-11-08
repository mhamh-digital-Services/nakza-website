const cart = [];
const cardPrice = 29;
const currency = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' });
const cartDialog = document.querySelector('#cart-dialog');
const cartItems = document.querySelector('#cart-items');
const cartEmpty = document.querySelector('#cart-empty');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const checkoutStatus = document.querySelector('#checkout-status');

function renderCart() {
  cartCount.textContent = cart.length.toLocaleString('ar-SA');
  cartEmpty.hidden = cart.length > 0;
  cartTotal.textContent = 'الإجمالي: ' + currency.format(cart.length * cardPrice);
  cartItems.replaceChildren();
  cart.forEach(({ gift, summary }, index) => {
    const item = document.createElement('li');
    const details = document.createElement('p');
    details.textContent = summary;
    const price = document.createElement('strong');
    price.textContent = currency.format(cardPrice);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'textlink';
    remove.textContent = 'حذف هدية ' + gift.name;
    remove.addEventListener('click', () => {
      cart.splice(index, 1);
      renderCart();
      (cartItems.querySelector('button') || cartDialog.querySelector('form button')).focus();
    });
    item.append(details, price, remove);
    cartItems.append(item);
  });
}

document.querySelector('#open-cart').addEventListener('click', () => cartDialog.showModal());
document.querySelector('#add-cart').addEventListener('click', () => {
  if (!preparedGift || document.querySelector('#summary').hidden) return;
  if (!cart.some(item => item.summary === result.value)) {
    if (cart.length >= 10) {
      checkoutStatus.textContent = 'الحد الأقصى ١٠ بطاقات في الطلب.';
      cartDialog.showModal();
      return;
    }
    cart.push({ gift: preparedGift, summary: result.value });
  }
  checkoutStatus.textContent = '';
  renderCart();
  cartDialog.showModal();
});

document.querySelector('#checkout-contact').addEventListener('click', () => {
  location.hash = 'contact';
});

renderCart();
