const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    console.log('Starting cross-platform build...');
    console.log('Current working directory:', process.cwd());
    console.log('Platform:', process.platform);

    // 1. Build Frontend
    console.log('Step 1: Building frontend...');
    execSync('npm install --prefix frontend', { stdio: 'inherit' });
    execSync('npm run build --prefix frontend', { stdio: 'inherit' });

    // 2. Prepare Dist Directory
    const distOutputDir = path.join(__dirname, 'dist');
    const frontendDistDir = path.join(__dirname, 'frontend', 'dist');

    if (fs.existsSync(distOutputDir)) {
        console.log('Step 2: Cleaning existing dist directory...');
        fs.rmSync(distOutputDir, { recursive: true, force: true });
    }

    console.log('Step 3: Creating empty dist directory...');
    fs.mkdirSync(distOutputDir);

    // 3. Copy files from frontend/dist to root dist
    console.log('Step 4: Copying artifacts to /dist folder...');
    const copyRecursive = (src, dest) => {
        if (fs.lstatSync(src).isDirectory()) {
            if (!fs.existsSync(dest)) fs.mkdirSync(dest);
            fs.readdirSync(src).forEach(file => {
                copyRecursive(path.join(src, file), path.join(dest, file));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    };

    if (fs.existsSync(frontendDistDir)) {
        copyRecursive(frontendDistDir, distOutputDir);
        console.log('Build finished successfully! Files are in the /dist directory.');
    } else {
        console.error('Error: frontend/dist directory not found after build.');
        process.exit(1);
    }
} catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
}
