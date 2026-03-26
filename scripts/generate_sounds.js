const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '../assets/sounds');

// Ensure directory exists
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

// Basic RIFF WAVE generator
function createWave(filename, generateSamples) {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  
  const samples = generateSamples(sampleRate);
  const dataSize = samples.length * (bitsPerSample / 8);
  const fileSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);               // Subchunk1Size
  buffer.writeUInt16LE(1, 20);                // AudioFormat (PCM)
  buffer.writeUInt16LE(numChannels, 22);      // NumChannels
  buffer.writeUInt32LE(sampleRate, 24);       // SampleRate
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);    // BitsPerSample
  
  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Write samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    // scale floats (-1 to 1) to 16 bit bounds
    const val = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(val * 32767), offset);
    offset += 2;
  }
  
  fs.writeFileSync(path.join(SOUNDS_DIR, filename), buffer);
  console.log(`Generated: ${filename}`);
}

// Helpers for waveforms
function sine(t, freq) { return Math.sin(t * 2 * Math.PI * freq); }

// Generators
createWave('bell.wav', (sr) => {
  const duration = 1.5;
  const s = [];
  for(let i=0; i<sr * duration; i++) {
    let t = i/sr;
    let env = Math.exp(-t * 2.5); // Fast exponential decay
    let wave = sine(t, 800) + 0.3 * sine(t, 1200) + 0.1 * sine(t, 1600); // multiple harmonics
    s.push(wave * env);
  }
  return s;
});

createWave('siren.wav', (sr) => {
  const duration = 2.0;
  const s = [];
  for(let i=0; i<sr * duration; i++) {
    let t = i/sr;
    let lfo = sine(t, 2); // 2 sweeps per second
    let freq = 1000 + 400 * lfo;
    s.push(sine(t, freq));
  }
  return s;
});

createWave('digital.wav', (sr) => {
  const duration = 1.0;
  const s = [];
  for(let i=0; i<sr * duration; i++) {
    let t = i/sr;
    // Beep every 0.25s
    let env = (t % 0.25 < 0.125) ? 1 : 0;
    s.push(sine(t, 2000) * env);
  }
  return s;
});

createWave('birds.wav', (sr) => {
  const duration = 2.0;
  const s = [];
  for(let i=0; i<sr * duration; i++) {
    let t = i/sr;
    let p = (t * 8) % 1.0; 
    let env = p < 0.3 ? p / 0.3 : (1 - (p-0.3)/0.7); // Triangle envelope
    let freq = 2500 + 1000 * Math.sin(t * 15);
    s.push(sine(t, freq) * env * 0.5 * (Math.random() > 0.5 ? 1 : 0.5)); // Chirpy
  }
  return s;
});

createWave('harp.wav', (sr) => {
  const duration = 2.0;
  const s = [];
  for(let i=0; i<sr * duration; i++) {
    let t = i/sr;
    let env = Math.exp(-t * 3);
    // Simple arpeggio 
    let f1 = sine(t, 440);
    let f2 = t > 0.1 ? sine(t-0.1, 554.37) : 0;
    let f3 = t > 0.2 ? sine(t-0.2, 659.25) : 0;
    let f4 = t > 0.3 ? sine(t-0.3, 880) : 0;
    s.push((f1 + f2 + f3 + f4) * 0.25 * env);
  }
  return s;
});

createWave('pulse.wav', (sr) => {
  const duration = 0.5;
  const s = [];
  for(let i=0; i<sr * duration; i++) {
    let t = i/sr;
    let env = Math.sin(t * Math.PI / duration); 
    s.push(sine(t, 400) * env);
  }
  return s;
});
