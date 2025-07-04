// Script pour corriger les importations Supabase
// Exécuter avec: node fix-supabase-imports.js

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Fonction pour remplacer les imports dans un fichier
async function fixImportsInFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Remplacer l'import du client component
    let newContent = content.replace(
      /import\s+{\s*createClientComponentClient\s*}\s*from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createClientComponentClient } from '@/lib/supabase/helpers'`
    );
    
    // Remplacer l'import du client serveur
    newContent = newContent.replace(
      /import\s+{\s*createServerComponentClient\s*}\s*from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createServerComponentClient } from '@/lib/supabase/helpers'`
    );
    
    // Écrire le fichier modifié si des changements ont été apportés
    if (content !== newContent) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour explorer récursivement les dossiers
async function processDirectory(directory) {
  try {
    let fixedCount = 0;
    const files = await readdir(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileStat = await stat(filePath);
      
      // Ignorer node_modules et .next
      if (filePath.includes('node_modules') || filePath.includes('.next')) {
        continue;
      }
      
      if (fileStat.isDirectory()) {
        // Récursion pour les sous-dossiers
        fixedCount += await processDirectory(filePath);
      } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        // Traiter les fichiers JavaScript/TypeScript
        if (await fixImportsInFile(filePath)) {
          fixedCount++;
        }
      }
    }
    
    return fixedCount;
  } catch (error) {
    console.error(`❌ Error processing directory ${directory}:`, error.message);
    return 0;
  }
}

// Fonction principale
async function main() {
  console.log('🔍 Starting to fix Supabase imports...');
  const rootDir = '.';
  const fixedCount = await processDirectory(rootDir);
  console.log(`✨ Done! Fixed imports in ${fixedCount} files.`);
}

main().catch(console.error); 