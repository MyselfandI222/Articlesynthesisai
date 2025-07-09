const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const config = {
  // Replace with your GitHub details
  owner: 'your-username',
  repo: 'your-repo-name',
  branch: 'main', // or 'master' or any other branch
  // Optional: GitHub personal access token for private repos
  // token: 'your-github-token',
  // Files or directories to download (leave empty for all)
  paths: [
    // Examples:
    // 'src/components',
    // 'src/utils',
    // 'package.json',
  ]
};

// Create directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  const dirname = path.dirname(dirPath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

// Download a file from GitHub
function downloadFile(filePath) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;
    
    const options = {
      headers: {
        'User-Agent': 'GitHub-File-Downloader',
        'Accept': 'application/vnd.github.v3.raw'
      }
    };
    
    // Add authorization header if token is provided
    if (config.token) {
      options.headers['Authorization'] = `token ${config.token}`;
    }
    
    https.get(apiUrl, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Handle redirect
        https.get(res.headers.location, (redirectRes) => {
          let data = '';
          redirectRes.on('data', (chunk) => {
            data += chunk;
          });
          
          redirectRes.on('end', () => {
            try {
              ensureDirectoryExists(filePath);
              fs.writeFileSync(filePath, data);
              console.log(`✅ Downloaded: ${filePath}`);
              resolve();
            } catch (err) {
              console.error(`❌ Error saving ${filePath}:`, err);
              reject(err);
            }
          });
        }).on('error', (err) => {
          console.error(`❌ Error downloading ${filePath}:`, err);
          reject(err);
        });
      } else if (res.statusCode === 200) {
        // Direct download
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            ensureDirectoryExists(filePath);
            fs.writeFileSync(filePath, data);
            console.log(`✅ Downloaded: ${filePath}`);
            resolve();
          } catch (err) {
            console.error(`❌ Error saving ${filePath}:`, err);
            reject(err);
          }
        });
      } else {
        console.error(`❌ Failed to download ${filePath}: Status ${res.statusCode}`);
        reject(new Error(`HTTP Status ${res.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`❌ Error downloading ${filePath}:`, err);
      reject(err);
    });
  });
}

// List repository contents
function listRepoContents(path = '') {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
    
    const options = {
      headers: {
        'User-Agent': 'GitHub-File-Downloader',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    if (config.token) {
      options.headers['Authorization'] = `token ${config.token}`;
    }
    
    https.get(apiUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`❌ Failed to list contents at ${path}: Status ${res.statusCode}`);
          reject(new Error(`HTTP Status ${res.statusCode}`));
          return;
        }
        
        try {
          const contents = JSON.parse(data);
          resolve(contents);
        } catch (err) {
          console.error('❌ Error parsing repository contents:', err);
          reject(err);
        }
      });
    }).on('error', (err) => {
      console.error('❌ Error listing repository contents:', err);
      reject(err);
    });
  });
}

// Download directory recursively
async function downloadDirectory(dirPath) {
  try {
    const contents = await listRepoContents(dirPath);
    
    for (const item of contents) {
      const itemPath = item.path;
      
      if (item.type === 'file') {
        await downloadFile(itemPath);
      } else if (item.type === 'dir') {
        await downloadDirectory(itemPath);
      }
    }
  } catch (err) {
    console.error(`❌ Error processing directory ${dirPath}:`, err);
  }
}

// Main function
async function updateFromGitHub() {
  console.log('🚀 Starting GitHub code update...');
  
  try {
    if (config.paths && config.paths.length > 0) {
      // Download specific paths
      for (const itemPath of config.paths) {
        try {
          const contents = await listRepoContents(itemPath);
          
          if (Array.isArray(contents)) {
            // It's a directory
            await downloadDirectory(itemPath);
          } else {
            // It's a file
            await downloadFile(itemPath);
          }
        } catch (err) {
          // Try as a file if directory listing fails
          await downloadFile(itemPath);
        }
      }
    } else {
      // Download entire repository
      await downloadDirectory('');
    }
    
    console.log('✅ GitHub code update completed successfully!');
  } catch (err) {
    console.error('❌ GitHub code update failed:', err);
  }
}

// Run the update
updateFromGitHub();