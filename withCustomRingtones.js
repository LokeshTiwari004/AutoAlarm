/**
 * Expo Config Plugin
 * Copies custom .wav ringtone files from assets/sounds to android/app/src/main/res/raw
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withCustomRingtones(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      
      const soundsPath = path.join(projectRoot, 'assets', 'sounds');
      const resRawPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'res',
        'raw'
      );

      // Create the raw directory if it doesn't exist
      if (!fs.existsSync(resRawPath)) {
        fs.mkdirSync(resRawPath, { recursive: true });
        console.log(`[withCustomRingtones] Created directory: ${resRawPath}`);
      }

      // Read all files in assets/sounds
      if (fs.existsSync(soundsPath)) {
        const files = fs.readdirSync(soundsPath);

        files.forEach((file) => {
          if (file.endsWith('.wav') || file.endsWith('.mp3')) {
            const src = path.join(soundsPath, file);
            // Ensure filename is lowercased (Android resource requirement)
            const destName = file.toLowerCase();
            const dest = path.join(resRawPath, destName);
            
            fs.copyFileSync(src, dest);
            console.log(`[withCustomRingtones] Copied ${file} -> res/raw/${destName}`);
          }
        });
      } else {
        console.warn(`[withCustomRingtones] Warning: Source sounds directory not found at ${soundsPath}`);
      }

      return config;
    },
  ]);
}

module.exports = withCustomRingtones;
