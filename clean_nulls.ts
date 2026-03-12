import { getDb } from './lib/db';
async function cleanDuplicateNulls() {
    const db = await getDb();
    const result = await db.collection('student_profiles').deleteMany({ userId: { $in: [null, undefined] } });
    console.log(`Deleted ${result.deletedCount} student_profiles with null userId`);
    process.exit(0);
}
cleanDuplicateNulls();
