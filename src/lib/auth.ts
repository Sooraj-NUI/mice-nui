import { SignJWT, jwtVerify } from "jose";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function createToken(userId: number) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));

  return token;
}

export async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

  return payload;
}

export async function getUserId(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new AuthError("Authorization header is required");
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AuthError("Invalid authorization header");
  }

  const payload = await verifyToken(token);

  if (typeof payload.userId !== "number") {
    throw new AuthError("Invalid token payload");
  }

  return payload.userId;
}
