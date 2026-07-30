# Development workflow

- Treat `main` as the stable branch. Do not make project changes directly on `main`.
- Perform all code, documentation, asset, test, and configuration changes on `develop`.
- Before starting a change, confirm the active branch is `develop` and the working tree is clean.
- Inspect and test each change, then create a focused Git commit before finishing the task.
- Stage only files related to the current task and preserve unrelated user changes.
- Use concise Conventional Commit prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `chore:`.
- Merge `develop` into `main` only after the changes have been verified and the user confirms they are ready.
- Do not amend, rebase, force-push, or rewrite existing history unless the user explicitly requests it.
- Do not push branches or commits to a remote unless the user explicitly requests it.
