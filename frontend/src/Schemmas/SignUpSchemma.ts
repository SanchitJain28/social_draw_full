import { z } from "zod";

export const SignUpSchemma = z.object({
    name:
        z.string()
            .min(5, {
                message: "Username must be greater than 5 letters"
            })
            .max(40, {
                message: "Username must be less than 40 chracters"
            }),
    email:
        z.string()
            .nonempty({
                message:"email cannot be empty"
            })
            .email()
    ,
    password: z.string().nonempty({
        message: "Password cannot be empty"
    }).min(8,{message:"Password must be 8 chracters or more"}),
    PhoneNo: z.string().nonempty({
        message: "Phone number cannot be empty"
    }),
    files: z.any().optional()
});