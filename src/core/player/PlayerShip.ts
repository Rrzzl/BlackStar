export interface PlayerShipState {
  hullId: string;
  moduleIds: string[];
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  angle: number;
  hp: number;
  shield: number;
  credits: number;
  cargo: Array<{ goodId: string; qty: number }>;
}
