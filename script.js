// ========================
// BACKEND API CONFIGURATION
// ========================
const API_BASE_URL = 'http://localhost:5000/api';

// Store JWT token
let authToken = localStorage.getItem('adminToken');

// ========================
// API FUNCTIONS
// ========================

// Products API
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function createProduct(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

async function updateProduct(id, formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Admin API
async function adminLogin(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    
    if (data.success) {
      authToken = data.token;
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Settings API
async function fetchSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

async function updateSetting(type, content) {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${type}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content })
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating setting:', error);
    throw error;
  }
}

// ========================
// UPDATE RENDER PRODUCTS FUNCTION
// ========================
async function renderProducts() {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;
  
  const products = await fetchProducts();
  productGrid.innerHTML = '';
  
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const displayImage = prod.images && prod.images.length > 0 
      ? `http://localhost:5000${prod.images[0]}` 
      : 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400';
    
    card.innerHTML = `
      <div class="product-img">
        <img src="${displayImage}" alt="${prod.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${prod.name.substring(0, 80)}${prod.name.length > 80 ? '...' : ''}</h3>
        <p class="product-desc">${prod.desc.substring(0, 120)}${prod.desc.length > 120 ? '...' : ''}</p>
        <span class="product-price">${prod.price}</span>
        <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #6C757D;">
          SKU: ${prod.sku}
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

// ========================
// UPDATE ADMIN LOGIN FUNCTION
// ========================
async function handleAdminLogin(username, password) {
  try {
    const result = await adminLogin(username, password);
    
    if (result.success) {
      sessionStorage.setItem('adminAuth', 'true');
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'block';
      
      // Initialize admin panel
      setTimeout(() => {
        if (typeof initImageUploadUI === 'function') initImageUploadUI();
        if (typeof loadAdminProducts === 'function') loadAdminProducts();
        if (typeof loadAdminSettings === 'function') loadAdminSettings();
        if (typeof initAdminForms === 'function') initAdminForms();
      }, 100);
      
      showToast('✅ Login successful!');
      return true;
    } else {
      showToast('❌ Invalid credentials');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('❌ Login failed');
    return false;
  }
}

// ========================
// UPDATE LOAD ADMIN PRODUCTS FUNCTION
// ========================
async function loadAdminProducts() {
  const container = document.getElementById('productListAdmin');
  if (!container) return;
  
  const products = await fetchProducts();
  container.innerHTML = '';
  
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6C757D;">No products added yet. Add your first product above.</p>';
    return;
  }
  
  products.forEach(prod => {
    const row = document.createElement('div');
    row.className = 'product-row';
    
    const images = prod.images || [];
    
    row.innerHTML = `
      <div class="product-thumbnails">
        ${images.slice(0, 5).map(img => `<img src="http://localhost:5000${img}" alt="product">`).join('')}
        ${images.length === 0 ? '<span style="color: #dc3545;">No images</span>' : ''}
      </div>
      <div class="product-info-admin">
        <h4 style="color: #0A1F44; margin-bottom: 0.5rem;">${prod.name.substring(0, 80)}...</h4>
        <div style="font-size: 0.85rem; color: #6C757D; margin-bottom: 0.5rem;">
          SKU: ${prod.sku} | Stock: ${prod.stock || 0}
        </div>
        <span style="font-weight: 600; color: #FF6B00;">${prod.price}</span>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary btn-small edit-product" data-id="${prod._id}">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-primary btn-small delete-product" style="background: #dc3545;" data-id="${prod._id}">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    container.appendChild(row);
  });

  // Delete handlers
  document.querySelectorAll('.delete-product').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (confirm('⚠️ Are you sure you want to delete this product? This action cannot be undone.')) {
        const id = btn.dataset.id;
        const result = await deleteProduct(id);
        if (result.success) {
          loadAdminProducts();
          renderProducts();
          showToast('✅ Product deleted successfully');
        }
      }
    });
  });
}

// ========================
// UPDATE ADMIN FORMS FUNCTION
// ========================
function initAdminForms() {
  const addForm = document.getElementById('addProductForm');
  if (addForm) {
    const newForm = addForm.cloneNode(true);
    addForm.parentNode.replaceChild(newForm, addForm);
    
    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      
      // Add form fields
      formData.append('name', document.getElementById('prodName')?.value || 'New Product');
      formData.append('desc', document.getElementById('prodDesc')?.value || 'Product description');
      formData.append('price', document.getElementById('prodPrice')?.value || 'Contact for price');
      
      // Generate SKU
      const skuInput = document.getElementById('prodSku');
      if (skuInput && skuInput.value) {
        formData.append('sku', skuInput.value);
      }
      
      // Add images
      const imageBoxes = document.querySelectorAll('.image-upload-box');
      imageBoxes.forEach(box => {
        if (box.dataset.imageFile) {
          formData.append('images', box.dataset.imageFile);
        }
      });
      
      // Submit to backend
      const result = await createProduct(formData);
      
      if (result.success) {
        newForm.reset();
        initImageUploadUI();
        loadAdminProducts();
        renderProducts();
        showToast('✅ New product added successfully');
      } else {
        showToast('❌ Error: ' + result.message);
      }
    });
  }

  // Location form
  const locForm = document.getElementById('locationForm');
  if (locForm) {
    const newLocForm = locForm.cloneNode(true);
    locForm.parentNode.replaceChild(newLocForm, locForm);
    
    newLocForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const addr = document.getElementById('companyAddressInput').value;
      const mapSrc = document.getElementById('mapSrcInput').value;
      
      await updateSetting('address', addr);
      await updateSetting('map', mapSrc);
      
      updateContactInfo();
      showToast('📍 Location updated successfully');
    });
  }

  // Company info form
  const infoForm = document.getElementById('companyInfoForm');
  if (infoForm) {
    const newInfoForm = infoForm.cloneNode(true);
    infoForm.parentNode.replaceChild(newInfoForm, infoForm);
    
    newInfoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const about = document.getElementById('aboutText').value;
      const privacy = document.getElementById('privacyText').value;
      const disclaimer = document.getElementById('disclaimerText').value;
      
      await updateSetting('about', about);
      await updateSetting('privacy', privacy);
      await updateSetting('disclaimer', disclaimer);
      
      showToast('📄 Company info updated');
    });
  }
}

// ========================
// UPDATE IMAGE UPLOAD FUNCTION
// ========================
function setImageToBox(box, imageFile) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    box.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = e.target.result;
    img.className = 'image-preview';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      clearImageUploadBox(box);
    };
    
    box.appendChild(img);
    box.appendChild(removeBtn);
    box.classList.add('has-image');
    box.dataset.imageFile = imageFile;
  };
  
  reader.readAsDataURL(imageFile);
}

