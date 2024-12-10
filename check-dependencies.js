import { execSync } from 'child_process';
import fs from 'fs';

console.log('Checking installed dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  const requiredDeps = ['react-hook-form', '@hookform/resolvers', 'zod'];
  const missingDeps = [];

  requiredDeps.forEach(dep => {
    if (!dependencies[dep] && !devDependencies[dep]) {
      missingDeps.push(dep);
    }
  });

  if (missingDeps.length > 0) {
    console.log('Missing dependencies:', missingDeps.join(', '));
    console.log('Installing missing dependencies...');
    execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
    console.log('Dependencies installed successfully!');
  } else {
    console.log('All required dependencies are already installed.');
  }

  console.log('Installed dependencies:');
  execSync('npm list react-hook-form @hookform/resolvers zod', { stdio: 'inherit' });
} catch (error) {
  console.error('Error:', error.message);
}