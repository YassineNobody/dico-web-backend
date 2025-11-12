export type ILearn = {
  id?: string;
  title: string;
  slug?: string;
  urlPdf: string;
  categoryId: number;
  contentMarkdown?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ICreateLean = {
  title: string;
  urlPdf: string;
  categoryId: number;
  contentMarkdown?: string;
};

export type IUpdateLearn = Partial<ICreateLean>;
