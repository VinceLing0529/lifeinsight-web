from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/manage-admin", tags=["manage-admin"])

ADMIN_USER = "729270660"
ADMIN_PASS = "Lingw123"

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    if data.username == ADMIN_USER and data.password == ADMIN_PASS:
        return {"success": True}
    raise HTTPException(status_code=401, detail="账号或密码错误") 