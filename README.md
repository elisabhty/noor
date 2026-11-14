# Noor — Coran Widgets

App iPhone (React + Tailwind + Capacitor) avec des widgets natifs (WidgetKit) et une Live Activity (Dynamic Island).
Mascotte : Noor, une petite lanterne.

## Ce qu'il y a dedans

| Partie | Où |
| --- | --- |
| App (Aujourd'hui, Coran, Prières, Dhikr, Widgets, Réglages) | `src/` |
| Mascotte | `src/components/Noor.jsx`, `assets/noor.svg` |
| Widgets iOS + Dynamic Island | `ios/App/NoorWidgets/` |
| Code partagé app ↔ widgets | `ios/App/Shared/NoorShared.swift` |
| Pont Capacitor (App Group, Live Activity) | `ios/App/App/NoorBridgePlugin.swift` |
| Données du Coran (générées, jamais tapées à la main) | `scripts/build-data.mjs` |

Widgets : Verset (petit, moyen, grand, écran verrouillé), Heures de prière (petit, moyen, 3 formats écran verrouillé),
Dhikr (bouton +1 sans ouvrir l'app), Date hégirienne, et la Live Activity « prochaine prière ».

## Onboarding, parcours et paywall

L'onboarding (`src/screens/Onboarding.jsx`) pose quelques questions, propose un rappel quotidien, puis affiche un parcours
de 7 jours (`src/lib/journey.js`) et le paywall (`src/screens/Paywall.jsx`).
Le paywall n'encaisse rien pour l'instant : dans `src/lib/paywall.js`, `live` est à `false` et les prix sont des valeurs
à remplacer par celles d'App Store Connect. Rien n'est encore réservé aux abonnés.

## Lancer sur ton Mac

```bash
npm install
npm run ios      # données + images + build web + copie dans le projet Xcode
npm run open     # ouvre Xcode
```

Dans Xcode, une seule fois :

1. Cible **App** → *Signing & Capabilities* → choisis ton équipe.
2. Cible **NoorWidgets** → même équipe.
3. Vérifie que les deux cibles ont la capacité **App Groups** avec `group.com.hormend.noor` (déjà dans les fichiers `.entitlements`).
4. Lance sur un iPhone ou un simulateur iOS 17 ou plus.

Pour changer l'identifiant `com.hormend.noor` : remplace-le dans `capacitor.config.ts`, dans le projet Xcode (les deux cibles),
dans les deux fichiers `.entitlements` et dans `NoorShared.swift` (`group`).

## Comment les widgets reçoivent leurs données

L'app calcule 30 jours d'heures de prière et les écrit, avec la langue, le rythme du verset et le compteur de dhikr,
dans l'App Group. Les widgets lisent ces valeurs. Le verset est choisi par la même formule côté app et côté widget
(`verseIndex` dans `src/lib/verses.js`, `NoorVerses.index` dans `NoorShared.swift`).

## Sources

- Texte arabe (Uthmani) : Noble Qur'an Encyclopedia (quranenc.com), via le paquet `quran-json` (CC BY 4.0).
- Traduction française : Muhammad Hamidullah. Traduction anglaise : Saheeh International (via tanzil.net).
- Heures de prière : bibliothèque `adhan` (MIT).
- Police arabe : Amiri Quran (SIL Open Font License).

Avant une sortie payante sur l'App Store, vérifie les conditions d'utilisation des deux traductions.
