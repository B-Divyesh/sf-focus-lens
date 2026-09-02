import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const repository = resolve('.');
const sandbox = await mkdtemp(join(tmpdir(), 'focus-lens-clean-'));
const clone = join(sandbox, 'repo');

const run = async (command, args, cwd) => {
  await execFile(command, args, { cwd, stdio: 'inherit', env: process.env });
};

try {
  await run('git', ['clone', '--no-local', repository, clone], repository);
  await run('npm', ['ci'], clone);
  const claims = JSON.parse(await readFile(join(clone, '.factory/claims.json'), 'utf8'));
  for (const claim of claims) {
    console.log(`\nRunning clean claim: ${claim.id}`);
    await run('npm', ['test', '--', '--grep', `@claim:${claim.id}`], clone);
  }
  console.log('\nAll claims passed from a clean clone before any manual build.');
} finally {
  await rm(sandbox, { recursive: true, force: true });
}
