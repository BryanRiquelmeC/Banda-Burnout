/* ============================================
   BURNOUT CHILE — Gestor de Fechas/Eventos
   Autenticación via Supabase Auth (JWT)
   ============================================ */

const SB_URL = 'https://uweiwgdwsguifgepzaac.supabase.co';
const SB_KEY = 'sb_publishable_droIZGMkkGaNKDVphRjS7Q_qrpYLg9v';

/* Headers públicos (solo lectura) */
const SB_HEADERS = {
  'apikey':        SB_KEY,
  'Authorization': 'Bearer ' + SB_KEY,
  'Content-Type':  'application/json',
  'Prefer':        'return=representation'
};

/* Headers con token de admin (protegida) */
function getWriteHeaders() {
  return {
    'apikey':        SB_KEY,
    'Authorization': 'Bearer ' + authToken,
    'Content-Type':  'application/json',
    'Prefer':        'return=representation'
  };
}

let authToken  = null;
let isAdmin    = false;
let editingId  = null;
let events     = [];

/* ---- Cargar eventos (público) ---- */
async function loadEvents() {
  try {
    const res = await fetch(SB_URL + '/rest/v1/eventos?select=*&order=id.asc', { headers: SB_HEADERS });
    events    = await res.json();
    if (!Array.isArray(events)) events = [];
  } catch(e) {
    events = [];
  }
  renderTable();
}

/* ---- Renderizar tabla ---- */
function renderTable() {
  const tbody = document.getElementById('eventsBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!events || events.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" style="text-align:center;padding:2rem;color:#888;font-style:italic;">No hay eventos programados por el momento.</td>';
    tbody.appendChild(tr);
    return;
  }

  events.forEach(function(ev) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td style="padding:1rem;color:#c0c0c0;border-bottom:1px solid #1c1c1c;">' + ev.fecha  + '</td>' +
      '<td style="padding:1rem;color:#c0c0c0;border-bottom:1px solid #1c1c1c;">' + ev.nombre + '</td>' +
      '<td style="padding:1rem;color:#c0c0c0;border-bottom:1px solid #1c1c1c;">' + ev.lugar  + '</td>' +
      '<td style="padding:1rem;text-align:center;border-bottom:1px solid #1c1c1c;width:50px;">' +
        (isAdmin ? '<button class="edit-btn" data-id="' + ev.id + '" style="background:none;border:none;cursor:pointer;font-size:1rem;">✏️</button>' : '') +
      '</td>' +
      '<td style="padding:1rem;text-align:center;border-bottom:1px solid #1c1c1c;width:50px;">' +
        (isAdmin ? '<button class="del-btn" data-id="' + ev.id + '" style="background:none;border:none;cursor:pointer;font-size:1rem;">🗑️</button>' : '') +
      '</td>';
    tbody.appendChild(tr);
  });

  /* Botones eliminar */
  tbody.querySelectorAll('.del-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id = btn.dataset.id;
      const ev = events.find(function(e) { return e.id == id; });
      openModal('¿Eliminar el evento "' + ev.nombre + '"?', async function() {
        try {
          const res = await fetch(SB_URL + '/rest/v1/eventos?id=eq.' + id, {
            method:  'DELETE',
            headers: getWriteHeaders()
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          showSuccess('🗑️ Evento eliminado.');
          loadEvents();
        } catch(err) {
          showError('❌ Error al eliminar: ' + err.message);
        }
      });
    });
  });

  /* Botones editar */
  tbody.querySelectorAll('.edit-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id = btn.dataset.id;
      const ev = events.find(function(e) { return e.id == id; });
      openModal('¿Editar el evento "' + ev.nombre + '"?', function() {
        editingId = id;
        document.getElementById('evDate').value  = ev.fecha;
        document.getElementById('evEvent').value = ev.nombre;
        document.getElementById('evPlace').value = ev.lugar;
        const formTitle  = document.getElementById('formTitle');
        const addBtn     = document.getElementById('addEventBtn');
        const cancelEdit = document.getElementById('cancelEditBtn');
        if (formTitle)  formTitle.textContent    = '✏️ Editar Evento';
        if (addBtn)     addBtn.textContent        = 'Guardar Cambios';
        if (cancelEdit) cancelEdit.style.display  = 'inline-block';
        document.getElementById('addEventForm').classList.add('visible');
        document.getElementById('addEventForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  });
}

/* ---- Modal ---- */
let pendingAction = null;

function openModal(message, onConfirm) {
  const modal    = document.getElementById('confirmModal');
  const modalMsg = document.getElementById('confirmMsg');
  if (!modal || !modalMsg) { if (confirm(message)) onConfirm(); return; }
  modalMsg.textContent = message;
  pendingAction        = onConfirm;
  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('confirmModal');
  if (modal) modal.classList.remove('open');
  pendingAction = null;
}

/* ---- Mensajes ---- */
function showError(msg) {
  const el = document.getElementById('adminError');
  const ok = document.getElementById('adminSuccess');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  if (ok) ok.style.display = 'none';
}

function showSuccess(msg) {
  const el = document.getElementById('adminSuccess');
  const er = document.getElementById('adminError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  if (er) er.style.display = 'none';
  setTimeout(function() { if (el) el.style.display = 'none'; }, 3000);
}

function clearMessages() {
  const er = document.getElementById('adminError');
  const ok = document.getElementById('adminSuccess');
  if (er) er.style.display = 'none';
  if (ok) ok.style.display = 'none';
}

/* ---- Reset formulario ---- */
function resetForm() {
  editingId = null;
  const inDate     = document.getElementById('evDate');
  const inEvent    = document.getElementById('evEvent');
  const inPlace    = document.getElementById('evPlace');
  const formTitle  = document.getElementById('formTitle');
  const addBtn     = document.getElementById('addEventBtn');
  const cancelEdit = document.getElementById('cancelEditBtn');
  if (inDate)     inDate.value             = '';
  if (inEvent)    inEvent.value            = '';
  if (inPlace)    inPlace.value            = '';
  if (formTitle)  formTitle.textContent    = '➕ Agregar Evento';
  if (addBtn)     addBtn.textContent       = 'Agregar Evento';
  if (cancelEdit) cancelEdit.style.display = 'none';
}

/* ---- Inicializar cuando el DOM esté listo ---- */
document.addEventListener('DOMContentLoaded', function() {
  loadEvents();

  const modalConfirm = document.getElementById('modalConfirm');
  const modalCancel  = document.getElementById('modalCancel');
  const modal        = document.getElementById('confirmModal');
  if (modalConfirm) modalConfirm.addEventListener('click', function() { if (pendingAction) pendingAction(); closeModal(); });
  if (modalCancel)  modalCancel.addEventListener('click', closeModal);
  if (modal)        modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

  const toggleBtn  = document.getElementById('adminToggle');
  const adminPanel = document.getElementById('adminPanel');
  if (toggleBtn && adminPanel) {
    toggleBtn.addEventListener('click', function() {
      const isOpen = adminPanel.classList.toggle('visible');
      toggleBtn.textContent = isOpen ? '🔒 Cerrar panel' : '🔒 Modo Administrador';
      clearMessages();
    });
  }

  const pwInput    = document.getElementById('adminPw');
  const emailInput = document.getElementById('adminEmail');
  const toggleEye  = document.getElementById('toggleEye');
  if (toggleEye && pwInput) {
    toggleEye.addEventListener('click', function() {
      const isText = pwInput.type === 'text';
      pwInput.type = isText ? 'password' : 'text';
      const eyeIcon = document.getElementById('eyeIcon');
      if (eyeIcon) eyeIcon.src = isText ? 'img/ojo.png' : 'img/ojo-cerrado.png';
    });
  }

  async function tryLogin() {
    const email    = emailInput ? emailInput.value.trim() : '';
    const password = pwInput    ? pwInput.value           : '';
    if (!email || !password) { showError('⚠️ Ingresa email y contraseña.'); return; }

    try {
      const res = await fetch(SB_URL + '/auth/v1/token?grant_type=password', {
        method:  'POST',
        headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error('credentials');

      const data = await res.json();
      authToken = data.access_token;
      isAdmin   = true;

      clearMessages();
      showSuccess('Acceso concedido. Bienvenido administrador.');
      const panelTitle = document.getElementById('adminPanelTitle');
      const loginRow   = document.getElementById('loginRow');
      const logoutBtn  = document.getElementById('adminLogout');
      const addForm    = document.getElementById('addEventForm');
      if (panelTitle) panelTitle.textContent  = '🔓 Modo Administrador Activo';
      if (loginRow)   loginRow.style.display  = 'none';
      if (logoutBtn)  logoutBtn.style.display = 'flex';
      if (addForm)    addForm.classList.add('visible');
      if (pwInput)    pwInput.value           = '';
      renderTable();

    } catch(err) {
      showError('⚠️ Credenciales incorrectas.');
      if (pwInput) { pwInput.value = ''; pwInput.focus(); }
    }
  }

  const loginBtn  = document.getElementById('adminLoginBtn');
  const cancelBtn = document.getElementById('adminCancelBtn');
  if (loginBtn)  loginBtn.addEventListener('click', tryLogin);
  if (pwInput)   pwInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') tryLogin(); });
  if (cancelBtn) cancelBtn.addEventListener('click', function() {
    if (adminPanel) adminPanel.classList.remove('visible');
    if (toggleBtn)  toggleBtn.textContent = '🔒 Modo Administrador';
    clearMessages();
    if (pwInput)    pwInput.value    = '';
    if (emailInput) emailInput.value = '';
  });

  const logoutBtn = document.getElementById('adminLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      openModal('¿Cerrar sesión de administrador?', async function() {
        /* Invalidar sesión en Supabase */
        if (authToken) {
          await fetch(SB_URL + '/auth/v1/logout', {
            method:  'POST',
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + authToken }
          }).catch(function() {});
        }
        authToken = null;
        isAdmin   = false;

        const panelTitle = document.getElementById('adminPanelTitle');
        const loginRow   = document.getElementById('loginRow');
        const addForm    = document.getElementById('addEventForm');
        if (panelTitle) panelTitle.textContent   = '🔒 Acceso Administrador';
        if (loginRow)   loginRow.style.display   = '';
        if (logoutBtn)  logoutBtn.style.display  = 'none';
        if (addForm)    addForm.classList.remove('visible');
        if (adminPanel) adminPanel.classList.remove('visible');
        if (toggleBtn)  toggleBtn.textContent    = '🔒 Modo Administrador';
        if (pwInput)    pwInput.value            = '';
        if (emailInput) emailInput.value         = '';
        clearMessages();
        resetForm();
        renderTable();
      });
    });
  }

  const addBtn = document.getElementById('addEventBtn');
  if (addBtn) {
    addBtn.addEventListener('click', async function() {
      const d = document.getElementById('evDate').value.trim();
      const n = document.getElementById('evEvent').value.trim();
      const p = document.getElementById('evPlace').value.trim();
      if (!d || !n || !p) { showError('⚠️ Completa todos los campos.'); return; }

      if (editingId) {
        openModal('¿Guardar los cambios en este evento?', async function() {
          try {
            const res = await fetch(SB_URL + '/rest/v1/eventos?id=eq.' + editingId, {
              method:  'PATCH',
              headers: getWriteHeaders(),
              body:    JSON.stringify({ fecha: d, nombre: n, lugar: p })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            showSuccess('✅ Evento actualizado.');
            resetForm();
            loadEvents();
          } catch(err) {
            showError('❌ Error al actualizar: ' + err.message);
          }
        });
      } else {
        try {
          const res = await fetch(SB_URL + '/rest/v1/eventos', {
            method:  'POST',
            headers: getWriteHeaders(),
            body:    JSON.stringify({ fecha: d, nombre: n, lugar: p })
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          showSuccess('✅ Evento agregado.');
          resetForm();
          loadEvents();
        } catch(err) {
          showError('❌ Error al agregar: ' + err.message);
        }
      }
    });
  }

  const cancelEdit = document.getElementById('cancelEditBtn');
  if (cancelEdit) {
    cancelEdit.addEventListener('click', function() {
      openModal('¿Cancelar la edición sin guardar?', function() {
        resetForm();
        renderTable();
      });
    });
  }

});
