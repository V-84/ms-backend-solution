import Joi from 'joi';

export function validateSpec(schema: Joi.ObjectSchema, data: unknown) {
      const { error, value } = schema.validate(data, {
        allowUnknown: true,
        stripUnknown: true,
        errors: {
          wrap: {
            label: '',
          },
        },
      });
      if(error) {
        throw new Error(`Validation error: ${error.message}`);
      }
      return value;
  }
