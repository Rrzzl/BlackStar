export const COVER_BACKGROUNDS = [
  "Former Soldier",
  "Disgraced Theologian",
  "Physician of the Verge",
  "Lapsed Aristocrat",
  "Born in the Orphan Worlds",
  "No Record",
] as const;

export type CoverBackground = (typeof COVER_BACKGROUNDS)[number];

export interface WitnessProfile {
  chosenName: string;
  coverBackground: CoverBackground;
  appearanceId: string;
}
