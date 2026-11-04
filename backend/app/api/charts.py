from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, Optional
from datetime import datetime, date
import sys
import os

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from triple_chart_parser import TripleChartParser
from core.timezone_utils import get_timezone_from_coordinates, format_timezone_offset

router = APIRouter()

class BirthInfoRequest(BaseModel):
    birth_date: str = Field(..., description="出生日期，格式：YYYY-MM-DD")
    birth_time: str = Field(..., description="出生时间，格式：HH:MM")
    longitude: float = Field(..., ge=-180, le=180, description="经度（-180~180）")
    latitude: float = Field(..., ge=-90, le=90, description="纬度（-90~90）")
    gender: int = Field(..., ge=0, le=1, description="性别，1=男，0=女")
    location_name: Optional[str] = Field("", description="地点名称")
    daylight_saving: Optional[bool] = Field(False, description="是否使用夏令时")

    @field_validator("birth_date")
    @classmethod
    def _check_birth_date(cls, v: str) -> str:
        try:
            d = datetime.strptime(v, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("出生日期格式错误，应为 YYYY-MM-DD")
        if d > date.today():
            raise ValueError("出生日期不能晚于今天")
        if d < date(1900, 1, 1):
            raise ValueError("出生日期不能早于 1900-01-01")
        return v

    @field_validator("birth_time")
    @classmethod
    def _check_birth_time(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%H:%M")
        except ValueError:
            raise ValueError("出生时间格式错误，应为 HH:MM")
        return v


def _birth_moment(request: BirthInfoRequest) -> Optional[datetime]:
    """出生时刻（naive 本地时间），供按出生日期计算时区偏移；解析失败返回 None，
    后续解析器会给出格式错误，这里不抢先抛错。"""
    try:
        return datetime.strptime(f"{request.birth_date} {request.birth_time}", "%Y-%m-%d %H:%M")
    except ValueError:
        return None

@router.post("/calculate")
async def calculate_charts(request: BirthInfoRequest):
    """
    计算三种命盘（八字、紫微斗数、印度星盘）
    
    Args:
        request: 出生信息请求
        
    Returns:
        包含三种命盘结果的字典
    """
    try:
        # 自动获取时区信息
        timezone_info = get_timezone_from_coordinates(request.longitude, request.latitude, at=_birth_moment(request))
        timezone_offset = format_timezone_offset(timezone_info["utc_offset"])
        
        # 创建三盘解析器
        parser = TripleChartParser()
        
        # 解析输入参数
        input_data = parser.parse_input(
            birth_date=request.birth_date,
            birth_time=request.birth_time,
            timezone=timezone_offset,
            longitude=request.longitude,
            latitude=request.latitude,
            gender=request.gender,
            daylight_saving=request.daylight_saving
        )
        
        # 计算各种命盘
        bazi_result = parser.calculate_bazi(input_data)
        ziwei_result = parser.calculate_ziwei(input_data)
        vedic_result = parser.calculate_vedic(input_data)
        
        # 生成最终输出
        output = parser.generate_output(input_data, bazi_result, ziwei_result, vedic_result)
        
        # 添加额外信息
        output["timezone_info"] = timezone_info
        output["input"]["location_name"] = request.location_name
        
        return {
            "success": True,
            "data": output,
            "message": "命盘计算成功"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"命盘计算失败: {str(e)}"
        )

@router.post("/bazi-only")
async def calculate_bazi_only(request: BirthInfoRequest):
    """
    仅计算八字命盘
    """
    try:
        timezone_info = get_timezone_from_coordinates(request.longitude, request.latitude, at=_birth_moment(request))
        timezone_offset = format_timezone_offset(timezone_info["utc_offset"])
        
        parser = TripleChartParser()
        input_data = parser.parse_input(
            birth_date=request.birth_date,
            birth_time=request.birth_time,
            timezone=timezone_offset,
            longitude=request.longitude,
            latitude=request.latitude,
            gender=request.gender,
            daylight_saving=request.daylight_saving
        )
        
        bazi_result = parser.calculate_bazi(input_data)
        
        return {
            "success": True,
            "data": {
                "input": input_data,
                "bazi": bazi_result,
                "timezone_info": timezone_info
            },
            "message": "八字计算成功"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"八字计算失败: {str(e)}"
        )

@router.post("/ziwei-only")
async def calculate_ziwei_only(request: BirthInfoRequest):
    """
    仅计算紫微斗数命盘
    """
    try:
        timezone_info = get_timezone_from_coordinates(request.longitude, request.latitude, at=_birth_moment(request))
        timezone_offset = format_timezone_offset(timezone_info["utc_offset"])
        
        parser = TripleChartParser()
        input_data = parser.parse_input(
            birth_date=request.birth_date,
            birth_time=request.birth_time,
            timezone=timezone_offset,
            longitude=request.longitude,
            latitude=request.latitude,
            gender=request.gender,
            daylight_saving=request.daylight_saving
        )
        
        ziwei_result = parser.calculate_ziwei(input_data)
        
        return {
            "success": True,
            "data": {
                "input": input_data,
                "ziwei": ziwei_result,
                "timezone_info": timezone_info
            },
            "message": "紫微斗数计算成功"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"紫微斗数计算失败: {str(e)}"
        )

@router.post("/vedic-only")
async def calculate_vedic_only(request: BirthInfoRequest):
    """
    仅计算印度星盘
    """
    try:
        timezone_info = get_timezone_from_coordinates(request.longitude, request.latitude, at=_birth_moment(request))
        timezone_offset = format_timezone_offset(timezone_info["utc_offset"])
        
        parser = TripleChartParser()
        input_data = parser.parse_input(
            birth_date=request.birth_date,
            birth_time=request.birth_time,
            timezone=timezone_offset,
            longitude=request.longitude,
            latitude=request.latitude,
            gender=request.gender,
            daylight_saving=request.daylight_saving
        )
        
        vedic_result = parser.calculate_vedic(input_data)
        
        return {
            "success": True,
            "data": {
                "input": input_data,
                "vedic": vedic_result,
                "timezone_info": timezone_info
            },
            "message": "印度星盘计算成功"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"印度星盘计算失败: {str(e)}"
        ) 