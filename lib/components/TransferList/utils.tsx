export type BaseItem = {
  id: string;
  name: string;
};

export function divideByIds<T extends { id: string }>(data: T[], ids: string[] = []): [T[], T[]] {
  return [data.filter(i => !ids.includes(i.id)), data.filter(i => ids.includes(i.id))];
}
