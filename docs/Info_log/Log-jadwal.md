2026-06-25T15:46:24.867315Z	Cloning repository...
2026-06-25T15:46:26.463041Z	From https://github.com/Ps1906132/eduadmin-fixed-clean
2026-06-25T15:46:26.463466Z	 * branch            b2b1506655dae70999df4f80ee4ae384d27f7005 -> FETCH_HEAD
2026-06-25T15:46:26.466482Z	
2026-06-25T15:46:26.515886Z	HEAD is now at b2b1506 Jadwal Ujian: permission check + role-based UI + scoped reset per jenis
2026-06-25T15:46:26.516288Z	
2026-06-25T15:46:26.636765Z	
2026-06-25T15:46:26.637431Z	Using v2 root directory strategy
2026-06-25T15:46:26.693225Z	Success: Finished cloning repository files
2026-06-25T15:46:29.772591Z	Checking for configuration in a Wrangler configuration file (BETA)
2026-06-25T15:46:29.77347Z	
2026-06-25T15:46:29.773586Z	Found wrangler.toml file. Reading build configuration...
2026-06-25T15:46:29.781932Z	pages_build_output_dir: dist
2026-06-25T15:46:29.785264Z	Build environment variables: 
2026-06-25T15:46:29.785457Z	  - VITE_USE_D1: true
2026-06-25T15:46:30.056217Z	Successfully read the Wrangler configuration file.
2026-06-25T15:46:30.600323Z	Detected the following tools from environment: npm@10.9.2, nodejs@22.16.0
2026-06-25T15:46:30.6008Z	Installing project dependencies: npm clean-install --progress=false
2026-06-25T15:46:39.533073Z	npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-06-25T15:46:49.78251Z	
2026-06-25T15:46:49.78341Z	added 263 packages, and audited 264 packages in 18s
2026-06-25T15:46:49.783646Z	
2026-06-25T15:46:49.783867Z	55 packages are looking for funding
2026-06-25T15:46:49.784086Z	  run `npm fund` for details
2026-06-25T15:46:49.814247Z	
2026-06-25T15:46:49.814597Z	9 vulnerabilities (1 low, 2 moderate, 6 high)
2026-06-25T15:46:49.814675Z	
2026-06-25T15:46:49.814757Z	To address all issues, run:
2026-06-25T15:46:49.814809Z	  npm audit fix
2026-06-25T15:46:49.814868Z	
2026-06-25T15:46:49.81493Z	Run `npm audit` for details.
2026-06-25T15:46:49.90357Z	Executing user command: npm run build
2026-06-25T15:46:50.640875Z	
2026-06-25T15:46:50.641218Z	> eduadmin---sistem-manajemen-sekolah@0.0.0 build
2026-06-25T15:46:50.641307Z	> vite build
2026-06-25T15:46:50.64136Z	
2026-06-25T15:46:51.239496Z	⚠️ Warning: Missing required environment variable VITE_API_URL
2026-06-25T15:46:51.290374Z	[36mvite v6.4.1 [32mbuilding for production...[36m[39m
2026-06-25T15:46:51.746326Z	transforming...
2026-06-25T15:46:52.320044Z	[32m✓[39m 15 modules transformed.
2026-06-25T15:46:52.348138Z	[31m✗[39m Build failed in 1.01s
2026-06-25T15:46:52.348498Z	[31merror during build:
2026-06-25T15:46:52.348621Z	[31m[vite:load-fallback] Could not load /opt/buildhome/repo/src/components/MataPelajaran (imported by App.tsx): ENOENT: no such file or directory, open '/opt/buildhome/repo/src/components/MataPelajaran'[31m
2026-06-25T15:46:52.348713Z	    at async open (node:internal/fs/promises:633:25)
2026-06-25T15:46:52.348783Z	    at async Object.readFile (node:internal/fs/promises:1237:14)
2026-06-25T15:46:52.348847Z	    at async Object.handler (file:///opt/buildhome/repo/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:45872:27)
2026-06-25T15:46:52.348958Z	    at async PluginDriver.hookFirstAndGetPlugin (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22404:28)
2026-06-25T15:46:52.349096Z	    at async file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:21404:33
2026-06-25T15:46:52.349242Z	    at async Queue.work (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22632:32)[39m
2026-06-25T15:46:52.463321Z	Failed: Error while executing user command. Exited with error code: 1
2026-06-25T15:46:52.507194Z	Failed: build command exited with code: 1
2026-06-25T15:46:53.46927Z	Failed: error occurred while running build command