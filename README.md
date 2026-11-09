# Pomodog

A Pomodoro companion that helps you build a steady focus routine with Nino, an animated dog.

## 🐾 About

Pomodog is in beta, with a Brazilian Portuguese interface. Android is the primary platform; the web app provides a preview of the experience.

- Configurable focus and break sessions, with pause, resume and recovery after backgrounding.
- Optional task names, charts of completed cycles, daily and weekly statistics, and focus streaks.
- An animated companion with optional feeding, gentle encouragement and reduced-motion support.
- Android session notifications with countdown and pause/resume controls, plus a home screen progress widget.
- Local use without an account, optional Google sign-in, Firestore synchronization and account deletion.
- Progress sharing through PNG cards and feedback through PostHog Surveys.
- Experimental Google Calendar suggestions on Android; validation with a real calendar remains pending.

Diagnostics and usage analytics are optional and disabled by default, including when using the app without an account.

## 🧰 Stack

- Expo SDK 57, React Native 0.86 and TypeScript.
- NativeWind/Tailwind CSS, Poppins and Lucide icons.
- Reanimated, React Native SVG and Gorhom Bottom Sheet.
- Firebase Authentication, Firestore and Firebase Analytics.
- Sentry for diagnostics and PostHog for feedback surveys.

## 💻 Development

Node.js 24 and npm are required. Install the locked dependencies and start the web preview:

```sh
npm ci
npm run web
```

Open the address printed in the terminal.

For Android, configure JDK 17 and the Android SDK, then connect a device with USB debugging enabled or start an emulator:

```sh
npm run android
```

This builds and installs the development client and starts Metro. On subsequent runs, start Metro with:

```sh
npm start
```

Use the installed development build for native features; Expo Go does not include the required native modules. Rebuild after changing native dependencies or config plugins. See the [Android development guide](docs/development-build.md) for setup, connection troubleshooting and device checks.

## ✅ Validation

```sh
npm run typecheck       # TypeScript checks
npm test                # Unit tests
npm run format:check    # Formatting and sorted imports
npm run export:web      # Web production export
npm run export:android  # Android JavaScript export
```

Firestore rules can be checked with `npm run test:rules`; this requires the Firebase CLI and a compatible Java runtime. Android JavaScript exports do not produce an APK or replace device validation.

Use Conventional Commits in English. `npm run format` formats the project and sorts imports.

## ⚙️ Configuration

| File                                                | Purpose                                                  |
| --------------------------------------------------- | -------------------------------------------------------- |
| `app.json`                                          | App metadata, branding and native config plugins.        |
| `src/firebase/client.ts` and `google-services.json` | Firebase client and Android SDK configuration.           |
| `src/google/client.ts`                              | Google sign-in OAuth client settings.                    |
| `firebase.json` and `firestore.rules`               | Firebase services and access rules for each user's data. |

The repository currently targets the development Firebase project. Production configuration is a separate release task. Optional source map uploads use a Sentry build token; see the [Sentry guide](docs/sentry.md).

## 🗂️ Structure

```text
App.tsx                  # Fonts and application providers
src/
├── Pomodog.tsx          # Screen composition and navigation
├── features/            # Screens, mascot and user flows
├── components/          # Shared UI components
├── domain/              # Progress, tasks and other domain rules
├── hooks/               # Timer state and lifecycle coordination
├── firebase/            # Authentication and account synchronization
├── storage/             # Local persistence
└── timer.ts             # Timer reducer and saved-state validation
plugins/                 # Expo config plugins and Android native features
scripts/                 # Brand assets and source map uploads
tests/                   # Unit tests and Firestore rule checks
docs/                    # Product, architecture, guides and verification evidence
```

## 📚 Documentation

Detailed project documentation is currently in Portuguese.

| Document                              | Purpose                                     |
| ------------------------------------- | ------------------------------------------- |
| [Documentation index](docs/README.md) | Find the guide for each topic.              |
| [Architecture](docs/arquitetura.md)   | Modules, data flow and native integrations. |
| [Roadmap](docs/plano-de-acao.md)      | Feature status, priorities and next steps.  |
| [Verification](docs/verificacao.md)   | Confirmed checks, evidence and limitations. |
| [Security](docs/seguranca.md)         | Security review and remaining checks.       |
| [Privacy](docs/privacidade.md)        | Data handling, consent and retention work.  |

Release readiness, remaining device checks and production setup are tracked in the roadmap.
