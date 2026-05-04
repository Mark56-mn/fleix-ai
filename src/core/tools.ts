import vm from 'node:vm';
import { readFile, writeFile } from 'node:fs/promises';

const cache = new Map<string, string>();

export type ToolCall = { name: 'calculator' | 'webSearch' | 'codeExec' | 'fileRead' | 'fileWrite' | 'dbQuery'; input: string; justification: string };

export async function runTool(call: ToolCall): Promise<string> {
  const key = `${call.name}:${call.input}`;
  if (cache.has(key)) return cache.get(key)!;

  let result = '';
  switch (call.name) {
    case 'calculator': {
      result = String(Function(`"use strict"; return (${call.input});`)());
      break;
    }
    case 'webSearch': {
      const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(call.input)}&format=json`);
      result = res.ok ? (await res.text()).slice(0, 800) : 'web search failed';
      break;
    }
    case 'codeExec': {
      const output = vm.runInNewContext(call.input, {}, { timeout: 1000 });
      result = String(output);
      break;
    }
    case 'fileRead':
      result = await readFile(call.input, 'utf8');
      break;
    case 'fileWrite': {
      const [path, ...data] = call.input.split('\n');
      await writeFile(path, data.join('\n'), 'utf8');
      result = `wrote ${path}`;
      break;
    }
    case 'dbQuery':
      result = 'dbQuery delegated to memory RPC layer';
      break;
  }

  cache.set(key, result);
  return result;
}
