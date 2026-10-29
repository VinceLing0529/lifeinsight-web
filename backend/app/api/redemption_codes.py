import redis
import json
import uuid
import time
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/redemption-codes", tags=["redemption-codes"])

# Redis连接配置
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

class CodeRequest(BaseModel):
    code: str

class CodeResponse(BaseModel):
    code: str
    is_valid: bool
    used_at: Optional[str] = None
    created_at: Optional[str] = None

class GenerateCodeRequest(BaseModel):
    quantity: int = 1
    expires_in_days: int = 30

class CodeInfo(BaseModel):
    code: str
    is_used: bool
    created_at: str
    used_at: Optional[str] = None
    expires_at: str

# 生成兑换码
def generate_code() -> str:
    """生成唯一的兑换码"""
    return f"LIFE{uuid.uuid4().hex[:8].upper()}"

# 验证兑换码
@router.post("/verify", response_model=CodeResponse)
async def verify_code(request: CodeRequest):
    """验证兑换码是否有效"""
    try:
        code = request.code.upper().strip()
        
        # 从Redis获取兑换码信息
        code_key = f"redemption_code:{code}"
        code_data = redis_client.get(code_key)
        
        if not code_data:
            raise HTTPException(status_code=404, detail="兑换码不存在")
        
        code_info = json.loads(code_data)
        
        # 检查是否已过期
        expires_at = datetime.fromisoformat(code_info['expires_at'])
        if datetime.now() > expires_at:
            raise HTTPException(status_code=400, detail="兑换码已过期")
        
        # 检查是否已使用
        if code_info['is_used']:
            raise HTTPException(status_code=400, detail="兑换码已被使用")
        
        # 标记为已使用
        code_info['is_used'] = True
        code_info['used_at'] = datetime.now().isoformat()
        redis_client.setex(code_key, 86400 * 30, json.dumps(code_info))  # 30天过期
        
        return CodeResponse(
            code=code,
            is_valid=True,
            used_at=code_info['used_at'],
            created_at=code_info['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"验证兑换码错误: {e}")
        raise HTTPException(status_code=500, detail="验证失败")

# 生成新兑换码
@router.post("/generate")
async def generate_codes(request: GenerateCodeRequest):
    """生成新的兑换码"""
    try:
        codes = []
        expires_at = datetime.now() + timedelta(days=request.expires_in_days)
        
        for _ in range(request.quantity):
            code = generate_code()
            code_info = {
                'code': code,
                'is_used': False,
                'created_at': datetime.now().isoformat(),
                'expires_at': expires_at.isoformat()
            }
            
            # 存储到Redis
            code_key = f"redemption_code:{code}"
            redis_client.setex(code_key, 86400 * request.expires_in_days, json.dumps(code_info))
            
            codes.append(code)
        
        return {
            "success": True,
            "codes": codes,
            "quantity": request.quantity,
            "expires_at": expires_at.isoformat()
        }
        
    except Exception as e:
        print(f"生成兑换码错误: {e}")
        raise HTTPException(status_code=500, detail="生成失败")

# 获取兑换码列表
@router.get("/list", response_model=List[CodeInfo])
async def list_codes():
    """获取所有兑换码列表"""
    try:
        codes = []
        pattern = "redemption_code:*"
        
        for key in redis_client.scan_iter(match=pattern):
            code_data = redis_client.get(key)
            if code_data:
                code_info = json.loads(code_data)
                codes.append(CodeInfo(**code_info))
        
        # 按创建时间排序
        codes.sort(key=lambda x: x.created_at, reverse=True)
        return codes
        
    except Exception as e:
        print(f"获取兑换码列表错误: {e}")
        raise HTTPException(status_code=500, detail="获取失败")

# 删除兑换码
@router.delete("/{code}")
async def delete_code(code: str):
    """删除指定兑换码"""
    try:
        code = code.upper().strip()
        code_key = f"redemption_code:{code}"
        
        if not redis_client.exists(code_key):
            raise HTTPException(status_code=404, detail="兑换码不存在")
        
        redis_client.delete(code_key)
        return {"success": True, "message": "兑换码已删除"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"删除兑换码错误: {e}")
        raise HTTPException(status_code=500, detail="删除失败")

# 获取兑换码统计信息
@router.get("/stats")
async def get_stats():
    """获取兑换码统计信息"""
    try:
        pattern = "redemption_code:*"
        total_codes = 0
        used_codes = 0
        valid_codes = 0
        
        for key in redis_client.scan_iter(match=pattern):
            total_codes += 1
            code_data = redis_client.get(key)
            if code_data:
                code_info = json.loads(code_data)
                if code_info['is_used']:
                    used_codes += 1
                else:
                    # 检查是否过期
                    expires_at = datetime.fromisoformat(code_info['expires_at'])
                    if datetime.now() <= expires_at:
                        valid_codes += 1
        
        return {
            "total_codes": total_codes,
            "used_codes": used_codes,
            "valid_codes": valid_codes,
            "usage_rate": round(used_codes / total_codes * 100, 2) if total_codes > 0 else 0
        }
        
    except Exception as e:
        print(f"获取统计信息错误: {e}")
        raise HTTPException(status_code=500, detail="获取失败") 