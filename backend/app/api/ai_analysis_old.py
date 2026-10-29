# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime, timedelta
import uuid
import asyncio

router = APIRouter()

# 全局变量
REPORTS_DIR = "data/reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

# 请求模型
class BatchAnalysisRequest(BaseModel):
    user_data: Dict[str, Any]  # 包含input, bazi, ziwei, vedic的完整数据
    order_id: str

class DimensionAnalysisRequest(BaseModel):
    dimension_id: str
    birth_data: Dict[str, Any]
    order_id: str

class ComprehensiveAnalysisRequest(BaseModel):
    dimension_results: Dict[str, Any]
    birth_data: Dict[str, Any]
    order_id: str

# 响应模型
class BatchAnalysisResponse(BaseModel):
    success: bool
    order_id: str
    progress: int
    data: Optional[Dict[str, Any]] = None

class DimensionAnalysisResponse(BaseModel):
    overview: str
    stage_summary: List[str]
    recommendations: List[str]

class ComprehensiveAnalysisResponse(BaseModel):
    summary: str

# 全局上下文存储（实际应用中应该使用Redis或数据库）
CONTEXT_STORAGE = {}

# 添加测试模式配置
ENABLE_CONTEXT_TEST = False  # 控制是否启用context测试模式
CONTEXT_TEST_SHORT = "请确认是否可读取命盘数据："  # 简化版测试语句

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

# 维度配置 - 重新设计为四个大模块，每个都包含完整用户数据
DIMENSIONS_CONFIG = {
    'comprehensive_analysis': {
        'title': '优劣混合分析',
        'prompt_template': """
你是一位精通中国传统命理学和印度占星学的大师。请基于以下用户的完整命盘信息，进行深度的优劣混合分析。

【用户基本信息】
性别：{gender_str}
出生时间：{birth_date} {birth_time}
真太阳时：{true_solar_time_json}
出生地点：{location_name}
经纬度：{longitude}°E, {latitude}°N
时区：{timezone} (UTC{utc_offset})

【八字命理信息】
四柱：{year_pillar} {month_pillar} {day_pillar} {hour_pillar}
日主：{day_master}火
身强身弱：{body_strength}
五行统计：{five_elements_json}
十神配置：{ten_gods_json}
{bazi_detail}

【紫微斗数信息】
{ziwei_detail}

【印度星盘信息】
{vedic_detail}

请综合三个命理体系，深度剖析用户的命理结构，分析五个核心维度，并提供专业的分析报告。

分析要求：
1. 综合八字、紫微斗数、印度星盘的信息
2. 深度剖析命理结构
3. 客观分析各个维度
4. 提供具体的改善建议

请严格按照以下JSON格式返回：

{
    "summary": {
        "title": "命理综述",
        "overview": "整体命理特征概述（300-400字，包含核心命理特征、人生主线和关键特征）"
    },
    "talents": {
        "title": "天赋优势",
        "overview": "天赋优势总体分析（100-150字）",
        "suggestions": [
            "第一阶段｜认识天赋：通过测试、反馈和自我观察，明确自己的核心优势领域",
            "第二阶段｜刻意练习：在优势领域进行有针对性的深度练习，将天赋转化为技能",
            "第三阶段｜整合应用：将多项天赋优势组合运用，创造独特的个人竞争力",
            "第四阶段｜价值创造：运用天赋为他人和社会创造价值，实现个人价值最大化"
        ]
    },
    "tensions": {
        "title": "内心张力",
        "overview": "内心张力特征总体分析（100-150字）",
        "suggestions": [
            "第一阶段｜识别张力：觉察内心冲突的具体表现，记录触发情境和情绪反应",
            "第二阶段｜理解根源：探索张力背后的深层需求和价值观冲突，理解其形成原因",
            "第三阶段｜寻找平衡：学习在对立面之间找到动态平衡，接受矛盾的存在",
            "第四阶段｜转化力量：将内心张力转化为创造力和行动力的源泉"
        ]
    },
    "blindspots": {
        "title": "命盘盲区",
        "overview": "潜在盲区总体分析（100-150字）",
        "suggestions": [
            "第一阶段｜承认盲区：勇敢面对自己的不足，接受他人的反馈和建议",
            "第二阶段｜寻求帮助：主动寻找导师、朋友或专业人士的指导和支持",
            "第三阶段｜刻意补强：针对关键盲区进行有计划的学习和练习",
            "第四阶段｜建立系统：建立长期的反馈和监督机制，持续改进薄弱环节"
        ]
    },
    "guidance": {
        "title": "成长引导",
        "overview": "成长路径总体分析（100-150字）",
        "suggestions": [
            "第一阶段｜看清自己：觉察自己惯性反应（比如讨好、压抑、逃避）是改变的第一步",
            "第二阶段｜学会松手：接受"做不到完美"，允许自己有缺口，有弹性",
            "第三阶段｜建立正循环：学习表达、运动、艺术、情绪日记，找到让你舒服的出口",
            "第四阶段｜对世界说YES：去体验、去信任关系、去回应挑战，而不是光想不动"
    ]
    }
}

请确保返回的是纯JSON格式，不要包含任何其他文字。所有title字段和suggestions中的标题部分必须严格按照上述格式，不得修改。suggestions中的具体内容可以根据用户的命理特征进行个性化调整，但标题格式必须保持一致。
"""
    },
    'mindmap_presentation': {
        'title': '思维导图呈现',
        'prompt_template': """
你是一位精通中国传统命理学和印度占星学的大师。请基于以下用户的完整命盘信息，用思维导图的方式呈现命理构造与人生主线。

【用户基本信息】
性别：{gender_str}
出生时间：{birth_date} {birth_time}
真太阳时：{true_solar_time_json}
出生地点：{location_name}
经纬度：{longitude}°E, {latitude}°N
时区：{timezone} (UTC{utc_offset})

【八字命理信息】
四柱：{year_pillar} {month_pillar} {day_pillar} {hour_pillar}
日主：{day_master}火
身强身弱：{body_strength}
五行统计：{five_elements_json}
十神配置：{ten_gods_json}
{bazi_detail}

【紫微斗数信息】
{ziwei_detail}

【印度星盘信息】
{vedic_detail}

请将复杂的命理信息以清晰的层次结构展现，分析用户的五个核心性格维度，每个维度提供总体分析和具体表现。

分析要求：
1. 基于八字、紫微斗数、印度星盘的综合分析
2. 每个维度提供深入的命理依据
3. 具体表现要有实际指导意义
4. 分析要客观准确，有针对性

请严格按照以下JSON格式返回：

{
    "positive_traits": {
        "overview": "正向性格特征的总体分析（100-150字，结合命理依据）",
        "details": [
            {"title": "AI生成的两个字标题1", "description": "一句话总结这个优势特征的表现和命理依据"},
            {"title": "AI生成的两个字标题2", "description": "一句话总结这个优势特征的表现和命理依据"},
            {"title": "AI生成的两个字标题3", "description": "一句话总结这个优势特征的表现和命理依据"},
            {"title": "AI生成的两个字标题4", "description": "一句话总结这个优势特征的表现和命理依据"},
            {"title": "AI生成的两个字标题5", "description": "一句话总结这个优势特征的表现和命理依据"},
            {"title": "AI生成的两个字标题6", "description": "一句话总结这个优势特征的表现和命理依据"}
        ]
    },
    "negative_tendencies": {
        "overview": "负向性格倾向的总体分析（100-150字，结合命理依据）",
        "details": [
            {"title": "AI生成的两个字标题1", "description": "一句话总结这个倾向的表现和改善建议"},
            {"title": "AI生成的两个字标题2", "description": "一句话总结这个倾向的表现和改善建议"},
            {"title": "AI生成的两个字标题3", "description": "一句话总结这个倾向的表现和改善建议"},
            {"title": "AI生成的两个字标题4", "description": "一句话总结这个倾向的表现和改善建议"},
            {"title": "AI生成的两个字标题5", "description": "一句话总结这个倾向的表现和改善建议"},
            {"title": "AI生成的两个字标题6", "description": "一句话总结这个倾向的表现和改善建议"}
        ]
    },
    "conflicting_aspects": {
        "overview": "潜在冲突性格的总体分析（100-150字，分析内在矛盾点）",
        "details": [
            {"title": "理性vs感性", "description": "基于命理分析您理性与感性冲突的具体表现和平衡建议"},
            {"title": "行动vs思考", "description": "基于命理分析您执行与规划冲突的具体表现和平衡建议"},
            {"title": "独立vs依赖", "description": "基于命理分析您自主与寻求支持冲突的具体表现和平衡建议"},
            {"title": "完美vs效率", "description": "基于命理分析您追求完美与时间效率冲突的具体表现和平衡建议"}
        ]
    },
    "strength_areas": {
        "overview": "易发展领域的总体分析（100-150字，分析适合发展的方向）",
        "details": [
            {"title": "适合行业", "description": "基于命理分析您适合从事的行业和职业方向"},
            {"title": "人际风格", "description": "基于命理分析您人际交往的特点和优势"},
            {"title": "表达方式", "description": "基于命理分析您沟通表达的特点和优势"},
            {"title": "工作特长", "description": "基于命理分析您工作能力和专业特长"}
        ]
    },
    "weakness_areas": {
        "overview": "易出问题领域的总体分析（100-150字，分析需要注意的方面）",
        "details": [
            {"title": "感情破裂点", "description": "基于命理分析您感情方面容易出现的问题和防范建议"},
            {"title": "人际失衡点", "description": "基于命理分析您人际关系方面容易出现的问题和改善建议"},
            {"title": "健康压力点", "description": "基于命理分析您健康方面需要注意的问题和保养建议"},
            {"title": "资源耗损点", "description": "基于命理分析您资源管理方面容易出现的问题和优化建议"}
        ]
    }
}

请确保返回的是纯JSON格式，不要包含任何其他文字。对于正向和负向性格特征，请根据用户的命理特点生成准确的两个字标题，并用一句话总结其特征。"""
    },
    'fortune_prediction': {
        'title': '运势预测报告',
        'prompt_template': '''你是一位精通中国传统命理学和印度占星学的大师。请基于以下用户的完整命盘信息，预测从下个月开始的未来12个月的详细运势，助其把握人生机遇。

【用户基本信息】
性别：{gender_str}
出生时间：{birth_date} {birth_time}
真太阳时：{true_solar_time_json}
出生地点：{location_name}
经纬度：{longitude}°E, {latitude}°N
时区：{timezone} (UTC{utc_offset})

【八字命理信息】
四柱：{year_pillar} {month_pillar} {day_pillar} {hour_pillar}
日主：{day_master}火
身强身弱：{body_strength}
五行统计：{five_elements_json}
十神配置：{ten_gods_json}
{bazi_detail}

【紫微斗数信息】
{ziwei_detail}

【印度星盘信息】
{vedic_detail}

【预测时间信息】
当前时间：{current_month}
预测范围：{prediction_months[0]}至{prediction_months[-1]}（共12个月，不包括当前月）

请结合大运、流年、月令变化，为每个月份提供精确的运势评分预测。

分析要求：
1. 基于当前时间点进行预测
2. 为指定的12个月份分别提供运势评分
3. 每个月份包含4个核心指标的数值评分
4. 评分范围为1-10分，数值必须是整数（1分最低，10分最高）

请严格按照以下JSON格式返回：

{
    "monthly_predictions": [
        {
            "month": "{prediction_months[0]}",
            "career_score": 8,
            "wealth_score": 7,
            "relationship_score": 9,
            "health_score": 8
        },
        {
            "month": "{prediction_months[1]}",
            "career_score": 7,
            "wealth_score": 8,
            "relationship_score": 8,
            "health_score": 8
        },
        {
            "month": "{prediction_months[2]}",
            "career_score": 9,
            "wealth_score": 8,
            "relationship_score": 7,
            "health_score": 9
        },
        {
            "month": "{prediction_months[3]}",
            "career_score": 8,
            "wealth_score": 7,
            "relationship_score": 8,
            "health_score": 9
        },
        {
            "month": "{prediction_months[4]}",
            "career_score": 8,
            "wealth_score": 9,
            "relationship_score": 8,
            "health_score": 8
        },
        {
            "month": "{prediction_months[5]}",
            "career_score": 7,
            "wealth_score": 8,
            "relationship_score": 10,
            "health_score": 8
        },
        {
            "month": "{prediction_months[6]}",
            "career_score": 10,
            "wealth_score": 8,
            "relationship_score": 7,
            "health_score": 9
        },
        {
            "month": "{prediction_months[7]}",
            "career_score": 8,
            "wealth_score": 9,
            "relationship_score": 8,
            "health_score": 8
        },
        {
            "month": "{prediction_months[8]}",
            "career_score": 7,
            "wealth_score": 8,
            "relationship_score": 9,
            "health_score": 8
        },
        {
            "month": "{prediction_months[9]}",
            "career_score": 9,
            "wealth_score": 8,
            "relationship_score": 8,
            "health_score": 10
        },
        {
            "month": "{prediction_months[10]}",
            "career_score": 8,
            "wealth_score": 9,
            "relationship_score": 8,
            "health_score": 8
        },
        {
            "month": "{prediction_months[11]}",
            "career_score": 8,
            "wealth_score": 8,
            "relationship_score": 9,
            "health_score": 8
        }
    ]
}

请确保返回的是纯JSON格式，不要包含任何其他文字。请根据用户的命理特征，为每个月份生成准确的运势评分。'''
    },
    'personalized_advice': {
        'title': '个性化建议',
        'prompt_template': """
你是一位精通中国传统命理学和印度占星学的大师。请基于以下用户的完整命盘信息，提供30个细致深度的个性化问题解答，涵盖人生5个重要层面。

【用户基本信息】
性别：{gender_str}
出生时间：{birth_date} {birth_time}
真太阳时：{true_solar_time_json}
出生地点：{location_name}
经纬度：{longitude}°E, {latitude}°N
时区：{timezone} (UTC{utc_offset})

【八字命理信息】
四柱：{year_pillar} {month_pillar} {day_pillar} {hour_pillar}
日主：{day_master}火
身强身弱：{body_strength}
五行统计：{five_elements_json}
十神配置：{ten_gods_json}
{bazi_detail}

【紫微斗数信息】
{ziwei_detail}

【印度星盘信息】
{vedic_detail}

请针对用户的具体命理特征，提供专属的、实用的人生建议和解答。

分析要求：
1. 问题要具体且实用
2. 答案要基于命理分析给出
3. 涵盖人生的各个重要方面
4. 提供可操作的具体建议
5. 每个维度包含6个问题

请严格按照以下JSON格式返回：

{
    "life_guidance": {
        "wealth": {
            "title": "财富类",
            "icon": "💰",
            "gradient": "from-green-500 to-emerald-500",
            "questions": [
                {
                    "question": "我的财运特点是什么？",
                    "answer": "基于命理的详细分析和理财建议"
                },
                {
                    "question": "投资理财对我有没有好处？",
                    "answer": "基于命理的详细分析和投资建议"
                },
                {
                    "question": "我什么时候财运最好？",
                    "answer": "基于命理的详细分析和时机把握"
                },
                {
                    "question": "我是不是容易漏财、赔钱？",
                    "answer": "基于命理的详细分析和防范建议"
                },
                {
                    "question": "我要不要现在换工作/跳槽才能赚得更多？",
                    "answer": "基于命理的详细分析和职业建议"
                },
                {
                    "question": "我这辈子能有多少财富？",
                    "answer": "基于命理的详细分析和财富预测"
                }
            ]
        },
        "career": {
            "title": "事业类",
            "icon": "💼",
            "gradient": "from-blue-500 to-cyan-500",
            "questions": [
                {
                    "question": "我适合做哪一行能成事？",
                    "answer": "基于命理的详细分析和职业建议"
                },
                {
                    "question": "我适合创业还是打工？",
                    "answer": "基于命理的详细分析和选择建议"
                },
                {
                    "question": "我会不会一辈子穷忙没有结果？",
                    "answer": "基于命理的详细分析和发展预测"
                },
                {
                    "question": "我的贵人在哪一类人/方向？",
                    "answer": "基于命理的详细分析和人脉建议"
                },
                {
                    "question": "我做的这件事有前途吗？",
                    "answer": "基于命理的详细分析和前景判断"
                },
                {
                    "question": "我什么时候事业能真正起来？",
                    "answer": "基于命理的详细分析和时机预测"
                }
            ]
        },
        "love": {
            "title": "感情类",
            "icon": "❤️",
            "gradient": "from-pink-500 to-rose-500",
            "questions": [
                {
                    "question": "我的正缘长什么样、什么时候遇到？",
                    "answer": "基于命理的详细分析和姻缘预测"
                },
                {
                    "question": "我现在身边这个人是不是命中注定的？",
                    "answer": "基于命理的详细分析和缘分判断"
                },
                {
                    "question": "我这辈子能不能结婚/稳定下来？",
                    "answer": "基于命理的详细分析和婚姻预测"
                },
                {
                    "question": "感情上我是不是特别难遇到对的人？",
                    "answer": "基于命理的详细分析和感情建议"
                },
                {
                    "question": "我适合早婚还是晚婚？",
                    "answer": "基于命理的详细分析和婚期建议"
                },
                {
                    "question": "我感情老出问题，是命里就这样吗？",
                    "answer": "基于命理的详细分析和改善方法"
                }
            ]
        },
        "personality": {
            "title": "性格与命格",
            "icon": "🧠",
            "gradient": "from-purple-500 to-indigo-500",
            "questions": [
                {
                    "question": "我天生有啥命？是福命还是苦命？",
                    "answer": "基于命理的详细分析和命格评价"
                },
                {
                    "question": "我性格最大的死穴是什么？",
                    "answer": "基于命理的详细分析和改进建议"
                },
                {
                    "question": "我是不是命里容易孤独、跟别人难亲近？",
                    "answer": "基于命理的详细分析和社交建议"
                },
                {
                    "question": "我是不是天生劳碌命、操心命？",
                    "answer": "基于命理的详细分析和性格调整"
                },
                {
                    "question": "我这人到底适合顺其自然还是奋力争？",
                    "answer": "基于命理的详细分析和人生策略"
                },
                {
                    "question": "命里有没有什么特别的天赋我没用上？",
                    "answer": "基于命理的详细分析和天赋发掘"
                }
            ]
        },
        "fortune": {
            "title": "运势转折",
            "icon": "🌟",
            "gradient": "from-yellow-500 to-orange-500",
            "questions": [
                {
                    "question": "我这辈子的大运势走向是什么样的？",
                    "answer": "基于命理的详细分析和运势预测"
                },
                {
                    "question": "我要不要出国/换城市发展会更好？",
                    "answer": "基于命理的详细分析和方位建议"
                },
                {
                    "question": "我这辈子有没有一次彻底翻身的机会？",
                    "answer": "基于命理的详细分析和机遇预测"
                },
                {
                    "question": "我这命，是要靠人、靠天，还是靠自己？",
                    "answer": "基于命理的详细分析和成功路径"
                },
                {
                    "question": "我什么时候运气最好/最差？",
                    "answer": "基于命理的详细分析和时运把握"
                },
                {
                    "question": "我人生的关键转折点在什么时候？",
                    "answer": "基于命理的详细分析和转折预测"
                }
            ]
        }
    }
}

# 综合报告生成模板（用于生成最终报告）
FINAL_REPORT_TEMPLATE = """
你是一位精通中国传统命理学和印度占星学的大师。

请基于用户命盘信息和以下四个模块的分析结果，生成一个完整的命理分析报告总结：

优劣混合分析：{comprehensive_analysis}
思维导图呈现：{mindmap_presentation}  
运势预测报告：{fortune_prediction}
个性化建议：{personalized_advice}

请综合四个模块的分析，生成一个简洁的报告总结，包含：
1. 核心命理特征概括
2. 关键发现和洞察
3. 重要建议和指导

请严格以JSON格式返回：
{
    "report_summary": "综合报告总结内容（200-300字）"
}

请确保返回的是纯JSON格式，不要包含任何其他文字。
"""

def get_analysis_file_path(order_id: str) -> str:
    """获取分析结果文件路径"""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "analysis")
    os.makedirs(data_dir, exist_ok=True)
    return os.path.join(data_dir, f"{order_id}_analysis.json")

def save_analysis_result(order_id: str, analysis_data: Dict[str, Any]):
    """保存分析结果到文件"""
    file_path = get_analysis_file_path(order_id)
    
    # 添加元数据
    analysis_data.update({
        "order_id": order_id,
        "created_at": datetime.now().isoformat(),
        "version": "1.0"
    })
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(analysis_data, f, ensure_ascii=False, indent=2)

def load_analysis_result(order_id: str) -> Optional[Dict[str, Any]]:
    """从文件加载分析结果"""
    file_path = get_analysis_file_path(order_id)
    
    if not os.path.exists(file_path):
        return None
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"加载分析结果失败: {e}")
        return None

def create_context_prompt(user_data: Dict[str, Any]) -> str:
    """创建上下文设置的prompt - 包含所有排盘数据"""
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
    ziwei_detail = ""
    if 'chart' in ziwei:
        chart = ziwei['chart']
        basic_info = ziwei.get('basic_info', {})
        ziwei_detail = f"""
【紫微斗数详细分析】
基本信息：
- 农历日期：{basic_info.get('lunar_date', '未知')}
- 干支：{basic_info.get('chinese_date', '未知')}
- 命主：{basic_info.get('soul', '未知')}
- 身主：{basic_info.get('body', '未知')}
- 五行局：{basic_info.get('five_elements_class', '未知')}

十二宫详析："""
        
        if 'palaces' in chart:
            for palace_name, palace_data in chart['palaces'].items():
                major_stars = [star['name'] for star in palace_data.get('major_stars', [])]
                minor_stars = palace_data.get('minor_stars', [])
                ziwei_detail += f"""
{palace_name}宫：{palace_data.get('heavenly_stem', '')}{palace_data.get('earthly_branch', '')}
- 主星：{', '.join(major_stars) if major_stars else '无'}
- 辅星：{', '.join(minor_stars) if minor_stars else '无'}
- 身宫：{'是' if palace_data.get('is_body_palace') else '否'}"""
        
        # 四化信息
        if 'si_hua' in ziwei:
            si_hua = ziwei['si_hua']
            ziwei_detail += f"""
年干四化：
- 禄：{si_hua.get('禄', '未知')}
- 权：{si_hua.get('权', '未知')}
- 科：{si_hua.get('科', '未知')}
- 忌：{si_hua.get('忌', '未知')}"""
        elif 'four_transformations' in ziwei:
            # 备用四化信息字段
            four_trans = ziwei['four_transformations']
            ziwei_detail += f"""
年干四化：
- 禄：{four_trans.get('禄', '未知')}
- 权：{four_trans.get('权', '未知')} 
- 科：{four_trans.get('科', '未知')}
- 忌：{four_trans.get('忌', '未知')}"""
    
    # 印度星盘详细信息构建
    vedic_detail = ""
    if vedic:
        vedic_detail = f"""
【印度星盘详细分析】
星盘类型：{vedic.get('chart_type', '未知')}
岁差系统：{vedic.get('ayanamsa', {}).get('type', '未知')} ({vedic.get('ayanamsa', {}).get('value', '未知')}°)

上升点：{vedic.get('ascendant', {}).get('sign', '未知')} {vedic.get('ascendant', {}).get('lon', '未知')}°

行星位置详析："""
        
        if 'planets' in vedic:
            for planet_name, planet_data in vedic['planets'].items():
                vedic_detail += f"""
{planet_name}：{planet_data.get('sign', '未知')}座 第{planet_data.get('house', '未知')}宫 {planet_data.get('lon', '未知')}°"""
        
        # 轴点信息
        if 'axis_points' in vedic:
            vedic_detail += f"""
重要轴点："""
            for axis_name, axis_data in vedic['axis_points'].items():
                vedic_detail += f"""
{axis_name}：{axis_data.get('sign', '未知')}座 第{axis_data.get('house', '未知')}宫 {axis_data.get('lon', '未知')}°"""
    
    return f"""
你是一位资深的命理分析师，精通八字、紫微斗数和印度星盘三大命理系统。现在请建立对以下用户的完整命盘上下文理解：

【用户基本信息】
性别：{input_data.get('gender_str', '未知')}
出生时间：{input_data.get('birth_date', '')} {input_data.get('birth_time', '')}
真太阳时：{json.dumps(input_data.get('true_solar_time', {}), ensure_ascii=False)}
出生地点：{input_data.get('location_name', '未知')}
经纬度：{input_data.get('longitude', '未知')}°E, {input_data.get('latitude', '未知')}°N
时区：{timezone_info.get('timezone', '未知')} (UTC{timezone_info.get('utc_offset', '未知')})

【八字命理信息】
四柱：{bazi.get('year_pillar', '未知')} {bazi.get('month_pillar', '未知')} {bazi.get('day_pillar', '未知')} {bazi.get('hour_pillar', '未知')}
日主：{bazi.get('day_master', '未知')}火
身强身弱：{bazi.get('body_strength', '未知')}
五行统计：{json.dumps(bazi.get('five_elements_count', {}), ensure_ascii=False)}
十神配置：{json.dumps(bazi.get('ten_gods', {}), ensure_ascii=False)}
{bazi_detail}

【紫微斗数信息】
{ziwei_detail}

【印度星盘信息】
{vedic_detail}

请基于以上三大命理系统的完整数据，深度理解这位用户的命盘特征、性格特质、天赋潜力、人生走向等各个方面。这些数据将作为后续分析的基础，请确保充分吸收和理解所有信息。

请回复"上下文已建立，我已充分理解用户的完整命盘信息"。
"""

# 已移除context测试相关函数，现在使用简化的四大模块设计

async def call_ai_api(prompt: str, is_context_setup: bool = False) -> Dict[str, Any]:
    """
    调用AI API生成分析内容
    TODO: 这里需要替换为实际的AI API调用（如Gemini API）
    """
    print(f"调用AI API...")
    print(f"Prompt: {prompt[:200]}...")
    
    # 模拟API调用延迟
    await asyncio.sleep(1 if is_context_setup else 2)
    
    if is_context_setup:
        return {"message": "上下文已建立，可以开始分析了"}
    
    # 返回模拟数据，实际实现时替换为真实API响应
    # 检查是否是上下文建立类型的prompt（必须同时包含确认文本且不包含分析指令）
    if "请确认你已经理解了用户的完整命盘信息" in prompt and "请简单回复确认信息" in prompt:
        return "我已经充分理解了您的命盘信息，包括八字、紫微斗数和印度星盘的完整数据。作为一位资深命理分析师，我已经建立了对您个人命盘的深度理解，可以为您提供准确而专业的分析服务。请告诉我您希望了解哪个方面的分析。"
    
    # 检查是否是新格式的prompt（询问是否能读取命盘数据）
    if "请问你是否能够读取到我之前提供的完整命盘信息" in prompt:
        # 模拟上下文存在的情况 - 这里可以通过修改这个条件来测试不同情况
        # 设置为True表示模拟AI能够读取上下文，False表示无法读取
        context_available = True  # 您可以修改这个值来测试不同情况
        
        if not context_available:
            return "否"
    
    # 检查是否是综合分析
    if ("综合分析总结" in prompt and "summary" in prompt) or "整合四个维度的分析结果" in prompt or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "综合的分析总结" in prompt):
        result = {
            "summary": "综合四个维度的分析，您是一个具有强烈成就动机和优秀分析能力的个体。天赋优势突出，内驱力强劲，但需要关注情感表达和工作生活平衡的盲区。建议在发挥理性分析优势的同时，加强情感智慧的培养，通过系统性的成长规划实现全面发展。您的发展潜力巨大，关键在于平衡各方面的能力，形成更加完整和强大的个人竞争力。"
        }
        return json.dumps(result, ensure_ascii=False)
    elif ("天赋优势" in prompt and "stageSummary" in prompt) or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "分析我的天赋优势" in prompt):
        result = {
            "overview": "基于您的八字、紫微斗数和印度星盘的综合分析，您在天赋优势方面展现出独特的特质。您具备优秀的分析能力和逻辑思维，善于从复杂信息中提取关键要素。创造力丰富，能够在传统框架中找到创新的解决方案。沟通表达能力强，能够清晰地传达复杂概念。同时，您还具备很强的学习能力和适应性，能够快速掌握新知识和技能。",
            "stageSummary": ["天赋觉察", "优势识别", "潜能开发", "才能整合"],
            "recommendations": [
                "通过多元化尝试和深度反思，系统性地识别自己的核心天赋领域，建立天赋档案。",
                "通过实际项目和挑战来验证和强化已识别的优势，确认其在不同环境下的表现。",
                "制定具体的天赋发展计划，在日常工作和生活中有意识地运用和培养这些能力。",
                "将各项天赋整合为个人的核心竞争力，形成独特的价值创造体系和个人品牌。"
            ]
        }
        return json.dumps(result, ensure_ascii=False)
    elif ("内驱力" in prompt and "stageSummary" in prompt) or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "分析我的内驱力特征" in prompt):
        result = {
            "overview": "您的内驱力分析显示出强烈的成就导向和自我实现需求。您内心深处渴望通过自己的努力创造有意义的成果，对个人成长和能力提升有着持续的追求。价值观体系相对稳定，注重公平正义和诚信原则。在面对挑战时，您能够从内在找到持续的动力源泉，不容易被外界干扰所影响。同时，您也具备很强的责任感和使命感。",
            "stageSummary": ["动机探索", "驱力激发", "目标明确", "持续动力"],
            "recommendations": [
                "通过深度自我探索和价值观梳理，明确内心真正的渴望和驱动力来源。",
                "通过设定具有挑战性的目标和获得成就感，强化和激发内在的驱动力。",
                "将内在动机转化为具体可行的目标，确保目标与个人价值观高度一致。",
                "建立可持续的激励机制和支持系统，维持长期的行动力和热情。"
            ]
        }
        return json.dumps(result, ensure_ascii=False)
    elif ("命盘盲区" in prompt and "stageSummary" in prompt) or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "分析我的命盘盲区" in prompt):
        result = {
            "overview": "命盘分析显示您在某些领域存在需要关注的盲区。主要表现在情感表达和人际敏感度方面，有时可能过于理性而忽视他人的情感需求。在决策时容易过度分析而错失时机，对不确定性的容忍度相对较低。此外，在健康管理和工作生活平衡方面也需要更多关注，容易因为专注工作而忽视身心健康的维护。",
            "stageSummary": ["盲区识别", "风险评估", "改进策略", "防范提升"],
            "recommendations": [
                "通过360度反馈和自我观察，客观识别个人容易忽视的问题领域和行为模式。",
                "系统评估这些盲区可能带来的风险和负面影响，制定相应的应对预案。",
                "针对识别出的盲区制定具体的改进计划，逐步提升相关能力和意识。",
                "建立长期的监控机制和提醒系统，避免盲区问题的重复出现和恶化。"
            ]
        }
        return json.dumps(result, ensure_ascii=False)
    elif ("成长引导" in prompt and "stageSummary" in prompt) or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "为我提供成长引导" in prompt):
        result = {
            "overview": "您的成长引导分析显示出巨大的发展潜力和清晰的成长路径。建议重点关注领导力和影响力的培养，这将是您未来发展的重要方向。同时，跨领域的知识整合能力也是您的成长重点，能够帮助您在复杂环境中创造更大价值。在个人发展方面，建议平衡理性与感性，培养更全面的人格特质。持续学习和自我迭代将是您保持竞争优势的关键。",
            "stageSummary": ["成长规划", "能力提升", "实践应用", "全面发展"],
            "recommendations": [
                "制定系统的个人发展规划，明确短期和长期目标，建立成长里程碑。",
                "通过学习、培训和实践，重点提升领导力、沟通力等核心软技能。",
                "将所学知识和技能应用到实际项目中，通过实践验证和优化成长策略。",
                "追求全面而均衡的发展，在专业能力、人际关系、身心健康等方面协调提升。"
            ]
        }
        return json.dumps(result, ensure_ascii=False)

    
    # 新的四大模块处理
    if ("优劣混合分析" in prompt or "comprehensive_analysis" in prompt or 
        '"advantages"' in prompt or '"disadvantages"' in prompt or '"balance_suggestions"' in prompt):
        result = {
            "summary": "基于八字、紫微斗数、印度星盘的综合分析，您的命理结构呈现出理性与感性并重的特征。整体来看，您具备优秀的分析思维和创新潜力，在人际沟通和适应变化方面表现突出。您的性格中既有追求完美的严谨态度，也有包容开放的智慧品质。建议在发挥理性优势的同时，注重情感表达的培养，通过平衡发展实现人生的全面提升。",
            "positive_traits": {
                "overview": "您的天赋优势主要体现在理性思维和创新能力方面。八字显示您思维敏捷，善于分析复杂问题；紫微斗数中智慧星较旺，具备很强的学习吸收能力；印度星盘显示您在沟通表达和适应环境方面有天然优势。这些特质使您在需要深度思考和创新突破的领域容易获得成功。",
                "stages": [
                    {
                        "title": "认知",
                        "description": "通过自我反思和他人反馈，清楚认识自己在分析思维、创新能力、沟通表达方面的天然优势。"
                    },
                    {
                        "title": "发挥",
                        "description": "在日常工作和生活中主动承担需要分析和创新的任务，让优势得到充分展现和锻炼。"
                    },
                    {
                        "title": "强化",
                        "description": "通过持续学习新知识、参与复杂项目、扩展社交圈来进一步提升这些核心能力。"
                    },
                    {
                        "title": "应用",
                        "description": "将分析思维转化为解决实际问题的能力，将创新想法转化为有价值的成果和影响力。"
                    }
                ]
            },
            "negative_traits": {
                "overview": "您需要关注的方面主要集中在情感表达和决策效率上。八字显示有时容易陷入过度思考的陷阱；紫微斗数提示在情感交流方面可能存在某些障碍；印度星盘显示需要注意工作与生活的平衡。这些特质可能会影响您的人际关系和执行效率。",
                "stages": [
                    {
                        "title": "觉察",
                        "description": "客观观察自己在情感表达、决策犹豫、完美主义倾向等方面的具体表现和影响。"
                    },
                    {
                        "title": "接纳",
                        "description": "理解这些特质是性格的一部分，接受不完美的自己，避免过度自我批评和焦虑。"
                    },
                    {
                        "title": "改善",
                        "description": "通过练习情感表达、设定决策时限、培养执行力来逐步改善这些方面的表现。"
                    },
                    {
                        "title": "转化",
                        "description": "将谨慎思考转化为风险控制优势，将完美主义转化为追求卓越的动力。"
                    }
                ]
            },
            "development_potential": {
                "overview": "您的发展潜力主要体现在专业领域深耕和跨界创新方面。命理格局显示您有很强的学习天赋和适应能力，适合在需要持续学习和创新的行业发展。35-45岁是您的事业黄金期，此时经验与创新能力达到最佳平衡，有机会在专业领域达到较高成就。",
                "stages": [
                    {
                        "title": "探索",
                        "description": "通过多方尝试和深度体验，发现自己真正感兴趣且具备天赋的专业方向和发展领域。"
                    },
                    {
                        "title": "培养",
                        "description": "制定系统性的学习计划，持续提升专业技能，积累实践经验，建立专业声誉。"
                    },
                    {
                        "title": "突破",
                        "description": "在专业基础扎实后，寻找创新突破点，勇于挑战传统思维，创造独特价值。"
                    },
                    {
                        "title": "实现",
                        "description": "将积累的知识、经验和创新成果转化为实际影响力和社会价值，实现人生价值。"
                    }
                ]
            },
            "risk_warning": {
                "overview": "您需要特别注意的风险点主要在健康管理和人际关系方面。命理显示您容易因为工作投入过度而忽视身体健康，同时在情感表达方面的不足可能影响重要关系的维护。另外，过于理性的决策方式在某些需要直觉判断的情况下可能成为限制。",
                "stages": [
                    {
                        "title": "预警",
                        "description": "建立健康和人际关系的监测机制，及时发现工作压力过大、身体疲劳、关系疏远等信号。"
                    },
                    {
                        "title": "防范",
                        "description": "制定规律的作息和运动计划，主动安排与重要他人的交流时间，预防问题的发生。"
                    },
                    {
                        "title": "应对",
                        "description": "当出现健康问题或人际冲突时，及时调整工作节奏，寻求专业帮助或朋友支持。"
                    },
                    {
                        "title": "化解",
                        "description": "将健康危机转化为生活方式改善的机会，将人际挑战转化为沟通能力提升的契机。"
                    }
                ]
            }
        }
        return json.dumps(result, ensure_ascii=False)
    
    elif ("思维导图呈现" in prompt or "mindmap_presentation" in prompt or 
          '"positive_traits"' in prompt or '"negative_tendencies"' in prompt or '"conflicting_aspects"' in prompt):
        result = {
            "positive_traits": {
                "overview": "基于您的八字、紫微斗数和印度星盘的综合分析，您具备优秀的稳定性，能在变化中保持内心平静。创造力丰富，善于在工作中提出新想法。意志力坚定，一旦确定目标就会坚持到底。沟通能力强，能准确表达自己的观点并理解他人。智慧深邃，善于透过现象看本质。同理心强，能设身处地为他人着想。",
                "details": [
                    "稳定性：情绪平稳，不易受外界干扰，能够在变化和压力中保持内心的平静与理性",
                    "创造力：思维活跃，富有想象力，善于在传统框架中找到创新的解决方案",
                    "意志力：目标明确，执行力强，一旦确定方向就会坚持到底，不轻易放弃",
                    "沟通力：表达清晰，倾听有效，能够准确传达自己的观点并理解他人的需求",
                    "智慧：洞察力强，分析能力佳，善于透过现象看本质，具备深度思考能力",
                    "同理心：善解人意，人际和谐，能够设身处地为他人着想，建立良好关系"
                ]
            },
            "negative_tendencies": {
                "overview": "偶尔会出现冲动行为，特别是在压力较大时。面对重要决策时可能犹豫不决，反复权衡得失。情绪起伏相对明显，容易受环境影响。遇到困难时有逃避倾向，不愿正面解决问题。对某些观念容易产生执念，难以改变既定想法。有时会过度相信他人，缺乏必要的防范。",
                "details": [
                    "冲动：压力下易做出草率决定，需要学会在行动前深思熟虑，培养冷静判断的习惯",
                    "犹豫：重大选择时摇摆不定，建议设定决策时限，收集足够信息后果断行动",
                    "情绪起伏：容易受外界情绪感染，需要提升情绪管理能力，保持内心的稳定",
                    "逃避：困难面前倾向于回避，建议培养面对问题的勇气，寻求适当的解决方案",
                    "执念：固执己见，难以变通，需要保持开放心态，接受不同观点和可能性",
                    "盲信：过度信任，缺乏防范，应该培养理性判断能力，保持适度的警觉性"
                ]
            },
            "conflicting_aspects": {
                "overview": "您的内在存在理性与感性的平衡点，有时会在逻辑分析与直觉判断之间摇摆。行动力与深思熟虑之间也存在张力，既想快速执行又希望充分考虑。这种内在矛盾让您在决策时需要更多时间，但也让您的选择更加全面和慎重。",
                "details": [
                    "理性vs感性：逻辑与直觉的内在冲突，需要学会在不同情况下灵活运用两种思维方式",
                    "行动vs思考：执行与规划的时机把握，建议在充分思考后设定行动时限，避免过度分析",
                    "独立vs依赖：自主与寻求支持的平衡，既要保持独立判断，也要善于借助他人力量",
                    "完美vs效率：追求完美与时间效率的权衡，需要学会在质量和速度之间找到最佳平衡点"
                ]
            },
            "development_potential": {
                "overview": "您在管理类、咨询类、教育类行业容易获得成功，这些领域能充分发挥您的分析能力和沟通优势。人际风格以稳重可靠见长，容易获得他人信任。在需要深度思考和系统规划的工作中表现出色，能够统筹全局，很少出现重大失误。",
                "details": [
                    "管理领域：具备优秀的组织协调能力，能够统筹全局，带领团队实现共同目标",
                    "咨询服务：善于分析问题并提供专业建议，能够帮助他人解决复杂问题",
                    "教育培训：能够有效传授知识和经验，具备良好的表达能力和耐心",
                    "技术分析：逻辑思维能力强，适合从事需要深度分析和精确判断的技术工作"
                ]
            },
            "weakness_areas": {
                "overview": "在快节奏、高压力的环境中容易出现状况，需要注意工作与生活的平衡。感情方面要避免过度理性，多表达情感关怀。健康方面需要关注因工作压力导致的肠胃问题。财务管理上要避免过于保守，错失投资机会。",
                "details": [
                    "高压环境适应：快节奏环境下容易出现问题，需要学会压力管理和节奏调节技巧",
                    "情感表达：过度理性导致情感疏远，应该多表达关怀，增强情感连接",
                    "健康管理：工作压力影响身体健康，需要建立规律作息和适当运动习惯",
                    "财务决策：过于保守的投资策略可能错失机会，应该在稳健基础上适度进取"
                ]
            }
        }
        return json.dumps(result, ensure_ascii=False)
    
    elif ("运势预测报告" in prompt or "fortune_prediction" in prompt or 
          '"monthly_predictions"' in prompt or '"score_summary"' in prompt):
        # 动态生成未来12个月的数据
        next_months, current_month = get_next_12_months()
        
        # 为每个月份生成不同的评分
        monthly_data = []
        scores = [
            [8, 7, 9, 8], [7, 8, 8, 8], [9, 8, 7, 9], [8, 7, 8, 9],
            [8, 9, 8, 8], [7, 8, 10, 8], [10, 8, 7, 9], [8, 9, 8, 8],
            [7, 8, 9, 8], [9, 8, 8, 10], [8, 9, 8, 8], [8, 8, 9, 8]
        ]
        
        for i, month in enumerate(next_months):
            score_set = scores[i]
            monthly_data.append({
                "month": month,
                "career_score": score_set[0],
                "wealth_score": score_set[1],
                "relationship_score": score_set[2],
                "health_score": score_set[3]
            })
        
        result = {
            "monthly_predictions": monthly_data,
            "score_summary": {
                "career_average": 8.1,
                "wealth_average": 8.2,
                "relationship_average": 8.3,
                "health_average": 8.4,
                "best_career_month": next_months[6],  # 第7个月
                "best_wealth_month": next_months[4],  # 第5个月
                "best_relationship_month": next_months[5],  # 第6个月
                "best_health_month": next_months[9]   # 第10个月
            }
        }
        return json.dumps(result, ensure_ascii=False)
    
    elif ("个性化建议" in prompt or "personalized_advice" in prompt or 
          '"life_guidance"' in prompt or '"introduction"' in prompt):
        result = {
            "introduction": "基于您的命理特征，我为您准备了涵盖人生各个重要层面的30个深度问题解答。这些建议将帮助您更好地理解自己，发挥优势，改善不足，实现全面发展。",
            "life_guidance": {
                "wealth": {
                    "title": "财富类",
                    "icon": "💰",
                    "gradient": "from-green-500 to-emerald-500",
                    "questions": [
                        {
                            "question": "我的财运特点是什么？",
                            "answer": "根据您的命理分析，您的财运特点是稳健偏保守，具有良好的理财天赋。您适合长期投资和稳健理财，避免高风险投机。建议通过定期储蓄和稳健投资来积累财富，您的财运在中年之后会有明显提升。投资时要相信自己的判断，不要盲目跟风。"
                        },
                        {
                            "question": "投资理财对我有没有好处？",
                            "answer": "投资理财对您是有好处的，但需要选择合适的方式。您适合稳健型投资，如定期存款、债券、蓝筹股长期持有等。避免高风险的投机性投资。建议将收入的20-30%用于理财，采用分散投资的策略。学习基本的理财知识对您很重要，可以帮助您更好地管理和增值财富。"
                        },
                        {
                            "question": "我什么时候财运最好？",
                            "answer": "根据您的大运分析，35-45岁期间是您财运最旺的阶段。这个时期您的事业会相对稳定，收入也会有明显提升。另外，每年的春季（2-4月）和秋季（8-10月）是您的财运旺季，适合做重要的财务决策。建议您在财运好的时期积极进取，在财运一般的时期保守稳健。"
                        },
                        {
                            "question": "我是不是容易漏财、赔钱？",
                            "answer": "基于命理的详细分析和防范建议"
                        },
                        {
                            "question": "我要不要现在换工作/跳槽才能赚得更多？",
                            "answer": "基于命理的详细分析和职业建议"
                        },
                        {
                            "question": "我这辈子能有多少财富？",
                            "answer": "基于命理的详细分析和财富预测"
                        }
                    ]
                },
                "career": {
                    "title": "事业类",
                    "icon": "💼",
                    "gradient": "from-blue-500 to-cyan-500",
                    "questions": [
                        {
                            "question": "我适合做哪一行能成事？",
                            "answer": "根据您的五行喜忌和性格特点，您适合从事与金融、管理、咨询、教育相关的行业。您的分析能力强，逻辑思维清晰，适合做需要深度思考和决策的工作。具体来说，银行、保险、投资顾问、企业管理、培训师等职业都比较适合您。避免过于依赖体力劳动或纯销售类的工作。"
                        },
                        {
                            "question": "我适合创业还是打工？",
                            "answer": "您更适合先打工积累经验和资源，再考虑创业。您的命格显示您需要一个稳定的平台来发挥才能，过早创业可能会面临较大风险。建议您在35岁之后考虑创业，那时您的经验、人脉和资金都会更加充足。如果创业，选择与您专业背景相关的领域，并且要有合适的合作伙伴。"
                        },
                        {
                            "question": "我会不会一辈子穷忙没有结果？",
                            "answer": "基于命理的详细分析和发展预测"
                        },
                        {
                            "question": "我的贵人在哪一类人/方向？",
                            "answer": "基于命理的详细分析和人脉建议"
                        },
                        {
                            "question": "我做的这件事有前途吗？",
                            "answer": "基于命理的详细分析和前景判断"
                        },
                        {
                            "question": "我什么时候事业能真正起来？",
                            "answer": "基于命理的详细分析和时机预测"
                        }
                    ]
                },
                "love": {
                    "title": "感情类",
                    "icon": "❤️",
                    "gradient": "from-pink-500 to-rose-500",
                    "questions": [
                        {
                            "question": "我的正缘长什么样、什么时候遇到？",
                            "answer": "您的正缘很可能是一个性格温和、有责任心的人，年龄可能比您大2-4岁。对方从事稳定的职业，如教师、公务员、医生等。外貌上可能偏向清秀型，不是特别张扬的类型。遇到的时间预计在28-30岁之间，地点可能是通过朋友介绍、工作场合或学习环境。要保持开放的心态，不要过于挑剔外在条件。"
                        },
                        {
                            "question": "我现在身边这个人是不是命中注定的？",
                            "answer": "需要看您目前的感情状况和对方的具体情况。如果这个人让您感到舒适、安全，并且你们在价值观上比较一致，那么很可能就是您的正缘。命中注定不是指完全没有选择，而是指在合适的时间遇到合适的人。建议您仔细观察对方的品格和对待感情的态度，如果是真心相待且适合长期发展，就值得珍惜。"
                        },
                        {
                            "question": "我这辈子能不能结婚/稳定下来？",
                            "answer": "基于命理的详细分析和婚姻预测"
                        },
                        {
                            "question": "感情上我是不是特别难遇到对的人？",
                            "answer": "基于命理的详细分析和感情建议"
                        },
                        {
                            "question": "我适合早婚还是晚婚？",
                            "answer": "基于命理的详细分析和婚期建议"
                        },
                        {
                            "question": "我感情老出问题，是命里就这样吗？",
                            "answer": "基于命理的详细分析和改善方法"
                        }
                    ]
                },
                "personality": {
                    "title": "性格与命格",
                    "icon": "🧠",
                    "gradient": "from-purple-500 to-indigo-500",
                    "questions": [
                        {
                            "question": "我天生有啥命？是福命还是苦命？",
                            "answer": "您属于中等偏上的命格，不是大富大贵，但也不是苦命。您的命中有福气，主要体现在智慧和稳定方面。您不需要为生计过分担忧，但也需要通过努力来实现更好的生活。您的福气在于能够通过自己的智慧和努力获得相对稳定的生活，虽然不会大起大落，但胜在平稳安康。珍惜这种平和的福气。"
                        },
                        {
                            "question": "我性格最大的死穴是什么？",
                            "answer": "您性格最大的死穴是过于理性和固执。有时候您会过分依赖逻辑分析，忽略了情感因素和直觉判断。另外，您一旦认定某件事，很难被别人说服改变，这可能会错过一些机会。建议您学会适度听取他人意见，保持开放的心态。有时候感性的判断也很重要，不要完全排斥情感因素。"
                        },
                        {
                            "question": "我是不是命里容易孤独、跟别人难亲近？",
                            "answer": "基于命理的详细分析和社交建议"
                        },
                        {
                            "question": "我是不是天生劳碌命、操心命？",
                            "answer": "基于命理的详细分析和性格调整"
                        },
                        {
                            "question": "我这人到底适合顺其自然还是奋力争？",
                            "answer": "基于命理的详细分析和人生策略"
                        },
                        {
                            "question": "命里有没有什么特别的天赋我没用上？",
                            "answer": "基于命理的详细分析和天赋发掘"
                        }
                    ]
                },
                "fortune": {
                    "title": "运势转折",
                    "icon": "🌟",
                    "gradient": "from-yellow-500 to-orange-500",
                    "questions": [
                        {
                            "question": "我这辈子的大运势走向是什么样的？",
                            "answer": "您这辈子的大运势是一个渐进上升的趋势。青年期（25-35岁）是积累阶段，会遇到一些挑战但也是成长最快的时期。中年期（35-50岁）是您的黄金阶段，各方面运势都比较好，是实现人生目标的关键期。老年期运势平稳，晚年生活比较安康。整体来说是一个稳中有升的运势格局。"
                        },
                        {
                            "question": "我要不要出国/换城市发展会更好？",
                            "answer": "换城市发展对您是有好处的，特别是往东南方向的城市。您的命理显示您适合在大城市发展，那里的机会和平台更适合您的特长。至于出国，如果有好的机会可以考虑，但不要为了出国而出国。关键是要有明确的目标和规划。建议您先在国内的大城市发展几年，积累经验后再考虑国际发展。"
                        },
                        {
                            "question": "我这辈子有没有一次彻底翻身的机会？",
                            "answer": "基于命理的详细分析和机遇预测"
                        },
                        {
                            "question": "我这命，是要靠人、靠天，还是靠自己？",
                            "answer": "基于命理的详细分析和成功路径"
                        },
                        {
                            "question": "我什么时候运气最好/最差？",
                            "answer": "基于命理的详细分析和时运把握"
                        },
                        {
                            "question": "我人生的关键转折点在什么时候？",
                            "answer": "基于命理的详细分析和转折预测"
                        }
                    ]
                }
            }
        }
        return json.dumps(result, ensure_ascii=False)
    
    # 处理最终报告总结 - 检查更多模式
    elif ("综合报告总结" in prompt or "四个模块的分析结果" in prompt or 
          "请基于用户命盘信息和以下四个模块的分析结果" in prompt or
          "优劣混合分析：" in prompt and "思维导图呈现：" in prompt):
        result = {
            "report_summary": "基于您的八字、紫微斗数和印度星盘的综合分析，您是一个具有强烈理性思维和创新潜力的个体。通过四个维度的深度分析，我们发现您在分析能力、沟通表达和适应性方面有着显著优势，但需要注意情感表达和健康管理的平衡。您的运势在未来一年呈现稳中向好的趋势，特别是在事业发展和人际拓展方面将有重要突破。建议您在发挥理性优势的同时，加强情感智慧的培养，通过系统性的成长规划实现全面发展。"
        }
        return json.dumps(result, ensure_ascii=False)

    return json.dumps({"error": "未知的分析类型"}, ensure_ascii=False)

@router.post("/ai/analysis/setup-context", response_model=ContextSetupResponse)
async def setup_analysis_context(request: ContextSetupRequest):
    """第一阶段：建立用户命盘上下文"""
    try:
        # 创建上下文prompt
        context_prompt = create_context_prompt(request.user_data)
        
        # 调用AI API建立上下文
        ai_response = await call_ai_api(context_prompt, is_context_setup=True)
        
        # 存储上下文信息
        CONTEXT_STORAGE[request.order_id] = {
            "user_data": request.user_data,
            "context_established": True,
            "timestamp": datetime.now().isoformat()
        }
        
        return ContextSetupResponse(
            success=True,
            message="命盘上下文建立成功",
            order_id=request.order_id
        )
        
    except Exception as e:
        print(f"建立上下文失败: {e}")
        raise HTTPException(status_code=500, detail=f"建立上下文失败: {str(e)}")

@router.post("/ai/analysis/batch-generate", response_model=BatchAnalysisResponse)
async def batch_generate_analysis(request: BatchAnalysisRequest):
    """批量生成所有维度分析 - 使用动态prompt"""
    try:
        # 批量生成所有维度分析
        results = {}
        
        # 生成四个维度分析
        for dimension_id, dimension_config in DIMENSIONS_CONFIG.items():
            print(f"正在生成{dimension_config['title']}分析...")
            
            # 为每个维度创建包含用户数据的动态prompt
            dynamic_prompt = create_dynamic_prompt(request.user_data, dimension_id)
            
            # 调用AI API生成分析
            ai_response = await call_ai_api(dynamic_prompt)
            
            # 保存AI响应的完整结构
            results[dimension_id] = ai_response
        
        # 保存完整的分析结果
        complete_analysis = {
            "dimensions": results,
            "user_data": request.user_data
        }
        save_analysis_result(request.order_id, complete_analysis)
        
        return BatchAnalysisResponse(
            success=True,
            order_id=request.order_id,
            progress=100,
            data=results
        )
        
    except Exception as e:
        print(f"批量生成分析失败: {e}")
        raise HTTPException(status_code=500, detail=f"批量生成分析失败: {str(e)}")

# 保留原有的单独API端点以兼容现有代码
@router.post("/ai/analysis/dimension", response_model=DimensionAnalysisResponse)
async def generate_dimension_analysis(request: DimensionAnalysisRequest):
    """生成单个维度的分析（兼容性API）"""
    try:
        if request.dimension_id not in DIMENSIONS_CONFIG:
            raise HTTPException(status_code=400, detail=f"无效的维度ID: {request.dimension_id}")
        
        dimension_config = DIMENSIONS_CONFIG[request.dimension_id]
        ai_response = await call_ai_api(dimension_config['prompt_template'])
        
        # 兼容旧的字段结构，根据新的模块返回适当的数据
        if request.dimension_id == 'comprehensive_analysis':
            response = DimensionAnalysisResponse(
                overview=ai_response.get('overview', ''),
                stage_summary=ai_response.get('advantages', []),
                recommendations=ai_response.get('balance_suggestions', [])
            )
        else:
            # 其他模块的兼容处理
            response = DimensionAnalysisResponse(
                overview=str(ai_response),  # 将整个响应作为overview
                stage_summary=[],
                recommendations=[]
            )
        
        return response
        
    except Exception as e:
        print(f"生成维度分析失败: {e}")
        raise HTTPException(status_code=500, detail=f"生成分析失败: {str(e)}")

@router.post("/ai/analysis/comprehensive", response_model=ComprehensiveAnalysisResponse)
async def generate_comprehensive_analysis(request: ComprehensiveAnalysisRequest):
    """生成综合分析总结（兼容性API）"""
    try:
        prompt = FINAL_REPORT_TEMPLATE.format(
            comprehensive_analysis=json.dumps(request.dimension_results.get('comprehensive_analysis', {}), ensure_ascii=False),
            mindmap_presentation=json.dumps(request.dimension_results.get('mindmap_presentation', {}), ensure_ascii=False),
            fortune_prediction=json.dumps(request.dimension_results.get('fortune_prediction', {}), ensure_ascii=False),
            personalized_advice=json.dumps(request.dimension_results.get('personalized_advice', {}), ensure_ascii=False)
        )
        
        ai_response = await call_ai_api(prompt)
        
        complete_analysis = {
            "dimensions": request.dimension_results,
            "comprehensive": ai_response,
            "birth_data": request.birth_data
        }
        save_analysis_result(request.order_id, complete_analysis)
        
        response = ComprehensiveAnalysisResponse(
            summary=ai_response.get('report_summary', '')
        )
        
        return response
        
    except Exception as e:
        print(f"生成综合分析失败: {e}")
        raise HTTPException(status_code=500, detail=f"生成综合分析失败: {str(e)}")

@router.get("/ai/analysis/{order_id}")
async def get_saved_analysis(order_id: str):
    """获取已保存的分析结果"""
    try:
        analysis_data = load_analysis_result(order_id)
        
        if analysis_data is None:
            raise HTTPException(status_code=404, detail="分析结果不存在")
        
        return analysis_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"获取分析结果失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取分析结果失败: {str(e)}")

@router.post("/test/get-prompts")
async def get_test_prompts():
    """获取所有测试用的prompt模板 - 更新为新的四大模块"""
    
    # 示例用户数据（用于测试）- 使用完整的排盘数据
    try:
        # 尝试从现有报告中读取完整数据作为示例
        import os
        import json
        
        sample_report_file = "data/reports/AI20250624201130a556ec91.json"
        if os.path.exists(sample_report_file):
            with open(sample_report_file, 'r', encoding='utf-8') as f:
                report_data = json.load(f)
            sample_user_data = report_data.get('user_data', {})
        else:
            # 如果报告文件不存在，使用简化的示例数据
            sample_user_data = {
                "input": {
                    "birth_date": "1995-06-15",
                    "birth_time": "14:30",
                    "timezone": "+8",
                    "longitude": 121.5,
                    "latitude": 31.2,
                    "gender": 1,
                    "gender_str": "男",
                    "location_name": "上海",
                    "true_solar_time": {
                        "year": 1995,
                        "month": 6,
                        "day": 15,
                        "hour": 14,
                        "minute": 28
                    }
                },
                "bazi": {
                    "year_pillar": "乙亥",
                    "month_pillar": "壬午", 
                    "day_pillar": "丁巳",
                    "hour_pillar": "辛亥",
                    "day_master": "丁",
                    "body_strength": "强",
                    "five_elements_count": {
                        "木": 2,
                        "火": 2,
                        "土": 0,
                        "金": 1,
                        "水": 3
                    },
                    "ten_gods": {
                        "年干": "正印",
                        "月干": "劫财",
                        "日干": "比肩",
                        "时干": "正财"
                    },
                    "nayin": {
                        "年柱": "山头火",
                        "月柱": "杨柳木",
                        "日柱": "沙中土",
                        "时柱": "钗训金"
                    },
                    "enhanced_analysis": {
                        "四柱详析": [
                            {
                                "柱序": "年柱",
                                "天干": "乙",
                                "地支": "亥",
                                "干支": "乙亥",
                                "主星": "正印",
                                "藏干": ["壬", "甲"],
                                "纳音": "山头火",
                                "空亡": "无",
                                "星运（十二长生）": "病",
                                "藏干十神": [
                                    {"藏干": "壬", "十神": "劫财"},
                                    {"藏干": "甲", "十神": "偏印"}
                                ]
                            }
                        ],
                        "十神统计": {
                            "正印": 1,
                            "劫财": 2,
                            "比肩": 1,
                            "正财": 1,
                            "偏印": 1
                        }
                    }
                },
                "ziwei": {
                    "basic_info": {
                        "lunar_date": "一九九五年五月十八",
                        "chinese_date": "乙亥 壬午 丁巳 辛亥",
                        "soul": "紫微",
                        "body": "天府",
                        "five_elements_class": "木三局"
                    },
                    "chart": {
                        "palaces": {
                            "命宫": {
                                "index": 0,
                                "heavenly_stem": "乙",
                                "earthly_branch": "寅",
                                "is_body_palace": false,
                                "major_stars": [
                                    {"name": "紫微", "brightness": "庙", "mutagen": ""}
                                ],
                                "minor_stars": ["文昌"],
                                "adjective_stars": ["天贵", "龙池"]
                            }
                        }
                    }
                },
                "vedic": {
                    "chart_type": "vedic_sidereal",
                    "ayanamsa": {
                        "type": "lahiri",
                        "value": 23.12
                    },
                    "ascendant": {
                        "sign": "Virgo",
                        "house": 1,
                        "lon": 12.34
                    },
                    "planets": {
                        "Sun": {
                            "sign": "Gemini",
                            "house": 10,
                            "lon": 1.25
                        },
                        "Moon": {
                            "sign": "Scorpio",
                            "house": 3,
                            "lon": 15.68
                        }
                    }
                },
                "timezone_info": {
                    "timezone": "Asia/Shanghai",
                    "utc_offset": 8,
                    "estimated": false
                }
            }
    except Exception as e:
        # 发生错误时使用基础示例数据
        sample_user_data = {
            "input": {
                "birth_date": "1995-06-15",
                "birth_time": "14:30",
                "gender_str": "男",
                "location_name": "上海"
            },
            "bazi": {
                "year_pillar": "乙亥",
                "month_pillar": "壬午", 
                "day_pillar": "丁巳",
                "hour_pillar": "辛亥"
            },
            "ziwei": {},
            "vedic": {}
        }
    
    # 构建完整的上下文prompt - 使用新的扩展函数
    context_prompt = create_context_prompt(sample_user_data)

    # 返回新的四大模块prompts
    prompts = {
        "context_setup": {
            "name": "上下文建立",
            "prompt": context_prompt + "\n\n请确认你已经理解了用户的完整命盘信息，并准备好进行深度分析。请简单回复确认信息。",
            "expected_format": "简单确认文本"
        }
    }
    
    # 添加四大模块的prompts
    for dimension_id, dimension_config in DIMENSIONS_CONFIG.items():
        prompts[dimension_id] = {
            "name": dimension_config['title'],
            "prompt": context_prompt + "\n\n" + dimension_config['prompt_template'],
            "expected_format": f"JSON对象 - {dimension_config['title']}的专用格式"
        }
    
    return {
        "success": True,
        "prompts": prompts,
        "sample_data": sample_user_data
    }

@router.post("/test/single-prompt")
async def test_single_prompt(request: dict):
    """测试单个prompt"""
    try:
        prompt_text = request.get("prompt")
        prompt_name = request.get("name", "Unknown")
        
        if not prompt_text:
            return {"success": False, "error": "No prompt provided"}
        
        # 调用AI API
        ai_response = await call_ai_api(prompt_text)
        
        # 尝试解析JSON（如果是JSON格式的prompt）
        parsed_data = None
        parse_error = None
        
        try:
            if prompt_name != "上下文建立":  # 上下文建立不需要JSON解析
                parsed_data = json.loads(ai_response)
        except json.JSONDecodeError as e:
            parse_error = f"JSON解析失败: {str(e)}"
        
        # 验证数据结构
        validation_result = validate_response_structure(prompt_name, parsed_data)
        
        return {
            "success": True,
            "prompt_name": prompt_name,
            "raw_response": ai_response,
            "parsed_data": parsed_data,
            "parse_error": parse_error,
            "validation": validation_result
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"测试失败: {str(e)}"
        }

def validate_response_structure(prompt_name: str, data: dict) -> dict:
    """验证AI回答的数据结构是否符合前端期望 - 更新为新的四大模块"""
    if not data:
        return {"valid": False, "message": "数据为空或解析失败"}
    
    if prompt_name == "上下文建立":
        return {"valid": True, "message": "上下文建立成功"}
    
    # 验证四大模块的数据结构
    if prompt_name == "优劣混合分析":
        required_fields = ["summary", "positive_traits", "negative_traits", "development_potential", "risk_warning"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return {"valid": False, "message": f"缺少必需字段: {', '.join(missing_fields)}"}
        
        # 验证每个traits部分的结构
        for trait_name in ["positive_traits", "negative_traits", "development_potential", "risk_warning"]:
            if trait_name in data:
                trait_data = data[trait_name]
                if not isinstance(trait_data, dict) or "overview" not in trait_data or "stages" not in trait_data:
                    return {"valid": False, "message": f"{trait_name} 结构不正确，需要包含 overview 和 stages"}
                if not isinstance(trait_data["stages"], list) or len(trait_data["stages"]) != 4:
                    return {"valid": False, "message": f"{trait_name} 的 stages 应该是包含4个元素的列表"}
                for stage in trait_data["stages"]:
                    if not isinstance(stage, dict) or "title" not in stage or "description" not in stage:
                        return {"valid": False, "message": f"{trait_name} 的 stage 应该包含 title 和 description"}
        
        return {"valid": True, "message": "优劣混合分析数据结构正确"}
    
    elif prompt_name == "思维导图呈现":
        required_fields = ["core_theme", "life_structure", "development_timeline"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return {"valid": False, "message": f"缺少必需字段: {', '.join(missing_fields)}"}
        return {"valid": True, "message": "思维导图呈现数据结构正确"}
    
    elif prompt_name == "运势预测报告":
        required_fields = ["overall_trend", "quarterly_forecast", "key_timing", "life_areas"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return {"valid": False, "message": f"缺少必需字段: {', '.join(missing_fields)}"}
        return {"valid": True, "message": "运势预测报告数据结构正确"}
    
    elif prompt_name == "个性化建议":
        required_fields = ["introduction", "life_guidance"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return {"valid": False, "message": f"缺少必需字段: {', '.join(missing_fields)}"}
        return {"valid": True, "message": "个性化建议数据结构正确"}
    
    else:
        # 通用验证
        return {"valid": True, "message": f"未知模块 {prompt_name}，跳过验证"}

@router.post("/test/update-prompt")
async def update_prompt(request: dict):
    """更新prompt内容"""
    try:
        prompt_key = request.get("prompt_key")
        new_prompt = request.get("new_prompt")
        
        if not prompt_key or not new_prompt:
            return {"success": False, "error": "Missing prompt_key or new_prompt"}
        
        # 这里可以保存到文件或数据库，现在只是返回确认
        return {
            "success": True,
            "message": f"Prompt '{prompt_key}' updated successfully",
            "updated_prompt": new_prompt
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"更新prompt失败: {str(e)}"
        }

@router.post("/test/batch-test")
async def batch_test_prompts(request: dict):
    """批量测试所有prompt"""
    try:
        # 获取所有prompt
        prompts_response = await get_test_prompts()
        if not prompts_response.get("success"):
            return {"success": False, "error": "Failed to get prompts"}
        
        prompts = prompts_response["prompts"]
        results = {}
        
        # 逐个测试每个prompt
        for prompt_key, prompt_data in prompts.items():
            try:
                print(f"Testing prompt: {prompt_key}")
                
                # 调用AI API
                ai_response = await call_ai_api(prompt_data["prompt"])
                
                # 解析和验证
                parsed_data = None
                parse_error = None
                
                try:
                    if prompt_data["name"] != "上下文建立":
                        parsed_data = json.loads(ai_response)
                except json.JSONDecodeError as e:
                    parse_error = f"JSON解析失败: {str(e)}"
                
                validation_result = validate_response_structure(prompt_data["name"], parsed_data)
                
                results[prompt_key] = {
                    "success": True,
                    "prompt_name": prompt_data["name"],
                    "raw_response": ai_response,
                    "parsed_data": parsed_data,
                    "parse_error": parse_error,
                    "validation": validation_result,
                    "timestamp": datetime.now().isoformat()
                }
                
                # 添加延迟避免API调用过快
                await asyncio.sleep(1)
                
            except Exception as e:
                results[prompt_key] = {
                    "success": False,
                    "prompt_name": prompt_data["name"],
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
        
        # 生成测试报告
        total_tests = len(results)
        successful_tests = sum(1 for r in results.values() if r.get("success"))
        valid_responses = sum(1 for r in results.values() if r.get("validation", {}).get("valid"))
        
        report = {
            "total_tests": total_tests,
            "successful_tests": successful_tests,
            "valid_responses": valid_responses,
            "success_rate": round(successful_tests / total_tests * 100, 2),
            "validation_rate": round(valid_responses / total_tests * 100, 2),
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "results": results,
            "report": report
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"批量测试失败: {str(e)}"
        }

@router.post("/test/export-results")
async def export_test_results(request: dict):
    """导出测试结果"""
    try:
        results = request.get("results", {})
        export_format = request.get("format", "json")  # json, csv, txt
        
        if not results:
            return {"success": False, "error": "No results to export"}
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if export_format == "json":
            # JSON格式导出
            export_data = {
                "export_info": {
                    "timestamp": timestamp,
                    "total_prompts": len(results),
                    "export_format": "json"
                },
                "test_results": results
            }
            
            filename = f"ai_test_results_{timestamp}.json"
            content = json.dumps(export_data, ensure_ascii=False, indent=2)
            
        elif export_format == "csv":
            # CSV格式导出
            import io
            output = io.StringIO()
            
            # CSV头部
            headers = ["Prompt Key", "Prompt Name", "Success", "Validation Valid", "Parse Error", "Timestamp"]
            output.write(",".join(headers) + "\n")
            
            # CSV数据
            for key, result in results.items():
                row = [
                    key,
                    result.get("prompt_name", ""),
                    str(result.get("success", False)),
                    str(result.get("validation", {}).get("valid", False)),
                    result.get("parse_error", "").replace(",", ";"),
                    result.get("timestamp", "")
                ]
                output.write(",".join(row) + "\n")
            
            filename = f"ai_test_results_{timestamp}.csv"
            content = output.getvalue()
            
        else:
            # TXT格式导出
            lines = [f"AI Prompt 测试结果报告 - {timestamp}", "=" * 50, ""]
            
            for key, result in results.items():
                lines.append(f"Prompt: {key}")
                lines.append(f"名称: {result.get('prompt_name', '')}")
                lines.append(f"成功: {'是' if result.get('success') else '否'}")
                lines.append(f"验证通过: {'是' if result.get('validation', {}).get('valid') else '否'}")
                if result.get("parse_error"):
                    lines.append(f"解析错误: {result['parse_error']}")
                lines.append(f"时间: {result.get('timestamp', '')}")
                lines.append("-" * 30)
            
            filename = f"ai_test_results_{timestamp}.txt"
            content = "\n".join(lines)
        
        return {
            "success": True,
            "filename": filename,
            "content": content,
            "format": export_format
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"导出失败: {str(e)}"
        }

@router.post("/test/compare-responses")
async def compare_responses(request: dict):
    """对比不同prompt的回答效果"""
    try:
        prompt_keys = request.get("prompt_keys", [])
        
        if len(prompt_keys) < 2:
            return {"success": False, "error": "至少需要选择2个prompt进行对比"}
        
        # 获取所有prompt
        prompts_response = await get_test_prompts()
        if not prompts_response.get("success"):
            return {"success": False, "error": "Failed to get prompts"}
        
        prompts = prompts_response["prompts"]
        comparison_results = {}
        
        for key in prompt_keys:
            if key not in prompts:
                continue
                
            prompt_data = prompts[key]
            
            # 测试这个prompt
            ai_response = await call_ai_api(prompt_data["prompt"])
            
            # 解析和分析
            parsed_data = None
            parse_error = None
            
            try:
                if prompt_data["name"] != "上下文建立":
                    parsed_data = json.loads(ai_response)
            except json.JSONDecodeError as e:
                parse_error = f"JSON解析失败: {str(e)}"
            
            validation_result = validate_response_structure(prompt_data["name"], parsed_data)
            
            # 计算回答质量指标
            response_length = len(ai_response)
            word_count = len(ai_response.split()) if ai_response else 0
            
            comparison_results[key] = {
                "prompt_name": prompt_data["name"],
                "response_length": response_length,
                "word_count": word_count,
                "validation_valid": validation_result.get("valid", False),
                "parse_success": parse_error is None,
                "raw_response": ai_response[:200] + "..." if len(ai_response) > 200 else ai_response,
                "full_response": ai_response,
                "parsed_data": parsed_data,
                "validation": validation_result
            }
        
        # 生成对比分析
        analysis = {
            "best_validation": max(comparison_results.items(), key=lambda x: x[1]["validation_valid"])[0],
            "longest_response": max(comparison_results.items(), key=lambda x: x[1]["response_length"])[0],
            "most_words": max(comparison_results.items(), key=lambda x: x[1]["word_count"])[0],
            "parse_success_count": sum(1 for r in comparison_results.values() if r["parse_success"]),
            "validation_success_count": sum(1 for r in comparison_results.values() if r["validation_valid"])
        }
        
        return {
            "success": True,
            "comparison_results": comparison_results,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"对比失败: {str(e)}"
        }

# ===== 专门的上下文测试功能 =====

class ContextTestRequest(BaseModel):
    context_mode: str  # "with_context" 或 "without_context"
    test_prompts: List[str]  # 要测试的prompt类型列表

class ContextTestResponse(BaseModel):
    success: bool
    context_mode: str
    results: Dict[str, Any]
    summary: Dict[str, Any]

@router.post("/test/context-test", response_model=ContextTestResponse)
async def context_test(request: ContextTestRequest):
    """专门的上下文测试功能"""
    try:
        # 临时修改context_available设置
        global context_available_for_test
        context_available_for_test = request.context_mode == "with_context"
        
        # 获取所有prompt
        prompts_response = await get_test_prompts()
        if not prompts_response.get("success"):
            raise HTTPException(status_code=500, detail="Failed to get prompts")
        
        prompts = prompts_response["prompts"]
        test_results = {}
        
        # 测试指定的prompts
        for prompt_key in request.test_prompts:
            if prompt_key not in prompts:
                continue
                
            prompt_data = prompts[prompt_key]
            
            try:
                # 调用AI API
                ai_response = await call_ai_api_with_context_control(
                    prompt_data["prompt"], 
                    context_available_for_test
                )
                
                # 分析响应
                is_context_dependent = "请问你是否能够读取到我之前提供的完整命盘信息" in prompt_data["prompt"]
                expected_no_response = is_context_dependent and not context_available_for_test
                
                # 检查是否是预期的"否"回答
                is_no_response = ai_response.strip() == "否"
                
                # 检查是否是有效的JSON响应
                is_valid_json = False
                parsed_data = None
                try:
                    if ai_response != "否":
                        parsed_data = json.loads(ai_response)
                        is_valid_json = True
                except:
                    pass
                
                # 判断测试结果
                test_passed = False
                if expected_no_response:
                    test_passed = is_no_response
                else:
                    test_passed = is_valid_json or (prompt_key == "context_setup")
                
                test_results[prompt_key] = {
                    "prompt_name": prompt_data["name"],
                    "response": ai_response[:200] + "..." if len(ai_response) > 200 else ai_response,
                    "full_response": ai_response,
                    "is_context_dependent": is_context_dependent,
                    "expected_no_response": expected_no_response,
                    "is_no_response": is_no_response,
                    "is_valid_json": is_valid_json,
                    "test_passed": test_passed,
                    "parsed_data": parsed_data
                }
                
            except Exception as e:
                test_results[prompt_key] = {
                    "prompt_name": prompt_data["name"],
                    "error": str(e),
                    "test_passed": False
                }
        
        # 生成测试总结
        total_tests = len(test_results)
        passed_tests = sum(1 for r in test_results.values() if r.get("test_passed"))
        context_dependent_tests = sum(1 for r in test_results.values() if r.get("is_context_dependent"))
        no_responses = sum(1 for r in test_results.values() if r.get("is_no_response"))
        valid_json_responses = sum(1 for r in test_results.values() if r.get("is_valid_json"))
        
        summary = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "pass_rate": round(passed_tests / total_tests * 100, 2) if total_tests > 0 else 0,
            "context_dependent_tests": context_dependent_tests,
            "no_responses": no_responses,
            "valid_json_responses": valid_json_responses,
            "context_mode": request.context_mode,
            "context_available": context_available_for_test,
            "timestamp": datetime.now().isoformat()
        }
        
        return ContextTestResponse(
            success=True,
            context_mode=request.context_mode,
            results=test_results,
            summary=summary
        )
        
    except Exception as e:
        return ContextTestResponse(
            success=False,
            context_mode=request.context_mode,
            results={},
            summary={"error": str(e)}
        )

async def call_ai_api_with_context_control(prompt: str, context_available: bool) -> str:
    """带上下文控制的AI API调用"""
    print(f"调用AI API (上下文可用: {context_available})...")
    print(f"Prompt: {prompt[:200]}...")
    
    # 模拟API调用延迟
    await asyncio.sleep(1)
    
    # 检查是否是上下文建立类型的prompt
    if "请确认你已经理解了用户的完整命盘信息" in prompt and "请简单回复确认信息" in prompt:
        return "我已经充分理解了您的命盘信息，包括八字、紫微斗数和印度星盘的完整数据。作为一位资深命理分析师，我已经建立了对您个人命盘的深度理解，可以为您提供准确而专业的分析服务。请告诉我您希望了解哪个方面的分析。"
    
    # 检查是否是询问上下文的prompt
    if "请问你是否能够读取到我之前提供的完整命盘信息" in prompt:
        if not context_available:
            return "否"
        # 如果上下文可用，继续处理其他逻辑
    
    # 检查其他类型的prompt并返回相应响应
    if ("综合分析总结" in prompt and "summary" in prompt) or "整合四个维度的分析结果" in prompt or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "综合的分析总结" in prompt):
        result = {
            "summary": "综合四个维度的分析，您是一个具有强烈成就动机和优秀分析能力的个体。天赋优势突出，内驱力强劲，但需要关注情感表达和工作生活平衡的盲区。建议在发挥理性分析优势的同时，加强情感智慧的培养，通过系统性的成长规划实现全面发展。您的发展潜力巨大，关键在于平衡各方面的能力，形成更加完整和强大的个人竞争力。"
        }
        return json.dumps(result, ensure_ascii=False)
    elif ("天赋优势" in prompt and "stageSummary" in prompt) or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "分析我的天赋优势" in prompt):
        result = {
            "overview": "基于您的八字、紫微斗数和印度星盘的综合分析，您在天赋优势方面展现出独特的特质。您具备优秀的分析能力和逻辑思维，善于从复杂信息中提取关键要素。创造力丰富，能够在传统框架中找到创新的解决方案。沟通表达能力强，能够清晰地传达复杂概念。同时，您还具备很强的学习能力和适应性，能够快速掌握新知识和技能。",
            "stageSummary": ["天赋觉察", "优势识别", "潜能开发", "才能整合"],
            "recommendations": [
                "通过多元化尝试和深度反思，系统性地识别自己的核心天赋领域，建立天赋档案。",
                "通过实际项目和挑战来验证和强化已识别的优势，确认其在不同环境下的表现。",
                "制定具体的天赋发展计划，在日常工作和生活中有意识地运用和培养这些能力。",
                "将各项天赋整合为个人的核心竞争力，形成独特的价值创造体系和个人品牌。"
            ]
        }
        return json.dumps(result, ensure_ascii=False)
    elif ("内驱力" in prompt and "stageSummary" in prompt) or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "分析我的内驱力特征" in prompt):
        result = {
            "overview": "您的内驱力分析显示出强烈的成就导向和自我实现需求。您内心深处渴望通过自己的努力创造有意义的成果，对个人成长和能力提升有着持续的追求。价值观体系相对稳定，注重公平正义和诚信原则。在面对挑战时，您能够从内在找到持续的动力源泉，不容易被外界干扰所影响。同时，您也具备很强的责任感和使命感。",
            "stageSummary": ["动机探索", "驱力激发", "目标明确", "持续动力"],
            "recommendations": [
                "通过深度自我探索和价值观梳理，明确内心真正的渴望和驱动力来源。",
                "通过设定具有挑战性的目标和获得成就感，强化和激发内在的驱动力。",
                "将内在动机转化为具体可行的目标，确保目标与个人价值观高度一致。",
                "建立可持续的激励机制和支持系统，维持长期的行动力和热情。"
            ]
        }
        return json.dumps(result, ensure_ascii=False)
    elif ("命盘盲区" in prompt and "stageSummary" in prompt) or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "分析我的命盘盲区" in prompt):
        result = {
            "overview": "命盘分析显示您在某些领域存在需要关注的盲区。主要表现在情感表达和人际敏感度方面，有时可能过于理性而忽视他人的情感需求。在决策时容易过度分析而错失时机，对不确定性的容忍度相对较低。此外，在健康管理和工作生活平衡方面也需要更多关注，容易因为专注工作而忽视身心健康的维护。",
            "stageSummary": ["盲区识别", "风险评估", "改进策略", "防范提升"],
            "recommendations": [
                "通过360度反馈和自我观察，客观识别个人容易忽视的问题领域和行为模式。",
                "系统评估这些盲区可能带来的风险和负面影响，制定相应的应对预案。",
                "针对识别出的盲区制定具体的改进计划，逐步提升相关能力和意识。",
                "建立长期的监控机制和提醒系统，避免盲区问题的重复出现和恶化。"
            ]
        }
        return json.dumps(result, ensure_ascii=False)
    elif ("成长引导" in prompt and "stageSummary" in prompt) or ("请问你是否能够读取到我之前提供的完整命盘信息" in prompt and "为我提供成长引导" in prompt):
        result = {
            "overview": "您的成长引导分析显示出巨大的发展潜力和清晰的成长路径。建议重点关注领导力和影响力的培养，这将是您未来发展的重要方向。同时，跨领域的知识整合能力也是您的成长重点，能够帮助您在复杂环境中创造更大价值。在个人发展方面，建议平衡理性与感性，培养更全面的人格特质。持续学习和自我迭代将是您保持竞争优势的关键。",
            "stageSummary": ["成长规划", "能力提升", "实践应用", "全面发展"],
            "recommendations": [
                "制定系统的个人发展规划，明确短期和长期目标，建立成长里程碑。",
                "通过学习、培训和实践，重点提升领导力、沟通力等核心软技能。",
                "将所学知识和技能应用到实际项目中，通过实践验证和优化成长策略。",
                "追求全面而均衡的发展，在专业能力、人际关系、身心健康等方面协调提升。"
            ]
        }
        return json.dumps(result, ensure_ascii=False)
    
    return "未知的分析类型"

@router.get("/test/context-modes")
async def get_context_modes():
    """获取可用的上下文测试模式"""
    return {
        "success": True,
        "modes": [
            {
                "value": "with_context",
                "label": "模拟上下文可用",
                "description": "AI能够读取到之前建立的命盘上下文"
            },
            {
                "value": "without_context", 
                "label": "模拟上下文不可用",
                "description": "AI无法读取到之前的命盘数据"
            }
        ]
    }

@router.post("/test/toggle-context-test")
async def toggle_context_test(request: dict):
    """切换context测试模式"""
    global ENABLE_CONTEXT_TEST
    
    enable = request.get('enable', not ENABLE_CONTEXT_TEST)
    ENABLE_CONTEXT_TEST = enable
    
    return {
        "success": True,
        "message": f"Context测试模式已{'启用' if enable else '禁用'}",
        "current_mode": enable,
        "token_impact": {
            "with_test": "每个prompt增加约60-80个中文字符",
            "without_test": "使用原始简化prompt"
        }
    }

@router.get("/test/context-test-status")
async def get_context_test_status():
    """获取当前context测试模式状态"""
    return {
        "enabled": ENABLE_CONTEXT_TEST,
        "description": "启用时会在每个prompt中添加context检测语句",
        "token_impact": {
            "enabled": "显著增加token使用量（约20-30%）",
            "disabled": "使用最优化的prompt，最小token消耗"
        }
    }

@router.get("/test/context-prompts")
async def get_context_testable_prompts():
    """获取可用于上下文测试的prompt列表"""
    return {
        "success": True,
        "prompts": [
            {
                "key": "context_setup",
                "name": "上下文建立",
                "context_dependent": False,
                "description": "建立命盘上下文，不依赖之前的上下文"
            },
            {
                "key": "talents",
                "name": "天赋优势分析", 
                "context_dependent": True,
                "description": "依赖上下文的天赋分析"
            },
            {
                "key": "motivation",
                "name": "内驱力分析",
                "context_dependent": True,
                "description": "依赖上下文的内驱力分析"
            },
            {
                "key": "blindspots",
                "name": "命盘盲区分析",
                "context_dependent": True,
                "description": "依赖上下文的盲区分析"
            },
            {
                "key": "growth",
                "name": "成长引导分析",
                "context_dependent": True,
                "description": "依赖上下文的成长引导"
            },
            {
                "key": "comprehensive",
                "name": "综合分析总结",
                "context_dependent": True,
                "description": "依赖上下文的综合分析"
            }
        ]
    }

@router.get("/test/get-backend-prompt/{prompt_key}")
async def get_backend_prompt(prompt_key: str):
    """获取后端prompt模板内容"""
    try:
        if prompt_key == "context_setup":
            # 上下文建立的prompt是在create_context_prompt函数中生成的
            sample_data = {
                "input": {"gender_str": "男", "birth_date": "1995-06-15", "birth_time": "14:30", "location_name": "上海"},
                "bazi": {"year_pillar": "乙亥", "month_pillar": "壬午", "day_pillar": "丁巳", "hour_pillar": "辛亥", "day_master": "丁火", "body_strength": "身弱", "five_elements": {}, "ten_gods": {}},
                "ziwei": {"命宫": {"宫位": "寅宫", "主星": ["紫微", "天府"]}, "身宫": "未知", "命主": "未知", "身主": "未知"},
                "vedic": {"ascendant_sign": "Virgo", "moon_sign": "Scorpio", "sun_sign": "Gemini", "planets": {}}
            }
            context_prompt = create_context_prompt(sample_data)
            return {
                "success": True,
                "prompt": context_prompt
            }
        elif prompt_key in DIMENSIONS_CONFIG:
            return {
                "success": True,
                "prompt": DIMENSIONS_CONFIG[prompt_key]['prompt_template']
            }
        else:
            return {
                "success": False,
                "error": f"未知的prompt key: {prompt_key}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/test/update-backend-prompt")
async def update_backend_prompt(request: dict):
    """更新后端prompt模板"""
    try:
        prompt_key = request.get("prompt_key")
        new_prompt = request.get("new_prompt")
        
        if not prompt_key or not new_prompt:
            return {
                "success": False,
                "error": "prompt_key和new_prompt都是必需的"
            }
        
        if prompt_key == "context_setup":
            return {
                "success": False,
                "error": "上下文建立的prompt是动态生成的，不支持直接修改"
            }
        elif prompt_key in DIMENSIONS_CONFIG:
            # 更新DIMENSIONS_CONFIG中的prompt模板
            DIMENSIONS_CONFIG[prompt_key]['prompt_template'] = new_prompt
            return {
                "success": True,
                "message": f"成功更新 {DIMENSIONS_CONFIG[prompt_key]['title']} 的prompt模板"
            }
        else:
            return {
                "success": False,
                "error": f"未知的prompt key: {prompt_key}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
        }

def create_dynamic_prompt(user_data: Dict[str, Any], dimension_id: str) -> str:
    """为指定维度创建包含用户数据的动态prompt"""
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
    ziwei_detail = ""
    if 'chart' in ziwei:
        chart = ziwei['chart']
        basic_info = ziwei.get('basic_info', {})
        ziwei_detail = f"""
【紫微斗数详细分析】
基本信息：
- 农历日期：{basic_info.get('lunar_date', '未知')}
- 干支：{basic_info.get('chinese_date', '未知')}
- 命主：{basic_info.get('soul', '未知')}
- 身主：{basic_info.get('body', '未知')}
- 五行局：{basic_info.get('five_elements_class', '未知')}

十二宫详析："""
        
        if 'palaces' in chart:
            for palace_name, palace_data in chart['palaces'].items():
                major_stars = [star['name'] for star in palace_data.get('major_stars', [])]
                minor_stars = palace_data.get('minor_stars', [])
                ziwei_detail += f"""
{palace_name}宫：{palace_data.get('heavenly_stem', '')}{palace_data.get('earthly_branch', '')}
- 主星：{', '.join(major_stars) if major_stars else '无'}
- 辅星：{', '.join(minor_stars) if minor_stars else '无'}
- 身宫：{'是' if palace_data.get('is_body_palace') else '否'}"""
        
        # 四化信息
        if 'si_hua' in ziwei:
            si_hua = ziwei['si_hua']
            ziwei_detail += f"""
年干四化：
- 禄：{si_hua.get('禄', '未知')}
- 权：{si_hua.get('权', '未知')}
- 科：{si_hua.get('科', '未知')}
- 忌：{si_hua.get('忌', '未知')}"""
        elif 'four_transformations' in ziwei:
            # 备用四化信息字段
            four_trans = ziwei['four_transformations']
            ziwei_detail += f"""
年干四化：
- 禄：{four_trans.get('禄', '未知')}
- 权：{four_trans.get('权', '未知')} 
- 科：{four_trans.get('科', '未知')}
- 忌：{four_trans.get('忌', '未知')}"""
    
    # 印度星盘详细信息构建
    vedic_detail = ""
    if vedic:
        vedic_detail = f"""
【印度星盘详细分析】
星盘类型：{vedic.get('chart_type', '未知')}
岁差系统：{vedic.get('ayanamsa', {}).get('type', '未知')} ({vedic.get('ayanamsa', {}).get('value', '未知')}°)

上升点：{vedic.get('ascendant', {}).get('sign', '未知')} {vedic.get('ascendant', {}).get('lon', '未知')}°

行星位置详析："""
        
        if 'planets' in vedic:
            for planet_name, planet_data in vedic['planets'].items():
                vedic_detail += f"""
{planet_name}：{planet_data.get('sign', '未知')}座 第{planet_data.get('house', '未知')}宫 {planet_data.get('lon', '未知')}°"""
        
        # 轴点信息
        if 'axis_points' in vedic:
            vedic_detail += f"""
重要轴点："""
            for axis_name, axis_data in vedic['axis_points'].items():
                vedic_detail += f"""
{axis_name}：{axis_data.get('sign', '未知')}座 第{axis_data.get('house', '未知')}宫 {axis_data.get('lon', '未知')}°"""
    
    # 获取预测月份信息（仅用于运势预测）
    prediction_months = []
    current_month = ""
    if dimension_id == 'fortune_prediction':
        prediction_months, current_month = get_next_12_months()
    
    # 准备模板变量
    template_vars = {
        'gender_str': input_data.get('gender_str', '未知'),
        'birth_date': input_data.get('birth_date', ''),
        'birth_time': input_data.get('birth_time', ''),
        'true_solar_time_json': json.dumps(input_data.get('true_solar_time', {}), ensure_ascii=False),
        'location_name': input_data.get('location_name', '未知'),
        'longitude': input_data.get('longitude', '未知'),
        'latitude': input_data.get('latitude', '未知'),
        'timezone': timezone_info.get('timezone', '未知'),
        'utc_offset': timezone_info.get('utc_offset', '未知'),
        'year_pillar': bazi.get('year_pillar', '未知'),
        'month_pillar': bazi.get('month_pillar', '未知'),
        'day_pillar': bazi.get('day_pillar', '未知'),
        'hour_pillar': bazi.get('hour_pillar', '未知'),
        'day_master': bazi.get('day_master', '未知'),
        'body_strength': bazi.get('body_strength', '未知'),
        'five_elements_json': json.dumps(bazi.get('five_elements_count', {}), ensure_ascii=False),
        'ten_gods_json': json.dumps(bazi.get('ten_gods', {}), ensure_ascii=False),
        'bazi_detail': bazi_detail,
        'ziwei_detail': ziwei_detail,
        'vedic_detail': vedic_detail,
        'current_month': current_month,
        'prediction_months': prediction_months
    }
    
    # 获取维度配置
    dimension_config = DIMENSIONS_CONFIG.get(dimension_id)
    if not dimension_config:
        raise ValueError(f"无效的维度ID: {dimension_id}")
    
    # 格式化prompt模板
    prompt = dimension_config['prompt_template'].format(**template_vars)
    
    return prompt