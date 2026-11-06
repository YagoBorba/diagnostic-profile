import { normalizeConfig } from './config.mjs';

export function exportConfig(input) {
  // Normalize into a whitelist of supported fields; unknown token/credential fields are dropped.
  return { $schema: 'https://raw.githubusercontent.com/YagoBorba/diagnostic-profile/v0.1.0/schema/diagnostic-profile.schema.json', ...normalizeConfig(input) };
}
export function encodeConfig(input) {
  const bytes = new TextEncoder().encode(JSON.stringify(exportConfig(input)));
  if (bytes.length > 24576) throw new Error('Configuration exceeds the 24 KiB share-link limit; export a file instead.');
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeConfig(value) {
  if (typeof value !== 'string' || value.length > 32768 || !/^[\w-]+$/.test(value)) throw new Error('Invalid shared configuration.');
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return exportConfig(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
}

// Store-only ZIP, without external libraries; suitable for the small text/SVG installation kit.
export function zipFiles(files) {
  const encoder = new TextEncoder();
  const chunks = [], central = [];
  let offset = 0;
  const crc32 = (bytes) => {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
  };
  const header = (size) => { const bytes = new Uint8Array(size); return { bytes, view: new DataView(bytes.buffer) }; };
  for (const [filename, value] of Object.entries(files)) {
    if (!filename || filename.startsWith('/') || /^[a-z]:/i.test(filename) || filename.split('/').includes('..') || /[\\\u0000]/.test(filename)) throw new Error('Unsafe archive filename');
    const name = encoder.encode(filename), data = encoder.encode(value), crc = crc32(data);
    const h = header(30);
    h.view.setUint32(0, 0x04034b50, true); h.view.setUint16(4, 20, true); h.view.setUint16(6, 0x0800, true);
    h.view.setUint16(12, 33, true);
    h.view.setUint32(14, crc, true); h.view.setUint32(18, data.length, true); h.view.setUint32(22, data.length, true); h.view.setUint16(26, name.length, true);
    chunks.push(h.bytes, name, data);
    const c = header(46);
    c.view.setUint32(0, 0x02014b50, true); c.view.setUint16(4, 20, true); c.view.setUint16(6, 20, true);
    c.view.setUint16(14, 33, true);
    c.view.setUint16(8, 0x0800, true); c.view.setUint32(16, crc, true);
    c.view.setUint32(20, data.length, true); c.view.setUint32(24, data.length, true); c.view.setUint16(28, name.length, true); c.view.setUint32(42, offset, true);
    central.push(c.bytes, name); offset += 30 + name.length + data.length;
  }
  const centralSize = central.reduce((n, bytes) => n + bytes.length, 0);
  const end = header(22);
  end.view.setUint32(0, 0x06054b50, true); end.view.setUint16(8, central.length / 2, true); end.view.setUint16(10, central.length / 2, true);
  end.view.setUint32(12, centralSize, true); end.view.setUint32(16, offset, true);
  const all = [...chunks, ...central, end.bytes];
  const result = new Uint8Array(all.reduce((n, bytes) => n + bytes.length, 0));
  let cursor = 0;
  for (const bytes of all) { result.set(bytes, cursor); cursor += bytes.length; }
  return result;
}
