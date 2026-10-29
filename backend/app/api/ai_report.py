from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import json
import os
import uuid
import requests
import aiohttp
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
import re

router = APIRouter()

# 配置Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# 配置DeepSeek API
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

# 配置存储目录
REPORTS_DIR = Path("data/reports")
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# 导入prompt管理功能
from .prompt_admin import load_prompt_template

class AIReportRequest(BaseModel):
    user_data: Dict[str, Any]  # 包含input, bazi, ziwei, vedic的完整用户数据
    order_id: str = None

class AIReportResponse(BaseModel):
    order_id: str
    sections: List[Dict[str, Any]]
    generated_at: str

def get_next_12_months():
    """获取从下个月开始的12个月份列表"""
    current_date = datetime.now()
    next_month = current_date.replace(day=1) + timedelta(days=32)
    next_month = next_month.replace(day=1)  # 确保是下个月的第一天
    
    months = []
    for i in range(12):
        month_date = next_month.replace(month=next_month.month + i if next_month.month + i <= 12 else next_month.month + i - 12)
        if next_month.month + i > 12:
            month_date = month_date.replace(year=next_month.year + 1)
        months.append(f"{month_date.year}年{month_date.month}月")
    
    return months, current_date.strftime("%Y年%m月")

def generate_order_id():
    """生成订单号"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"AI{timestamp}{unique_id}"

def save_report_to_storage(order_id: str, report_data: dict, user_data: dict):
    """将报告保存到存储"""
    try:
        report_file = REPORTS_DIR / f"{order_id}.json"
        storage_data = {
            "order_id": order_id,
            "user_data": user_data,
            "report_data": report_data,
            "created_at": datetime.now().isoformat(),
            "status": "completed"
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(storage_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 报告已保存: {report_file}")
        return True
    except Exception as e:
        print(f"❌ 保存报告失败: {str(e)}")
        return False

def load_report_from_storage(order_id: str):
    """从存储中加载报告"""
    try:
        report_file = REPORTS_DIR / f"{order_id}.json"
        if not report_file.exists():
            return None
        
        with open(report_file, 'r', encoding='utf-8') as f:
            storage_data = json.load(f)
        
        return storage_data
    except Exception as e:
        print(f"❌ 加载报告失败: {str(e)}")
        return None

def list_all_reports():
    """列出所有报告"""
    try:
        reports = []
        for report_file in REPORTS_DIR.glob("*.json"):
            try:
                with open(report_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                reports.append({
                    "order_id": data.get("order_id"),
                    "created_at": data.get("created_at"),
                    "status": data.get("status", "completed")
                })
            except Exception as e:
                print(f"跳过损坏的文件 {report_file}: {str(e)}")
        
        return sorted(reports, key=lambda x: x["created_at"], reverse=True)
    except Exception as e:
        print(f"❌ 列出报告失败: {str(e)}")
        return []

# def call_gemini_api(prompt_text, max_retries=3):
#     """直接调用Gemini API，支持重试机制 - 已弃用，请使用 call_deepseek_api"""
#     # 该函数已被 call_deepseek_api 替代
#     return call_deepseek_api(prompt_text, max_retries)

async def call_deepseek_api(prompt_text, max_retries=3, model="deepseek-chat", temperature=0.7):
    """异步调用DeepSeek API，支持重试机制"""
    if not DEEPSEEK_API_KEY:
        raise Exception("DeepSeek API Key未配置，请设置DEEPSEEK_API_KEY环境变量")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
    }
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": "你是一位专业的命理分析师，精通八字、紫微斗数、印度星盘等多种命理体系。请根据用户提供的命理信息，给出专业、详细、准确的分析。"},
            {"role": "user", "content": prompt_text}
        ],
        "temperature": temperature,
        "stream": False
    }
    
    for attempt in range(max_retries):
        try:
            timeout = aiohttp.ClientTimeout(total=180)  # 3分钟超时
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(DEEPSEEK_API_URL, headers=headers, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        if 'choices' in result and len(result['choices']) > 0:
                            content = result['choices'][0]['message']['content']
                            return content
                        else:
                            raise Exception("API返回格式错误")
                    else:
                        error_text = await response.text()
                        raise Exception(f"API请求失败: {response.status} - {error_text}")
                        
        except asyncio.TimeoutError:
            print(f"DeepSeek API调用超时 (尝试 {attempt + 1}/{max_retries})")
            if attempt == max_retries - 1:
                raise Exception("API调用多次超时，请检查网络连接或稍后重试")
            continue
        except Exception as e:
            print(f"DeepSeek API调用错误 (尝试 {attempt + 1}/{max_retries}): {str(e)}")
            if attempt == max_retries - 1:
                raise e
            continue

def create_analysis_prompt(user_data: Dict[str, Any]) -> str:
    """创建优劣混合分析的prompt"""
    input_data = user_data.get('input', {})
    bazi = user_data.get('bazi', {})
    ziwei = user_data.get('ziwei', {})
    vedic = user_data.get('vedic', {})
    timezone_info = user_data.get('timezone_info', {})
    
    # 八字详细信息构建
    bazi_detail = ""
    if 'enhanced_analysis' in bazi:
        enhanced = bazi['enhanced_analysis']
        
        # 清理四柱详析中的空亡字段
        clean_columns = []
        for column in enhanced.get('四柱详析', []):
            clean_column = {k: v for k, v in column.items() if k != '空亡'}
            clean_columns.append(clean_column)
        
        bazi_detail = f"""
【八字详细分析】
四柱详析：{json.dumps(clean_columns, ensure_ascii=False)}
十神统计：{json.dumps(enhanced.get('十神统计', {}), ensure_ascii=False)}
五行分布：{json.dumps(enhanced.get('五行分布', {}), ensure_ascii=False)}
纳音：{json.dumps(bazi.get('nayin', {}), ensure_ascii=False)}
"""
    
    # 紫微斗数详细信息构建
    ziwei_lunar_date = "未知"
    ziwei_chinese_date = "未知"
    ziwei_soul = "未知"
    ziwei_body = "未知"
    ziwei_five_elements_class = "未知"
    ziwei_palaces_detail = "未知"
    ziwei_lu = "未知"
    ziwei_quan = "未知"
    ziwei_ke = "未知"
    ziwei_ji = "未知"
    
    if 'basic_info' in ziwei:
        basic_info = ziwei['basic_info']
        ziwei_lunar_date = basic_info.get('lunar_date', '未知')
        ziwei_chinese_date = basic_info.get('chinese_date', '未知')
        ziwei_soul = basic_info.get('soul', '未知')
        ziwei_body = basic_info.get('body', '未知')
        ziwei_five_elements_class = basic_info.get('five_elements_class', '未知')
    
    if 'chart' in ziwei and 'palaces' in ziwei['chart']:
        palaces = ziwei['chart']['palaces']
        ziwei_palaces_detail = ""
        for palace_name, palace_data in palaces.items():
            major_stars = [star['name'] for star in palace_data.get('major_stars', [])]
            minor_stars = palace_data.get('minor_stars', [])
            ziwei_palaces_detail += f"""
{palace_name}宫：{palace_data.get('heavenly_stem', '')}{palace_data.get('earthly_branch', '')}
- 主星：{', '.join(major_stars) if major_stars else '无'}
- 辅星：{', '.join(minor_stars) if minor_stars else '无'}
- 身宫：{'是' if palace_data.get('is_body_palace') else '否'}"""
    
    # 四化信息
    if 'si_hua' in ziwei:
        si_hua = ziwei['si_hua']
        ziwei_lu = si_hua.get('禄', '未知')
        ziwei_quan = si_hua.get('权', '未知')
        ziwei_ke = si_hua.get('科', '未知')
        ziwei_ji = si_hua.get('忌', '未知')
    elif 'four_transformations' in ziwei:
        four_trans = ziwei['four_transformations']
        ziwei_lu = four_trans.get('禄', '未知')
        ziwei_quan = four_trans.get('权', '未知')
        ziwei_ke = four_trans.get('科', '未知')
        ziwei_ji = four_trans.get('忌', '未知')
    
    # 印度星盘详细信息构建
    vedic_chart_type = vedic.get('chart_type', '未知')
    vedic_ayanamsa_type = vedic.get('ayanamsa', {}).get('type', '未知')
    vedic_ayanamsa_value = vedic.get('ayanamsa', {}).get('value', '未知')
    vedic_ascendant_sign = vedic.get('ascendant', {}).get('sign', '未知')
    vedic_ascendant_lon = vedic.get('ascendant', {}).get('lon', '未知')
    
    vedic_planets_detail = ""
    if 'planets' in vedic:
        for planet_name, planet_data in vedic['planets'].items():
            vedic_planets_detail += f"""
{planet_name}：{planet_data.get('sign', '未知')}座 第{planet_data.get('house', '未知')}宫 {planet_data.get('lon', '未知')}°"""
    
    vedic_axis_points_detail = ""
    if 'axis_points' in vedic:
        for axis_name, axis_data in vedic['axis_points'].items():
            vedic_axis_points_detail += f"""
{axis_name}：{axis_data.get('sign', '未知')}座 第{axis_data.get('house', '未知')}宫 {axis_data.get('lon', '未知')}°"""
    
    # 加载prompt模板
    prompt_template = load_prompt_template("analysis")
    if not prompt_template:
        raise ValueError("无法加载analysis prompt模板")
    
    # 准备模板变量
    template_vars = {
        'gender_str': input_data.get('gender_str', '未知'),
        'birth_date': input_data.get('birth_date', ''),
        'birth_time': input_data.get('birth_time', ''),
        'true_solar_time': json.dumps(input_data.get('true_solar_time', {}), ensure_ascii=False),
        'location_name': input_data.get('location_name', '未知'),
        'longitude': input_data.get('longitude', '未知'),
        'latitude': input_data.get('latitude', '未知'),
        'timezone': timezone_info.get('timezone', '未知'),
        'bazi_year_pillar': bazi.get('year_pillar', '未知'),
        'bazi_month_pillar': bazi.get('month_pillar', '未知'),
        'bazi_day_pillar': bazi.get('day_pillar', '未知'),
        'bazi_hour_pillar': bazi.get('hour_pillar', '未知'),
        'bazi_day_master': bazi.get('day_master', '未知'),
        'bazi_body_strength': bazi.get('body_strength', '未知'),
        'bazi_five_elements': json.dumps(bazi.get('five_elements_count', {}), ensure_ascii=False),
        'bazi_ten_gods': json.dumps(bazi.get('ten_gods', {}), ensure_ascii=False),
        'bazi_enhanced_analysis': bazi_detail,
        'ziwei_lunar_date': ziwei_lunar_date,
        'ziwei_chinese_date': ziwei_chinese_date,
        'ziwei_soul': ziwei_soul,
        'ziwei_body': ziwei_body,
        'ziwei_five_elements_class': ziwei_five_elements_class,
        'ziwei_palaces_detail': ziwei_palaces_detail,
        'ziwei_lu': ziwei_lu,
        'ziwei_quan': ziwei_quan,
        'ziwei_ke': ziwei_ke,
        'ziwei_ji': ziwei_ji,
        'vedic_chart_type': vedic_chart_type,
        'vedic_ayanamsa_type': vedic_ayanamsa_type,
        'vedic_ayanamsa_value': vedic_ayanamsa_value,
        'vedic_ascendant_sign': vedic_ascendant_sign,
        'vedic_ascendant_lon': vedic_ascendant_lon,
        'vedic_planets_detail': vedic_planets_detail,
        'vedic_axis_points_detail': vedic_axis_points_detail
    }
    
    # 格式化prompt
    try:
        formatted_prompt = prompt_template["content"].format(**template_vars)
        return formatted_prompt
    except KeyError as e:
        raise ValueError(f"Prompt模板格式化失败，缺少变量: {e}")

def create_mindmap_prompt(user_data: Dict[str, Any]) -> str:
    """创建思维导图呈现的prompt"""
    input_data = user_data.get('input', {})
    bazi = user_data.get('bazi', {})
    ziwei = user_data.get('ziwei', {})
    vedic = user_data.get('vedic', {})
    timezone_info = user_data.get('timezone_info', {})
    
    # 八字详细信息构建
    bazi_detail = ""
    if 'enhanced_analysis' in bazi:
        enhanced = bazi['enhanced_analysis']
        
        # 清理四柱详析中的空亡字段
        clean_columns = []
        for column in enhanced.get('四柱详析', []):
            clean_column = {k: v for k, v in column.items() if k != '空亡'}
            clean_columns.append(clean_column)
        
        bazi_detail = f"""
【八字详细分析】
四柱详析：{json.dumps(clean_columns, ensure_ascii=False)}
十神统计：{json.dumps(enhanced.get('十神统计', {}), ensure_ascii=False)}
五行分布：{json.dumps(enhanced.get('五行分布', {}), ensure_ascii=False)}
纳音：{json.dumps(bazi.get('nayin', {}), ensure_ascii=False)}
"""
    
    # 紫微斗数详细信息构建
    ziwei_lunar_date = "未知"
    ziwei_chinese_date = "未知"
    ziwei_soul = "未知"
    ziwei_body = "未知"
    ziwei_five_elements_class = "未知"
    ziwei_palaces_detail = "未知"
    ziwei_lu = "未知"
    ziwei_quan = "未知"
    ziwei_ke = "未知"
    ziwei_ji = "未知"
    
    if 'basic_info' in ziwei:
        basic_info = ziwei['basic_info']
        ziwei_lunar_date = basic_info.get('lunar_date', '未知')
        ziwei_chinese_date = basic_info.get('chinese_date', '未知')
        ziwei_soul = basic_info.get('soul', '未知')
        ziwei_body = basic_info.get('body', '未知')
        ziwei_five_elements_class = basic_info.get('five_elements_class', '未知')
    
    if 'chart' in ziwei and 'palaces' in ziwei['chart']:
        palaces = ziwei['chart']['palaces']
        ziwei_palaces_detail = ""
        for palace_name, palace_data in palaces.items():
            major_stars = [star['name'] for star in palace_data.get('major_stars', [])]
            minor_stars = palace_data.get('minor_stars', [])
            ziwei_palaces_detail += f"""
{palace_name}宫：{palace_data.get('heavenly_stem', '')}{palace_data.get('earthly_branch', '')}
- 主星：{', '.join(major_stars) if major_stars else '无'}
- 辅星：{', '.join(minor_stars) if minor_stars else '无'}
- 身宫：{'是' if palace_data.get('is_body_palace') else '否'}"""
    
    # 四化信息
    if 'si_hua' in ziwei:
        si_hua = ziwei['si_hua']
        ziwei_lu = si_hua.get('禄', '未知')
        ziwei_quan = si_hua.get('权', '未知')
        ziwei_ke = si_hua.get('科', '未知')
        ziwei_ji = si_hua.get('忌', '未知')
    elif 'four_transformations' in ziwei:
        four_trans = ziwei['four_transformations']
        ziwei_lu = four_trans.get('禄', '未知')
        ziwei_quan = four_trans.get('权', '未知')
        ziwei_ke = four_trans.get('科', '未知')
        ziwei_ji = four_trans.get('忌', '未知')
    
    # 印度星盘详细信息构建
    vedic_chart_type = vedic.get('chart_type', '未知')
    vedic_ayanamsa_type = vedic.get('ayanamsa', {}).get('type', '未知')
    vedic_ayanamsa_value = vedic.get('ayanamsa', {}).get('value', '未知')
    vedic_ascendant_sign = vedic.get('ascendant', {}).get('sign', '未知')
    vedic_ascendant_lon = vedic.get('ascendant', {}).get('lon', '未知')
    
    vedic_planets_detail = ""
    if 'planets' in vedic:
        for planet_name, planet_data in vedic['planets'].items():
            vedic_planets_detail += f"""
{planet_name}：{planet_data.get('sign', '未知')}座 第{planet_data.get('house', '未知')}宫 {planet_data.get('lon', '未知')}°"""
    
    vedic_axis_points_detail = ""
    if 'axis_points' in vedic:
        for axis_name, axis_data in vedic['axis_points'].items():
            vedic_axis_points_detail += f"""
{axis_name}：{axis_data.get('sign', '未知')}座 第{axis_data.get('house', '未知')}宫 {axis_data.get('lon', '未知')}°"""
    
    # 加载prompt模板
    prompt_template = load_prompt_template("mindmap")
    if not prompt_template:
        raise ValueError("无法加载mindmap prompt模板")
    
    # 准备模板变量
    template_vars = {
        'gender_str': input_data.get('gender_str', '未知'),
        'birth_date': input_data.get('birth_date', ''),
        'birth_time': input_data.get('birth_time', ''),
        'true_solar_time': json.dumps(input_data.get('true_solar_time', {}), ensure_ascii=False),
        'location_name': input_data.get('location_name', '未知'),
        'longitude': input_data.get('longitude', '未知'),
        'latitude': input_data.get('latitude', '未知'),
        'timezone': timezone_info.get('timezone', '未知'),
        'bazi_year_pillar': bazi.get('year_pillar', '未知'),
        'bazi_month_pillar': bazi.get('month_pillar', '未知'),
        'bazi_day_pillar': bazi.get('day_pillar', '未知'),
        'bazi_hour_pillar': bazi.get('hour_pillar', '未知'),
        'bazi_day_master': bazi.get('day_master', '未知'),
        'bazi_body_strength': bazi.get('body_strength', '未知'),
        'bazi_five_elements': json.dumps(bazi.get('five_elements_count', {}), ensure_ascii=False),
        'bazi_ten_gods': json.dumps(bazi.get('ten_gods', {}), ensure_ascii=False),
        'bazi_enhanced_analysis': bazi_detail,
        'ziwei_lunar_date': ziwei_lunar_date,
        'ziwei_chinese_date': ziwei_chinese_date,
        'ziwei_soul': ziwei_soul,
        'ziwei_body': ziwei_body,
        'ziwei_five_elements_class': ziwei_five_elements_class,
        'ziwei_palaces_detail': ziwei_palaces_detail,
        'ziwei_lu': ziwei_lu,
        'ziwei_quan': ziwei_quan,
        'ziwei_ke': ziwei_ke,
        'ziwei_ji': ziwei_ji,
        'vedic_chart_type': vedic_chart_type,
        'vedic_ayanamsa_type': vedic_ayanamsa_type,
        'vedic_ayanamsa_value': vedic_ayanamsa_value,
        'vedic_ascendant_sign': vedic_ascendant_sign,
        'vedic_ascendant_lon': vedic_ascendant_lon,
        'vedic_planets_detail': vedic_planets_detail,
        'vedic_axis_points_detail': vedic_axis_points_detail
    }
    
    # 格式化prompt
    try:
        formatted_prompt = prompt_template["content"].format(**template_vars)
        return formatted_prompt
    except KeyError as e:
        raise ValueError(f"Prompt模板格式化失败，缺少变量: {e}")

def create_fortune_prompt(user_data: Dict[str, Any]) -> str:
    """创建运势预测报告的prompt"""
    input_data = user_data.get('input', {})
    bazi = user_data.get('bazi', {})
    ziwei = user_data.get('ziwei', {})
    vedic = user_data.get('vedic', {})
    timezone_info = user_data.get('timezone_info', {})
    
    # 获取预测月份信息
    prediction_months, current_month = get_next_12_months()
    
    # 八字详细信息构建
    bazi_detail = ""
    if 'enhanced_analysis' in bazi:
        enhanced = bazi['enhanced_analysis']
        
        # 清理四柱详析中的空亡字段
        clean_columns = []
        for column in enhanced.get('四柱详析', []):
            clean_column = {k: v for k, v in column.items() if k != '空亡'}
            clean_columns.append(clean_column)
        
        bazi_detail = f"""
【八字详细分析】
四柱详析：{json.dumps(clean_columns, ensure_ascii=False)}
十神统计：{json.dumps(enhanced.get('十神统计', {}), ensure_ascii=False)}
五行分布：{json.dumps(enhanced.get('五行分布', {}), ensure_ascii=False)}
纳音：{json.dumps(bazi.get('nayin', {}), ensure_ascii=False)}
"""
    
    # 紫微斗数详细信息构建
    ziwei_lunar_date = "未知"
    ziwei_chinese_date = "未知"
    ziwei_soul = "未知"
    ziwei_body = "未知"
    ziwei_five_elements_class = "未知"
    ziwei_palaces_detail = "未知"
    ziwei_lu = "未知"
    ziwei_quan = "未知"
    ziwei_ke = "未知"
    ziwei_ji = "未知"
    
    if 'basic_info' in ziwei:
        basic_info = ziwei['basic_info']
        ziwei_lunar_date = basic_info.get('lunar_date', '未知')
        ziwei_chinese_date = basic_info.get('chinese_date', '未知')
        ziwei_soul = basic_info.get('soul', '未知')
        ziwei_body = basic_info.get('body', '未知')
        ziwei_five_elements_class = basic_info.get('five_elements_class', '未知')
    
    if 'chart' in ziwei and 'palaces' in ziwei['chart']:
        palaces = ziwei['chart']['palaces']
        ziwei_palaces_detail = ""
        for palace_name, palace_data in palaces.items():
            major_stars = [star['name'] for star in palace_data.get('major_stars', [])]
            minor_stars = palace_data.get('minor_stars', [])
            ziwei_palaces_detail += f"""
{palace_name}宫：{palace_data.get('heavenly_stem', '')}{palace_data.get('earthly_branch', '')}
- 主星：{', '.join(major_stars) if major_stars else '无'}
- 辅星：{', '.join(minor_stars) if minor_stars else '无'}
- 身宫：{'是' if palace_data.get('is_body_palace') else '否'}"""
    
    # 四化信息
    if 'si_hua' in ziwei:
        si_hua = ziwei['si_hua']
        ziwei_lu = si_hua.get('禄', '未知')
        ziwei_quan = si_hua.get('权', '未知')
        ziwei_ke = si_hua.get('科', '未知')
        ziwei_ji = si_hua.get('忌', '未知')
    elif 'four_transformations' in ziwei:
        four_trans = ziwei['four_transformations']
        ziwei_lu = four_trans.get('禄', '未知')
        ziwei_quan = four_trans.get('权', '未知')
        ziwei_ke = four_trans.get('科', '未知')
        ziwei_ji = four_trans.get('忌', '未知')
    
    # 印度星盘详细信息构建
    vedic_chart_type = vedic.get('chart_type', '未知')
    vedic_ayanamsa_type = vedic.get('ayanamsa', {}).get('type', '未知')
    vedic_ayanamsa_value = vedic.get('ayanamsa', {}).get('value', '未知')
    vedic_ascendant_sign = vedic.get('ascendant', {}).get('sign', '未知')
    vedic_ascendant_lon = vedic.get('ascendant', {}).get('lon', '未知')
    
    vedic_planets_detail = ""
    if 'planets' in vedic:
        for planet_name, planet_data in vedic['planets'].items():
            vedic_planets_detail += f"""
{planet_name}：{planet_data.get('sign', '未知')}座 第{planet_data.get('house', '未知')}宫 {planet_data.get('lon', '未知')}°"""
    
    vedic_axis_points_detail = ""
    if 'axis_points' in vedic:
        for axis_name, axis_data in vedic['axis_points'].items():
            vedic_axis_points_detail += f"""
{axis_name}：{axis_data.get('sign', '未知')}座 第{axis_data.get('house', '未知')}宫 {axis_data.get('lon', '未知')}°"""
    
    # 加载prompt模板
    prompt_template = load_prompt_template("fortune")
    if not prompt_template:
        raise ValueError("无法加载fortune prompt模板")
    
    # 准备模板变量
    template_vars = {
        'gender_str': input_data.get('gender_str', '未知'),
        'birth_date': input_data.get('birth_date', ''),
        'birth_time': input_data.get('birth_time', ''),
        'true_solar_time': json.dumps(input_data.get('true_solar_time', {}), ensure_ascii=False),
        'location_name': input_data.get('location_name', '未知'),
        'longitude': input_data.get('longitude', '未知'),
        'latitude': input_data.get('latitude', '未知'),
        'timezone': timezone_info.get('timezone', '未知'),
        'bazi_year_pillar': bazi.get('year_pillar', '未知'),
        'bazi_month_pillar': bazi.get('month_pillar', '未知'),
        'bazi_day_pillar': bazi.get('day_pillar', '未知'),
        'bazi_hour_pillar': bazi.get('hour_pillar', '未知'),
        'bazi_day_master': bazi.get('day_master', '未知'),
        'bazi_body_strength': bazi.get('body_strength', '未知'),
        'bazi_five_elements': json.dumps(bazi.get('five_elements_count', {}), ensure_ascii=False),
        'bazi_ten_gods': json.dumps(bazi.get('ten_gods', {}), ensure_ascii=False),
        'bazi_enhanced_analysis': bazi_detail,
        'ziwei_lunar_date': ziwei_lunar_date,
        'ziwei_chinese_date': ziwei_chinese_date,
        'ziwei_soul': ziwei_soul,
        'ziwei_body': ziwei_body,
        'ziwei_five_elements_class': ziwei_five_elements_class,
        'ziwei_palaces_detail': ziwei_palaces_detail,
        'ziwei_lu': ziwei_lu,
        'ziwei_quan': ziwei_quan,
        'ziwei_ke': ziwei_ke,
        'ziwei_ji': ziwei_ji,
        'vedic_chart_type': vedic_chart_type,
        'vedic_ayanamsa_type': vedic_ayanamsa_type,
        'vedic_ayanamsa_value': vedic_ayanamsa_value,
        'vedic_ascendant_sign': vedic_ascendant_sign,
        'vedic_ascendant_lon': vedic_ascendant_lon,
        'vedic_planets_detail': vedic_planets_detail,
        'vedic_axis_points_detail': vedic_axis_points_detail,
        'current_month': current_month,
        'prediction_start': prediction_months[0] if prediction_months else "未知",
        'prediction_end': prediction_months[-1] if prediction_months else "未知"
    }
    
    # 添加预测月份变量
    for i, month in enumerate(prediction_months):
        template_vars[f'prediction_month_{i}'] = month
    
    # 格式化prompt
    try:
        formatted_prompt = prompt_template["content"].format(**template_vars)
        return formatted_prompt
    except KeyError as e:
        raise ValueError(f"Prompt模板格式化失败，缺少变量: {e}")

def create_qa_prompt(user_data: Dict[str, Any]) -> str:
    """创建个性化建议的prompt"""
    input_data = user_data.get('input', {})
    bazi = user_data.get('bazi', {})
    ziwei = user_data.get('ziwei', {})
    vedic = user_data.get('vedic', {})
    timezone_info = user_data.get('timezone_info', {})
    
    # 八字详细信息构建
    bazi_detail = ""
    if 'enhanced_analysis' in bazi:
        enhanced = bazi['enhanced_analysis']
        
        # 清理四柱详析中的空亡字段
        clean_columns = []
        for column in enhanced.get('四柱详析', []):
            clean_column = {k: v for k, v in column.items() if k != '空亡'}
            clean_columns.append(clean_column)
        
        bazi_detail = f"""
【八字详细分析】
四柱详析：{json.dumps(clean_columns, ensure_ascii=False)}
十神统计：{json.dumps(enhanced.get('十神统计', {}), ensure_ascii=False)}
五行分布：{json.dumps(enhanced.get('五行分布', {}), ensure_ascii=False)}
纳音：{json.dumps(bazi.get('nayin', {}), ensure_ascii=False)}
"""
    
    # 紫微斗数详细信息构建
    ziwei_lunar_date = "未知"
    ziwei_chinese_date = "未知"
    ziwei_soul = "未知"
    ziwei_body = "未知"
    ziwei_five_elements_class = "未知"
    ziwei_palaces_detail = "未知"
    ziwei_lu = "未知"
    ziwei_quan = "未知"
    ziwei_ke = "未知"
    ziwei_ji = "未知"
    
    if 'basic_info' in ziwei:
        basic_info = ziwei['basic_info']
        ziwei_lunar_date = basic_info.get('lunar_date', '未知')
        ziwei_chinese_date = basic_info.get('chinese_date', '未知')
        ziwei_soul = basic_info.get('soul', '未知')
        ziwei_body = basic_info.get('body', '未知')
        ziwei_five_elements_class = basic_info.get('five_elements_class', '未知')
    
    if 'chart' in ziwei and 'palaces' in ziwei['chart']:
        palaces = ziwei['chart']['palaces']
        ziwei_palaces_detail = ""
        for palace_name, palace_data in palaces.items():
            major_stars = [star['name'] for star in palace_data.get('major_stars', [])]
            minor_stars = palace_data.get('minor_stars', [])
            ziwei_palaces_detail += f"""
{palace_name}宫：{palace_data.get('heavenly_stem', '')}{palace_data.get('earthly_branch', '')}
- 主星：{', '.join(major_stars) if major_stars else '无'}
- 辅星：{', '.join(minor_stars) if minor_stars else '无'}
- 身宫：{'是' if palace_data.get('is_body_palace') else '否'}"""
    
    # 四化信息
    if 'si_hua' in ziwei:
        si_hua = ziwei['si_hua']
        ziwei_lu = si_hua.get('禄', '未知')
        ziwei_quan = si_hua.get('权', '未知')
        ziwei_ke = si_hua.get('科', '未知')
        ziwei_ji = si_hua.get('忌', '未知')
    elif 'four_transformations' in ziwei:
        four_trans = ziwei['four_transformations']
        ziwei_lu = four_trans.get('禄', '未知')
        ziwei_quan = four_trans.get('权', '未知')
        ziwei_ke = four_trans.get('科', '未知')
        ziwei_ji = four_trans.get('忌', '未知')
    
    # 印度星盘详细信息构建
    vedic_chart_type = vedic.get('chart_type', '未知')
    vedic_ayanamsa_type = vedic.get('ayanamsa', {}).get('type', '未知')
    vedic_ayanamsa_value = vedic.get('ayanamsa', {}).get('value', '未知')
    vedic_ascendant_sign = vedic.get('ascendant', {}).get('sign', '未知')
    vedic_ascendant_lon = vedic.get('ascendant', {}).get('lon', '未知')
    
    vedic_planets_detail = ""
    if 'planets' in vedic:
        for planet_name, planet_data in vedic['planets'].items():
            vedic_planets_detail += f"""
{planet_name}：{planet_data.get('sign', '未知')}座 第{planet_data.get('house', '未知')}宫 {planet_data.get('lon', '未知')}°"""
    
    vedic_axis_points_detail = ""
    if 'axis_points' in vedic:
        for axis_name, axis_data in vedic['axis_points'].items():
            vedic_axis_points_detail += f"""
{axis_name}：{axis_data.get('sign', '未知')}座 第{axis_data.get('house', '未知')}宫 {axis_data.get('lon', '未知')}°"""
    
    # 加载prompt模板
    prompt_template = load_prompt_template("qa")
    if not prompt_template:
        raise ValueError("无法加载qa prompt模板")
    
    # 准备模板变量
    template_vars = {
        'gender_str': input_data.get('gender_str', '未知'),
        'birth_date': input_data.get('birth_date', ''),
        'birth_time': input_data.get('birth_time', ''),
        'true_solar_time': json.dumps(input_data.get('true_solar_time', {}), ensure_ascii=False),
        'location_name': input_data.get('location_name', '未知'),
        'longitude': input_data.get('longitude', '未知'),
        'latitude': input_data.get('latitude', '未知'),
        'timezone': timezone_info.get('timezone', '未知'),
        'bazi_year_pillar': bazi.get('year_pillar', '未知'),
        'bazi_month_pillar': bazi.get('month_pillar', '未知'),
        'bazi_day_pillar': bazi.get('day_pillar', '未知'),
        'bazi_hour_pillar': bazi.get('hour_pillar', '未知'),
        'bazi_day_master': bazi.get('day_master', '未知'),
        'bazi_body_strength': bazi.get('body_strength', '未知'),
        'bazi_five_elements': json.dumps(bazi.get('five_elements_count', {}), ensure_ascii=False),
        'bazi_ten_gods': json.dumps(bazi.get('ten_gods', {}), ensure_ascii=False),
        'bazi_enhanced_analysis': bazi_detail,
        'ziwei_lunar_date': ziwei_lunar_date,
        'ziwei_chinese_date': ziwei_chinese_date,
        'ziwei_soul': ziwei_soul,
        'ziwei_body': ziwei_body,
        'ziwei_five_elements_class': ziwei_five_elements_class,
        'ziwei_palaces_detail': ziwei_palaces_detail,
        'ziwei_lu': ziwei_lu,
        'ziwei_quan': ziwei_quan,
        'ziwei_ke': ziwei_ke,
        'ziwei_ji': ziwei_ji,
        'vedic_chart_type': vedic_chart_type,
        'vedic_ayanamsa_type': vedic_ayanamsa_type,
        'vedic_ayanamsa_value': vedic_ayanamsa_value,
        'vedic_ascendant_sign': vedic_ascendant_sign,
        'vedic_ascendant_lon': vedic_ascendant_lon,
        'vedic_planets_detail': vedic_planets_detail,
        'vedic_axis_points_detail': vedic_axis_points_detail
    }
    
    # 格式化prompt
    try:
        formatted_prompt = prompt_template["content"].format(**template_vars)
        return formatted_prompt
    except KeyError as e:
        raise ValueError(f"Prompt模板格式化失败，缺少变量: {e}")

def create_report_sections(bazi_analysis, ziwei_analysis, vedic_analysis, mindmap_data):
    """根据AI分析结果创建报告sections"""
    
    # 默认的section模板（与ExamplePage保持一致的格式）
    sections = [
        {
            "id": "analysis",
            "title": "优劣混合分析",
            "description": "结合三盘找出您的优势与劣势，深度剖析命理结构。",
            "icon": "📊",
            "gradient": "from-blue-500 to-cyan-500",
            "bgGradient": "from-blue-500/10 to-cyan-500/10",
            "borderGradient": "from-blue-500/50 to-cyan-500/50",
            "score": 88,
            "summary": bazi_analysis[:200] + "..." if len(bazi_analysis) > 200 else bazi_analysis,
            "detailSections": [
                {
                    "icon": "🎯",
                    "title": "八字综合分析",
                    "content": bazi_analysis,
                    "score": 85
                },
                {
                    "icon": "⭐",
                    "title": "紫微斗数解析",
                    "content": ziwei_analysis,
                    "score": 90
                },
                {
                    "icon": "🔯",
                    "title": "印度星盘洞察",
                    "content": vedic_analysis,
                    "score": 88
                }
            ]
        },
        {
            "id": "mindmap",
            "title": "思维导图呈现",
            "description": "用思维导图方式呈现命理构造与人生主线。",
            "icon": "⭐",
            "gradient": "from-amber-500 to-orange-500",
            "bgGradient": "from-amber-500/10 to-orange-500/10",
            "borderGradient": "from-amber-500/50 to-orange-500/50",
            "score": 92,
            "summary": "您的人生发展轨迹清晰，各个阶段都有明确的成长目标。",
            "mindMapData": mindmap_data,
            "detailSections": []
        },
        {
            "id": "fortune",
            "title": "运势预测报告",
            "description": "未来一年运势详细预测，助您把握人生机遇。",
            "icon": "🔮",
            "gradient": "from-purple-500 to-pink-500",
            "bgGradient": "from-purple-500/10 to-pink-500/10",
            "borderGradient": "from-purple-500/50 to-pink-500/50",
            "score": 85,
            "summary": "2024年下半年至2025年上半年整体运势上升，特别是事业和财运方面有明显改善。",
            "detailSections": [
                {
                    "icon": "💼",
                    "title": "事业运势分析",
                    "content": "基于您的命理配置，预测未来一年的事业发展趋势...",
                    "score": 88
                },
                {
                    "icon": "💎",
                    "title": "财运趋势预测",
                    "content": "分析您的财运变化规律和投资时机...",
                    "score": 82
                }
            ]
        },
        {
            "id": "suggestions",
            "title": "个性化建议",
            "description": "五维（性格、事业、财富、感情、成长）深度解答。",
            "icon": "💡",
            "gradient": "from-emerald-500 to-teal-500",
            "bgGradient": "from-emerald-500/10 to-teal-500/10",
            "borderGradient": "from-emerald-500/50 to-teal-500/50",
            "score": 90,
            "summary": "基于您的命理特点，提供全方位的人生发展建议和实用指导。",
            "detailSections": [
                {
                    "icon": "🎭",
                    "title": "性格优化建议",
                    "content": "根据八字分析提供的性格改善建议...",
                    "score": 88
                },
                {
                    "icon": "🚀",
                    "title": "事业发展建议",
                    "content": "基于紫微斗数的事业规划指导...",
                    "score": 92
                }
            ]
        }
    ]
    
    return sections

@router.post("/generate", response_model=AIReportResponse)
async def generate_ai_report(request: AIReportRequest):
    """生成AI报告 - 新流程：只生成prompt文件"""
    try:
        # 生成订单号
        order_id = request.order_id or generate_order_id()
        
        # 创建订单目录
        order_dir = REPORTS_DIR / order_id
        order_dir.mkdir(parents=True, exist_ok=True)
        
        # 提取用户数据
        user_data = request.user_data
        input_data = user_data.get('input', {})
        bazi_data = user_data.get('bazi', {})
        ziwei_data = user_data.get('ziwei', {})
        vedic_data = user_data.get('vedic', {})
        
        # 生成四个模块的prompt文件
        prompts = {
            "analysis": create_analysis_prompt(user_data),
            "mindmap": create_mindmap_prompt(user_data), 
            "fortune": create_fortune_prompt(user_data),
            "qa": create_qa_prompt(user_data)
        }
        
        # 保存prompt文件
        for module_name, prompt_content in prompts.items():
            prompt_file = order_dir / f"{module_name}_prompt.txt"
            with open(prompt_file, 'w', encoding='utf-8') as f:
                f.write(prompt_content)
        
        # 创建初始状态文件
        status_data = {
            "order_id": order_id,
            "created_at": datetime.now().isoformat(),
            "status": "prompts_generated",
            "modules": {
                "analysis": {"status": "pending", "progress": 0},
                "mindmap": {"status": "pending", "progress": 0},
                "fortune": {"status": "pending", "progress": 0},
                "qa": {"status": "pending", "progress": 0}
            }
        }
        
        status_file = order_dir / "status.json"
        with open(status_file, 'w', encoding='utf-8') as f:
            json.dump(status_data, f, ensure_ascii=False, indent=2)
        
        # 保存用户数据
        user_data_file = order_dir / "user_data.json"
        with open(user_data_file, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Prompt文件已生成: {order_id}")
        
        return AIReportResponse(
            order_id=order_id,
            sections=[],  # 空数组，因为还没有生成内容
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"❌ 生成prompt文件失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"生成prompt文件失败: {str(e)}")

@router.get("/status/{order_id}")
async def get_report_status(order_id: str):
    """获取报告生成状态"""
    try:
        storage_data = load_report_from_storage(order_id)
        
        if not storage_data:
            raise HTTPException(status_code=404, detail=f"订单号 {order_id} 不存在")
        
        return {
            "order_id": order_id,
            "status": storage_data.get("status", "completed"),
            "progress": 100,
            "created_at": storage_data.get("created_at"),
            "report_available": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询订单状态失败: {str(e)}")

@router.get("/report/{order_id}")
async def get_report_by_order_id(order_id: str):
    """通过订单号获取完整报告"""
    try:
        order_dir = REPORTS_DIR / order_id
        if not order_dir.exists():
            raise HTTPException(status_code=404, detail=f"订单号 {order_id} 不存在")
        
        # 读取状态文件
        status_file = order_dir / "status.json"
        if not status_file.exists():
            raise HTTPException(status_code=404, detail="状态文件不存在")
        
        with open(status_file, 'r', encoding='utf-8') as f:
            status_data = json.load(f)
        
        # 读取用户数据
        user_data_file = order_dir / "user_data.json"
        user_data = {}
        if user_data_file.exists():
            with open(user_data_file, 'r', encoding='utf-8') as f:
                user_data = json.load(f)
        
        # 读取所有已生成的模块数据
        sections = []
        modules = status_data.get("modules", {})
        
        for module_name, module_status in modules.items():
            if module_status.get("status") == "completed":
                result_file = order_dir / f"{module_name}_result.json"
                if result_file.exists():
                    with open(result_file, 'r', encoding='utf-8') as f:
                        result_data = json.load(f)
                    sections.append({
                        "id": module_name,
                        "title": get_module_title(module_name),
                        "content": result_data.get("content", ""),
                        "generated_at": result_data.get("generated_at")
                    })
        
        return {
            "order_id": order_id,
            "sections": sections,
            "generated_at": status_data.get("created_at"),
            "status": status_data.get("status", "prompts_generated"),
            "user_data": user_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取报告失败: {str(e)}")

def get_module_title(module_name):
    """获取模块标题"""
    titles = {
        "analysis": "优劣混合分析",
        "mindmap": "思维导图呈现", 
        "fortune": "运势预测报告",
        "qa": "个性化建议"
    }
    return titles.get(module_name, module_name)

@router.get("/reports/list")
async def list_reports():
    """列出所有报告"""
    try:
        reports = list_all_reports()
        return {"reports": reports}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取报告列表失败: {str(e)}")

# 新增API端点

class ModuleGenerateRequest(BaseModel):
    order_id: str
    module: str  # analysis, mindmap, fortune, qa

@router.post("/generate-module")
async def generate_single_module(request: ModuleGenerateRequest):
    """生成单个模块的报告"""
    try:
        order_dir = REPORTS_DIR / request.order_id
        if not order_dir.exists():
            raise HTTPException(status_code=404, detail="订单不存在")
        
        # 读取prompt文件
        prompt_file = order_dir / f"{request.module}_prompt.txt"
        if not prompt_file.exists():
            raise HTTPException(status_code=404, detail="Prompt文件不存在")
        
        with open(prompt_file, 'r', encoding='utf-8') as f:
            prompt_content = f.read()
        
        # 调用AI生成内容
        print(f"🚀 开始生成模块 {request.module} 的报告...")
        ai_response = await call_deepseek_api(prompt_content)

        # 统一清洗content字段，去除```json ... ```包裹
        def clean_ai_content(content: str) -> str:
            content = content.strip()
            if content.startswith("```json"):
                content = re.sub(r"^```json\\s*", "", content)
                content = re.sub(r"\\s*```$", "", content)
            return content
        cleaned_content = clean_ai_content(ai_response)

        # 解析AI返回的JSON内容
        try:
            parsed_content = json.loads(cleaned_content)
        except json.JSONDecodeError as e:
            print(f"⚠️ AI返回内容不是有效JSON，保存为字符串: {str(e)}")
            parsed_content = cleaned_content

        # 保存AI响应
        result_file = order_dir / f"{request.module}_result.json"
        result_data = {
            "module": request.module,
            "order_id": request.order_id,
            "generated_at": datetime.now().isoformat(),
            "content": parsed_content
        }
        
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
        
        # 更新状态文件
        status_file = order_dir / "status.json"
        if status_file.exists():
            with open(status_file, 'r', encoding='utf-8') as f:
                status_data = json.load(f)
            
            status_data["modules"][request.module] = {
                "status": "completed",
                "progress": 100,
                "completed_at": datetime.now().isoformat()
            }
            
            with open(status_file, 'w', encoding='utf-8') as f:
                json.dump(status_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 模块 {request.module} 报告生成完成")
        
        return {
            "order_id": request.order_id,
            "module": request.module,
            "status": "completed",
            "message": "模块报告生成完成"
        }
        
    except Exception as e:
        print(f"❌ 生成模块报告失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"生成模块报告失败: {str(e)}")

@router.get("/module-status/{order_id}")
async def get_module_status(order_id: str):
    """获取订单中所有模块的状态"""
    try:
        order_dir = REPORTS_DIR / order_id
        if not order_dir.exists():
            raise HTTPException(status_code=404, detail="订单不存在")
        
        status_file = order_dir / "status.json"
        if not status_file.exists():
            raise HTTPException(status_code=404, detail="状态文件不存在")
        
        with open(status_file, 'r', encoding='utf-8') as f:
            status_data = json.load(f)
        
        return status_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模块状态失败: {str(e)}")

@router.get("/module-data/{order_id}/{module}")
async def get_module_data(order_id: str, module: str):
    """获取指定模块的数据"""
    try:
        order_dir = REPORTS_DIR / order_id
        if not order_dir.exists():
            raise HTTPException(status_code=404, detail="订单不存在")
        
        result_file = order_dir / f"{module}_result.json"
        if not result_file.exists():
            raise HTTPException(status_code=404, detail="模块数据不存在")
        
        with open(result_file, 'r', encoding='utf-8') as f:
            result_data = json.load(f)
        
        return result_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模块数据失败: {str(e)}")

@router.post("/simulate-progress/{order_id}/{module}")
async def simulate_progress(order_id: str, module: str):
    """模拟生成进度（用于前端显示）"""
    try:
        order_dir = REPORTS_DIR / order_id
        if not order_dir.exists():
            raise HTTPException(status_code=404, detail="订单不存在")
        
        status_file = order_dir / "status.json"
        if not status_file.exists():
            raise HTTPException(status_code=404, detail="状态文件不存在")
        
        # 读取当前状态
        with open(status_file, 'r', encoding='utf-8') as f:
            status_data = json.load(f)
        
        # 更新模块状态为生成中
        status_data["modules"][module] = {
            "status": "generating",
            "progress": 0,
            "started_at": datetime.now().isoformat()
        }
        
        with open(status_file, 'w', encoding='utf-8') as f:
            json.dump(status_data, f, ensure_ascii=False, indent=2)
        
        return {
            "order_id": order_id,
            "module": module,
            "status": "generating",
            "progress": 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"模拟进度失败: {str(e)}") 