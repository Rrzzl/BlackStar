export type Species = 'human' | 'drellan' | 'ksar' | 'vex';
export type Class = 'gunslinger';

export interface CaptainState {
  name: string;
  species: Species;
  klass: Class;
  paint: string;
  createdAt: number;
  deaths: number;
}
