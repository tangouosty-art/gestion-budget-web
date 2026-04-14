// client/src/utils/helpers.js

export const formaterMonnaie = (montant) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant || 0);

export const formaterDate = (date) =>
  date ? new Intl.DateTimeFormat('fr-FR').format(new Date(date)) : '—';

export const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export const moisActuel  = () => new Date().getMonth() + 1;
export const anneeActuelle = () => new Date().getFullYear();

export const pourcentage = (valeur, total) =>
  total > 0 ? Math.min(Math.round((valeur / total) * 100), 100) : 0;

export const couleurPourcentage = (pct) => {
  if (pct >= 100) return 'var(--red)';
  if (pct >= 80)  return 'var(--orange)';
  if (pct >= 60)  return 'var(--yellow)';
  return 'var(--accent)';
};

export const dateDansXJours = (date, jours) => {
  if (!date) return false;
  const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= jours;
};

export const labelStatut = { a_faire: 'À faire', en_cours: 'En cours', termine: 'Terminé' };
export const labelPriorite = { basse: 'Basse', normale: 'Normale', haute: 'Haute', urgente: 'Urgente' };

export const classeBadgeStatut = {
  a_faire: 'badge badge-todo',
  en_cours: 'badge badge-doing',
  termine:  'badge badge-done',
};
export const classeBadgePriorite = {
  basse:   'badge badge-basse',
  normale: 'badge badge-normale',
  haute:   'badge badge-haute',
  urgente: 'badge badge-urgent',
};
