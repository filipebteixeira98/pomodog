<p align="center">
  <img src="assets/brand/icon.png" alt="Pomodog logo featuring Nino" width="88" height="88" />
</p>

<h1 align="center">Pomodog</h1>

<p align="center">
  A friendly Pomodoro companion for building a steady focus routine.<br />
  <strong>Beta · Android · Brazilian Portuguese interface</strong>
</p>

## 🐾 Features

- Focus and break sessions with pause, resume and background recovery.
- Nino, an animated dog with gentle encouragement and reduced-motion support.
- Optional tasks, focus streaks and progress charts.
- Android session notifications, countdown controls and a home screen widget.
- Offline use, optional Google sign-in and account synchronization.

Diagnostics and usage analytics are optional and disabled by default.

<p align="center">
  <img src="docs/screenshots/tarefas-progresso-web-2026-10-19.png" alt="Pomodog progress screen showing completed cycles grouped by task" width="260" /><br />
  <em>Progress preview with sample data.</em>
</p>

Built with Expo, React Native, TypeScript, NativeWind and Firebase.

## 💻 Development

Requires Node.js 24 and npm. Start the web preview:

```sh
npm ci
npm run web
```

For Android, configure JDK 17 and the Android SDK, then connect a device or start an emulator:

```sh
npm run android
```

Use the installed development build instead of Expo Go. For subsequent sessions, run `npm start`. See the [Android setup guide](docs/development-build.md) for details.

## ✅ Checks

```sh
npm run typecheck
npm test
npm run format:check
```

## 📚 Documentation

See the [documentation index](docs/README.md) for architecture, configuration, privacy and verification. The [roadmap](docs/plano-de-acao.md) tracks feature status and release work. Detailed guides are in Portuguese.
