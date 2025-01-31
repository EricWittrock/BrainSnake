import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import glsl from 'vite-plugin-glsl';
// import devtools from 'solid-devtools/vite';
// import plainText from 'vite-plugin-plain-text';

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
    glsl()
    // plainText([/\/LICENSE$/, '**/*.text', /\.glsl$/]),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
