import Joi from '@hapi/joi';

export const registerSchema = Joi.object({
  user_name: Joi.string().required(),
  user_fullname: Joi.string().required(),
  user_email: Joi.string().email().lowercase().required(),
  user_password: Joi.string().min(2).required(),
  user_mobile: Joi.string().length(10),
  user_role: Joi.string().required(),
  user_status: Joi.boolean().required(),
});

export const loginSchema = Joi.object({
  financial_year: Joi.number().positive().required(),
  user_name: Joi.string().required(),
  user_password: Joi.string().min(2).required(),
});
