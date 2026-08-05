/**
 * Database Migration: Rename Service Provider to Stakeholder
 * 
 * This script migrates existing data from the old naming convention to the new one.
 * 
 * What it does:
 * 1. Renames MongoDB collections
 * 2. Updates field names in related collections
 * 3. Verifies the migration
 * 
 * Run once:
 *   node backend/migrations/renameServiceProviderToStakeholder.js
 */

require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

async function run() {
  try {
    console.log('🚀 Starting Service Provider → Stakeholder migration...\n');
    
    // Connect to database
    await mongoose.connect(process.env.DATABASE);
    console.log('✅ Connected to database\n');
    
    const db = mongoose.connection.db;
    
    // ─── Step 1: Rename Collections ─────────────────────────────────────────
    console.log('📦 Step 1: Renaming collections...');
    
    try {
      // Check if old collections exist
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (collectionNames.includes('serviceproviders')) {
        await db.collection('serviceproviders').rename('stakeholders');
        console.log('   ✅ Renamed: serviceproviders → stakeholders');
      } else if (collectionNames.includes('stakeholders')) {
        console.log('   ℹ️  stakeholders collection already exists');
      } else {
        console.log('   ⚠️  serviceproviders collection not found');
      }
      
      if (collectionNames.includes('serviceproviderrequirements')) {
        await db.collection('serviceproviderrequirements').rename('stakeholderrequirements');
        console.log('   ✅ Renamed: serviceproviderrequirements → stakeholderrequirements');
      } else if (collectionNames.includes('stakeholderrequirements')) {
        console.log('   ℹ️  stakeholderrequirements collection already exists');
      } else {
        console.log('   ⚠️  serviceproviderrequirements collection not found');
      }
    } catch (err) {
      console.error('   ❌ Error renaming collections:', err.message);
    }
    
    console.log('');
    
    // ─── Step 2: Update Field Names in UATSignOff ───────────────────────────
    console.log('📝 Step 2: Updating field names in uatsignoffs...');
    
    try {
      const uatResult = await db.collection('uatsignoffs').updateMany(
        { serviceProvider: { $exists: true } },
        { $rename: { serviceProvider: 'stakeholder' } }
      );
      console.log(`   ✅ Updated ${uatResult.modifiedCount} documents in uatsignoffs`);
    } catch (err) {
      console.error('   ❌ Error updating uatsignoffs:', err.message);
    }
    
    console.log('');
    
    // ─── Step 3: Update Field Names in Projects ─────────────────────────────
    console.log('📝 Step 3: Updating field names in projects...');
    
    try {
      const projectResult = await db.collection('projects').updateMany(
        { legacyServiceProvider: { $exists: true } },
        { $rename: { legacyServiceProvider: 'legacyStakeholder' } }
      );
      console.log(`   ✅ Updated ${projectResult.modifiedCount} documents in projects`);
    } catch (err) {
      console.error('   ❌ Error updating projects:', err.message);
    }
    
    console.log('');
    
    // ─── Step 4: Update Field Names in StakeholderRequirements ──────────────
    console.log('📝 Step 4: Updating field names in stakeholderrequirements...');
    
    try {
      // Update serviceProvider field
      const reqResult1 = await db.collection('stakeholderrequirements').updateMany(
        { serviceProvider: { $exists: true } },
        { $rename: { serviceProvider: 'stakeholder' } }
      );
      console.log(`   ✅ Updated ${reqResult1.modifiedCount} documents (serviceProvider → stakeholder)`);
      
      // Update submittedByType enum value
      const reqResult2 = await db.collection('stakeholderrequirements').updateMany(
        { submittedByType: 'service_provider' },
        { $set: { submittedByType: 'stakeholder' } }
      );
      console.log(`   ✅ Updated ${reqResult2.modifiedCount} documents (enum: service_provider → stakeholder)`);
    } catch (err) {
      console.error('   ❌ Error updating stakeholderrequirements:', err.message);
    }
    
    console.log('');
    
    // ─── Step 5: Update Field Names in RequirementTemplates ─────────────────
    console.log('📝 Step 5: Updating field names in requirementtemplates...');
    
    try {
      const templateResult = await db.collection('requirementtemplates').updateMany(
        { serviceProvider: { $exists: true } },
        { $rename: { serviceProvider: 'stakeholder' } }
      );
      console.log(`   ✅ Updated ${templateResult.modifiedCount} documents in requirementtemplates`);
    } catch (err) {
      console.error('   ❌ Error updating requirementtemplates:', err.message);
    }
    
    console.log('');
    
    // ─── Step 6: Verification ────────────────────────────────────────────────
    console.log('🔍 Step 6: Verifying migration...');
    
    const collectionsAfter = await db.listCollections().toArray();
    const collectionNamesAfter = collectionsAfter.map(c => c.name);
    
    console.log('   Collections found:');
    if (collectionNamesAfter.includes('stakeholders')) {
      const count = await db.collection('stakeholders').countDocuments();
      console.log(`   ✅ stakeholders (${count} documents)`);
    }
    if (collectionNamesAfter.includes('stakeholderrequirements')) {
      const count = await db.collection('stakeholderrequirements').countDocuments();
      console.log(`   ✅ stakeholderrequirements (${count} documents)`);
    }
    
    // Check for old collections
    if (collectionNamesAfter.includes('serviceproviders')) {
      console.log('   ⚠️  WARNING: Old serviceproviders collection still exists!');
    }
    if (collectionNamesAfter.includes('serviceproviderrequirements')) {
      console.log('   ⚠️  WARNING: Old serviceproviderrequirements collection still exists!');
    }
    
    console.log('');
    console.log('═'.repeat(60));
    console.log('✅ Migration complete!');
    console.log('═'.repeat(60));
    console.log('\n📋 Next steps:');
    console.log('   1. Test the application thoroughly');
    console.log('   2. Verify all stakeholder-related features work');
    console.log('   3. Run: node backend/setup/linkUsersToStakeholders.js');
    console.log('   4. If everything works, you can drop old collections (optional)');
    console.log('');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();
