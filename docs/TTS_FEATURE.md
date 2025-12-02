# Fonctionnalité Text-to-Speech (TTS)

## Vue d'ensemble

La fonctionnalité de synthèse vocale (Text-to-Speech) permet aux enfants d'entendre la prononciation de chaque mot surligné pendant la lecture en mode karaoke.

## Utilisation

### Activation/Désactivation

Un bouton est disponible dans la barre supérieure de l'interface de lecture :
- **Icône Volume2** (🔊) : TTS activé - les mots sont lus à voix haute
- **Icône VolumeX** (🔇) : TTS désactivé - lecture silencieuse

### Fonctionnement

Lorsque le TTS est activé et que la lecture automatique est en cours :
1. Chaque mot surligné est prononcé automatiquement
2. La vitesse de lecture est adaptée aux enfants (0.8x)
3. Le ton est légèrement plus aigu pour une meilleure clarté (1.1x pitch)
4. La langue de prononciation s'adapte à la langue choisie (FR/EN)

## Implémentation technique

### Store

La préférence TTS est sauvegardée dans `useReadingSettingsStore` :
- État : `textToSpeech: boolean`
- Fonction : `setTextToSpeech(enabled: boolean)`
- Persistance : localStorage via zustand persist

### API Web Speech

Utilisation de l'API `SpeechSynthesisUtterance` du navigateur :
```typescript
const utterance = new SpeechSynthesisUtterance(word);
utterance.lang = 'fr-FR' | 'en-US';
utterance.rate = 0.8;  // Vitesse adaptée aux enfants
utterance.pitch = 1.1; // Ton légèrement plus aigu
```

### Nettoyage

- La synthèse vocale est annulée lors du changement de mot
- Cleanup complet lors du démontage du composant
- Évite les répétitions du même mot via `lastSpokenWordRef`

## Compatibilité

- ✅ Tous les navigateurs modernes supportent l'API Web Speech
- ✅ Chrome, Firefox, Safari, Edge
- ⚠️ Nécessite une connexion internet pour certains navigateurs

## Configuration

Les traductions pour les labels sont disponibles dans :
- `messages/fr.json` : "Activer/Désactiver la lecture audio"
- `messages/en.json` : "Enable/Disable audio reading"

## Améliorations futures possibles

- [ ] Sélection de la voix (masculine/féminine)
- [ ] Ajustement du volume sonore
- [ ] Option de vitesse de lecture personnalisable
- [ ] Support des voix téléchargées (offline)
