const { MongoClient } = require('mongodb');

async function cleanDuplicateNulls() {
    const url = "mongodb+srv://getsfunded_db_user:P5QxmUc8oOVGtEQU@fund-ed.yygnr2s.mongodb.net/funded_db?retryWrites=true&w=majority";
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db('funded_db');
        const result = await db.collection('student_profiles').deleteMany({ userId: { $in: [null, undefined] } });
        console.log(`Deleted ${result.deletedCount} student_profiles with null userId`);
    } finally {
        await client.close();
    }
}
cleanDuplicateNulls();
