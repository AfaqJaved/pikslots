import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	envDir: resolve(__dirname, '../../'),
	server: {
		// Allow any *.localhost subdomain (e.g. afaq.localhost, app.localhost) for local
		// tenant-subdomain testing — browsers resolve these to 127.0.0.1 automatically.
		allowedHosts: ['.localhost']
	}
});
