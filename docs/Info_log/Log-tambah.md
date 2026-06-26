2026-06-25T14:55:52.499849Z	Cloning repository...
2026-06-25T14:55:53.63242Z	From https://github.com/Ps1906132/eduadmin-fixed-clean
2026-06-25T14:55:53.632855Z	 * branch            ac0a51b4cf16b7072be9907718feb20a1eefcaf0 -> FETCH_HEAD
2026-06-25T14:55:53.632957Z	
2026-06-25T14:55:53.668348Z	HEAD is now at ac0a51b Tambah permission check di useSchedules hook (konsistensi dengan useSubjects)
2026-06-25T14:55:53.668733Z	
2026-06-25T14:55:53.721792Z	
2026-06-25T14:55:53.72218Z	Using v2 root directory strategy
2026-06-25T14:55:53.737878Z	Success: Finished cloning repository files
2026-06-25T14:55:55.723162Z	Checking for configuration in a Wrangler configuration file (BETA)
2026-06-25T14:55:55.723742Z	
2026-06-25T14:55:55.724336Z	Found wrangler.toml file. Reading build configuration...
2026-06-25T14:55:55.732335Z	pages_build_output_dir: dist
2026-06-25T14:55:55.732535Z	Build environment variables: 
2026-06-25T14:55:55.73264Z	  - VITE_USE_D1: true
2026-06-25T14:55:55.919767Z	Successfully read the Wrangler configuration file.
2026-06-25T14:55:56.382885Z	Detected the following tools from environment: npm@10.9.2, nodejs@22.16.0
2026-06-25T14:55:56.383359Z	Installing project dependencies: npm clean-install --progress=false
2026-06-25T14:56:00.88927Z	npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-06-25T14:56:04.890427Z	
2026-06-25T14:56:04.89072Z	added 263 packages, and audited 264 packages in 7s
2026-06-25T14:56:04.89078Z	
2026-06-25T14:56:04.890822Z	55 packages are looking for funding
2026-06-25T14:56:04.89086Z	  run `npm fund` for details
2026-06-25T14:56:04.914766Z	
2026-06-25T14:56:04.915112Z	9 vulnerabilities (1 low, 2 moderate, 6 high)
2026-06-25T14:56:04.915221Z	
2026-06-25T14:56:04.915313Z	To address all issues, run:
2026-06-25T14:56:04.915402Z	  npm audit fix
2026-06-25T14:56:04.915454Z	
2026-06-25T14:56:04.915502Z	Run `npm audit` for details.
2026-06-25T14:56:04.990771Z	Executing user command: npm run build
2026-06-25T14:56:05.334027Z	
2026-06-25T14:56:05.334577Z	> eduadmin---sistem-manajemen-sekolah@0.0.0 build
2026-06-25T14:56:05.335197Z	> vite build
2026-06-25T14:56:05.335732Z	
2026-06-25T14:56:05.680322Z	⚠️ Warning: Missing required environment variable VITE_API_URL
2026-06-25T14:56:05.710443Z	[36mvite v6.4.1 [32mbuilding for production...[36m[39m
2026-06-25T14:56:05.957085Z	transforming...
2026-06-25T14:56:06.550379Z	[32m✓[39m 16 modules transformed.
2026-06-25T14:56:06.557307Z	[31m✗[39m Build failed in 815ms
2026-06-25T14:56:06.557511Z	[31merror during build:
2026-06-25T14:56:06.557591Z	[31m[vite:load-fallback] Could not load /opt/buildhome/repo/src/components/MataPelajaran (imported by App.tsx): ENOENT: no such file or directory, open '/opt/buildhome/repo/src/components/MataPelajaran'[31m
2026-06-25T14:56:06.557649Z	    at async open (node:internal/fs/promises:633:25)
2026-06-25T14:56:06.557697Z	    at async Object.readFile (node:internal/fs/promises:1237:14)
2026-06-25T14:56:06.557753Z	    at async Object.handler (file:///opt/buildhome/repo/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:45872:27)
2026-06-25T14:56:06.557813Z	    at async PluginDriver.hookFirstAndGetPlugin (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22404:28)
2026-06-25T14:56:06.557874Z	    at async file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:21404:33
2026-06-25T14:56:06.557956Z	    at async Queue.work (file:///opt/buildhome/repo/node_modules/rollup/dist/es/shared/node-entry.js:22632:32)[39m
2026-06-25T14:56:06.609069Z	Failed: Error while executing user command. Exited with error code: 1
2026-06-25T14:56:06.615609Z	Failed: build command exited with code: 1
2026-06-25T14:56:07.297425Z	Failed: error occurred while running build command