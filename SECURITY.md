# Security policy

Version 0.2.x receives security fixes on a best-effort basis. Report against the latest patch release; older minor versions are unsupported. Fixes follow the documented hotfix/release flow.

Do not include tokens or private profile data in public issues. Use GitHub's private vulnerability reporting option when available. If it is unavailable, email the maintainer at yagoaborba@hotmail.com with the affected version, reproduction steps and impact.

The generator reads GitHub data and writes profile assets. Generated files may be public: inspect them before publishing. Keep personal access tokens in environment variables or GitHub Actions secrets, and grant only the permissions needed.

Themes and configurations are data, not executable plugins. Community submissions must not introduce scripts, external credentials or undisclosed tracking.
