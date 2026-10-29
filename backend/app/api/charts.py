from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
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
    longitude: float = Field(..., description="经度")
    latitude: float = Field(..., description="纬度")
    gender: int = Field(..., description="性别，1=男，0=女")
    location_name: Optional[str] = Field("", description="地点名称")
    daylight_saving: Optional[bool] = Field(False, description="是否使用夏令时")

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
        timezone_info = get_timezone_from_coordinates(request.longitude, request.latitude)
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

@router.get("/test")
async def test_charts():
    """
    测试命盘计算功能
    """
    try:
        # 使用固定测试数据
        test_request = BirthInfoRequest(
            birth_date="2000-01-01",
            birth_time="00:00",
            longitude=116.4,
            latitude=39.9,
            gender=1,
            location_name="北京",
            daylight_saving=False
        )
        
        result = await calculate_charts(test_request)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"测试失败: {str(e)}"
        )

@router.post("/bazi-only")
async def calculate_bazi_only(request: BirthInfoRequest):
    """
    仅计算八字命盘
    """
    try:
        timezone_info = get_timezone_from_coordinates(request.longitude, request.latitude)
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
        timezone_info = get_timezone_from_coordinates(request.longitude, request.latitude)
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
        timezone_info = get_timezone_from_coordinates(request.longitude, request.latitude)
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