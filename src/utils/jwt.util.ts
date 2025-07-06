import jsonwebtoken from "jsonwebtoken";

const jwtSecretKey =process.env.JWT_SECRET_KEY;

export async function generateToken(id:string, email:string, role:string) {
    
    if( !jwtSecretKey || typeof jwtSecretKey !== "string"){
    throw new Error("jwt is not defined or not string");
    }
    const token = jsonwebtoken.sign(
        {id: id, email: email, role: role}, //id email and role -> payload as object
        jwtSecretKey,                       //secretOrPrivateKey -> string
        {expiresIn: '30h'},                 //options?: SignOptions -> expiresIn
    ) 
    return token;
}