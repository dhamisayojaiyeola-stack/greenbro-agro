
// GREENBRO AGRO SHOPPING CART

let cart = JSON.parse(localStorage.getItem("greenbroCart")) || [];


// Update cart count everywhere the counter appears
function updateCartCount() {

    const cartDisplays = document.querySelectorAll(".cart-count");

    const total = cart.reduce(function(sum, item) {
        return sum + (Number(item.quantity) || 0);
    }, 0);

    cartDisplays.forEach(function(display) {
        display.textContent = total;
    });

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

// DISPLAY PRODUCTS INSIDE THE CART PAGE

function displayCart() {

    const cartItems = document.getElementById("cart-items");
    const totalItemsDisplay = document.getElementById("total-items");
    const cartTotalDisplay = document.getElementById("cart-total");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    let totalItems = 0;
    let grandTotal = 0;

    if (cart.length === 0) {

        cartItems.innerHTML = "<p>Your cart is currently empty.</p>";

    }

    cart.forEach(function(item, index) {

        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const subtotal = price * quantity;

        totalItems += quantity;
        grandTotal += subtotal;

        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";

        const name = document.createElement("h3");
        name.textContent = item.name +
            (item.brand ? " - " + item.brand : "");

        const size = document.createElement("p");

        const unitLabels = {
            kg: "Kilogram (kg)",
            unit: "Unit",
            carton: "Carton",
            tubers: "Tubers",
            basket: "Basket",
            bag: "Bag",
            litres: "Litres",
            pack: "Pack"
        };

        size.textContent = "Size: " +
            (item.size ? item.size + " " : "") +
            (unitLabels[item.unit] || item.unit || "Unit");

        const priceDisplay = document.createElement("p");
        priceDisplay.textContent =
            "Price per unit: ₦" + price.toLocaleString();

       const quantityContainer = document.createElement("div");
quantityContainer.className = "cart-quantity-control";

const decreaseButton = document.createElement("button");
decreaseButton.textContent = "−";
decreaseButton.className = "quantity-btn";

const quantityDisplay = document.createElement("span");
quantityDisplay.textContent = quantity;

const increaseButton = document.createElement("button");
increaseButton.textContent = "+";
increaseButton.className = "quantity-btn";

decreaseButton.addEventListener("click", function() {
    if (quantity > 1) {
        item.quantity--;
        saveCart();
    }
});

increaseButton.addEventListener("click", function() {
    item.quantity++;
    saveCart();
});

quantityContainer.appendChild(decreaseButton);
quantityContainer.appendChild(quantityDisplay);
quantityContainer.appendChild(increaseButton);

        const subtotalDisplay = document.createElement("p");
        subtotalDisplay.textContent =
            "Subtotal: ₦" + subtotal.toLocaleString();

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-cart-btn";

        removeButton.addEventListener("click", function() {
            cart.splice(index, 1);
            saveCart();
        });

        itemDiv.appendChild(name);
        itemDiv.appendChild(size);
        itemDiv.appendChild(priceDisplay);
        itemDiv.appendChild(quantityContainer);
        itemDiv.appendChild(subtotalDisplay);
        itemDiv.appendChild(removeButton);

        cartItems.appendChild(itemDiv);

    });

    if (totalItemsDisplay) {
        totalItemsDisplay.textContent = totalItems;
    }

    if (cartTotalDisplay) {
        cartTotalDisplay.textContent =
            "₦" + grandTotal.toLocaleString();
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
