# OpportunityGenie AI — GitHub Migration Notes

This repository was prepared from the Replit project as a clean source-code copy.

## Preserved
- Application source code
- Backend/API source
- Database package/schema
- Assets
- package manifests and lockfiles
- TypeScript configuration
- Existing `.gitignore`
- `replit.md` for reference

## Removed
- Existing `.git` history and Replit Git remote
- Replit-specific project metadata directories/files: `.config`, `.agents`, `.replit`, `.replitignore`
- Common generated/cache/build directories

## Important
Replit-specific dependencies and environment-variable references inside the application source were intentionally NOT removed.
They should be reviewed during the deployment/migration phase rather than deleted blindly.

Do not commit secrets such as `.env` files, API keys, database passwords, or private credentials.
