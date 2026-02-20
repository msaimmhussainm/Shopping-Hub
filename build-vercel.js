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

    // 2. Prepare Public Directory
    const publicDir = path.join(__dirname, 'public');
    const distDir = path.join(__dirname, 'frontend', 'dist');

    if (fs.existsSync(publicDir)) {
        console.log('Step 2: Cleaning existing public directory...');
        fs.rmSync(publicDir, { recursive: true, force: true });
    }

    console.log('Step 3: Creating empty public directory...');
    fs.mkdirSync(publicDir);

    // 3. Copy files from dist to public
    console.log('Step 4: Copying artifacts to public folder...');
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

    if (fs.existsSync(distDir)) {
        copyRecursive(distDir, publicDir);
        console.log('Build finished successfully! Files are in the /public directory.');
    } else {
        console.error('Error: frontend/dist directory not found after build.');
        process.exit(1);
    }
} catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
}
