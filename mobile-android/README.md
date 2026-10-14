# Allo-Allo - Application Mobile Android (Kotlin + Jetpack Compose)

Bienvenue dans le dépôt du client mobile natif **Allo-Allo**, conçu spécifiquement pour la diaspora tunisienne, les locaux en Tunisie et les passionnés de culture tunisienne.

## Stack Technologique Mobile
- **Langage** : Kotlin 2.0+ (100% natif, Jetpack Compose)
- **Architecture** : Clean Architecture + MVVM + Unidirectional Data Flow (UDF)
- **Injection de dépendances** : Google Hilt / Dagger
- **Réseau & API** : Retrofit 2 + OkHttp + KotlinX Serialization
- **Temps réel & Média** : WebSockets (OkHttp WebSocket) + WebRTC natif pour les appels audio/vidéo
- **Lecteur Vidéo (TikTok Feed)** : Media3 ExoPlayer avec pré-chargement et mise en cache
- **Image Loading** : Coil Compose
- **Sécurité locale** : EncryptedSharedPreferences + BiometricPrompt (Empreinte / Face Unlock)

## Arborescence du Projet Mobile
```
mobile-android/
├── app/
│   ├── src/main/
│   │   ├── java/com/alloallo/app/
│   │   │   ├── data/
│   │   │   │   ├── remote/ (ApiService.kt, WebSocketManager.kt)
│   │   │   │   ├── repository/ (MatchRepository.kt, PaymentRepository.kt)
│   │   │   │   └── model/ (UserProfile.kt, VideoPost.kt, Match.kt)
│   │   │   ├── domain/
│   │   │   │   ├── usecase/ (SwipeProfileUseCase.kt, SendGiftUseCase.kt)
│   │   │   ├── ui/
│   │   │   │   ├── navigation/ (AlloAlloNavHost.kt, BottomBarDestination.kt)
│   │   │   │   ├── screens/
│   │   │   │   │   ├── SwipeScreen.kt (Rencontres sans frustration)
│   │   │   │   │   ├── VideoFeedScreen.kt (Feed vertical type TikTok)
│   │   │   │   │   ├── LiveStreamScreen.kt (Lives + Cadeaux virtuels)
│   │   │   │   │   ├── ChatDetailScreen.kt (Chat chiffré, éphémère & vocal)
│   │   │   │   │   ├── TunisianPaymentScreen.kt (D17, Floussi, Recharge USSD)
│   │   │   │   │   └── ProfilePrivacyScreen.kt (Mode discret, Vérification)
│   │   │   │   └── theme/ (Color.kt, Theme.kt, Type.kt)
│   │   │   └── MainActivity.kt
│   │   └── res/
│   └── build.gradle.kts
```

## Intégration des Paiements Tunisiens
1. **D17 Mobile (La Poste Tunisienne)** :
   Intégration du protocole USSD (*117#) et de l'API de validation marchand D17 avec retour de webhook chiffré.
2. **Recharge Téléphonique par Code Voucher (USSD)** :
   - Ooredoo : `*101*CODE_14_CHIFFRES#`
   - Orange Tunisie : `*100*CODE_14_CHIFFRES#`
   - Tunisie Telecom : `*123*CODE_14_CHIFFRES#`
3. **Floussi / Sobflous / ClicToPay** :
   Intégration via Deep-link sécurisé et vérification HMAC du reçu de paiement.
