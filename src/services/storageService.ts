// ARCHIVO: src/services/storageService.ts
// CORRECCIÓN: Agregamos 'type' en los imports
import type { QuoteData, AppSettings } from '../types';
import { INITIAL_SETTINGS, SEED_QUOTES } from '../data/constants';

const DB_KEYS = { QUOTES: 'alamex_quotes_v4', SETTINGS: 'alamex_settings_v1' };

export const BackendService = {
  // ... (El resto del código es igual, lo importante son los imports de arriba)
  getQuotes: (): QuoteData[] => {
    const data = localStorage.getItem(DB_KEYS.QUOTES);
    return data ? JSON.parse(data) : SEED_QUOTES;
  },
  saveQuote: (quote: QuoteData): QuoteData => {
    const quotes = BackendService.getQuotes();
    let newQuote = { ...quote };
    if (!newQuote.id) newQuote.id = Date.now();
    const index = quotes.findIndex(q => q.id === newQuote.id);
    if (index >= 0) quotes[index] = newQuote;
    else quotes.unshift(newQuote);
    localStorage.setItem(DB_KEYS.QUOTES, JSON.stringify(quotes));
    return newQuote;
  },
  deleteQuote: (id: number | string) => {
    const quotes = BackendService.getQuotes().filter(q => q.id !== id);
    localStorage.setItem(DB_KEYS.QUOTES, JSON.stringify(quotes));
  },
  updateQuoteStatus: (id: number | string, status: QuoteData['status']) => {
    const quotes = BackendService.getQuotes();
    const index = quotes.findIndex(q => q.id === id);
    if (index >= 0) {
      quotes[index].status = status;
      localStorage.setItem(DB_KEYS.QUOTES, JSON.stringify(quotes));
      return quotes;
    }
    return quotes;
  },
  updateQuoteStage: (id: number | string, stage: string) => {
    const quotes = BackendService.getQuotes();
    const index = quotes.findIndex(q => q.id === id);
    if (index >= 0) {
      quotes[index].currentStage = stage;
      localStorage.setItem(DB_KEYS.QUOTES, JSON.stringify(quotes));
      return quotes;
    }
    return quotes;
  },
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(DB_KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
  }
};