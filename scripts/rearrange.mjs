import fs from 'fs';

const file = 'app/apply/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">`;
const endStr = `</section>`;

const parts = content.split(targetStr);
const rest = parts[1].split(endStr);
const inner = rest[0];

const extractCard = (marker) => {
    const match = inner.match(new RegExp(`{\\/\\* ${marker} \\*\\/}.*?<button[\\s\\S]*?<\\/button>`, 's'));
    return match ? match[0] : '';
};

let studentObj = extractCard('STUDENT CARD');
let teacherObj = extractCard('TEACHER CARD');
let parentObj = extractCard('PARENT CARD');
let schoolObj = extractCard('SCHOOL CARD');

studentObj = studentObj.replace(/text-left overflow-hidden"/, 'text-left overflow-hidden min-h-[420px] flex flex-col"').replace(/<div className="relative z-10">/, '<div className="relative z-10 flex flex-col flex-grow">').replace(/<div className="flex items-center text-emerald-600/, '<div className="flex items-center mt-auto pt-4 text-emerald-600');
teacherObj = teacherObj.replace(/text-left overflow-hidden"/, 'text-left overflow-hidden min-h-[420px] flex flex-col"').replace(/<div className="relative z-10">/, '<div className="relative z-10 flex flex-col flex-grow">').replace(/<div className="flex items-center text-blue-600/, '<div className="flex items-center mt-auto pt-4 text-blue-600');
parentObj = parentObj.replace(/text-left overflow-hidden"/, 'text-left overflow-hidden min-h-[420px] flex flex-col"').replace(/<div className="relative z-10">/, '<div className="relative z-10 flex flex-col flex-grow">').replace(/<div className="flex items-center text-purple-600/, '<div className="flex items-center mt-auto pt-4 text-purple-600');

schoolObj = schoolObj.replace(/min-h-\\[420px\\]"/, 'min-h-[420px] w-full"');

const newStr = `
            <div className="flex flex-col gap-12 max-w-6xl mx-auto">
              {/* TOP ROW: SCHOOL CARD */}
              <div className="w-full max-w-[400px] mx-auto">
                ${schoolObj}
              </div>

              {/* BOTTOM ROW: 3 CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                ${studentObj}
                ${teacherObj}
                ${parentObj}
              </div>
            </div>
          `;

const newContent = parts[0] + newStr + endStr + rest.slice(1).join(endStr);
fs.writeFileSync(file, newContent);
console.log('Done!');
