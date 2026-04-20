export function readWorkerEnv(name: string): string | undefined {
  const direct = process.env[name];
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const reflected = Reflect.get(process.env, name);
  if (typeof reflected === "string" && reflected.trim()) return reflected.trim();
  return undefined;
}
