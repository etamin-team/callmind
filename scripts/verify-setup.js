#!/usr/bin/env node

import { readdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

console.log('🔍 Verifying Callmind monorepo setup...\n')

const rootDir = process.cwd()
const checks = []

// Check structure
const expectedStructure = {
  apps: ['api', 'web'],
  packages: ['db', 'eslint-config', 'typescript-config', 'types', 'ui'],
}

try {
  const apps = readdirSync(join(rootDir, 'apps'))
  const packages = readdirSync(join(rootDir, 'packages'))
  
  // Check apps
  for (const app of expectedStructure.apps) {
    if (apps.includes(app)) {
      checks.push({ name: `App: ${app}`, status: '✅' })
      
      // Check package.json
      const pkgPath = join(rootDir, 'apps', app, 'package.json')
      if (existsSync(pkgPath)) {
        checks.push({ name: `  └─ package.json`, status: '✅' })
      }
    } else {
      checks.push({ name: `App: ${app}`, status: '❌' })
    }
  }
  
  // Check packages
  for (const pkg of expectedStructure.packages) {
    if (packages.includes(pkg)) {
      checks.push({ name: `Package: ${pkg}`, status: '✅' })
      
      // Check package.json
      const pkgPath = join(rootDir, 'packages', pkg, 'package.json')
      if (existsSync(pkgPath)) {
        checks.push({ name: `  └─ package.json`, status: '✅' })
      }
    } else {
      checks.push({ name: `Package: ${pkg}`, status: '❌' })
    }
  }
  
} catch (error) {
  checks.push({ name: 'Structure check', status: `❌ Error: ${error.message}` })
}

// Check config files
const configFiles = [
  'turbo.json',
  'pnpm-workspace.yaml',
  'docker-compose.yml',
  '.env.example',
  'AGENTS.md',
]

for (const file of configFiles) {
  if (existsSync(join(rootDir, file))) {
    checks.push({ name: `Config: ${file}`, status: '✅' })
  } else {
    checks.push({ name: `Config: ${file}`, status: '❌' })
  }
}

// Check API specific files
const apiFiles = [
  'apps/api/src/server.ts',
  'apps/api/src/config/environment.ts',
  'apps/api/src/routes/health/health.routes.ts',
]

for (const file of apiFiles) {
  if (existsSync(join(rootDir, file))) {
    checks.push({ name: `API: ${file.split('/').pop()}`, status: '✅' })
  } else {
    checks.push({ name: `API: ${file.split('/').pop()}`, status: '❌' })
  }
}

// Check DB package
const dbFiles = [
  'packages/db/src/index.ts',
  'packages/db/src/models/user.model.ts',
]

for (const file of dbFiles) {
  if (existsSync(join(rootDir, file))) {
    checks.push({ name: `DB: ${file.split('/').pop()}`, status: '✅' })
  } else {
    checks.push({ name: `DB: ${file.split('/').pop()}`, status: '❌' })
  }
}

// Print results
checks.forEach(check => {
  console.log(`${check.status} ${check.name}`)
})

// Summary
const successCount = checks.filter(c => c.status.includes('✅')).length
const totalCount = checks.length

console.log(`\n📊 Summary: ${successCount}/${totalCount} checks passed`)

if (successCount === totalCount) {
  console.log('\n🎉 All checks passed! Your monorepo is ready.')
  console.log('\nNext steps:')
  console.log('1. pnpm install')
  console.log('2. pnpm docker:up')
  console.log('3. pnpm dev')
  process.exit(0)
} else {
  console.log('\n⚠️  Some checks failed. Please review the missing files.')
  process.exit(1)
}
