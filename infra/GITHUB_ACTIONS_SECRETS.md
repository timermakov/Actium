# GitHub Actions secrets

| Secret | Used by | Description |
|--------|---------|-------------|
| `DOCKERHUB_USERNAME` | CI | Registry login |
| `DOCKERHUB_TOKEN` | CI | Registry password |
| `DOCKERHUB_NAMESPACE` | CI, CD | Image prefix (default: username) |
| `GH_PAT` | CD | Push manifest bumps to `master` |
| `TELEGRAM_BOT_TOKEN` | notify.yml, cd.yml | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | notify.yml, cd.yml | Target chat id |

Telegram notifications are skipped until bot token and chat id are configured.
