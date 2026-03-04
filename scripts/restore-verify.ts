import * as fs from 'fs';
import { execSync } from 'child_process';

// 1. Restore the file to discard all broken AST/Regex messes
console.log('Restoring app/verify/page.tsx from git');
execSync('git checkout app/verify/page.tsx');

// Wait, doing git checkout will discard ALL the i18n extractions done by earlier script (extract-texts.ts).
// I cannot use git checkout because we didn't commit after extract-texts.ts!
// Let's abort and just do a manual string replace of the broken block.
