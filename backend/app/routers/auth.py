from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.auth.jwt_handler import create_access_token

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    if body.email == "demo@autosense.com" and body.password == "demo123":
        token = create_access_token({"sub": body.email, "name": "Demo User"})
        return TokenResponse(accessToken=token)
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
    )


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest):
    token = create_access_token({"sub": body.email, "name": body.name})
    return TokenResponse(accessToken=token)
