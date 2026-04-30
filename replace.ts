import * as fs from 'fs';

const files = ['src/pages/Frontend.tsx', 'src/pages/Backend.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Frontend & Backend Color Replace
  content = content.replace(/#003E4C/g, '#5C3D2E'); // Dark Teal -> Dark Brown
  content = content.replace(/#B5A173/g, '#A73C3C'); // Gold -> Barn Red
  content = content.replace(/text-\[#FDFBF7\]/g, 'text-[#5C3D2E]'); // Light text on dark bg -> Dark text on light bg
  content = content.replace(/bg-\[#FDFBF7\]/g, 'bg-[#FFFDF9]'); // Modal bg
  
  // Specific Backend adjustments
  content = content.replace(/bg-\[#002f3a\]/g, 'bg-[#FFFDF9]'); // Backend card bg
  content = content.replace(/bg-\[#00252e\]/g, 'bg-[#F4EFE6]'); // Backend card footer bg
  
  // specific adjustment in Button text for better contrast
  content = content.replace(/text-\[#5C3D2E\] py-4 font-bold tracking-\[0\.3em\] hover:bg-white/g, 'text-[#FFFDF9] py-4 font-bold tracking-[0.3em] hover:bg-[#8B2E2E]');
  
  // illustration
  content = content.replace(/ElegantTeaLeaf/g, 'RusticFlower');
  
  fs.writeFileSync(file, content);
}
