const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'mobile', 'src', 'screens');
const componentsDir = path.join(__dirname, 'mobile', 'src', 'components');
const navDir = path.join(__dirname, 'mobile', 'src', 'navigation');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes("from '../theme/theme'") && !content.includes("from '../../theme/theme'")) {
    return;
  }
  
  // Replace import
  content = content.replace(/import\s+{\s*theme\s*}\s+from\s+['"]\.\.\/theme\/theme['"];?/, "import { useTheme } from '../theme/ThemeProvider';");
  content = content.replace(/import\s+{\s*theme\s*}\s+from\s+['"]\.\.\/\.\.\/theme\/theme['"];?/, "import { useTheme } from '../../theme/ThemeProvider';");
  
  // Find component name
  const componentMatch = content.match(/export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\([^)]*\)\s*=>\s*{/);
  if (componentMatch) {
    const compName = componentMatch[1];
    // Insert hook
    content = content.replace(componentMatch[0], componentMatch[0] + "\n  const { theme } = useTheme();\n  const styles = getStyles(theme);");
  }

  // Find export default function App()
  const defaultMatch = content.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)\([^)]*\)\s*{/);
  if (defaultMatch) {
    content = content.replace(defaultMatch[0], defaultMatch[0] + "\n  const { theme } = useTheme();\n  const styles = getStyles(theme);");
  }

  // Change styles definition
  content = content.replace(/const\s+styles\s*=\s*StyleSheet\.create\({/g, "const getStyles = (theme) => StyleSheet.create({");
  
  fs.writeFileSync(filePath, content);
  console.log('Processed', filePath);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walkDir(screensDir);
walkDir(componentsDir);
walkDir(navDir);
