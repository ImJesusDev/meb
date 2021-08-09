import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';

/*
 *   Interface that describes the properties
 *   that are required to create a new Component
 */
export interface ComponentAttrs {
  name: string;
  resourceType: string;
  componentBrand: string;
  componentModel: string;
  regularCondition: {
    disables: boolean;
    ticket: boolean;
  };
  badCondition: {
    disables: boolean;
    ticket: boolean;
  };
}

/*
 *   Interface that describes the properties
 *   that a Component Document has
 */
export interface ComponentDoc extends mongoose.Document {
  name: string;
  resourceType: string;
  componentBrand: string;
  componentModel: string;
  regularCondition: {
    disables: boolean;
    ticket: boolean;
  };
  badCondition: {
    disables: boolean;
    ticket: boolean;
  };
}

/*
 *   Interface that describes the properties
 *   that a Component Model has
 */
interface ComponentModel extends mongoose.Model<ComponentDoc> {
  build(attrs: ComponentAttrs): ComponentDoc;
}

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
    componentModel: {
      type: String,
      required: true,
    },
    componentBrand: {
      type: String,
      required: true,
    },
    regularCondition: {
      disables: {
        type: Boolean,
      },
      ticket: {
        type: Boolean,
      },
    },
    badCondition: {
      disables: {
        type: Boolean,
      },
      ticket: {
        type: Boolean,
      },
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

componentSchema.set('versionKey', 'version');
componentSchema.plugin(updateIfCurrentPlugin);
componentSchema.statics.build = (attrs: ComponentAttrs) => {
  return new Component(attrs);
};

const Component = mongoose.model<ComponentDoc, ComponentModel>(
  'Component',
  componentSchema
);

export { Component };
