export interface MainCategory {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  name: string;
  status: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  name: string;
  status: string;
  mainCategory?: MainCategory;
}
