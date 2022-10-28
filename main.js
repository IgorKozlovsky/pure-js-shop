const productsDOM = document.querySelector(".products-center");
const btnCart = document.querySelector(".navbar-toggler");
const cartTotal = document.querySelector(".cart-total");
const cartCount = document.querySelector(".cart-count");
const cartDOM = document.querySelector(".offcanvas-body");
const btnClearCart = document.querySelector(".btn-clear");
let cart = [];

class Product {
  async getProducts() {
    try {
      const data = await fetch("products.json")
        .then((res) => res.json())
        .then((data) => data.items);
      return data;
    } catch (e) {
      console.log(e);
    }
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((e) => {
      result += `<article class="product">
        <div class="img-container">
          <img src="${e.image}" alt="${e.title} image" class="product-img" />
          <button class="bag-btn" data-id="${e.id}">
            Add to cart
          </button>
        </div>
        <h3>${e.title}</h3>
        <h4>₴${e.price}</h4>
      </article>`;
    });
    productsDOM.innerHTML = result;
  }
  setBtnEvent() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerHTML = "Already in cart";
        button.disabled = true;
      }
      button.addEventListener("click", (e) => {
        button.innerHTML = "Already in cart";
        button.disabled = true;

        let product = { ...Store.getProduct(id), amount: 1 };
        cart = [...cart, product];
        Store.setCart(cart);
        this.setCartValues();
        this.addCartItem(product);
      });
    });
  }
  cartInit() {
    cart = Store.getCart();
    this.setCartValues();
    cart.forEach((item) => this.addCartItem(item));
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src="${item.image}" alt="${item.title} image" />
    <div>
      <h4>${item.title}</h4>
      <h5>₴${item.price}</h5>
      <span class="remove-item" data-id="${item.id}">remove</span>
    </div>
    <div>
      <div class="arrow arrow-top" data-id="${item.id}"></div>
      <p class="item-amount">${item.amount}</p>
      <div class="arrow arrow-bottom" data-id="${item.id}"></div>
    </div>`;
    cartDOM.append(div);
  }
  setCartValues() {
    let totalPrice = 0,
      totalCount = 0;
    cart.map((item) => {
      totalPrice += item.price * item.amount;
      totalCount += item.amount;
    });
    cartTotal.innerHTML = parseFloat(totalPrice.toFixed(2));
    cartCount.innerHTML = totalCount;
  }
  cartButtons() {
    btnClearCart.addEventListener("click", () => this.cartCleanUp());
    cartDOM.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let id = event.target.dataset.id;
        cart = cart.filter((e) => e.id !== id);
        this.setCartValues();
        Store.setCart(cart);
        cartDOM.removeChild(event.target.parentElement.parentElement);
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach((button) => {
          if (button.dataset.id == id) {
            button.disabled = false;
            button.innerHTML = `Add to cart`;
          }
        });
      } else if (event.target.classList.contains("arrow-top")) {
        let id = event.target.dataset.id,
          item = cart.find((e) => e.id === id);
        item.amount++;
        Store.setCart(cart);
        this.setCartValues();
        event.target.nextElementSibling.innerText = item.amount;
      } else if (event.target.classList.contains("arrow-bottom")) {
        let id = event.target.dataset.id,
          item = cart.find((e) => e.id === id);
        item.amount--;
        if (item.amount <= 0) {
          cart = cart.filter((e) => e.id !== id);
          cartDOM.removeChild(event.target.parentElement.parentElement);
          const buttons = [...document.querySelectorAll(".bag-btn")];
          buttons.forEach((button) => {
            if (button.dataset.id == id) {
              button.disabled = false;
              button.innerHTML = `Add to cart`;
            }
          });
        }
        event.target.previousElementSibling.innerText = item.amount;
        Store.setCart(cart);
        this.setCartValues();
      }
    });
  }
  cartCleanUp() {
    cart = [];
    Store.setCart([]);
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach((button) => {
      button.disabled = false;
      button.innerHTML = "Add to cart";
    });
    while (cartDOM.children.length > 0) {
      cartDOM.removeChild(cartDOM.children[0]);
    }
    cartTotal.innerHTML = 0;
    cartCount.innerHTML = 0;
  }
}

class Store {
  static setProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let product = JSON.parse(localStorage.getItem("products")).find((e) => e.id === id);
    return product;
  }
  static setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    let cart = JSON.parse(localStorage.getItem("cart"));
    return cart ? cart : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Product();
  const ui = new UI();
  ui.cartInit();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Store.setProducts(products);
    })
    .then(() => {
      ui.cartButtons();
      ui.setBtnEvent();
    });
});
