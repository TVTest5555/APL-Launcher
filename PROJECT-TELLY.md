# Project Telly — Android TV / Google TV

Project Telly is the Android TV / Google TV product build in this repository. It is based on **APL Launcher** by Knikt (Gero Corp.); the upstream project is released under the MIT License. The upstream licence and attribution are retained in this repository.

This is an early development fork, not a finished consumer release. Android is the first target. Samsung Tizen and LG webOS sources have not been rebranded or adapted as part of this first pass.

## First Android changes

- The Android app is labelled **Project Telly**.
- The optional accessibility companion is labelled **Project Telly Remote**.
- New installations default to a clean home screen: app-provided shelves, live/trending shelves, Continue Watching cards and the upstream creator reminder are off by default.
- These are defaults, not locked settings. Where the existing launcher exposes a setting, the user can turn the feature back on.
- The Remote companion remains optional. The launcher itself can be selected as the Android TV home app without it; some remote-button interception features require the companion.

The Android build uses the existing package IDs for this prototype. Do not treat these APKs as a production release or as a stable update channel until the package identity and signing arrangement have been reviewed.

## Build locally

Requirements: Python 3, Pillow, JDK 17 or later, Android SDK platform 35 and build-tools 35.0.0, and Gradle 8.10.2.

```bash
python -m pip install Pillow
python tools/make-android.py --release --new-key
```

The release build excludes the repository's non-redistributable SF Pro font files. The command above creates a **temporary signing key** for a development build. APKs signed with a newly generated key cannot update APKs signed by a different key; uninstall the previous test build before installing one signed by a new temporary key.

## GitHub Actions preview builds

Pushing to a `project-telly/*` branch runs the Android preview workflow. It uploads versioned APKs signed with a fresh temporary key. These artifacts are for testing only and are not production-signed releases. A production distribution needs a long-lived signing key stored securely in GitHub Actions secrets, plus a reviewed package identity and release process.

## Upstream and licensing

- Original project: [Knikt / APL Launcher](https://github.com/Knikt/APL-Launcher)
- The original [MIT License](LICENSE) and upstream copyright notices remain in place.
- Project Telly-specific Android adaptations are maintained in this fork.
- Third-party names, app logos, fonts and other assets remain subject to their own rights and licences. Release builds omit SF Pro font binaries, as required by the upstream build script's licensing note.

Project Telly is an independent project and is not affiliated with Apple, Google, Android, Samsung or LG.
