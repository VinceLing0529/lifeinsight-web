from timezonefinder import TimezoneFinder
import pytz
from datetime import datetime
from typing import Dict, Any

def get_timezone_from_coordinates(longitude: float, latitude: float) -> Dict[str, Any]:
    """
    根据经纬度获取时区信息
    
    Args:
        longitude: 经度
        latitude: 纬度
        
    Returns:
        Dict containing timezone name and UTC offset
    """
    try:
        tf = TimezoneFinder()
        timezone_str = tf.timezone_at(lat=latitude, lng=longitude)
        
        if timezone_str is None:
            # 如果无法确定时区，根据经度估算（更精确的计算）
            # 经度每15度对应1小时时差
            utc_offset = round(longitude / 15)
            # 限制在合理范围内 (-12 到 +14)
            utc_offset = max(-12, min(14, utc_offset))
            timezone_str = f"UTC{utc_offset:+d}"
            
            return {
                "timezone": timezone_str,
                "utc_offset": utc_offset,
                "estimated": True
            }
        
        # 获取当前时间的UTC偏移
        tz = pytz.timezone(timezone_str)
        now = datetime.now(tz)
        utc_offset = int(now.utcoffset().total_seconds() / 3600)
        
        return {
            "timezone": timezone_str,
            "utc_offset": utc_offset,
            "estimated": False
        }
        
    except Exception as e:
        # fallback: 根据经度估算时区（更精确的计算）
        utc_offset = round(longitude / 15)
        utc_offset = max(-12, min(14, utc_offset))
        return {
            "timezone": f"UTC{utc_offset:+d}",
            "utc_offset": utc_offset,
            "estimated": True,
            "error": str(e)
        }

def format_timezone_offset(utc_offset: int) -> str:
    """
    将UTC偏移格式化为字符串
    
    Args:
        utc_offset: UTC偏移小时数
        
    Returns:
        格式化的时区字符串，如："+8", "-5"
    """
    return f"{utc_offset:+d}"

def get_location_info(longitude: float, latitude: float) -> Dict[str, Any]:
    """
    获取地理位置的详细信息
    
    Args:
        longitude: 经度
        latitude: 纬度
        
    Returns:
        包含时区和地理信息的字典
    """
    timezone_info = get_timezone_from_coordinates(longitude, latitude)
    
    # 简单的地理区域判断
    region = "未知地区"
    if 70 <= longitude <= 140 and 10 <= latitude <= 55:
        region = "亚洲"
    elif -180 <= longitude <= -50 and 10 <= latitude <= 80:
        region = "北美洲"
    elif -20 <= longitude <= 60 and 35 <= latitude <= 70:
        region = "欧洲"
    elif 110 <= longitude <= 180 and -50 <= latitude <= -10:
        region = "大洋洲"
    elif -80 <= longitude <= -35 and -60 <= latitude <= 15:
        region = "南美洲"
    elif -20 <= longitude <= 55 and -35 <= latitude <= 40:
        region = "非洲"
    
    return {
        **timezone_info,
        "region": region,
        "coordinates": {
            "longitude": longitude,
            "latitude": latitude
        }
    } 