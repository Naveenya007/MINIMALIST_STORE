(function ($) {
  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const cartKey = 'minimalist-store-cart';
  const usersKey = 'minimalist-store-users';
  const sessionKey = 'minimalist-store-session';

  function fallbackProducts() {
    return [
      { id: 1, name: 'Reusable Bottle', price: 499, image: 'images/bottle.jpg', description: 'A clean everyday bottle for low-waste living.', featured: 1 },
      { id: 2, name: 'Minimal Planner', price: 299, image: 'images/planner.jpg', description: 'A calm paper planner for focused days.', featured: 1 },
      { id: 3, name: 'Desk Organizer', price: 899, image: 'images/organizer.jpg', description: 'Keeps essentials tidy without visual clutter.', featured: 1 },
      { id: 4, name: 'Bamboo Toothbrush Set', price: 199, image: 'images/bamboo-brush.jpg', description: 'Eco-friendly oral care for daily use.', featured: 0 },
      { id: 5, name: 'Linen Cushion Cover', price: 699, image: 'images/linen-cushion.jpg', description: 'Neutral textures that soften the room.', featured: 0 },
      { id: 6, name: 'Ceramic Coffee Mug', price: 349, image: 'images/ceramic-mug.jpg', description: 'Simple form and a comfortable grip.', featured: 0 },
      { id: 7, name: 'Soy Wax Scented Candle', price: 399, image: 'images/soy-candle.jpg', description: 'A warm scent with a clean burn.', featured: 0 },
      { id: 8, name: 'Wooden Phone Stand', price: 249, image: 'images/wood-phone-stand.jpg', description: 'A minimal stand for desks and bedside tables.', featured: 0 },
      { id: 9, name: 'Cotton Tote Bag', price: 299, image: 'images/tote-bag.jpg', description: 'A reusable bag for everyday carrying.', featured: 0 },
      { id: 10, name: 'Minimal Wall Clock', price: 1199, image: 'images/wall-clock.jpg', description: 'A quiet clock with a timeless shape.', featured: 0 },
      { id: 11, name: 'Glass Storage Jars', price: 899, image: 'images/glass-jars.jpg', description: 'A set of jars to organize pantry basics.', featured: 0 },
      { id: 12, name: 'Linen Table Runner', price: 649, image: 'images/table-runner.jpg', description: 'An understated accent for the table.', featured: 0 },
      { id: 13, name: 'Ceramic Plant Pot', price: 549, image: 'images/plant-pot.jpg', description: 'Simple planter for desks and shelves.', featured: 0 },
      { id: 14, name: 'Natural Cotton Bath Towel', price: 799, image: 'images/bath-towel.jpg', description: 'Soft, absorbent, and easy to live with.', featured: 0 },
      { id: 15, name: 'Essential Oil Diffuser', price: 1499, image: 'images/diffuser.jpg', description: 'A compact diffuser for slow evenings.', featured: 0 },
      { id: 16, name: 'Minimal Desk Lamp', price: 1299, image: 'images/desk-lamp.jpg', description: 'Task lighting with a clean silhouette.', featured: 0 },
    ];
  }

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(cartKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  function readUsers() {
    try {
      return JSON.parse(localStorage.getItem(usersKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(usersKey, JSON.stringify(users));
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(sessionKey) || 'null');
    } catch (error) {
      return null;
    }
  }

  function writeSession(user) {
    localStorage.setItem(sessionKey, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(sessionKey);
  }

  function fallbackSignup(payload) {
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const confirmPassword = String(payload.confirmPassword || '');

    if (!name || !email || !password || !confirmPassword) {
      return { success: false, message: 'All fields are required' };
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    const users = readUsers();
    if (users.some((user) => user.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    const user = { id: Date.now(), name, email, password };
    users.push(user);
    writeUsers(users);
    writeSession({ id: user.id, name: user.name, email: user.email });

    return { success: true, message: 'Signup successful!' };
  }

  function fallbackLogin(payload) {
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');

    if (!email || !password) {
      return { success: false, message: 'Email and password required' };
    }

    const users = readUsers();
    const user = users.find((entry) => entry.email === email && entry.password === password);
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    writeSession({ id: user.id, name: user.name, email: user.email });
    return { success: true, message: 'Login successful!' };
  }

  function fallbackLogout() {
    clearSession();
    return { success: true, message: 'Logged out successfully' };
  }

  function fallbackCheckSession() {
    const session = readSession();
    return {
      loggedIn: Boolean(session),
      user: session,
    };
  }

  function writeCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartBadge();
  }

  function addToCart(product) {
    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    writeCart(cart);
  }

  function removeFromCart(productId) {
    const updated = readCart().filter((item) => String(item.id) !== String(productId));
    writeCart(updated);
    renderCartPage();
  }

  function updateCartBadge() {
    const count = readCart().reduce((sum, item) => sum + item.quantity, 0);
    $('[data-cart-count]').text(count);
  }

  function toProductButtonData(product) {
    return encodeURIComponent(JSON.stringify(product));
  }

  function renderProducts(products) {
    const grid = $('#product-grid');
    if (!grid.length) {
      return;
    }

    grid.empty();

    products.forEach((product) => {
      const card = $('<article class="card product-card"></article>');
      card.append(`<img src="${product.image}" alt="${product.name}">`);
      card.append(`<h3>${product.name}</h3>`);
      card.append(`<p>${product.description}</p>`);
      card.append(`<p class="price">${currency.format(product.price)}</p>`);
      card.append(`<button type="button" class="add-to-cart" data-product="${toProductButtonData(product)}">Add to Cart</button>`);
      grid.append(card);
    });
  }

  function renderFeatured(products) {
    const featuredContainer = $('#featured-product');
    if (!featuredContainer.length) {
      return;
    }

    const featured = products.find((product) => Number(product.featured) === 1) || products[0];
    if (!featured) {
      return;
    }

    featuredContainer.html(`
      <img src="${featured.image}" alt="${featured.name}">
      <h3>${featured.name}</h3>
      <p>${featured.description}</p>
      <p class="price">${currency.format(featured.price)}</p>
      <button type="button" class="add-to-cart" data-product="${toProductButtonData(featured)}">Add to Cart</button>
    `);
  }

  function renderCartPage() {
    const container = $('#cart-items');
    if (!container.length) {
      return;
    }

    const cart = readCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!cart.length) {
      container.html('<p class="empty-state">Your cart is empty. Browse the products page to add something simple.</p>');
      $('#total').text('Total: ' + currency.format(0));
      return;
    }

    const list = $('<div class="cart-list"></div>');
    cart.forEach((item) => {
      const row = $(
        `<div class="cart-row">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h3>${item.name}</h3>
            <p>${currency.format(item.price)} x ${item.quantity}</p>
          </div>
          <button type="button" class="remove-from-cart" data-id="${item.id}">Remove</button>
        </div>`
      );
      list.append(row);
    });

    container.html(list);
    $('#total').text('Total: ' + currency.format(total));
    displayUserInfo();
  }

  function submitOrder() {
    const form = $('#order-form');
    if (!form.length) {
      return;
    }

    form.on('submit', function (event) {
      event.preventDefault();

      const cart = readCart();
      const payload = {
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };

      $.ajax({
        url: 'api/order.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
      })
        .done((response) => {
          $('#order-status').html('<p class="success">✓ ' + response.message + '</p>');
          writeCart([]);
          renderCartPage();
          form[0].reset();
        })
        .fail((xhr) => {
          const message = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Unable to save the order right now.';
          if (xhr.status === 401) {
            $('#order-status').html('<p class="error">✗ Please log in first to place an order</p>');
          } else {
            $('#order-status').html('<p class="error">✗ ' + message + '</p>');
          }
        });
    });
  }

  function displayUserInfo() {
    $.ajax({
      url: 'api/session.php',
      method: 'GET',
      dataType: 'json',
      success: function(response) {
        if (response.loggedIn && response.user) {
          $('#user-info').text('Placing order as: ' + response.user.name + ' (' + response.user.email + ')');
        }
      }
    });
  }

  function submitContact() {
    const form = $('#contact-form');
    if (!form.length) {
      return;
    }

    form.on('submit', function (event) {
      event.preventDefault();

      $.ajax({
        url: 'api/contact.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          name: $('#contact-name').val(),
          email: $('#contact-email').val(),
          message: $('#contact-message').val(),
        }),
      })
        .done((response) => {
          $('#contact-status').text(response.message).addClass('success');
          form[0].reset();
        })
        .fail((xhr) => {
          const message = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Unable to save the message right now.';
          $('#contact-status').text(message).removeClass('success');
        });
    });
  }

  function bindCartActions() {
    $(document).on('click', '.add-to-cart', function () {
      const encoded = $(this).data('product');
      const product = JSON.parse(decodeURIComponent(encoded));
      addToCart(product);
    });

    $(document).on('click', '.remove-from-cart', function () {
      removeFromCart($(this).data('id'));
    });
  }

  function loadProducts() {
    if (!$('#product-grid').length && !$('#featured-product').length) {
      updateCartBadge();
      renderCartPage();
      submitOrder();
      submitContact();
      return;
    }

    $.getJSON('api/products.php').done((response) => {
      const products = response.products || [];
      renderProducts(products);
      renderFeatured(products);
      updateCartBadge();
      renderCartPage();
      submitOrder();
      submitContact();
    }).fail(() => {
      const products = fallbackProducts();
      renderProducts(products);
      renderFeatured(products);
      updateCartBadge();
      renderCartPage();
      submitOrder();
      submitContact();
    });
  }

  function checkSession() {
    $.ajax({
      url: 'api/session.php',
      method: 'GET',
      dataType: 'json',
      success: function(response) {
        if (response.loggedIn && response.user) {
          $('#user-menu').show();
          $('#auth-menu').hide();
        } else {
          $('#user-menu').hide();
          $('#auth-menu').show();
        }
      },
      error: function() {
        const session = fallbackCheckSession();
        if (session.loggedIn && session.user) {
          $('#user-menu').show();
          $('#auth-menu').hide();
        } else {
          $('#user-menu').hide();
          $('#auth-menu').show();
        }
      }
    });
  }

  function authSignup(payload) {
    return $.ajax({
      url: 'api/signup.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json',
    }).then((response) => response, () => fallbackSignup(payload));
  }

  function authLogin(payload) {
    return $.ajax({
      url: 'api/login.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json',
    }).then((response) => response, () => fallbackLogin(payload));
  }

  function authLogout() {
    return $.ajax({
      url: 'api/logout.php',
      method: 'GET',
      dataType: 'json',
    }).then((response) => response, () => fallbackLogout());
  }

  window.minimalistStoreAuth = {
    signup: authSignup,
    login: authLogin,
    logout: authLogout,
    checkSession: fallbackCheckSession,
  };

  window.logout = function () {
    authLogout().always(() => {
      window.location.href = 'login.html';
    });
    return false;
  };

  $(function () {
    checkSession();
    bindCartActions();
    loadProducts();
  });
})(jQuery);
