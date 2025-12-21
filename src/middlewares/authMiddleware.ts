import { z } from "zod";

//basic checks, can be more extensive if required
export const partnerSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  
  formId: z.string("Invalid form ID format"),
  responses: z.array(
    z.object({
      fieldId: z.string("Invalid field ID format"), 
      value: z.string().optional(), 
      optionId: z.string("Invalid option ID format").optional(), 
    })
  ),
});