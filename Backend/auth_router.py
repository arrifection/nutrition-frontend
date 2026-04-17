from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from datetime import datetime
from database import users_collection, user_helper
from auth_utils import get_password_hash, verify_password, create_access_token, decode_access_token
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "client" # Default to client, can be "dietitian"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    email: str
    role: str

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user_helper(user)

@router.post("/register", response_model=dict)
async def register(user_data: UserRegister):
    try:
        # Normalize email
        user_data.email = user_data.email.lower()
        
        # Check if user exists
        existing_user = await users_collection.find_one({
            "$or": [{"email": user_data.email}, {"username": user_data.username}]
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        hashed_password = get_password_hash(user_data.password)
        new_user = {
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_password,
            "role": user_data.role,
            "createdAt": datetime.utcnow()
        }
        
        result = await users_collection.insert_one(new_user)
        if result.inserted_id:
            print(f"SUCCESS: User {user_data.email} registered")
            return {"message": "User registered successfully"}
        raise HTTPException(status_code=500, detail="Failed to register user record")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"ERROR in register: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {type(e).__name__} - {str(e)}")

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    try:
        # Normalize email
        user_data.email = user_data.email.lower()
        
        user = await users_collection.find_one({"email": user_data.email})
        if not user:
            print(f"LOGIN FAIL: User not found - {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not verify_password(user_data.password, user["password"]):
            print(f"LOGIN FAIL: Password mismatch for {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"LOGIN SUCCESS: {user_data.email}")
        access_token = create_access_token(data={"sub": user["email"]})
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "username": user["username"],
            "email": user["email"],
            "role": user.get("role", "client")
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"ERROR in login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {type(e).__name__} - {str(e)}")

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
