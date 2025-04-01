import { z } from "zod";

export const SignInSchemma = z.object({
    email:
        z.string()
            .nonempty({
                message:"email cannot be empty"
            })
            .email()
    ,
    password: z.string().nonempty({
        message: "Password cannot be empty"
    }),
});