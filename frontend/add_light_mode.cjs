const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Insert new variables into :root
const rootVars = `  --mobile-header-bg: rgba(15, 17, 23, 0.85);
  --overlay-bg: rgba(0, 0, 0, 0.7);
  --input-bg: rgba(255, 255, 255, 0.04);
  --input-placeholder: rgba(255, 255, 255, 0.2);
  --hover-bg: rgba(255, 255, 255, 0.04);
}`;

css = css.replace(/}\s*$/, rootVars); // Won't work because there are other rules. 
// We want to replace the FIRST '}' which closes :root
css = css.replace('}', rootVars);

const lightModeVars = `
[data-theme="light"] {
  --bg-dark: #f8fafc;
  --bg-surface: #ffffff;
  --bg-card: #ffffff;
  --bg-card-hover: #f1f5f9;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --text-soft: #475569;
  --border: rgba(0, 0, 0, 0.08);
  --border-hover: rgba(0, 0, 0, 0.15);
  --glass: rgba(0, 0, 0, 0.02);
  --glass-border: rgba(0, 0, 0, 0.05);
  --sidebar-bg: #f8fafc;
  --sidebar-active-bg: rgba(99, 102, 241, 0.08);
  --gradient-surface: linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.12);
  
  --mobile-header-bg: rgba(255, 255, 255, 0.85);
  --overlay-bg: rgba(255, 255, 255, 0.7);
  --input-bg: rgba(0, 0, 0, 0.04);
  --input-placeholder: rgba(0, 0, 0, 0.4);
  --hover-bg: rgba(0, 0, 0, 0.04);
}
`;

css = css.replace(rootVars, rootVars + lightModeVars);

// Replace hardcoded RGBA
css = css.replace(/background: rgba\(255, 255, 255, 0\.08\);/g, 'background: var(--border);');
css = css.replace(/background: rgba\(255, 255, 255, 0\.15\);/g, 'background: var(--border-hover);');
css = css.replace(/background: rgba\(15, 17, 23, 0\.85\);/g, 'background: var(--mobile-header-bg);');
css = css.replace(/background: rgba\(0, 0, 0, 0\.7\);/g, 'background: var(--overlay-bg);');
css = css.replace(/background: rgba\(255, 255, 255, 0\.04\);/g, 'background: var(--hover-bg);');
// input and textarea backgrounds are covered by the above 0.04 replacement if it hits them too. Let's fix that.
// Let's just use --input-bg for all background: rgba(255, 255, 255, 0.04); because --hover-bg and --input-bg are same.
css = css.replace(/var\(--hover-bg\)/g, 'var(--input-bg)'); // simplify

css = css.replace(/color: rgba\(255, 255, 255, 0\.2\);/g, 'color: var(--input-placeholder);');
css = css.replace(/background: rgba\(255, 255, 255, 0\.02\);/g, 'background: var(--glass);');
css = css.replace(/background: rgba\(255, 255, 255, 0\.06\);/g, 'background: var(--glass-border);');
css = css.replace(/rgba\(255,255,255,0\.06\)/g, 'var(--border)'); // For linear gradients
css = css.replace(/rgba\(255,255,255,0\.05\)/g, 'var(--border)'); // For stat-card linear gradient

fs.writeFileSync(cssPath, css);
console.log('CSS updated successfully.');
