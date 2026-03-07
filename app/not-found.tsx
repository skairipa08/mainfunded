'use client';

export default function NotFound() {
    return (
        <html lang="en">
            <body>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                    <h1>404 - Not Found</h1>
                    <p>The requested resource could not be found.</p>
                </div>
            </body>
        </html>
    );
}
