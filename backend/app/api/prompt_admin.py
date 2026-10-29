from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import json
import os
from pathlib import Path
from datetime import datetime

router = APIRouter()

# 配置存储目录
PROMPTS_DIR = Path("data/prompts")
PROMPTS_DIR.mkdir(parents=True, exist_ok=True)

class PromptTemplate(BaseModel):
    name: str
    title: str
    description: str
    content: str
    version: str
    last_modified: str

class PromptUpdateRequest(BaseModel):
    content: str
    version: str

# 默认的prompt模板
DEFAULT_PROMPTS = {
    "analysis": {
        "name": "analysis",
        "title": "优劣混合分析",
        "description": "结合三盘找出用户的优势与劣势，深度剖析命理结构",
        "content": """你是一位精通中国传统命理学和印度占星学的大师。请基于以下用户的完整命盘信息，进行深度的优劣混合分析。

【用户基本信息】
性别：{gender_str}
出生时间：{birth_date} {birth_time}
真太阳时：{true_solar_time}
出生地点：{location_name}
经纬度：{longitude}°E, {latitude}°N
时区：{timezone} (UTC{timezone})

【八字命理信息】
四柱：{bazi_year_pillar} {bazi_month_pillar} {bazi_day_pillar} {bazi_hour_pillar}
日主：{bazi_day_master}
身强身弱：{bazi_body_strength}
五行统计：{bazi_five_elements}
十神配置：{bazi_ten_gods}
{bazi_enhanced_analysis}

【紫微斗数详细分析】
基本信息：
- 农历日期：{ziwei_lunar_date}
- 干支：{ziwei_chinese_date}
- 命主：{ziwei_soul}
- 身主：{ziwei_body}
- 五行局：{ziwei_five_elements_class}

十二宫详析：
{ziwei_palaces_detail}

四化信息：
- 禄：{ziwei_lu}
- 权：{ziwei_quan}
- 科：{ziwei_ke}
- 忌：{ziwei_ji}

【印度星盘详细分析】
星盘类型：{vedic_chart_type}
岁差系统：{vedic_ayanamsa_type} ({vedic_ayanamsa_value}°)

上升点：{vedic_ascendant_sign} {vedic_ascendant_lon}°

行星位置详析：
{vedic_planets_detail}

重要轴点：
{vedic_axis_points_detail}

请综合三个命理体系，深度剖析用户的命理结构，分析五个核心维度，并提供专业的分析报告。

分析要求：
1. 综合八字、紫微斗数、印度星盘的信息
2. 深度剖析命理结构
3. 客观分析各个维度
4. 提供具体的改善建议

请严格按照以下JSON格式返回：

{{
    "summary": {{
        "title": "命理综述",
        "overview": "整体命理特征概述（300-400字，包含核心命理特征、人生主线和关键特征）"
    }},
    "talents": {{
        "title": "天赋优势",
        "overview": "天赋优势总体分析（100-150字）"
    }},
    "tensions": {{
        "title": "内心张力",
        "overview": "内心张力特征总体分析（100-150字）"
    }},
    "blindspots": {{
        "title": "命盘盲区",
        "overview": "潜在盲区总体分析（100-150字）"
    }},
    "guidance": {{
        "title": "成长引导",
        "overview": "成长路径总体分析（100-150字）"
    }}
}}

请确保返回的是纯JSON格式，不要包含任何其他文字。所有title字段必须严格按照上述格式，不得修改。overview内容可以根据用户的命理特征进行个性化调整。""",
        "version": "1.0.0",
        "last_modified": datetime.now().isoformat()
    },
    "mindmap": {
        "name": "mindmap",
        "title": "思维导图呈现",
        "description": "用思维导图方式呈现命理构造与人生主线",
        "content": """你是一位精通中国传统命理学和印度占星学的大师。请基于以下用户的完整命盘信息，用思维导图的方式呈现命理构造与人生主线。

【用户基本信息】
性别：{gender_str}
出生时间：{birth_date} {birth_time}
真太阳时：{true_solar_time}
出生地点：{location_name}
经纬度：{longitude}°E, {latitude}°N
时区：{timezone} (UTC{timezone})

【八字命理信息】
四柱：{bazi_year_pillar} {bazi_month_pillar} {bazi_day_pillar} {bazi_hour_pillar}
日主：{bazi_day_master}
身强身弱：{bazi_body_strength}
五行统计：{bazi_five_elements}
十神配置：{bazi_ten_gods}
{bazi_enhanced_analysis}

【紫微斗数详细分析】
基本信息：
- 农历日期：{ziwei_lunar_date}
- 干支：{ziwei_chinese_date}
- 命主：{ziwei_soul}
- 身主：{ziwei_body}
- 五行局：{ziwei_five_elements_class}

十二宫详析：
{ziwei_palaces_detail}

四化信息：
- 禄：{ziwei_lu}
- 权：{ziwei_quan}
- 科：{ziwei_ke}
- 忌：{ziwei_ji}

【印度星盘详细分析】
星盘类型：{vedic_chart_type}
岁差系统：{vedic_ayanamsa_type} ({vedic_ayanamsa_value}°)

上升点：{vedic_ascendant_sign} {vedic_ascendant_lon}°

行星位置详析：
{vedic_planets_detail}

重要轴点：
{vedic_axis_points_detail}

请将复杂的命理信息以清晰的层次结构展现，分析用户的五个核心性格维度，每个维度提供总体分析和具体表现。

分析要求：
1. 基于八字、紫微斗数、印度星盘的综合分析
2. 每个维度提供深入的命理依据
3. 具体表现要有实际指导意义
4. 分析要客观准确，有针对性

请严格按照以下JSON格式返回：

{{
    "positive_traits": {{
        "overview": "正向性格特征的总体分析（100-150字，结合命理依据）",
        "details": [
            {{"title": "AI生成的两个字标题1", "description": "一句话总结这个优势特征的表现和命理依据"}},
            {{"title": "AI生成的两个字标题2", "description": "一句话总结这个优势特征的表现和命理依据"}},
            {{"title": "AI生成的两个字标题3", "description": "一句话总结这个优势特征的表现和命理依据"}},
            {{"title": "AI生成的两个字标题4", "description": "一句话总结这个优势特征的表现和命理依据"}},
            {{"title": "AI生成的两个字标题5", "description": "一句话总结这个优势特征的表现和命理依据"}},
            {{"title": "AI生成的两个字标题6", "description": "一句话总结这个优势特征的表现和命理依据"}}
        ]
    }},
    "negative_tendencies": {{
        "overview": "负向性格倾向的总体分析（100-150字，结合命理依据）",
        "details": [
            {{"title": "AI生成的两个字标题1", "description": "一句话总结这个倾向的表现和改善建议"}},
            {{"title": "AI生成的两个字标题2", "description": "一句话总结这个倾向的表现和改善建议"}},
            {{"title": "AI生成的两个字标题3", "description": "一句话总结这个倾向的表现和改善建议"}},
            {{"title": "AI生成的两个字标题4", "description": "一句话总结这个倾向的表现和改善建议"}},
            {{"title": "AI生成的两个字标题5", "description": "一句话总结这个倾向的表现和改善建议"}},
            {{"title": "AI生成的两个字标题6", "description": "一句话总结这个倾向的表现和改善建议"}}
        ]
    }},
    "conflicting_aspects": {{
        "overview": "潜在冲突性格的总体分析（100-150字，分析内在矛盾点）",
        "details": [
            {{"title": "理性vs感性", "description": "基于命理分析您理性与感性冲突的具体表现和平衡建议"}},
            {{"title": "行动vs思考", "description": "基于命理分析您执行与规划冲突的具体表现和平衡建议"}},
            {{"title": "独立vs依赖", "description": "基于命理分析您自主与寻求支持冲突的具体表现和平衡建议"}},
            {{"title": "完美vs效率", "description": "基于命理分析您追求完美与时间效率冲突的具体表现和平衡建议"}}
        ]
    }},
    "strength_areas": {{
        "overview": "易发展领域的总体分析（100-150字，分析适合发展的方向）",
        "details": [
            {{"title": "适合行业", "description": "基于命理分析您适合从事的行业和职业方向"}},
            {{"title": "人际风格", "description": "基于命理分析您人际交往的特点和优势"}},
            {{"title": "表达方式", "description": "基于命理分析您沟通表达的特点和优势"}},
            {{"title": "工作特长", "description": "基于命理分析您工作能力和专业特长"}}
        ]
    }},
    "weakness_areas": {{
        "overview": "易出问题领域的总体分析（100-150字，分析需要注意的方面）",
        "details": [
            {{"title": "感情破裂点", "description": "基于命理分析您感情方面容易出现的问题和防范建议"}},
            {{"title": "人际失衡点", "description": "基于命理分析您人际关系方面容易出现的问题和改善建议"}},
            {{"title": "健康压力点", "description": "基于命理分析您健康方面需要注意的问题和保养建议"}},
            {{"title": "资源耗损点", "description": "基于命理分析您资源管理方面容易出现的问题和优化建议"}}
        ]
    }}
}}

请确保返回的是纯JSON格式，不要包含任何其他文字。对于正向和负向性格特征，请根据用户的命理特点生成准确的两个字标题，并用一句话总结其特征。""",
        "version": "1.0.0",
        "last_modified": datetime.now().isoformat()
    },
    "fortune": {
        "name": "fortune",
        "title": "运势预测报告",
        "description": "基于当前时间未来12个月运势详细预测，助用户把握人生机遇",
        "content": """你是一位精通中国传统命理学和印度占星学的大师。请基于以下用户的完整命盘信息，预测从下个月开始的未来12个月的详细运势，助其把握人生机遇。

【用户基本信息】
性别：{gender_str}
出生时间：{birth_date} {birth_time}
真太阳时：{true_solar_time}
出生地点：{location_name}
经纬度：{longitude}°E, {latitude}°N
时区：{timezone} (UTC{timezone})

【八字命理信息】
四柱：{bazi_year_pillar} {bazi_month_pillar} {bazi_day_pillar} {bazi_hour_pillar}
日主：{bazi_day_master}
身强身弱：{bazi_body_strength}
五行统计：{bazi_five_elements}
十神配置：{bazi_ten_gods}
{bazi_enhanced_analysis}

【紫微斗数详细分析】
基本信息：
- 农历日期：{ziwei_lunar_date}
- 干支：{ziwei_chinese_date}
- 命主：{ziwei_soul}
- 身主：{ziwei_body}
- 五行局：{ziwei_five_elements_class}

十二宫详析：
{ziwei_palaces_detail}

四化信息：
- 禄：{ziwei_lu}
- 权：{ziwei_quan}
- 科：{ziwei_ke}
- 忌：{ziwei_ji}

【印度星盘详细分析】
星盘类型：{vedic_chart_type}
岁差系统：{vedic_ayanamsa_type} ({vedic_ayanamsa_value}°)

上升点：{vedic_ascendant_sign} {vedic_ascendant_lon}°

行星位置详析：
{vedic_planets_detail}

重要轴点：
{vedic_axis_points_detail}

【运势预测信息】
当前月份：{current_month}
预测期间：{prediction_start} 至 {prediction_end}
预测月份：{prediction_month_0}, {prediction_month_1}, {prediction_month_2}, {prediction_month_3}, {prediction_month_4}, {prediction_month_5}, {prediction_month_6}, {prediction_month_7}, {prediction_month_8}, {prediction_month_9}, {prediction_month_10}, {prediction_month_11}

请基于三大命理体系的综合分析，为每个预测月份提供详细的运势分析，包括事业、财运、感情、健康四个维度的评分和具体建议。

分析要求：
1. 结合八字流年、紫微斗数大限、印度星盘行运
2. 每个月份提供四个维度的评分（1-10分）
3. 提供具体的运势分析和建议
4. 重点关注机遇和需要注意的方面

请严格按照以下JSON格式返回：

{{
    "monthly_predictions": [
        {{
            "month": "{prediction_month_0}",
            "career_score": 8,
            "wealth_score": 7,
            "relationship_score": 9,
            "health_score": 8,
            "career_analysis": "事业运势分析（100-150字）",
            "wealth_analysis": "财运分析（100-150字）",
            "relationship_analysis": "感情运势分析（100-150字）",
            "health_analysis": "健康运势分析（100-150字）",
            "opportunities": "本月机遇（50-80字）",
            "challenges": "需要注意的挑战（50-80字）"
        }},
        {{
            "month": "{prediction_month_1}",
            "career_score": 7,
            "wealth_score": 8,
            "relationship_score": 6,
            "health_score": 9,
            "career_analysis": "事业运势分析（100-150字）",
            "wealth_analysis": "财运分析（100-150字）",
            "relationship_analysis": "感情运势分析（100-150字）",
            "health_analysis": "健康运势分析（100-150字）",
            "opportunities": "本月机遇（50-80字）",
            "challenges": "需要注意的挑战（50-80字）"
        }}
        // ... 继续其他10个月份
    ]
}}

请确保返回的是纯JSON格式，不要包含任何其他文字。评分范围是1-10分，分析内容要具体且有指导意义。""",
        "version": "1.0.0",
        "last_modified": datetime.now().isoformat()
    },
    "qa": {
        "name": "qa",
        "title": "个性化建议",
        "description": "基于命理分析回答用户的个性化问题，提供专业建议",
        "content": """你是一位精通中国传统命理学和印度占星学的大师。请基于以下用户的完整命盘信息，回答用户的个性化问题，提供专业的命理建议。

【用户基本信息】
性别：{gender_str}
出生时间：{birth_date} {birth_time}
真太阳时：{true_solar_time}
出生地点：{location_name}
经纬度：{longitude}°E, {latitude}°N
时区：{timezone} (UTC{timezone})

【八字命理信息】
四柱：{bazi_year_pillar} {bazi_month_pillar} {bazi_day_pillar} {bazi_hour_pillar}
日主：{bazi_day_master}
身强身弱：{bazi_body_strength}
五行统计：{bazi_five_elements}
十神配置：{bazi_ten_gods}
{bazi_enhanced_analysis}

【紫微斗数详细分析】
基本信息：
- 农历日期：{ziwei_lunar_date}
- 干支：{ziwei_chinese_date}
- 命主：{ziwei_soul}
- 身主：{ziwei_body}
- 五行局：{ziwei_five_elements_class}

十二宫详析：
{ziwei_palaces_detail}

四化信息：
- 禄：{ziwei_lu}
- 权：{ziwei_quan}
- 科：{ziwei_ke}
- 忌：{ziwei_ji}

【印度星盘详细分析】
星盘类型：{vedic_chart_type}
岁差系统：{vedic_ayanamsa_type} ({vedic_ayanamsa_value}°)

上升点：{vedic_ascendant_sign} {vedic_ascendant_lon}°

行星位置详析：
{vedic_planets_detail}

重要轴点：
{vedic_axis_points_detail}

请基于三大命理体系的综合分析，回答用户的问题并提供专业的建议。分析要结合用户的命理特征，给出个性化的指导。

请严格按照以下JSON格式返回：

{{
    "career_questions": [
        {{
            "question": "我适合从事什么行业？",
            "answer": "基于命理的详细分析和职业建议（200-300字）"
        }},
        {{
            "question": "我的事业发展方向如何？",
            "answer": "基于命理的详细分析和职业建议（200-300字）"
        }}
    ],
    "relationship_questions": [
        {{
            "question": "我的感情特质是什么？",
            "answer": "从命理角度看，您的感情特质是...（200-300字）"
        }},
        {{
            "question": "我什么时候会遇到正缘？",
            "answer": "基于命理的详细分析和时间预测（200-300字）"
        }}
    ],
    "wealth_questions": [
        {{
            "question": "我的财运特点是什么？",
            "answer": "基于命理的详细分析和理财建议（200-300字）"
        }},
        {{
            "question": "我适合什么投资方式？",
            "answer": "基于命理的详细分析和投资建议（200-300字）"
        }}
    ],
    "health_questions": [
        {{
            "question": "我需要注意哪些健康问题？",
            "answer": "从命理角度，您需要注意...（200-300字）"
        }},
        {{
            "question": "我如何调理身体？",
            "answer": "基于命理的详细分析和健康建议（200-300字）"
        }}
    ],
    "life_questions": [
        {{
            "question": "我的人生使命是什么？",
            "answer": "根据您的命理特征，您的人生使命是...（200-300字）"
        }},
        {{
            "question": "我如何实现人生价值？",
            "answer": "基于命理的详细分析和人生指导（200-300字）"
        }}
    ]
}}

请确保返回的是纯JSON格式，不要包含任何其他文字。回答要具体、专业、有指导意义，结合用户的命理特征给出个性化建议。""",
        "version": "1.0.0",
        "last_modified": datetime.now().isoformat()
    }
}

def load_prompt_template(prompt_name: str) -> Dict[str, Any]:
    """加载prompt模板"""
    prompt_file = PROMPTS_DIR / f"{prompt_name}.json"
    
    if prompt_file.exists():
        try:
            with open(prompt_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"加载prompt模板失败: {str(e)}")
    
    # 如果文件不存在或加载失败，返回默认模板
    return DEFAULT_PROMPTS.get(prompt_name, {})

def save_prompt_template(prompt_name: str, prompt_data: Dict[str, Any]) -> bool:
    """保存prompt模板"""
    try:
        prompt_file = PROMPTS_DIR / f"{prompt_name}.json"
        with open(prompt_file, 'w', encoding='utf-8') as f:
            json.dump(prompt_data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存prompt模板失败: {str(e)}")
        return False

@router.get("/prompts")
async def get_all_prompts() -> List[PromptTemplate]:
    """获取所有prompt模板"""
    prompts = []
    for prompt_name in ["analysis", "mindmap", "fortune", "qa"]:
        prompt_data = load_prompt_template(prompt_name)
        if prompt_data:
            prompts.append(PromptTemplate(**prompt_data))
    return prompts

@router.get("/prompts/{prompt_name}")
async def get_prompt_template(prompt_name: str) -> PromptTemplate:
    """获取指定的prompt模板"""
    prompt_data = load_prompt_template(prompt_name)
    if not prompt_data:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    return PromptTemplate(**prompt_data)

@router.put("/prompts/{prompt_name}")
async def update_prompt_template(prompt_name: str, request: PromptUpdateRequest) -> Dict[str, Any]:
    """更新prompt模板"""
    prompt_data = load_prompt_template(prompt_name)
    if not prompt_data:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    
    # 更新内容
    prompt_data["content"] = request.content
    prompt_data["version"] = request.version
    prompt_data["last_modified"] = datetime.now().isoformat()
    
    # 保存到文件
    if save_prompt_template(prompt_name, prompt_data):
        return {"message": "Prompt template updated successfully", "prompt": prompt_data}
    else:
        raise HTTPException(status_code=500, detail="Failed to save prompt template")

@router.post("/prompts/{prompt_name}/reset")
async def reset_prompt_template(prompt_name: str) -> Dict[str, Any]:
    """重置prompt模板到默认值"""
    if prompt_name not in DEFAULT_PROMPTS:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    
    default_prompt = DEFAULT_PROMPTS[prompt_name].copy()
    default_prompt["last_modified"] = datetime.now().isoformat()
    
    if save_prompt_template(prompt_name, default_prompt):
        return {"message": "Prompt template reset successfully", "prompt": default_prompt}
    else:
        raise HTTPException(status_code=500, detail="Failed to reset prompt template")

@router.get("/prompts/{prompt_name}/preview")
async def preview_prompt_template(prompt_name: str) -> Dict[str, Any]:
    """预览prompt模板（包含示例数据）"""
    prompt_data = load_prompt_template(prompt_name)
    if not prompt_data:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    
    # 示例数据
    sample_data = {
        "gender_str": "男",
        "birth_date": "1995-06-15",
        "birth_time": "14:30",
        "true_solar_time": "14:25",
        "location_name": "上海市",
        "longitude": "121.5",
        "latitude": "31.2",
        "timezone": "+8",
        "bazi_year_pillar": "乙亥",
        "bazi_month_pillar": "己巳",
        "bazi_day_pillar": "丁酉",
        "bazi_hour_pillar": "丁未",
        "bazi_day_master": "丁",
        "bazi_body_strength": "身弱",
        "bazi_five_elements": '{"金": 2, "木": 1, "水": 1, "火": 3, "土": 1}',
        "bazi_ten_gods": '{"年干": "偏印", "月干": "食神", "日干": "日主", "时干": "比肩"}',
        "bazi_enhanced_analysis": "详细的八字分析内容...",
        "ziwei_lunar_date": "农历二月十五",
        "ziwei_chinese_date": "乙亥年 己巳月 丁酉日",
        "ziwei_soul": "丁火",
        "ziwei_body": "酉金",
        "ziwei_palaces_detail": "紫微斗数十二宫详析...",
        "ziwei_lu": "禄存",
        "ziwei_quan": "权星",
        "ziwei_ke": "科星",
        "ziwei_ji": "忌星",
        "vedic_chart_type": "Vedic Chart",
        "vedic_ayanamsa_type": "Koch Coordinates",
        "vedic_ayanamsa_value": "23.45°",
        "vedic_ascendant_sign": "Aries",
        "vedic_ascendant_lon": "20°",
        "vedic_planets_detail": "行星位置详析...",
        "vedic_axis_points_detail": "重要轴点分析...",
        "current_month": "2025年1月",
        "prediction_start": "2025年2月",
        "prediction_end": "2026年1月",
        "prediction_months": ["2025年2月", "2025年3月", "2025年4月", "2025年5月", "2025年6月", "2025年7月", "2025年8月", "2025年9月", "2025年10月", "2025年11月", "2025年12月", "2026年1月"],
        # 添加可能用到的JSON结构变量
        "summary": '{"title": "命理综述", "overview": "整体命理特征概述示例"}',
        "talents": '{"title": "天赋优势", "overview": "天赋优势总体分析示例"}',
        "tensions": '{"title": "内心张力", "overview": "内心张力特征总体分析示例"}',
        "blindspots": '{"title": "命盘盲区", "overview": "潜在盲区总体分析示例"}',
        "guidance": '{"title": "成长引导", "overview": "成长路径总体分析示例"}',
        "positive_traits": '{"overview": "正向性格特征的总体分析示例", "details": []}',
        "negative_tendencies": '{"overview": "负向性格倾向的总体分析示例", "details": []}',
        "conflicting_aspects": '{"overview": "潜在冲突性格的总体分析示例", "details": []}',
        "strength_areas": '{"overview": "易发展领域的总体分析示例", "details": []}',
        "weakness_areas": '{"overview": "易出问题领域的总体分析示例", "details": []}',
        "monthly_predictions": '[{"month": "2025年2月", "career_score": 8, "wealth_score": 7, "relationship_score": 9, "health_score": 8}]',
        "career_questions": '[{"question": "我适合从事什么行业？", "answer": "基于命理的详细分析和职业建议"}]',
        "relationship_questions": '[{"question": "我的感情特质是什么？", "answer": "从命理角度看，您的感情特质是..."}]',
        "wealth_questions": '[{"question": "我的财运特点是什么？", "answer": "基于命理的详细分析和理财建议"}]',
        "health_questions": '[{"question": "我需要注意哪些健康问题？", "answer": "从命理角度，您需要注意..."}]',
        "life_questions": '[{"question": "我的人生使命是什么？", "answer": "根据您的命理特征，您的人生使命是..."}]'
    }
    # 自动展开prediction_months
    if "prediction_months" in sample_data and isinstance(sample_data["prediction_months"], list):
        for i, v in enumerate(sample_data["prediction_months"]):
            sample_data[f"prediction_month_{i}"] = v
    
    # 格式化prompt内容
    try:
        formatted_content = prompt_data["content"].format(**sample_data)
    except KeyError as e:
        formatted_content = f"模板格式化错误: 缺少变量 {e}"
    
    return {
        "prompt_name": prompt_name,
        "original_content": prompt_data["content"],
        "formatted_content": formatted_content,
        "sample_data": sample_data
    } 