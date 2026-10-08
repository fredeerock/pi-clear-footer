# pi-clear-footer

A compact, single-line footer for Pi's interactive terminal UI.

- Left: working directory, session name (when set), and Git branch (when available).
- Right: context usage percentage, provider, model, and thinking level.
- Highlights context usage at 80% or higher.
- Shortens the home directory to `~` and truncates content to fit the terminal width.
- Removes control characters from displayed labels.

This replaces Pi's default footer; default token/cost totals and other extensions' footer status entries are not displayed. It only activates in TUI mode.

## Install

```sh
pi install git:github.com/fredeerock/pi-clear-footer
```

Run `/reload` in an existing Pi session, or restart Pi. No command or configuration is needed.

Avoid loading another footer-replacement extension at the same time.

## Try without installing

```sh
pi -e ./clear-footer.ts
```
