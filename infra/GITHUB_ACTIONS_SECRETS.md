# GitHub Actions secrets

| Secret | Used by | Description |
|--------|---------|-------------|
| `DOCKERHUB_USERNAME` | CI | Registry login |
| `DOCKERHUB_TOKEN` | CI | Registry password |
| `DOCKERHUB_NAMESPACE` | CI, CD | Image prefix (default: username) |
| `GH_PAT` | CD | Push manifest bumps to `master` |
| `TELEGRAM_BOT_TOKEN` | notify.yml, cd.yml | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | notify.yml, cd.yml | Target chat id |
| `SONAR_HOST_URL` | CI | SonarQube server URL (e.g. `http://178.154.244.207:9090`) |
| `SONAR_TOKEN_USER_ACCOUNT` | CI | Project token for `actium-user-account` |
| `SONAR_TOKEN_WEB` | CI | Project token for `actium-web` |
| `SONAR_TOKEN_AI` | CI | Project token for `actium-ai-backend` |

Telegram notifications are skipped until bot token and chat id are configured.
