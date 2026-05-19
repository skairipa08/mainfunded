#!/usr/bin/env tsx
import { getDb } from '../lib/db'

async function createProjectIndexes() {
  const db = await getDb()

  await db.collection('projects').createIndexes([
    { key: { project_id: 1 }, unique: true },
    { key: { owner_id: 1 } },
    { key: { status: 1, risk_score: 1 } },
    { key: { status: 1, published_at: -1 } },
    { key: { type: 1, status: 1 } },
    { key: { domain: 1 } },
    { key: { title: 'text', description: 'text' } },
  ])

  await db.collection('project_members').createIndexes([
    { key: { member_id: 1 }, unique: true },
    { key: { project_id: 1 } },
    { key: { user_id: 1 } },
  ])

  await db.collection('milestones').createIndexes([
    { key: { milestone_id: 1 }, unique: true },
    { key: { project_id: 1, order: 1 } },
    { key: { project_id: 1, status: 1 } },
  ])

  await db.collection('project_escrow').createIndexes([
    { key: { project_id: 1 }, unique: true },
  ])

  await db.collection('escrow_transactions').createIndexes([
    { key: { tx_id: 1 }, unique: true },
    { key: { project_id: 1, type: 1 } },
    { key: { donor_id: 1, type: 1 } },
  ])

  await db.collection('project_verification').createIndexes([
    { key: { project_id: 1 }, unique: true },
  ])

  await db.collection('sponsor_project_follows').createIndexes([
    { key: { donor_id: 1, project_id: 1 }, unique: true },
    { key: { donor_id: 1 } },
    { key: { project_id: 1 } },
  ])

  console.log('✓ Project indexes created')
  process.exit(0)
}

createProjectIndexes().catch(e => { console.error(e); process.exit(1) })
