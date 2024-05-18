document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('products');
    const cartContainer = document.getElementById('cart');
    let cart = [];

    async function fetchProducts() {
        try {
            const response = await fetch('/products');
            const data = await response.json();
            displayProducts(data.page);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    function displayProducts(products) {
        const defaultImageUrl = 'default.png';  // Path to the default image
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';

            productElement.innerHTML = `
                <img src="${defaultImageUrl}" alt="${product.title}">
                <h2>${product.title}</h2>
                <p>${product.description}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button onclick="addToCart(${product.id}, '${product.title}', ${product.price})">Add to Cart</button>
            `;

            productContainer.appendChild(productElement);
        });
    }

    window.addToCart = function(id, title, price) {
        const product = cart.find(item => item.id === id);
        if (product) {
            product.quantity += 1;
        } else {
            cart.push({ id, title, price, quantity: 1 });
        }
        updateCart();
    }

    function updateCart() {
        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        const ul = document.createElement('ul');
        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            const li = document.createElement('li');
            li.innerHTML = `${item.title} - $${item.price.toFixed(2)} x ${item.quantity}`;
            ul.appendChild(li);
        });

        cartContainer.appendChild(ul);

        const totalElement = document.createElement('p');
        totalElement.className = 'total';
        totalElement.innerHTML = `Total: $${total.toFixed(2)}`;
        cartContainer.appendChild(totalElement);
    }

    window.checkout = async function() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;

        const order = {
            customer_id: 1,
            products: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            })),
            customer_info: {
                name: name,
                delivery_address: address,
                email: email
            }
        };

        try {
            const response = await fetch('/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });

            if (response.ok) {
                alert('Order placed successfully!');
                cart = [];
                updateCart();
                document.getElementById('customer-form').reset();
            } else {
                alert('Failed to place order.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
        }
    }

    fetchProducts();
});
