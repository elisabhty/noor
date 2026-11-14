// Réglages du paywall. Tant que `live` est false, aucun achat n'est déclenché :
// le bouton laisse entrer dans l'app. Passer à true une fois RevenueCat / StoreKit branché
// (et brancher l'achat dans `purchase`). Les prix affichés doivent être ceux d'App Store Connect.
export const PAYWALL = {
  live: false,
  trialDays: 7,
  weekly: { fr: '4,99 €', en: '€4.99' },
  yearly: { fr: '39,99 €', en: '€39.99' },
};

export async function purchase(/* plan */) {
  if (!PAYWALL.live) return { ok: true, simulated: true };
  throw new Error('Achat non branché');
}
