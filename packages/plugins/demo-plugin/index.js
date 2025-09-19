/**
 * Thor.dev Demo Plugin
 * Adds README, LICENSE, and metadata.json to generated projects
 */

const fs = require('fs').promises;
const path = require('path');

const LICENSES = {
  'MIT': `MIT License

Copyright (c) ${new Date().getFullYear()} [PROJECT_NAME]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,

  'Apache-2.0': `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright ${new Date().getFullYear()} [PROJECT_NAME]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,

  'GPL-3.0': `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${new Date().getFullYear()} [PROJECT_NAME]

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`,

  'BSD-3-Clause': `BSD 3-Clause License

Copyright (c) ${new Date().getFullYear()}, [PROJECT_NAME]
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`
};

/**
 * Plugin entry point
 * @param {string} projectPath - Path to the generated project
 * @param {object} meta - Project metadata
 * @param {object} options - Plugin configuration options
 */
async function apply(projectPath, meta, options = {}) {
  console.log(`🔌 Running demo-plugin on project: ${meta.name}`);
  
  const config = {
    addReadme: true,
    addLicense: true,
    licenseType: 'MIT',
    addMetadata: true,
    ...options
  };

  const results = {
    filesCreated: [],
    filesModified: [],
    errors: []
  };

  try {
    // Add README.md
    if (config.addReadme) {
      const readmePath = path.join(projectPath, 'README.md');
      const readmeExists = await fileExists(readmePath);
      
      if (!readmeExists) {
        const readmeContent = generateReadme(meta, config);
        await fs.writeFile(readmePath, readmeContent);
        results.filesCreated.push('README.md');
        console.log('✅ Created README.md');
      } else {
        console.log('ℹ️  README.md already exists, skipping');
      }
    }

    // Add LICENSE
    if (config.addLicense) {
      const licensePath = path.join(projectPath, 'LICENSE');
      const licenseExists = await fileExists(licensePath);
      
      if (!licenseExists) {
        const licenseContent = LICENSES[config.licenseType] || LICENSES.MIT;
        const finalLicenseContent = licenseContent.replace(/\[PROJECT_NAME\]/g, meta.name);
        await fs.writeFile(licensePath, finalLicenseContent);
        results.filesCreated.push('LICENSE');
        console.log(`✅ Created LICENSE (${config.licenseType})`);
      } else {
        console.log('ℹ️  LICENSE already exists, skipping');
      }
    }

    // Add metadata.json
    if (config.addMetadata) {
      const metadataPath = path.join(projectPath, 'metadata.json');
      const metadataContent = {
        name: meta.name,
        description: meta.description,
        version: '1.0.0',
        generatedBy: 'Thor.dev',
        generatedAt: new Date().toISOString(),
        framework: meta.config?.framework || 'nextjs',
        features: meta.config?.features || [],
        plugins: ['demo-plugin'],
        license: config.licenseType,
        author: meta.author || 'Unknown'
      };
      
      await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));
      results.filesCreated.push('metadata.json');
      console.log('✅ Created metadata.json');
    }

    // Update package.json if it exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fileExists(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        
        // Add license field if not present
        if (config.addLicense && !packageJson.license) {
          packageJson.license = config.licenseType;
        }
        
        // Add repository field if not present
        if (!packageJson.repository && meta.repoUrl) {
          packageJson.repository = {
            type: 'git',
            url: meta.repoUrl
          };
        }
        
        // Add keywords if not present
        if (!packageJson.keywords) {
          packageJson.keywords = [
            meta.config?.framework || 'nextjs',
            'thor-dev',
            'generated'
          ];
        }
        
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        results.filesModified.push('package.json');
        console.log('✅ Updated package.json');
      } catch (error) {
        console.warn('⚠️  Failed to update package.json:', error.message);
        results.errors.push(`Failed to update package.json: ${error.message}`);
      }
    }

    console.log(`🎉 Demo plugin completed successfully!`);
    console.log(`   Files created: ${results.filesCreated.length}`);
    console.log(`   Files modified: ${results.filesModified.length}`);
    
    return {
      success: true,
      results
    };

  } catch (error) {
    console.error('❌ Demo plugin failed:', error);
    results.errors.push(error.message);
    
    return {
      success: false,
      error: error.message,
      results
    };
  }
}

function generateReadme(meta, config) {
  return `# ${meta.name}

${meta.description || 'A project generated by Thor.dev'}

## 🚀 Generated by Thor.dev

This project was created using [Thor.dev](https://thor.dev) - the Multi-Agent Workspace for Epic Projects.

## 📋 Features

- ⚡ ${meta.config?.framework || 'Next.js'} Framework
- 🔷 TypeScript Support
- 🎨 Modern UI Components
${meta.config?.features?.map(feature => `- ✨ ${feature}`).join('\n') || ''}

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd ${meta.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
# or 
pnpm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
${meta.name}/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── public/
├── package.json
└── README.md
\`\`\`

## 🚀 Deployment

Deploy your application to your preferred platform:

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [Railway](https://railway.app/)

## 📝 License

This project is licensed under the ${config.licenseType} License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you need help with this project, please visit [Thor.dev](https://thor.dev) or open an issue.

---

<div align="center">
  <strong>Built with ❤️ using Thor.dev</strong>
</div>
`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  apply
};