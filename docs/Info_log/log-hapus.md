2026-06-25T14:37:12.920387Z	Cloning repository...
2026-06-25T14:37:14.050489Z	From https://github.com/Ps1906132/eduadmin-fixed-clean
2026-06-25T14:37:14.050907Z	 * branch            ea0c29c4669ce286443c9d46b2af18f7dfd643ab -> FETCH_HEAD
2026-06-25T14:37:14.051058Z	
2026-06-25T14:37:14.091946Z	HEAD is now at ea0c29c Hapus file legacy MataPelajaran.tsx + tambah permission check di useSubjects hook
2026-06-25T14:37:14.092393Z	
2026-06-25T14:37:14.143424Z	
2026-06-25T14:37:14.143841Z	Using v2 root directory strategy
2026-06-25T14:37:14.160329Z	Success: Finished cloning repository files
2026-06-25T14:37:15.549938Z	Checking for configuration in a Wrangler configuration file (BETA)
2026-06-25T14:37:15.550323Z	
2026-06-25T14:37:15.552037Z	Found wrangler.toml file. Reading build configuration...
2026-06-25T14:37:15.557394Z	pages_build_output_dir: dist
2026-06-25T14:37:15.557547Z	Build environment variables: 
2026-06-25T14:37:15.557644Z	  - VITE_USE_D1: true
2026-06-25T14:37:15.725783Z	Successfully read the Wrangler configuration file.
2026-06-25T14:37:16.158954Z	Detected the following tools from environment: npm@10.9.2, nodejs@22.16.0
2026-06-25T14:37:16.159325Z	Installing project dependencies: npm clean-install --progress=false
2026-06-25T14:37:19.965572Z	npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-06-25T14:37:23.130209Z	
2026-06-25T14:37:23.130481Z	added 263 packages, and audited 264 packages in 6s
2026-06-25T14:37:23.130539Z	
2026-06-25T14:37:23.130575Z	55 packages are looking for funding
2026-06-25T14:37:23.130608Z	  run `npm fund` for details
2026-06-25T14:37:23.156698Z	
2026-06-25T14:37:23.158074Z	9 vulnerabilities (1 low, 2 moderate, 6 high)
2026-06-25T14:37:23.158215Z	
2026-06-25T14:37:23.158293Z	To address all issues, run:
2026-06-25T14:37:23.158358Z	  npm audit fix
2026-06-25T14:37:23.158395Z	
2026-06-25T14:37:23.158431Z	Run `npm audit` for details.
2026-06-25T14:37:23.221696Z	Executing user command: npm run build
2026-06-25T14:37:23.520306Z	
2026-06-25T14:37:23.520641Z	> eduadmin---sistem-manajemen-sekolah@0.0.0 build
2026-06-25T14:37:23.520724Z	> vite build
2026-06-25T14:37:23.520778Z	
2026-06-25T14:37:23.738663Z	⚠️ Warning: Missing required environment variable VITE_API_URL
2026-06-25T14:37:23.770694Z	[36mvite v6.4.1 [32mbuilding for production...[36m[39m
2026-06-25T14:37:24.042934Z	transforming...
2026-06-25T14:37:24.596543Z	[32m✓[39m 16 modules transformed.
2026-06-25T14:37:24.603784Z	[31m✗[39m Build failed in 800ms
2026-06-25T14:37:24.607817Z	[31merror during build:
2026-06-25T14:37:24.608153Z	[31m[vite:load-fallback] Could not load /opt/buildhome/repo/src/components/MataPelajaran (imported by App.tsx): ENOENT: no such file or directory, open '/opt/buildhome/repo/src/components/MataPelajaran'[31m
2026-06-25T14:37:24.608223Z	    at async open (node:internal/fs/promises:633:25)
2026-06-25T14:37:24.608291Z	    at async Object.readFile (node:internal/fs/promises:1237:14)
2026-06-25T14:37:24.608328Z	    at async Object.handler (file:///opt/buildhome/repo/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:45872:27)
2026-06-25T14:37:24.608389Z	    at async PluginDriver.hookFirstAndGetPlugin (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22404:28)
2026-06-25T14:37:24.608455Z	    at async file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:21404:33
2026-06-25T14:37:24.608677Z	    at async Queue.work (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22632:32)[39m
2026-06-25T14:37:24.647576Z	Failed: Error while executing user command. Exited with error code: 1
2026-06-25T14:37:24.652971Z	Failed: build command exited with code: 1
2026-06-25T14:37:25.387706Z	Failed: error occurred while running build command