
// GREENBRO AGRO SHOPPING CART

let cart = JSON.parse(localStorage.getItem("greenbroCart")) || [];

const cartDisplay = document.getElementById("cart-count");
const addButtons = document.querySelectorAll(".add-cart-btn");

// Update cart count
function updateCartCount() {
    if (cartDisplay) {
        const total = cart.reduce(function(sum, item) {
            return sum + item.quantity;
        }, 0);

        cartDisplay.textContent = total;
    }
}

// Save cart
function saveCart() {
    localStorage.setItem("greenbroCart", JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Add products
addButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const card = button.closest(".product-card");
        const name = card.querySelector("h3").textContent;
        const sizeSelector = card.querySelector(".product-select");
        const quantityInput = card.querySelector(".product-quantity");

        const size = sizeSelector ? sizeSelector.value : "Per tuber";
        const quantity = Number(quantityInput.value);

        if (!Number.isInteger(quantity) || quantity < 1) {
            alert("Please enter a valid quantity.");
            return;
        }

        const existingItem = cart.find(function(item) {
            return item.name === name && item.size === size;
        });

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                name: name,
                size: size,
                quantity: quantity
            });
        }

        saveCart();

        button.textContent = "Added to Cart ✓";

        setTimeout(function() {
            button.textContent = "Add to Cart";
        }, 1000);
    });
});

// Display products inside the cart page
function displayCart() {

    const cartItems = document.getElementById("cart-items");
    const totalItemsDisplay = document.getElementById("total-items");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    let totalItems = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is currently empty.</p>";
    }

    cart.forEach(function(item, index) {

        totalItems += item.quantity;

        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";

        const name = document.createElement("h3");
        name.textContent = item.name;

        const size = document.createElement("p");
        size.textContent = "Size: " + item.size;

        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + item.quantity;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-cart-btn";

        removeButton.addEventListener("click", function() {
            cart.splice(index, 1);
            saveCart();
        });

        itemDiv.appendChild(name);
        itemDiv.appendChild(size);
        itemDiv.appendChild(quantity);
        itemDiv.appendChild(removeButton);

        cartItems.appendChild(itemDiv);
    });

    if (totalItemsDisplay) {
        totalItemsDisplay.textContent = totalItems;
    }
}

// Load saved cart when page opens
updateCartCount();
displayCart();

/* GREENBRO AGRO HOMEPAGE SLIDER */

const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".slider-dot");
const nextButton = document.querySelector(".next-slide");
const prevButton = document.querySelector(".prev-slide");

if (slides.length > 0) {
    let currentSlide = 0;
    let slideTimer;

    function showSlide(index) {
        slides[currentSlide].classList.remove("active");
        dots[currentSlide].classList.remove("active");

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.add("active");
        dots[currentSlide].classList.add("active");
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function previousSlide() {
        showSlide(currentSlide - 1);
    }

    function startSlider() {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 5000);
    }

    nextButton.addEventListener("click", function() {
        nextSlide();
        startSlider();
    });

    prevButton.addEventListener("click", function() {
        previousSlide();
        startSlider();
    });

    dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
            showSlide(index);
            startSlider();
        });
    });

    startSlider();
}
// GREENBRO AGRO SHOPPING CART
let cart = JSON.parse(localStorage.getItem("greenbroCart")) || [];
