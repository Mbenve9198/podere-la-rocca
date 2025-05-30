export interface ITranslation {
  it: string
  en: string
}

export interface ICategory {
  _id?: string
  name: string
  translations: ITranslation
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface IProductTranslation extends ITranslation {
  description?: {
    it?: string
    en?: string
  }
}

export interface IProduct {
  _id?: string
  name: string
  price: number
  category: string
  subcategory?: string
  description?: string
  image?: string
  available: boolean
  pickup_required: boolean
  translations: IProductTranslation
  createdAt?: string
  updatedAt?: string
}

