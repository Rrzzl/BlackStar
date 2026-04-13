export class Stockpile {
  quantity: number;
  private readonly maxMult = 5;

  constructor(
    readonly goodId: string,
    readonly equilibrium: number,
    initial: number = equilibrium,
  ) {
    this.quantity = Math.max(0, Math.min(initial, equilibrium * this.maxMult));
  }

  ratio(): number {
    return this.quantity / this.equilibrium;
  }

  produce(n: number): void {
    this.add(n);
  }

  consume(n: number): void {
    this.remove(n);
  }

  add(n: number): number {
    const before = this.quantity;
    this.quantity = Math.min(this.equilibrium * this.maxMult, this.quantity + n);
    return this.quantity - before;
  }

  remove(n: number): number {
    const before = this.quantity;
    this.quantity = Math.max(0, this.quantity - n);
    return before - this.quantity;
  }
}
