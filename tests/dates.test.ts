import { describe, expect, it } from 'vitest';
import { ajouterJours, dateLongue, depuisISO, ecartJours, jourISO, nomDuJour } from '../src/domain/dates';

describe('cles de jour', () => {
  it('utilise l’heure locale, pas UTC', () => {
    // 23 h 30 heure locale : en UTC on serait deja le lendemain sur la moitie
    // du globe. La cle doit rester celle du jour vecu.
    const tard = new Date(2026, 8, 21, 23, 30, 0);
    expect(jourISO(tard)).toBe('2026-09-21');
  });

  it('complete les mois et jours a deux chiffres', () => {
    expect(jourISO(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });

  it('fait l’aller-retour avec depuisISO', () => {
    expect(jourISO(depuisISO('2026-09-21'))).toBe('2026-09-21');
  });
});

describe('arithmetique des jours', () => {
  it('ajoute et retire des jours en franchissant les mois', () => {
    expect(ajouterJours('2026-09-30', 1)).toBe('2026-10-01');
    expect(ajouterJours('2026-01-01', -1)).toBe('2025-12-31');
    expect(ajouterJours('2024-02-28', 1)).toBe('2024-02-29'); // annee bissextile
  });

  it('compte l’ecart en jours entiers', () => {
    expect(ecartJours('2026-09-21', '2026-09-28')).toBe(7);
    expect(ecartJours('2026-09-28', '2026-09-21')).toBe(-7);
    expect(ecartJours('2026-09-21', '2026-09-21')).toBe(0);
  });
});

describe('libelles', () => {
  it('nomme les jours en francais', () => {
    expect(nomDuJour(0)).toBe('Dimanche');
    expect(nomDuJour(6)).toBe('Samedi');
  });

  it('produit une date longue capitalisee', () => {
    const texte = dateLongue(new Date(2026, 8, 21, 12));
    expect(texte.charAt(0)).toBe(texte.charAt(0).toUpperCase());
    expect(texte).toContain('21');
  });
});
