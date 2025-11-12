export type ILearnCategory = {
  id?: string;
  uuid?: string;
  slug?: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ICreateLearnCategory = {
  name: string;
  description?: string;
  slug?: string;
};

export type IUpdateLearnCategory = Partial<ICreateLearnCategory>;
