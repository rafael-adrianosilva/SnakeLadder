/** Tipos de customização de personagem (seção 11 do prompt mestre). */

export type PieceShape = 'circle' | 'star' | 'diamond' | 'square' | 'hexagon';
export type BodyBaseId = 'human_m' | 'human_f' | 'robot' | 'alien' | 'ghost' | 'cat' | 'dog';
export type HairId = 'short' | 'long' | 'curly' | 'mohawk' | 'bald' | 'ponytail';
export type EyesId = 'normal' | 'happy' | 'cool' | 'angry' | 'star' | 'heart';
export type MouthId = 'smile' | 'grin' | 'surprised' | 'serious' | 'tongue';
export type AccessoryId = 'tophat' | 'cap' | 'crown' | 'glasses' | 'monocle' | 'flower';
export type OutfitId = 'tshirt' | 'suit' | 'astronaut' | 'ninja' | 'wizard';
export type FrameEffect = 'none' | 'glow' | 'fire' | 'ice' | 'lightning' | 'rainbow';

export interface AvatarConfig {
  pieceShape: PieceShape;
  backgroundColor: string;
  bodyBase: BodyBaseId;
  bodyColor: string;
  outfit: OutfitId | null;
  hair: HairId | null;
  hairColor: string;
  eyes: EyesId;
  mouth: MouthId;
  accessory: AccessoryId | null;
  frameEffect: FrameEffect;
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type UnlockType = 'free' | 'coins' | 'achievement' | 'level';

export interface AvatarItem {
  id: string;
  category: 'body' | 'hair' | 'eyes' | 'mouth' | 'outfit' | 'accessory' | 'frame' | 'shape';
  name: string;
  previewAsset: string;
  svgAsset: string;
  unlockType: UnlockType;
  cost?: number;
  achievementId?: string;
  requiredLevel?: number;
  rarity: Rarity;
}

/** Avatar padrão atribuído a novas contas. */
export const DEFAULT_AVATAR: AvatarConfig = {
  pieceShape: 'circle',
  backgroundColor: '#6C3FF5',
  bodyBase: 'human_m',
  bodyColor: '#F1C27D',
  outfit: 'tshirt',
  hair: 'short',
  hairColor: '#2C1B18',
  eyes: 'normal',
  mouth: 'smile',
  accessory: null,
  frameEffect: 'none',
};
