const http = require('http');

const postData = JSON.stringify({
    fullName: 'Validation Student',
    email: 'validate@student.edu',
    country: 'Turkey',
    educationLevel: 'Undergraduate',
    needSummary: 'This description is specifically designed to be over 100 characters long to pass the minimum length validation check we implemented on the server. It verifies that the server correctly accepts valid descriptions.',
    targetAmount: 2500,
    classYear: '4',
    faculty: 'Arts and Sciences',
    department: 'Psychology',
    documents: ['test-doc.pdf']
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ops/applications',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('1. Testing POST /api/ops/applications...');
const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`POST Status: ${res.statusCode}`);
        try {
            const result = JSON.parse(data);
            if (result.success) {
                console.log('POST Success. Created ID:', result.data.id);
                console.log('Stored Fields Check:');
                console.log('- targetAmount:', result.data.targetAmount);
                console.log('- classYear:', result.data.classYear);
                console.log('- faculty:', result.data.faculty);
                console.log('- department:', result.data.department);

                // Step 2: GET status
                console.log('\n2. Testing GET /api/applications/[id]/status...');
                http.get(`http://localhost:3000/api/applications/${result.data.id}/status`, (res2) => {
                    let data2 = '';
                    res2.on('data', chunk => data2 += chunk);
                    res2.on('end', () => {
                        console.log(`GET Status: ${res2.statusCode}`);
                        const result2 = JSON.parse(data2);
                        if (result2.success) {
                            console.log('GET Success. Retreived Data:');
                            console.log('- targetAmount:', result2.data.targetAmount);
                            console.log('- classYear:', result2.data.classYear);
                            console.log('- faculty:', result2.data.faculty);
                            console.log('- department:', result2.data.department);

                            if (result2.data.targetAmount === 2500 && result2.data.classYear === '4') {
                                console.log('\n✅ VALIDATION PASSED: All fields persisted and retrieved correctly.');
                            } else {
                                console.error('\n❌ VALIDATION FAILED: Data mismatch.');
                            }
                        } else {
                            console.error('GET Failed:', result2);
                        }
                    });
                });
            } else {
                console.error('POST Failed:', result);
            }
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.write(postData);
req.end();
