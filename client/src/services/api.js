// client/src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('mbp_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const request = async (method, path, body = null) => {
  const opts = { method, headers: headers() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erreur réseau');
  return data;
};

// ---- Auth ----
export const authAPI = {
  inscription: (payload) => request('POST', '/auth/register', payload),
  connexion:   (payload) => request('POST', '/auth/login', payload),
  profil:      ()        => request('GET',  '/auth/profile'),
  modifierProfil: (p)    => request('PUT',  '/auth/profile', p),
  changerMdp:  (p)       => request('PUT',  '/auth/change-password', p),
  verifierEmail: (token) => request('GET',  `/auth/verify/${token}`),
};

// ---- Budgets ----
export const budgetsAPI = {
  lister:    ()            => request('GET',    '/budgets'),
  duMois:    (m, a)        => request('GET',    `/budgets/mois/${m}/annee/${a}`),
  enregistrer: (p)         => request('POST',   '/budgets', p),
  supprimer: (id)          => request('DELETE', `/budgets/${id}`),
};

// ---- Revenus ----
export const revenusAPI = {
  lister:    (params = '') => request('GET',    `/revenus${params}`),
  creer:     (p)           => request('POST',   '/revenus', p),
  modifier:  (id, p)       => request('PUT',    `/revenus/${id}`, p),
  supprimer: (id)          => request('DELETE', `/revenus/${id}`),
};

// ---- Dépenses ----
export const depensesAPI = {
  lister:       (params = '') => request('GET', `/depenses${params}`),
  parCategorie: (params = '') => request('GET', `/depenses/par-categorie${params}`),
  evolution:    (params = '') => request('GET', `/depenses/evolution${params}`),
  creer:        (p)           => request('POST',   '/depenses', p),
  modifier:     (id, p)       => request('PUT',    `/depenses/${id}`, p),
  supprimer:    (id)          => request('DELETE', `/depenses/${id}`),
};

// ---- Catégories ----
export const categoriesAPI = {
  lister:    ()       => request('GET',    '/categories'),
  creer:     (p)      => request('POST',   '/categories', p),
  modifier:  (id, p)  => request('PUT',    `/categories/${id}`, p),
  supprimer: (id)     => request('DELETE', `/categories/${id}`),
};

// ---- Tâches ----
export const tachesAPI = {
  lister:    (params = '') => request('GET',    `/taches${params}`),
  creer:     (p)           => request('POST',   '/taches', p),
  modifier:  (id, p)       => request('PUT',    `/taches/${id}`, p),
  supprimer: (id)          => request('DELETE', `/taches/${id}`),
};
