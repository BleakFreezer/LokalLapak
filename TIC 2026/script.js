// Cart management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartAutoCloseTimeout = null;
let allProducts = []; // Store all products for filtering

// Search management - Store recently viewed products (not search keywords)
let recentViewedProducts = JSON.parse(localStorage.getItem('recentViewedProducts')) || [];

// Initialize splash screen
function initSplashScreen() {
  // Check if user coming back from detail.html
  const comingFromDetail = sessionStorage.getItem('comingFromDetail');
  
  // If coming from detail.html, hide splash immediately and clear the flag
  if (comingFromDetail) {
    sessionStorage.removeItem('comingFromDetail');
    hideSplashScreen();
    return;
  }
  
  // Check if splash screen has been shown in this session (fresh load/refresh)
  if (!sessionStorage.getItem('splashScreenShown')) {
    const splashScreen = document.getElementById('splash-screen');
    
    // Mark splash screen as shown in this session
    sessionStorage.setItem('splashScreenShown', 'true');
    
    // Auto hide splash screen after 1 second
    setTimeout(() => {
      hideSplashScreen();
    }, 1000);
    
    // Allow manual dismiss by clicking on splash screen
    splashScreen.addEventListener('click', hideSplashScreen);
  } else {
    // Hide splash screen immediately if already shown in this session
    hideSplashScreen();
  }
}

function hideSplashScreen() {
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    splashScreen.classList.add('hide');
    // Remove the element from DOM after animation completes
    setTimeout(() => {
      if (splashScreen.parentNode) {
        splashScreen.remove();
      }
    }, 500);
  }
}

// Set flag when user navigates to detail.html
document.addEventListener('click', function(e) {
  const link = e.target.closest('a[href*="detail.html"]');
  if (link) {
    sessionStorage.setItem('comingFromDetail', 'true');
  }
});

// Ensure splash screen is hidden when returning from detail.html via pageshow
window.addEventListener('pageshow', (event) => {
  const comingFromDetail = sessionStorage.getItem('comingFromDetail');
  if (comingFromDetail && !event.persisted) {
    sessionStorage.setItem('comingFromDetail', 'true');
  }
});

// Trigger splash screen for successful purchase
function triggerBuySuccessSplash() {
  const body = document.body;
  const splashHTML = `
    <div id="buy-success-splash" class="buy-success-splash">
      <div class="buy-success-content">
        <div class="buy-success-icon">✓</div>
        <h2 class="buy-success-title">Pesanan Berhasil!</h2>
        <p class="buy-success-subtitle">Terima kasih telah berbelanja</p>
      </div>
    </div>
  `;
  
  body.insertAdjacentHTML('beforeend', splashHTML);
  const splash = document.getElementById('buy-success-splash');
  
  // Auto hide after 2 seconds
  setTimeout(() => {
    splash.classList.add('hide');
    setTimeout(() => {
      splash.remove();
    }, 500);
  }, 2000);
}

// Make it globally accessible
window.triggerBuySuccessSplash = triggerBuySuccessSplash;

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', async function() {
  initSplashScreen();
  await loadAndRenderProducts();
  initNavAnimation();
  initCategoryFilter();
  setupPageNavigation();
  initCartFunctionality();
  initViewToggle();
  initSearchFunctionality();
  trackProductClicks();
  initSubmitSnackModal();
  renderOrderHistory();
});

// Load products from JSON and render dynamically
async function loadAndRenderProducts() {
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    allProducts = data.products;
    renderProductsList(allProducts);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Render products list
function renderProductsList(products) {
  const productList = document.getElementById('product-list');
  const currentView = localStorage.getItem('productView') || 'list';
  productList.classList.remove('product-list-layout', 'product-grid-layout');
  productList.classList.add(`product-${currentView}-layout`);
  productList.innerHTML = products.map(product => generateProductCard(product, currentView)).join('');
}

// Generate product card HTML
function generateProductCard(product, viewMode = 'list') {
  const isLeftLayout = product.id % 2 === 1; // Alternate layout
  const badgeHtml = product.badge ? 
    `<span class="absolute top-4 ${isLeftLayout ? 'left-4' : 'right-4'} bg-${product.badgeColor}-container text-on-${product.badgeColor}-container px-3 py-1 rounded-full text-xs font-bold">${product.badge}</span>` : '';
  
  if (viewMode === 'grid') {
    // Grid layout
    const reviewHtml = product.reviews && product.reviews.length > 0 ? 
      product.reviews[0].text : 'Produk terbaik!';
    
    return `
      <article class="product-card bg-surface-container-lowest rounded-lg p-4 relative group transition-all flex flex-col" data-category="${product.category}" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}" data-product-image="${product.image}">
        <div class="w-full h-32 bg-surface rounded-lg overflow-hidden mb-3 shadow-lg relative">
          <img alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${product.image}"/>
          ${badgeHtml}
        </div>
        <div class="flex-1 flex flex-col">
          <h3 class="text-sm font-bold text-on-surface mb-1 line-clamp-2">${product.name}</h3>
          <div class="flex items-center gap-1 mb-2">
            <span class="material-symbols-outlined text-[#ffd709] text-xs" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="text-xs font-bold text-on-surface">${product.rating}</span>
            <span class="text-xs text-on-surface-variant">(${(product.sold / 1000).toFixed(1)}k)</span>
          </div>
          <p class="text-primary font-bold text-sm mb-3">Rp ${product.price.toLocaleString('id-ID')}</p>
          <div class="flex gap-2 mt-auto">
            <a href="detail.html?id=${product.id}" class="flex-1 bg-primary-container text-on-primary-container py-2 rounded-full font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform no-underline text-center">
              <span class="material-symbols-outlined text-sm">info</span>
            </a>
            <button class="w-10 bg-secondary-container text-on-secondary-container py-2 rounded-full font-bold flex items-center justify-center active:scale-95 transition-transform add-to-cart-btn hover:opacity-90">
              <span class="material-symbols-outlined text-sm">shopping_bag</span>
            </button>
          </div>
        </div>
      </article>
    `;
  } else {
    // List layout (original)
    const imageRow = isLeftLayout ? 'md:flex-row' : 'md:flex-row-reverse';
    
    const reviewHtml = product.reviews && product.reviews.length > 0 ? 
      product.reviews[0].text : 'Produk terbaik!';
    
    return `
      <article class="product-card bg-surface-container-lowest rounded-lg p-6 relative group transition-all" data-category="${product.category}" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}" data-product-image="${product.image}">
        <div class="flex flex-col ${imageRow} gap-6">
          <div class="w-full md:w-48 h-48 bg-surface rounded-lg overflow-hidden shadow-lg relative flex-shrink-0">
            <img alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${product.image}"/>
            ${badgeHtml}
          </div>
          <div class="flex-1 pt-2">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-on-surface">${product.name}</h3>
              <span class="text-primary font-bold text-lg">Rp ${product.price.toLocaleString('id-ID')}</span>
            </div>
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-[#ffd709]" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="text-xs font-bold text-on-surface">${product.rating}</span>
              <span class="text-xs text-on-surface-variant">(${(product.sold / 1000).toFixed(1)}k terjual)</span>
            </div>
            <div class="bg-surface-container-low p-4 rounded-md border-l-4 border-primary italic text-sm text-on-surface-variant mb-6">
              "${reviewHtml}"
            </div>
            <div class="flex gap-3">
              <a href="detail.html?id=${product.id}" class="flex-1 bg-primary-container text-on-primary-container py-3 rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform no-underline text-center">
                <span class="material-symbols-outlined text-xl">info</span>
                Lihat Detail
              </a>
              <button class="w-16 bg-secondary-container text-on-secondary-container py-3 rounded-full font-bold flex items-center justify-center active:scale-95 transition-transform add-to-cart-btn hover:opacity-90">
                <span class="material-symbols-outlined text-xl">shopping_bag</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }
}

// View Toggle Functionality
function initViewToggle() {
  const viewToggle = document.getElementById('view-toggle');
  const currentView = localStorage.getItem('productView') || 'list';
  
  // Set initial icon based on saved view
  updateViewToggleIcon(currentView);
  
  viewToggle.addEventListener('click', function() {
    const productList = document.getElementById('product-list');
    let newView = productList.classList.contains('product-grid-layout') ? 'list' : 'grid';
    
    // Save preference
    localStorage.setItem('productView', newView);
    
    // Update layout for products
    productList.classList.remove('product-list-layout', 'product-grid-layout');
    productList.classList.add(`product-${newView}-layout`);
    
    // Update icon
    updateViewToggleIcon(newView);
    
    // Re-render products with new layout
    renderProductsList(allProducts);
    
    // Re-render order history with new layout
    if (typeof renderOrderHistory === 'function') {
      renderOrderHistory();
    }
  });
}

function updateViewToggleIcon(viewMode) {
  const viewToggle = document.getElementById('view-toggle');
  viewToggle.textContent = viewMode === 'list' ? 'view_agenda' : 'grid_view';
}

// Cart Functionality
function initCartFunctionality() {
  // Add to cart buttons - using event delegation for better reliability
  document.addEventListener('click', function(e) {
    if (e.target.closest('.add-to-cart-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.add-to-cart-btn');
      const product = btn.closest('.product-card');
      
      if (!product) return;
      
      const productId = product.getAttribute('data-product-id');
      const productName = product.getAttribute('data-product-name');
      const productPrice = parseInt(product.getAttribute('data-product-price'));
      const productImage = product.getAttribute('data-product-image');

      if (!productId || !productName || !productPrice || !productImage) {
        console.error('Product missing attributes:', { productId, productName, productPrice, productImage });
        return;
      }

      addToCart({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage
      });

      openCart(true); // true = auto-close after 2.5 seconds
    }
  });

  // FAB cart button - don't auto-close
  document.getElementById('fab-cart').addEventListener('click', function() {
    openCart(false);
  });

  // Close cart button - cancel auto-close if exists
  document.getElementById('cart-close').addEventListener('click', function() {
    clearTimeout(cartAutoCloseTimeout);
    closeCart();
  });

  // Backdrop click - cancel auto-close if exists
  document.getElementById('cart-backdrop').addEventListener('click', function() {
    clearTimeout(cartAutoCloseTimeout);
    closeCart();
  });

  // Cart items interaction - cancel auto-close
  document.addEventListener('click', function(e) {
    if (e.target.closest('.quantity-plus, .quantity-minus, .delete-item-btn')) {
      clearTimeout(cartAutoCloseTimeout);
    }
  });

  // Clear all cart button
  document.getElementById('clear-cart-btn').addEventListener('click', function() {
    if (cart.length === 0) return;
    if (confirm('Yakin ingin menghapus semua item dari keranjang?')) {
      clearCart();
    }
  });

  // Render cart on load
  renderCart();
}

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartBadge();
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;
  
  cart = [];
  saveCart();
  updateCartBadge();
  renderCart();
}

function updateQuantity(productId, quantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCart();
      renderCart();
    }
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartTotal = document.getElementById('cart-total');

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '';
    emptyCartMessage.classList.remove('hidden');
    emptyCartMessage.classList.add('show');
    cartItemsContainer.style.display = 'none';
    cartTotal.textContent = 'Rp 0';
    updateCartBadge();
    return;
  }

  emptyCartMessage.classList.add('hidden');
  emptyCartMessage.classList.remove('show');
  cartItemsContainer.style.display = '';

  cartItemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item flex gap-4 items-center" data-product-id="${item.id}">
      <div class="w-24 h-24 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0">
        <img class="w-full h-full object-cover" src="${item.image}" alt="${item.name}"/>
      </div>
      <div class="flex-1 space-y-1">
        <h3 class="font-headline font-bold text-lg text-on-surface leading-tight">${item.name}</h3>
        <p class="text-primary font-bold">Rp ${item.price.toLocaleString('id-ID')}</p>
        <div class="flex items-center gap-3 pt-1">
          <div class="flex items-center bg-surface-container-high rounded-full p-1 border border-outline-variant/10">
            <button class="w-8 h-8 flex items-center justify-center text-on-surface hover:text-primary transition-colors quantity-minus" data-product-id="${item.id}">
              <span class="material-symbols-outlined text-sm">remove</span>
            </button>
            <span class="px-3 font-bold font-label cart-item-quantity" data-quantity="${item.quantity}">${item.quantity}</span>
            <button class="w-8 h-8 flex items-center justify-center text-on-surface hover:text-primary transition-colors quantity-plus" data-product-id="${item.id}">
              <span class="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <button class="text-error hover:opacity-70 transition-opacity delete-item-btn" data-product-id="${item.id}" title="Remove from cart">
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Attach event listeners for quantity controls with smooth animation
  document.querySelectorAll('.quantity-plus').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const item = cart.find(i => i.id === productId);
      if (item) {
        // Trigger quantity animation
        const quantitySpan = this.closest('.flex').querySelector('.cart-item-quantity');
        if (quantitySpan) {
          quantitySpan.classList.add('updating');
          setTimeout(() => quantitySpan.classList.remove('updating'), 200);
        }
        updateQuantity(productId, item.quantity + 1);
      }
    });
  });

  document.querySelectorAll('.quantity-minus').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const item = cart.find(i => i.id === productId);
      if (item) {
        // Trigger quantity animation
        const quantitySpan = this.closest('.flex').querySelector('.cart-item-quantity');
        if (quantitySpan) {
          quantitySpan.classList.add('updating');
          setTimeout(() => quantitySpan.classList.remove('updating'), 200);
        }
        updateQuantity(productId, item.quantity - 1);
      }
    });
  });

  // Attach event listeners for delete buttons with smooth removal animation
  document.querySelectorAll('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const cartItem = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
      
      // Start removal animation
      if (cartItem) {
        cartItem.classList.add('removing');
        // Wait for animation to complete before removing from cart
        setTimeout(() => {
          removeFromCart(productId);
        }, 300);
      } else {
        removeFromCart(productId);
      }
    });
  });

  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  updateCartBadge();
}

// Update cart badge with item count
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalItems === 0) {
    badge.classList.add('hidden');
  } else {
    badge.classList.remove('hidden');
    badge.textContent = totalItems > 99 ? '99+' : totalItems;
    // Trigger bounce animation
    badge.classList.remove('update');
    void badge.offsetWidth; // Trigger reflow
    badge.classList.add('update');
  }
}

function openCart(autoClose = false) {
  // Clear any existing auto-close timeout
  clearTimeout(cartAutoCloseTimeout);
  
  const modal = document.getElementById('cart-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
    // Show toast notification if it's from 'add to cart' button
  if (autoClose) {
    showToast();
  }
    // Auto-close after 2.5 seconds if it's from 'add to cart' button
  if (autoClose) {
    cartAutoCloseTimeout = setTimeout(() => {
      closeCart();
    }, 1000);
  }
}

function closeCart() {
  const modal = document.getElementById('cart-modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function showToast() {
  const toast = document.getElementById('toast-notification');
  // Remove and re-add class to trigger animation
  toast.classList.remove('show');
  // Trigger reflow to restart animation
  void toast.offsetWidth;
  toast.classList.add('show');
}

// Show toast notification with custom message
function showToastNotification(message) {
  const toast = document.getElementById('toast-notification');
  toast.textContent = message;
  toast.classList.remove('show');
  // Trigger reflow to restart animation
  void toast.offsetWidth;
  toast.classList.add('show');
}

// Navbar Liquid Glass Animation
function initNavAnimation() {
  const navItems = document.querySelectorAll('.nav-item');
  const navBubble = document.getElementById('navBubble');

  function updateBubble(item) {
    if (!item || !navBubble) return;
    const itemRect = item.getBoundingClientRect();
    const containerRect = item.parentElement.getBoundingClientRect();

    navBubble.style.left = (itemRect.left - containerRect.left) + 'px';
    navBubble.style.width = itemRect.width + 'px';
  }

  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const page = this.getAttribute('data-page');
      if (page) {
        e.preventDefault();
        showPage(page);
        
        navItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        updateBubble(this);
      }
    });
  });

  // Set initial bubble position
  const activeItem = document.querySelector('.nav-item.active');
  if (activeItem) {
    updateBubble(activeItem);
  }

  // Update on window resize
  window.addEventListener('resize', () => {
    updateBubble(document.querySelector('.nav-item.active'));
  });
}

// Category Filter
function initCategoryFilter() {
  document.querySelectorAll('.category-filter').forEach(button => {
    button.addEventListener('click', function() {
      const selectedCategory = this.getAttribute('data-category');

      // Update active button styling
      document.querySelectorAll('.category-filter').forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-semibold');
        btn.classList.add('bg-surface-container-high', 'text-on-surface-variant', 'font-medium');
      });

      this.classList.remove('bg-surface-container-high', 'text-on-surface-variant', 'font-medium');
      this.classList.add('bg-primary-container', 'text-on-primary-container', 'font-semibold');
      this.style.backgroundColor = '#fd8b00';
      this.style.color = '#442100';

      // Filter products
      document.querySelectorAll('.product-card').forEach(product => {
        const productCategory = product.getAttribute('data-category');

        if (selectedCategory === 'semua' || productCategory === selectedCategory) {
          product.style.display = 'block';
          setTimeout(() => {
            product.style.opacity = '1';
          }, 10);
        } else {
          product.style.display = 'none';
          product.style.opacity = '0';
        }
      });
    });
  });
}

// Page Navigation
function setupPageNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const page = this.getAttribute('data-page');
      if (page) {
        e.preventDefault();
        // Update hash without reloading page
        window.location.hash = page;
        showPage(page);
      }
    });
  });
  
  // Handle hash change (for browser back/forward buttons)
  window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1); // Remove # from hash
    const validPages = ['beranda', 'kategori', 'pesanan'];
    if (validPages.includes(hash)) {
      showPage(hash);
    }
  });
  
  // Handle initial page load with hash
  const initialHash = window.location.hash.substring(1);
  const validPages = ['beranda', 'kategori', 'pesanan'];
  if (initialHash && validPages.includes(initialHash)) {
    showPage(initialHash);
  }
}

function showPage(pageName) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const targetSection = document.getElementById(pageName + '-page');
  if (targetSection) {
    targetSection.classList.add('active');
    window.scrollTo(0, 0);
  }

  // Update navbar active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === pageName) {
      item.classList.add('active');
    }
  });

  // Update bubble position
  const activeNavItem = document.querySelector('.nav-item.active');
  if (activeNavItem) {
    const navBubble = document.getElementById('navBubble');
    if (navBubble) {
      const itemRect = activeNavItem.getBoundingClientRect();
      const containerRect = activeNavItem.parentElement.getBoundingClientRect();
      navBubble.style.left = (itemRect.left - containerRect.left) + 'px';
      navBubble.style.width = itemRect.width + 'px';
    }
  }
}

// Track product clicks for history
function trackProductClicks() {
  // Delegated event listener for all detail.html links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="detail.html"]');
    if (link) {
      const detailUrl = link.getAttribute('href');
      const match = detailUrl.match(/id=(\d+)/);
      if (match) {
        const productId = parseInt(match[1]);
        const product = allProducts.find(p => p.id === productId);
        if (product) {
          addToRecentViewedProducts(product);
        }
      }
    }
  });
}

// Make showPage globally accessible for onclick handlers
window.showPage = showPage;

// ============ SEARCH FUNCTIONALITY ============
function initSearchFunctionality() {
  const searchBtn = document.getElementById('search-btn');
  const searchModal = document.getElementById('search-modal');
  const searchBackBtn = document.getElementById('search-back-btn');
  const searchFindBtn = document.getElementById('search-find-btn');
  const searchInput = document.getElementById('search-input');

  // Open search modal
  if (searchBtn) {
    searchBtn.addEventListener('click', openSearchModal);
  }

  // Close search modal
  if (searchBackBtn) {
    searchBackBtn.addEventListener('click', closeSearchModal);
  }

  // Search find button
  if (searchFindBtn) {
    searchFindBtn.addEventListener('click', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (query.length > 0) {
        performSearch(query);
      }
    });
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim().toLowerCase();
      if (query.length > 0) {
        performSearch(query);
      } else {
        renderSearchInitialState();
      }
    });

    // Handle Enter key
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        const query = this.value.trim().toLowerCase();
        performSearch(query);
      }
    });
  }

  // Initial render
  renderSearchInitialState();
}

function openSearchModal() {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Focus input after modal opens
  setTimeout(() => {
    input.focus();
  }, 100);
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  
  // Clear input
  input.value = '';
  renderSearchInitialState();
}

function renderSearchInitialState() {
  const resultsSection = document.getElementById('search-results-section');
  const recentSection = document.getElementById('recent-section');
  const popularSection = document.getElementById('popular-section');
  const categoriesSection = document.getElementById('categories-section');

  // Hide results section
  resultsSection.classList.add('hidden');

  // Show other sections
  recentSection.classList.remove('hidden');
  popularSection.classList.remove('hidden');
  categoriesSection.classList.remove('hidden');

  // Render recent searches
  renderRecentSearches();

  // Render popular products
  renderPopularProducts();
}

function renderRecentSearches() {
  const container = document.getElementById('recent-searches');
  container.innerHTML = '';

  if (recentViewedProducts.length === 0) {
    container.innerHTML = '<div style="color: #5b5c5b; font-size: 0.875rem;">Belum ada produk yang dilihat</div>';
    return;
  }

  const recentContainer = document.createElement('div');
  recentContainer.style.display = 'grid';
  recentContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
  recentContainer.style.gap = '1rem';

  recentViewedProducts.slice(0, 5).forEach(product => {
    const item = document.createElement('a');
    item.href = `detail.html?id=${product.id}`;
    item.className = 'search-result-item';
    item.style.textDecoration = 'none';
    item.style.color = 'inherit';
    item.innerHTML = `
      <div class="search-result-image">
        <img alt="${product.name}" src="${product.image}">
      </div>
      <div class="search-result-name" style="font-size: 0.75rem;">${product.name}</div>
      <div class="search-result-price" style="font-size: 0.75rem;">Rp ${product.price.toLocaleString('id-ID')}</div>
    `;
    item.addEventListener('click', () => {
      addToRecentViewedProducts(product);
    });
    recentContainer.appendChild(item);
  });

  container.appendChild(recentContainer);
}

function renderPopularProducts() {
  const container = document.getElementById('popular-items');
  container.innerHTML = '';

  // Get top 3 products by sold quantity
  const topProducts = allProducts.sort((a, b) => b.sold - a.sold).slice(0, 3);

  topProducts.forEach((product, index) => {
    const item = document.createElement('div');
    item.className = 'popular-item';
    item.innerHTML = `
      <div class=\"popular-item-rank\">#${index + 1}</div>
      <div class=\"popular-item-image\">
        <img alt=\"${product.name}\" src=\"${product.image}\">
      </div>
      <div class=\"popular-item-info\">
        <div class=\"popular-item-name\">${product.name}</div>
        <div class=\"popular-item-rating\">
          <span style=\"color: #ffd709;\">★</span>
          ${product.rating} • ${(product.sold / 1000).toFixed(1)}k terjual
        </div>
      </div>
    `;
    item.addEventListener('click', (e) => {
      e.preventDefault();
      addToRecentViewedProducts(product);
      window.location.href = `detail.html?id=${product.id}`;
    });
    container.appendChild(item);
  });
}

function performSearch(query) {
  const resultsSection = document.getElementById('search-results-section');
  const recentSection = document.getElementById('recent-section');
  const popularSection = document.getElementById('popular-section');
  const categoriesSection = document.getElementById('categories-section');
  const resultsContainer = document.getElementById('search-results');

  // Hide other sections
  recentSection.classList.add('hidden');
  popularSection.classList.add('hidden');
  categoriesSection.classList.add('hidden');

  // Show results section
  resultsSection.classList.remove('hidden');

  // Filter products
  const results = allProducts.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );

  // Render results
  resultsContainer.innerHTML = '';
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div style=\"grid-column: 1 / -1; text-align: center; padding: 2rem; color: #5b5c5b;\">
        <span class=\"material-symbols-outlined\" style=\"font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.5;\">search_off</span>
        <p>Tidak ada produk yang cocok</p>
      </div>
    `;
    return;
  }

  results.forEach(product => {
    const item = document.createElement('a');
    item.href = `detail.html?id=${product.id}`;
    item.className = 'search-result-item';
    item.innerHTML = `
      <div class=\"search-result-image\">
        <img alt=\"${product.name}\" src=\"${product.image}\">
      </div>
      <div class=\"search-result-name\">${product.name}</div>
      <div class=\"search-result-price\">Rp ${product.price.toLocaleString('id-ID')}</div>
    `;    item.addEventListener('click', (e) => {
      e.preventDefault();
      addToRecentViewedProducts(product);
      window.location.href = `detail.html?id=${product.id}`;
    });    item.addEventListener('click', (e) => {
      e.preventDefault();
      addToRecentViewedProducts(product);
      window.location.href = `detail.html?id=${product.id}`;
    });
    resultsContainer.appendChild(item);
  });
}

function addToRecentViewedProducts(product) {
  // Remove if already exists and add to front
  recentViewedProducts = recentViewedProducts.filter(p => p.id !== product.id);
  recentViewedProducts.unshift(product);

  // Keep only last 10 viewed products
  recentViewedProducts = recentViewedProducts.slice(0, 10);

  // Save to localStorage
  localStorage.setItem('recentViewedProducts', JSON.stringify(recentViewedProducts));
}

function searchByCategory(category) {
  const searchInput = document.getElementById('search-input');
  const categoryName = {
    'pedes': 'Pedas',
    'manis': 'Manis',
    'sehat': 'Sehat',
    'kiloan': 'Kiloan'
  };

  searchInput.value = categoryName[category] || '';
  performSearch(category);
}

// Make searchByCategory globally accessible for onclick handlers
window.searchByCategory = searchByCategory;

// ============ AJUKAN JAJANAN MODAL FUNCTIONALITY ============
function initSubmitSnackModal() {
  const modal = document.getElementById('ajukan-modal');
  if (!modal) return;
  
  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeSubmitSnackModal();
    }
  });
  
  // Initialize rating stars
  initRatingStars();
}

function openSubmitSnackModal() {
  const modal = document.getElementById('ajukan-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSubmitSnackModal() {
  const modal = document.getElementById('ajukan-modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  
  // Reset form
  document.querySelector('.ajukan-form').reset();
  resetRating();
}

// Initialize rating stars
function initRatingStars() {
  const ratingGroup = document.getElementById('rating-group');
  const ratingInput = document.getElementById('snack-rating');
  
  if (!ratingGroup) return;
  
  const stars = ratingGroup.querySelectorAll('.rating-star');
  
  stars.forEach(star => {
    star.addEventListener('click', function(e) {
      e.preventDefault();
      const rating = this.getAttribute('data-rating');
      ratingInput.value = rating;
      
      // Update visual state
      stars.forEach(s => s.classList.remove('active'));
      for (let i = 0; i < rating; i++) {
        stars[i].classList.add('active');
      }
    });
    
    star.addEventListener('mouseenter', function() {
      const hoverRating = this.getAttribute('data-rating');
      stars.forEach((s, index) => {
        if (index < hoverRating) {
          s.style.color = '#ffd709';
        } else {
          s.style.color = '#adadac';
        }
      });
    });
  });
  
  ratingGroup.addEventListener('mouseleave', function() {
    const currentRating = ratingInput.value;
    stars.forEach((s, index) => {
      if (index < currentRating) {
        s.style.color = '#ffd709';
      } else {
        s.style.color = '#adadac';
      }
    });
  });
}

function resetRating() {
  const ratingInput = document.getElementById('snack-rating');
  const stars = document.querySelectorAll('.rating-star');
  ratingInput.value = '';
  stars.forEach(s => {
    s.classList.remove('active');
    s.style.color = '#adadac';
  });
}

// Make openSubmitSnackModal globally accessible for onclick handlers
window.openSubmitSnackModal = openSubmitSnackModal;
window.closeSubmitSnackModal = closeSubmitSnackModal;

// ============ REFERRAL PROGRAM FUNCTIONALITY ============

// Calculate discount based on number of successful referrals
// 10% for 1-9 uses, 20% for 10-19, 30% for 20-29, etc.
function calculateReferralDiscount(successCount) {
  if (successCount === 0) return 0;
  
  // Progressive discount: Base 10% + 10% for every 10 successful referrals
  // 1-9: 10%, 10-19: 20%, 20-29: 30%, etc.
  const discountTier = Math.floor((successCount - 1) / 10) + 1;
  return discountTier * 10;
}

// Generate unique referral code for user
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Initialize referral system
function initReferralSystem() {
  // Check if user already has a referral code, if not generate one
  let referralData = JSON.parse(localStorage.getItem('referralData')) || {};
  
  if (!referralData.code) {
    referralData.code = generateReferralCode();
    referralData.createdAt = new Date().toISOString();
    referralData.referrals = []; // Array to track referred users
    referralData.successfulReferrals = 0; // Count successful referrals
  }
  
  localStorage.setItem('referralData', JSON.stringify(referralData));
  
  // Setup referral UI
  setupReferralUI(referralData);
  
  // Check for referral parameter in URL
  checkReferralParameter();
}

// Setup referral UI elements
function setupReferralUI(referralData) {
  // Display referral code
  const codeDisplay = document.getElementById('referral-code-display');
  if (codeDisplay) {
    codeDisplay.textContent = referralData.code;
  }
  
  // Update referral counts
  const referralCount = document.getElementById('referral-count');
  const successCount = document.getElementById('referral-success-count');
  
  if (referralCount) {
    referralCount.textContent = referralData.referrals ? referralData.referrals.length : 0;
  }
  
  if (successCount) {
    successCount.textContent = referralData.successfulReferrals || 0;
  }
  
  // Update discount display
  updateDiscountDisplay(referralData.successfulReferrals || 0);
  
  // Setup copy referral code button
  const copyCodeBtn = document.getElementById('copy-referral-btn');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', function() {
      copyToClipboard(referralData.code, 'Kode referral disalin!');
    });
  }
  
  // Setup WhatsApp share button
  const whatsappBtn = document.getElementById('whatsapp-share-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', function() {
      shareViaWhatsApp(referralData.code, referralData.successfulReferrals || 0);
    });
  }
  
  // Setup copy link button
  const copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function() {
      const referralLink = generateReferralLink(referralData.code);
      copyToClipboard(referralLink, 'Link referral disalin!');
    });
  }
}

// Update discount display
function updateDiscountDisplay(successCount) {
  const currentDiscount = calculateReferralDiscount(successCount);
  const currentDiscountEl = document.getElementById('current-discount');
  const nextMilestoneEl = document.getElementById('next-discount-milestone');
  
  if (currentDiscountEl) {
    currentDiscountEl.textContent = currentDiscount + '%';
  }
  
  if (nextMilestoneEl) {
    const nextTier = Math.floor(successCount / 10) + 1;
    const nextMilestoneCount = nextTier * 10;
    const remaining = nextMilestoneCount - successCount;
    
    if (successCount === 0) {
      nextMilestoneEl.textContent = 'Dapatkan 1 orang berhasil untuk dapat diskon 10%';
    } else if (remaining > 0) {
      nextMilestoneEl.textContent = `Naik ke ${currentDiscount + 10}% di ${nextMilestoneCount} orang berhasil (${remaining} lagi)`;
    } else {
      nextMilestoneEl.textContent = `Sudah di tier ${currentDiscount}%! Lanjutkan untuk naik lagi.`;
    }
  }
}

// Generate referral link
function generateReferralLink(code) {
  const baseURL = window.location.origin + window.location.pathname;
  return `${baseURL}?ref=${code}`;
}

// Generate WhatsApp share message with discount info
function generateWhatsAppMessage(code, discountPercent) {
  const link = generateReferralLink(code);
  const message = `Halo! 👋 Saya sudah jajan di Lokal-Lapak - Snack Hub Terlengkap yang pasti asik! 

🎁 Ayo bergabung dan dapatkan diskon ${discountPercent}% untuk member baru!
Gunakan kode referral saya: ${code}
atau buka link ini: ${link}

Jangan lupa cobain snack lokal terbaik mereka! 🤤`;
  
  return encodeURIComponent(message);
}

// Share via WhatsApp
function shareViaWhatsApp(code, successCount) {
  const discountPercent = calculateReferralDiscount(successCount);
  const message = generateWhatsAppMessage(code, discountPercent);
  const whatsappURL = `https://wa.me/?text=${message}`;
  window.open(whatsappURL, '_blank');
  
  // Track referral send
  trackReferralSend(code);
}

// Copy to clipboard
function copyToClipboard(text, successMessage) {
  navigator.clipboard.writeText(text).then(() => {
    showToastNotification(successMessage);
  }).catch(err => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToastNotification(successMessage);
  });
}

// Track when user sends referral
function trackReferralSend(code) {
  const referralData = JSON.parse(localStorage.getItem('referralData')) || {};
  const timestamp = new Date().toISOString();
  
  if (!referralData.referrals) {
    referralData.referrals = [];
  }
  
  referralData.referrals.push({
    sharedAt: timestamp,
    platform: 'whatsapp'
  });
  
  localStorage.setItem('referralData', JSON.stringify(referralData));
  
  // Update UI
  const referralCount = document.getElementById('referral-count');
  if (referralCount) {
    referralCount.textContent = referralData.referrals.length;
  }
}

// Check for referral parameter in URL
function checkReferralParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');
  
  if (referralCode && referralCode.length > 0) {
    // Store referrer code
    const referrerData = JSON.parse(localStorage.getItem('referrerData')) || {};
    referrerData.referrerCode = referralCode;
    referrerData.arrivedAt = new Date().toISOString();
    localStorage.setItem('referrerData', JSON.stringify(referrerData));
    
    // Show notification - user was referred
    showToastNotification(`🎉 Selamat datang! Dapatkan diskon dari kode: ${referralCode}`);
  }
}

// Get discount for referred user
function getReferralDiscount() {
  const referrerData = JSON.parse(localStorage.getItem('referrerData')) || {};
  
  if (!referrerData.referrerCode) {
    return 0; // No referral, no discount
  }
  
  // For now, new referral users get 10% discount
  // In production, backend would verify and apply discount based on referrer's tier
  return 10;
}

// Validate and apply referral code on purchase
function applyReferralCode(purchaseData) {
  const referrerData = JSON.parse(localStorage.getItem('referrerData')) || {};
  const referralCode = referrerData.referrerCode;
  
  if (referralCode) {
    // In a real app, you would send this to backend to:
    // 1. Verify the referral code exists
    // 2. Mark this purchase as successful referral
    // 3. Add discount to user's account
    // 4. Update referrer's successful count
    
    const discountApplied = getReferralDiscount();
    
    console.log('Referral purchase tracked:', {
      purchaseData,
      referralCode,
      discountApplied: discountApplied + '%',
      purchaseTime: new Date().toISOString()
    });
    
    // For demo: update local referral success
    updateReferralSuccess(referralCode);
  }
}

// Update referral success count
function updateReferralSuccess(referrerCode) {
  // In a real app, this would be done by the backend
  // For now, we just log it
  console.log('Referral successful for code:', referrerCode);
}

// Make functions globally accessible
window.initReferralSystem = initReferralSystem;
window.generateReferralLink = generateReferralLink;
window.calculateReferralDiscount = calculateReferralDiscount;
window.getReferralDiscount = getReferralDiscount;

// Initialize referral system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReferralSystem);
} else {
  initReferralSystem();
}

// Clear splash screen session flag when user leaves or closes tab
window.addEventListener('beforeunload', function() {
  sessionStorage.removeItem('splashScreenShown');
});
