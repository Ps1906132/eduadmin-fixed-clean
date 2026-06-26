2026-06-25T15:37:06.687865Z	Cloning repository...
2026-06-25T15:37:07.755785Z	From https://github.com/Ps1906132/eduadmin-fixed-clean
2026-06-25T15:37:07.756138Z	 * branch            1ed80b58e3d9c992c3e692f823cdc83c0acc74b8 -> FETCH_HEAD
2026-06-25T15:37:07.756238Z	
2026-06-25T15:37:07.790288Z	HEAD is now at 1ed80b5 Fix tombol Simpan JadwalUjian → trigger syncExams ke D1
2026-06-25T15:37:07.790569Z	
2026-06-25T15:37:07.843858Z	
2026-06-25T15:37:07.844267Z	Using v2 root directory strategy
2026-06-25T15:37:07.860943Z	Success: Finished cloning repository files
2026-06-25T15:37:11.017255Z	Checking for configuration in a Wrangler configuration file (BETA)
2026-06-25T15:37:11.018828Z	
2026-06-25T15:37:11.018994Z	Found wrangler.toml file. Reading build configuration...
2026-06-25T15:37:11.028774Z	pages_build_output_dir: dist
2026-06-25T15:37:11.030172Z	Build environment variables: 
2026-06-25T15:37:11.030277Z	  - VITE_USE_D1: true
2026-06-25T15:37:11.265341Z	Successfully read the Wrangler configuration file.
2026-06-25T15:37:11.997813Z	Detected the following tools from environment: npm@10.9.2, nodejs@22.16.0
2026-06-25T15:37:11.998312Z	Installing project dependencies: npm clean-install --progress=false
2026-06-25T15:37:17.974013Z	npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-06-25T15:37:22.188132Z	
2026-06-25T15:37:22.188563Z	added 263 packages, and audited 264 packages in 8s
2026-06-25T15:37:22.188686Z	
2026-06-25T15:37:22.188855Z	55 packages are looking for funding
2026-06-25T15:37:22.188911Z	  run `npm fund` for details
2026-06-25T15:37:22.210241Z	
2026-06-25T15:37:22.210721Z	9 vulnerabilities (1 low, 2 moderate, 6 high)
2026-06-25T15:37:22.210838Z	
2026-06-25T15:37:22.210921Z	To address all issues, run:
2026-06-25T15:37:22.211001Z	  npm audit fix
2026-06-25T15:37:22.211111Z	
2026-06-25T15:37:22.21119Z	Run `npm audit` for details.
2026-06-25T15:37:22.278794Z	Executing user command: npm run build
2026-06-25T15:37:22.739204Z	
2026-06-25T15:37:22.739486Z	> eduadmin---sistem-manajemen-sekolah@0.0.0 build
2026-06-25T15:37:22.739545Z	> vite build
2026-06-25T15:37:22.7396Z	
2026-06-25T15:37:23.024707Z	⚠️ Warning: Missing required environment variable VITE_API_URL
2026-06-25T15:37:23.070779Z	[36mvite v6.4.1 [32mbuilding for production...[36m[39m
2026-06-25T15:37:23.418488Z	transforming...
2026-06-25T15:37:23.803978Z	[32m✓[39m 15 modules transformed.
2026-06-25T15:37:23.811574Z	[31m✗[39m Build failed in 695ms
2026-06-25T15:37:23.812562Z	[31merror during build:
2026-06-25T15:37:23.812684Z	[31m[vite:load-fallback] Could not load /opt/buildhome/repo/src/components/MataPelajaran (imported by App.tsx): ENOENT: no such file or directory, open '/opt/buildhome/repo/src/components/MataPelajaran'[31m
2026-06-25T15:37:23.812791Z	    at async open (node:internal/fs/promises:633:25)
2026-06-25T15:37:23.812852Z	    at async Object.readFile (node:internal/fs/promises:1237:14)
2026-06-25T15:37:23.812972Z	    at async Object.handler (file:///opt/buildhome/repo/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:45872:27)
2026-06-25T15:37:23.813118Z	    at async PluginDriver.hookFirstAndGetPlugin (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22404:28)
2026-06-25T15:37:23.813194Z	    at async file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:21404:33
2026-06-25T15:37:23.813334Z	    at async Queue.work (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22632:32)[39m
2026-06-25T15:37:23.860695Z	Failed: Error while executing user command. Exited with error code: 1
2026-06-25T15:37:23.872256Z	Failed: build command exited with code: 1
2026-06-25T15:37:24.621455Z	Failed: error occurred while running build command