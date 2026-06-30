const API_URL = 'http://localhost:3000/api';
let isLogin = true;

// Alternar entre login y registro
function toggleAuth() {
  isLogin = !isLogin;
  document.getElementById('auth-btn').textContent = isLogin ? 'Iniciar sesión' : 'Registrarse';
  document.getElementById('toggle-auth').innerHTML = isLogin
    ? '¿No tenés cuenta? <span onclick="toggleAuth()">Registrate</span>'
    : '¿Ya tenés cuenta? <span onclick="toggleAuth()">Iniciá sesión</span>';
}

// Submit del formulario de auth
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const endpoint = isLogin ? 'login' : 'register';

  const res = await fetch(`${API_URL}/auth/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  if (isLogin) {
    localStorage.setItem('token', data.token);
    showApp();
  } else {
    alert('Cuenta creada. Ahora iniciá sesión.');
    toggleAuth();
  }
});

// Mostrar la app si ya hay token
function showApp() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('app-section').style.display = 'block';
  loadBookmarks();
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('token');
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('app-section').style.display = 'none';
}

// Cargar bookmarks
async function loadBookmarks() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/bookmarks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const bookmarks = await res.json();

  const list = document.getElementById('bookmarks-list');
  list.innerHTML = '';

  bookmarks.forEach(bookmark => {
    const card = document.createElement('div');
    card.className = 'bookmark-card';
    card.innerHTML = `
      <div>
        <a href="${bookmark.url}" target="_blank">${bookmark.title}</a>
        <div class="tags">${bookmark.tags.join(', ')}</div>
      </div>
      <button class="delete-btn" onclick="deleteBookmark('${bookmark._id}')">Eliminar</button>
    `;
    list.appendChild(card);
  });
}

// Crear bookmark
document.getElementById('bookmark-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const title = document.getElementById('title').value;
  const url = document.getElementById('url').value;
  const tags = document.getElementById('tags').value
    .split(',')
    .map(t => t.trim())
    .filter(t => t !== '');

  await fetch(`${API_URL}/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, url, tags })
  });

  e.target.reset();
  loadBookmarks();
});

// Eliminar bookmark
async function deleteBookmark(id) {
  const token = localStorage.getItem('token');
  await fetch(`${API_URL}/bookmarks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  loadBookmarks();
}

// Arrancar — si hay token, mostrar app directamente
if (localStorage.getItem('token')) {
  showApp();
}