2026-06-25T15:25:24.317748Z	Cloning repository...
2026-06-25T15:25:25.350863Z	From https://github.com/Ps1906132/eduadmin-fixed-clean
2026-06-25T15:25:25.351362Z	 * branch            85e38cb38cdc10752f313065c5ec632c713a3e1f -> FETCH_HEAD
2026-06-25T15:25:25.351476Z	
2026-06-25T15:25:25.404739Z	HEAD is now at 85e38cb Absensi Kurikulum: fetch dari D1, permission check, READ_ONLY matrix
2026-06-25T15:25:25.405191Z	
2026-06-25T15:25:25.495783Z	
2026-06-25T15:25:25.496318Z	Using v2 root directory strategy
2026-06-25T15:25:25.525027Z	Success: Finished cloning repository files
2026-06-25T15:25:28.306861Z	Checking for configuration in a Wrangler configuration file (BETA)
2026-06-25T15:25:28.30816Z	
2026-06-25T15:25:28.308396Z	Found wrangler.toml file. Reading build configuration...
2026-06-25T15:25:28.317685Z	pages_build_output_dir: dist
2026-06-25T15:25:28.318144Z	Build environment variables: 
2026-06-25T15:25:28.319117Z	  - VITE_USE_D1: true
2026-06-25T15:25:28.553916Z	Successfully read the Wrangler configuration file.
2026-06-25T15:25:29.176941Z	Detected the following tools from environment: npm@10.9.2, nodejs@22.16.0
2026-06-25T15:25:29.178639Z	Installing project dependencies: npm clean-install --progress=false
2026-06-25T15:25:35.185661Z	npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-06-25T15:25:40.817642Z	
2026-06-25T15:25:40.820555Z	added 263 packages, and audited 264 packages in 10s
2026-06-25T15:25:40.820785Z	
2026-06-25T15:25:40.820884Z	55 packages are looking for funding
2026-06-25T15:25:40.82098Z	  run `npm fund` for details
2026-06-25T15:25:40.843966Z	
2026-06-25T15:25:40.844192Z	9 vulnerabilities (1 low, 2 moderate, 6 high)
2026-06-25T15:25:40.844257Z	
2026-06-25T15:25:40.844298Z	To address all issues, run:
2026-06-25T15:25:40.844342Z	  npm audit fix
2026-06-25T15:25:40.844418Z	
2026-06-25T15:25:40.844472Z	Run `npm audit` for details.
2026-06-25T15:25:40.919482Z	Executing user command: npm run build
2026-06-25T15:25:41.337202Z	
2026-06-25T15:25:41.337537Z	> eduadmin---sistem-manajemen-sekolah@0.0.0 build
2026-06-25T15:25:41.337623Z	> vite build
2026-06-25T15:25:41.337672Z	
2026-06-25T15:25:41.765511Z	⚠️ Warning: Missing required environment variable VITE_API_URL
2026-06-25T15:25:41.819594Z	[36mvite v6.4.1 [32mbuilding for production...[36m[39m
2026-06-25T15:25:42.142435Z	transforming...
2026-06-25T15:25:42.526809Z	[32m✓[39m 17 modules transformed.
2026-06-25T15:25:42.538106Z	[31m✗[39m Build failed in 672ms
2026-06-25T15:25:42.538658Z	[31merror during build:
2026-06-25T15:25:42.538911Z	[31m[vite:load-fallback] Could not load /opt/buildhome/repo/src/components/MataPelajaran (imported by App.tsx): ENOENT: no such file or directory, open '/opt/buildhome/repo/src/components/MataPelajaran'[31m
2026-06-25T15:25:42.539099Z	    at async open (node:internal/fs/promises:633:25)
2026-06-25T15:25:42.539219Z	    at async Object.readFile (node:internal/fs/promises:1237:14)
2026-06-25T15:25:42.539395Z	    at async Object.handler (file:///opt/buildhome/repo/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:45872:27)
2026-06-25T15:25:42.539845Z	    at async PluginDriver.hookFirstAndGetPlugin (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22404:28)
2026-06-25T15:25:42.539984Z	    at async file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:21404:33
2026-06-25T15:25:42.540243Z	    at async Queue.work (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22632:32)[39m
2026-06-25T15:25:42.608921Z	Failed: Error while executing user command. Exited with error code: 1
2026-06-25T15:25:42.62567Z	Failed: build command exited with code: 1
2026-06-25T15:25:43.524163Z	Failed: error occurred while running build command