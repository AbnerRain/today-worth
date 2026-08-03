# Development workflow

- Treat `main` as the stable branch. Do not make project changes directly on `main`.
- Perform all code, documentation, asset, test, and configuration changes on `develop`.
- Treat `miniprogram/` as the canonical product implementation. Build and verify new features, UI, and interactions there first; keep the root H5 as a synchronized preview only unless the user explicitly requests H5-specific work.
- Before starting a change, confirm the active branch is `develop` and the working tree is clean.
- Inspect and test each change, then create a focused Git commit before finishing the task.
- Stage only files related to the current task and preserve unrelated user changes.
- Use concise Conventional Commit prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `chore:`.
- After a successful commit on `develop`, push `develop` to `origin` before finishing the task.
- Merge `develop` into `main` only after the changes have been verified and the user confirms they are ready, then push the updated `main` to `origin`.
- Do not amend, rebase, force-push, or rewrite existing history unless the user explicitly requests it.
- Never force-push. If a normal push is rejected, stop and report the conflict instead of rewriting remote history.
