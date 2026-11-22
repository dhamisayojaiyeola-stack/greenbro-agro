
// GREENBRO AGRO CUSTOMER SHOPPING SYSTEM

let allProducts = [];
let selectedShoppingItems = [];

const foodSelector = document.getElementById("foodSelector");
const foodOptions = document.getElementById("foodOptions");
const foodFields = document.getElementById("foodFields");
const selectedFoodTitle = document.getElementById("selectedFoodTitle");
const selectedItemsContainer = document.getElementById("selectedItems");
const itemCount = document.getElementById("itemCount");
const shoppingTotal = document.getElementById("shoppingTotal");
const addFoodButton = document.getElementById("addFoodButton");
const proceedToCart = document.getElementById("proceedToCart");


// LOAD PRODUCTS FROM DATABASE

async function loadShopProducts() {
    try {
        const response = await fetch("/api/products");
        const products = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        allProducts = products.filter(function(product) {
            return product.isAvailable !== false &&
                product.variants &&
                product.variants.length > 0;
        });

        foodSelector.innerHTML =
            '<option value="">Choose a foodstuff...</option>';

        allProducts.forEach(function(product, index) {
            const option = document.createElement("option");
            option.value = index;

            option.textContent = product.name +
                (product.brand ? " - " + product.brand : "");

            foodSelector.appendChild(option);
        });

        if (allProducts.length === 0) {
            foodSelector.innerHTML =
                '<option value="">No products available</option>';
        }

    } catch (error) {
        foodSelector.innerHTML =
            '<option value="">Unable to load products</option>';

        console.error(error);
        alert("Could not load products. Please refresh the page.");
    }
}


// SHOW PRODUCT OPTIONS

function showFoodOptions() {

    const productIndex = foodSelector.value;

    foodFields.innerHTML = "";

    if (productIndex === "") {
        foodOptions.hidden = true;
        return;
    }

    const product = allProducts[Number(productIndex)];

    selectedFoodTitle.textContent =
        product.name + (product.brand ? " - " + product.brand : "");

    // SIZE SELECTOR

    const sizeWrapper = document.createElement("div");
    sizeWrapper.className = "food-field";

    const sizeLabel = document.createElement("label");
    sizeLabel.textContent = "Choose Size:";

    const sizeSelect = document.createElement("select");
    sizeSelect.id = "selectedSize";

   product.variants.forEach(function(variant, index) {

    const option = document.createElement("option");
    option.value = index;

    const unitValue = variant.unit || product.unit || "unit";
    const sizeValue = variant.size || "";

    const unitLabels = {
        kg: "kg",
        unit: "unit",
        carton: "carton",
        tubers: "tubers",
        basket: "basket",
        bag: "bag",
        litres: "litres",
        pack: "pack"
    };

    option.textContent =
        (sizeValue ? sizeValue + " " : "") +
        (unitLabels[unitValue] || unitValue) +
        " - " +
        (variant.price === null || variant.price === undefined
            ? "Price coming soon"
            : "₦" + Number(variant.price).toLocaleString());

    sizeSelect.appendChild(option);
});

    sizeWrapper.appendChild(sizeLabel);
    sizeWrapper.appendChild(sizeSelect);

    foodFields.appendChild(sizeWrapper);

    // QUANTITY

    const quantityWrapper = document.createElement("div");
    quantityWrapper.className = "food-field";

    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "Quantity:";

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.id = "selectedQuantity";
    quantityInput.min = "1";
    quantityInput.step = "1";
    quantityInput.value = "1";

    quantityWrapper.appendChild(quantityLabel);
    quantityWrapper.appendChild(quantityInput);

    foodFields.appendChild(quantityWrapper);

    // PRICE INFORMATION

    const priceDisplay = document.createElement("p");
    priceDisplay.id = "selectedPrice";

    foodFields.appendChild(priceDisplay);

    function updatePrice() {

        const variant = product.variants[Number(sizeSelect.value)];

        if (!variant) return;

        priceDisplay.textContent =
            variant.price === null || variant.price === undefined
                ? "Price coming soon"
                : "Unit Price: ₦" +
                    Number(variant.price).toLocaleString();
    }

    sizeSelect.addEventListener("change", updatePrice);

    updatePrice();

    foodOptions.hidden = false;
}


// SHOW SELECTED PRODUCT OPTIONS

foodSelector.addEventListener("change", showFoodOptions);


// ADD PRODUCT TO SHOPPING LIST

function addFoodToShoppingList() {

    const productIndex = foodSelector.value;

    if (productIndex === "") {
        alert("Please select a foodstuff.");
        return;
    }

    const product = allProducts[Number(productIndex)];

    const sizeSelect = document.getElementById("selectedSize");
    const quantityInput = document.getElementById("selectedQuantity");

    const variantIndex = Number(sizeSelect.value);
    const variant = product.variants[variantIndex];

    const quantity = Number(quantityInput.value);

    if (!variant || !Number.isInteger(quantity) || quantity < 1) {
        alert("Please enter a valid quantity.");
        return;
    }

    if (variant.price === null || variant.price === undefined) {
        alert("This product has not been priced yet.");
        return;
    }

    selectedShoppingItems.push({
    productId: product._id,
    name: product.name,
    brand: product.brand || "",
    category: product.category,
    size: variant.size || "",
    unit: variant.unit || product.unit || "unit",
    quantity: quantity,
    price: Number(variant.price),
    variantIndex: variantIndex,
    image: product.image || "image/logo.png"
});

    renderShoppingList();

    foodSelector.value = "";
    foodOptions.hidden = true;
}


// DISPLAY SELECTED ITEMS


function renderShoppingList() {

    selectedItemsContainer.innerHTML = "";

    let grandTotal = 0;
    let totalQuantity = 0;

    if (selectedShoppingItems.length === 0) {
        selectedItemsContainer.innerHTML =
            '<p class="empty-package">Your selected foodstuffs will appear here.</p>';

        shoppingTotal.textContent = "₦0.00";
        itemCount.textContent = "0 items";
        return;
    }

    const table = document.createElement("table");
    table.className = "shopping-list-table";

    table.innerHTML = `
        <thead>
            <tr>
                <th>PRODUCT</th>
                <th>QUANTITY</th>
                <th>SIZE</th>
                <th>PRICE</th>
                <th>ACTION</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    selectedShoppingItems.forEach(function(item, index) {

        const lineTotal = item.price * item.quantity;

        grandTotal += lineTotal;
        totalQuantity += item.quantity;

        const row = document.createElement("tr");

        const productCell = document.createElement("td");
        productCell.textContent = item.name +
            (item.brand ? " - " + item.brand : "");

        const quantityCell = document.createElement("td");
        quantityCell.textContent = item.quantity;

        const sizeCell = document.createElement("td");
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

sizeCell.textContent =
    (item.size ? item.size + " " : "") +
    (unitLabels[item.unit] || item.unit || "Unit");

        const priceCell = document.createElement("td");
        priceCell.textContent = "₦" + lineTotal.toLocaleString();

        const actionCell = document.createElement("td");
        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "remove-shopping-item";

        removeButton.addEventListener("click", function() {
            selectedShoppingItems.splice(index, 1);
            renderShoppingList();
        });

        actionCell.appendChild(removeButton);

        row.appendChild(productCell);
        row.appendChild(quantityCell);
        row.appendChild(sizeCell);
        row.appendChild(priceCell);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });

    selectedItemsContainer.appendChild(table);

    itemCount.textContent = totalQuantity + " units selected";
    shoppingTotal.textContent = "₦" + grandTotal.toLocaleString();
}

// ADD BUTTON

addFoodButton.addEventListener("click", addFoodToShoppingList);


// PROCEED TO CART

proceedToCart.addEventListener("click", function() {

    if (selectedShoppingItems.length === 0) {
        alert("Please add at least one foodstuff to your shopping list.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("greenbroCart")) || [];

    selectedShoppingItems.forEach(function(selectedItem) {

       const existingItem = cart.find(function(item) {
    return item.productId === selectedItem.productId &&
        item.variantIndex === selectedItem.variantIndex;
});

        if (existingItem) {

            existingItem.quantity += selectedItem.quantity;

        } else {

            cart.push({
    productId: selectedItem.productId,
    name: selectedItem.name,
    brand: selectedItem.brand,
    size: selectedItem.size,
    unit: selectedItem.unit,
    quantity: selectedItem.quantity,
    price: selectedItem.price,
    variantIndex: selectedItem.variantIndex,
    image: selectedItem.image
});
        }
    });

    localStorage.setItem("greenbroCart", JSON.stringify(cart));

    window.location.href = "cart.html";
});


// START SHOPPING

loadShopProducts();
