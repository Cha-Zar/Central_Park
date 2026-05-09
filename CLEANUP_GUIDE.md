# Project Cleanup Guide

## Files to KEEP ✅

### Essential for Operation
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `postcss.config.js` - PostCSS configuration
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migrations
- `.env.example` - Environment variables template

### Source Code
- `src/` - All application code (unchanged)
- `ESP32_MASTER.ino` - Master sensor code (unchanged)
- `ESP32_SLAVE.ino` - Slave actuator code (unchanged)

### Essential Documentation
- `README.md` - Main project documentation
- `QUICK_START.md` - Quick start guide for setup

### Testing & Data
- `test-data/` - New folder with JSON test data for database seeding

---

## Files to REMOVE ❌

### Redundant Documentation
- `PROJECT_SUMMARY.md` - Redundant with README.md
- `COMPLETION_SUMMARY.md` - Development artifact
- `DEPLOYMENT.md` - Can be integrated into README if needed
- `TROUBLESHOOTING.md` - Can be integrated into QUICK_START.md
- `ARCHITECTURE.md` - (Optional) Keep if you want detailed technical docs

### Auto-Generated (Can Delete)
- `next-env.d.ts` - Auto-generated on npm run dev
- `.next/` - Build output (already in .gitignore)
- `node_modules/` - Dependencies (already in .gitignore)
- `package-lock.json` - Lock file (already in .gitignore)

### Development Files to Clean Up
- `.env` - Local development only (keep .env.example)
- `.env.local` - Local development only
- `.vscode/` - IDE settings (personal preference)

---

## After Cleanup, Your Structure Should Be:

```
green_garden/
├── src/                    # Application code
├── prisma/                # Database schema & migrations
├── test-data/             # NEW: Test JSON files
├── public/                # Static assets (if any)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .gitignore
├── .env.example
├── README.md
├── QUICK_START.md
├── ESP32_MASTER.ino
└── ESP32_SLAVE.ino
```

---

## Git Cleanup Before Push

Before pushing to GitHub:

1. **Update .gitignore** to exclude:
   ```
   .env
   .env.local
   .next/
   node_modules/
   ```

2. **Remove files locally**:
   ```bash
   rm COMPLETION_SUMMARY.md PROJECT_SUMMARY.md DEPLOYMENT.md TROUBLESHOOTING.md
   rm next-env.d.ts
   rm .env .env.local
   ```

3. **Commit cleanup**:
   ```bash
   git add -A
   git commit -m "chore: cleanup project structure"
   ```

4. **Push to GitHub**:
   ```bash
   git push origin main
   ```

---

## Next Steps

1. ✅ Database schema updated with `waterLevel` and `pumpState`
2. ✅ Test data created in `test-data/` folder
3. ⏳ Run: `npm install && npm run db:push` to update database
4. ⏳ Manually seed test data via Neon dashboard using JSON files
5. ⏳ Deploy to Vercel with cleaned repository
