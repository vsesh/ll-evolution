const STORAGE_KEY = 'evolution_sim_v2';

function rleEncode(arr) {
  const chunks = [];
  let i = 0;
  while (i < arr.length) {
    const color = arr[i];
    let len = 1;
    while (i + len < arr.length && arr[i + len] === color && len < 65535) len++;
    chunks.push(color, len >> 8, len & 0xFF);
    i += len;
  }
  return new Uint8Array(chunks);
}

function rleDecode(bytes, targetLen) {
  const out = new Uint8Array(targetLen);
  let i = 0;
  let j = 0;
  while (i + 2 < bytes.length) {
    const color = bytes[i];
    const len = (bytes[i + 1] << 8) | bytes[i + 2];
    out.fill(color, j, j + len);
    j += len;
    i += 3;
  }
  return out;
}

function toBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export class Storage {
  save(_simulation) {
    // try {
    //   const { tick, grid } = simulation.serialize();
    //   const compressed = rleEncode(grid instanceof Uint8Array ? grid : new Uint8Array(grid));
    //   const payload = JSON.stringify({ tick, grid: toBase64(compressed) });
    //   localStorage.setItem(STORAGE_KEY, payload);
    //   return true;
    // } catch (e) {
    //   console.warn('Save failed:', e);
    //   return false;
    // }
  }

  load(simulation) {
    // try {
    //   const raw = localStorage.getItem(STORAGE_KEY);
    //   if (!raw) return false;
    //   const { tick, grid: b64 } = JSON.parse(raw);
    //   const compressed = fromBase64(b64);
    //   const gridSize = simulation.grid.length;
    //   const grid = rleDecode(compressed, gridSize);
    //   simulation.deserialize({ tick, grid });
    //   return true;
    // } catch (e) {
    //   console.warn('Load failed:', e);
    //   return false;
    // }
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
