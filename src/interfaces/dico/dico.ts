export enum WordType {
  noun = "noun",
  verb = "verb",
  adjective = "adjective",
  adverb = "adverb",
  preposition = "preposition",
  pronoun = "pronoun",
  suffix = "suffix",
  other = "other",
}

export type IDico = {
  id?: number;
  uuid?: string;
  sourceLanguage: "FR" | "AR";
  targetLanguage: "FR" | "AR";
  wordType: WordType;
  createdAt?: Date;
  sourceWord: string;
  translationWord: string;
  normalizedWord: string;

  // 🔹 Ajout de la relation
  userId: number; // FK vers User.id
};

export type ICreateDico = {
  sourceLanguage: "FR" | "AR";
  targetLanguage: "FR" | "AR";
  wordType: WordType;
  createdAt?: Date;
  sourceWord: string;
  translationWord: string;
  normalizedWord?: string;

  // 🔹 Ajout de la relation
  userId: number; // FK vers User.id
};

export type IUpdateDico = Partial<ICreateDico>;
