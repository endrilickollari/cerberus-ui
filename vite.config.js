import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(() => {
    return {
        build: {
            outDir: 'dist',
        },
        plugins: [react()],
        define: {
            "process.env.VITE_API_BASE_URL": JSON.stringify(process.env.VITE_API_BASE_URL),
        },
    };
});