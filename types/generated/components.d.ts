import type { Struct, Schema } from '@strapi/strapi';

export interface FishbowlFishbowl extends Struct.ComponentSchema {
  collectionName: 'components_fishbowl_fishbowls';
  info: {
    displayName: 'Fishbowl';
    description: '';
  };
  attributes: {
    productId: Schema.Attribute.Integer;
    partId: Schema.Attribute.Integer;
    num: Schema.Attribute.String;
    sizeUomId: Schema.Attribute.Integer;
    uomId: Schema.Attribute.Integer;
    weightUomId: Schema.Attribute.Integer;
    categories: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'fishbowl.fishbowl': FishbowlFishbowl;
    }
  }
}
