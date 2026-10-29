from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import json
import os

# 如果有OpenAI API key，取消注释以下行
# import openai
# from openai import OpenAI

router = APIRouter()

class AnalysisRequest(BaseModel):
    chart_data: Dict[str, Any] = Field(..., description="三盘数据")
    analysis_type: str = Field(..., description="分析类型：personality, career, relationship, health, comprehensive")
    custom_question: Optional[str] = Field("", description="自定义问题")

class MindMapRequest(BaseModel):
    chart_data: Dict[str, Any] = Field(..., description="三盘数据")
    focus_area: Optional[str] = Field("comprehensive", description="关注领域")

@router.post("/chatgpt")
async def analyze_with_chatgpt(request: AnalysisRequest):
    """
    使用ChatGPT分析命盘数据
    
    注意：需要设置环境变量 OPENAI_API_KEY
    """
    try:
        # 检查是否配置了API key
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return {
                "success": False,
                "message": "未配置OpenAI API Key，请在环境变量中设置 OPENAI_API_KEY",
                "data": {
                    "analysis": "ChatGPT分析功能暂不可用，请配置API Key后使用。",
                    "suggestions": [
                        "在系统环境变量中设置 OPENAI_API_KEY",
                        "重启后端服务",
                        "或使用本地分析功能"
                    ]
                }
            }
        
        # TODO: 实现ChatGPT分析逻辑
        # client = OpenAI(api_key=api_key)
        
        # 构建分析提示
        analysis_prompt = _build_analysis_prompt(request.chart_data, request.analysis_type, request.custom_question)
        
        # 模拟分析结果（实际应该调用OpenAI API）
        mock_analysis = _generate_mock_analysis(request.analysis_type, request.chart_data)
        
        return {
            "success": True,
            "data": {
                "analysis": mock_analysis,
                "analysis_type": request.analysis_type,
                "timestamp": "2024-01-01T00:00:00Z",
                "source": "ChatGPT (模拟)"
            },
            "message": "分析完成（当前为模拟数据）"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"分析失败: {str(e)}"
        )

@router.post("/mindmap")
async def generate_mindmap(request: MindMapRequest):
    """
    生成命理分析思维导图数据（Mermaid格式）
    """
    try:
        # 提取关键信息
        chart_summary = _extract_chart_summary(request.chart_data)
        
        # 生成Mermaid思维导图
        mindmap_data = _generate_mermaid_mindmap(chart_summary, request.focus_area)
        
        return {
            "success": True,
            "data": {
                "mindmap": mindmap_data,
                "format": "mermaid",
                "focus_area": request.focus_area,
                "summary": chart_summary
            },
            "message": "思维导图生成成功"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"思维导图生成失败: {str(e)}"
        )

@router.post("/local-analysis")
async def local_analysis(request: AnalysisRequest):
    """
    本地规则分析（不依赖外部API）
    """
    try:
        analysis_result = _perform_local_analysis(request.chart_data, request.analysis_type)
        
        return {
            "success": True,
            "data": analysis_result,
            "message": "本地分析完成"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"本地分析失败: {str(e)}"
        )

def _build_analysis_prompt(chart_data: Dict[str, Any], analysis_type: str, custom_question: str = "") -> str:
    """构建ChatGPT分析提示"""
    
    base_prompt = f"""
    你是一位资深的命理分析师，精通八字、紫微斗数和印度占星。请基于以下三盘数据进行{analysis_type}分析：

    八字信息：{json.dumps(chart_data.get('bazi', {}), ensure_ascii=False, indent=2)}
    
    紫微斗数：{json.dumps(chart_data.get('ziwei', {}), ensure_ascii=False, indent=2)}
    
    印度星盘：{json.dumps(chart_data.get('vedic', {}), ensure_ascii=False, indent=2)}
    
    请从以下角度进行分析：
    1. 三盘相互印证的特点
    2. 各系统的核心信息
    3. 综合分析结论
    """
    
    if custom_question:
        base_prompt += f"\n\n特别关注：{custom_question}"
    
    analysis_templates = {
        "personality": "重点分析性格特点、天赋才能、心理倾向",
        "career": "重点分析事业发展、职业选择、工作运势",
        "relationship": "重点分析感情婚姻、人际关系、桃花运",
        "health": "重点分析健康状况、体质特点、养生建议",
        "comprehensive": "全面分析各个生活层面"
    }
    
    if analysis_type in analysis_templates:
        base_prompt += f"\n\n{analysis_templates[analysis_type]}"
    
    return base_prompt

def _generate_mock_analysis(analysis_type: str, chart_data: Dict[str, Any]) -> str:
    """生成模拟分析结果"""
    
    # 提取基本信息
    bazi_info = chart_data.get('bazi', {})
    ziwei_info = chart_data.get('ziwei', {})
    
    mock_templates = {
        "personality": f"""
        性格分析报告：
        
        根据您的八字和紫微斗数分析，您具有以下性格特点：
        
        1. 核心性格：
           - 八字显示您日主较强，具有独立自主的性格
           - 紫微斗数显示您的命宫主星组合体现出领导能力
        
        2. 天赋特质：
           - 思维敏捷，善于分析问题
           - 具有艺术天赋和审美能力
           - 人际交往能力较强
        
        3. 注意事项：
           - 有时过于追求完美
           - 需要注意情绪管理
           - 建议培养耐心和包容心
        """,
        
        "career": f"""
        事业发展分析：
        
        基于您的命盘特征，事业方面建议如下：
        
        1. 适合行业：
           - 金融、投资、管理类
           - 教育、咨询、策划类
           - 创意、设计、媒体类
        
        2. 发展时机：
           - 青年期（25-35岁）为事业发展黄金期
           - 中年期需要注意转型升级
        
        3. 成功要素：
           - 发挥沟通协调能力
           - 注重团队合作
           - 持续学习提升
        """,
        
        "comprehensive": f"""
        综合命理分析报告：
        
        1. 性格特征：独立自主，思维敏捷，具有领导潜质
        
        2. 事业发展：适合管理、金融、教育等行业，青年期为发展黄金期
        
        3. 感情婚姻：重视精神交流，理想化倾向，需要理解包容的伴侣
        
        4. 健康状况：总体良好，需注意心血管和消化系统保养
        
        5. 财运分析：理财能力较强，投资需谨慎，稳健为主
        
        6. 人际关系：社交能力强，贵人运不错，需要真诚待人
        """
    }
    
    return mock_templates.get(analysis_type, mock_templates["comprehensive"])

def _extract_chart_summary(chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """提取命盘关键信息摘要"""
    
    summary = {
        "bazi_summary": {},
        "ziwei_summary": {},
        "vedic_summary": {}
    }
    
    # 提取八字摘要
    bazi = chart_data.get('bazi', {})
    if bazi:
        summary["bazi_summary"] = {
            "four_pillars": bazi.get('四柱', ''),
            "day_master": bazi.get('日主', ''),
            "strength": bazi.get('身强身弱', ''),
            "five_elements": bazi.get('五行分布', {})
        }
    
    # 提取紫微摘要
    ziwei = chart_data.get('ziwei', {})
    if ziwei:
        summary["ziwei_summary"] = {
            "life_palace": ziwei.get('命宫', ''),
            "body_palace": ziwei.get('身宫', ''),
            "major_stars": ziwei.get('主星分布', {}),
            "destiny_class": ziwei.get('命理等级', '')
        }
    
    # 提取印度星盘摘要
    vedic = chart_data.get('vedic', {})
    if vedic:
        summary["vedic_summary"] = {
            "ascendant": vedic.get('上升星座', ''),
            "sun_sign": vedic.get('太阳星座', ''),
            "moon_sign": vedic.get('月亮星座', ''),
            "planetary_positions": vedic.get('行星位置', {})
        }
    
    return summary

def _generate_mermaid_mindmap(chart_summary: Dict[str, Any], focus_area: str) -> str:
    """生成Mermaid思维导图"""
    
    mindmap = """mindmap
  root((命理分析))
    八字系统
      四柱信息
        年柱
        月柱
        日柱
        时柱
      五行分析
        五行分布
        强弱分析
        用神忌神
    紫微斗数
      十二宫
        命宫
        财帛宫
        官禄宫
        田宅宫
      主星分布
        紫微星
        天机星
        太阳星
      四化飞星
        化禄
        化权
        化科
        化忌
    印度星盘
      十二星座
        白羊座
        金牛座
        双子座
        巨蟹座
      行星位置
        太阳
        月亮
        水星
        金星
      宫位分析
        第一宫
        第二宫
        第七宫
        第十宫
    综合分析
      性格特征
        优点
        缺点
        潜能
      事业发展
        适合行业
        发展时机
        注意事项
      感情婚姻
        感情观
        婚姻运
        桃花运
      健康状况
        体质特点
        易患疾病
        养生建议"""
    
    return mindmap

def _perform_local_analysis(chart_data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
    """执行本地规则分析"""
    
    # 基于规则的简单分析
    analysis = {
        "summary": f"基于传统命理规则的{analysis_type}分析",
        "key_points": [],
        "suggestions": [],
        "confidence": "medium"
    }
    
    # 根据不同分析类型添加具体内容
    if analysis_type == "personality":
        analysis["key_points"] = [
            "性格独立自主，具有领导潜质",
            "思维敏捷，善于分析问题",
            "重视精神层面的追求"
        ]
        analysis["suggestions"] = [
            "发挥天赋优势，积极进取",
            "注意情绪管理，保持平和心态",
            "培养耐心和包容心"
        ]
    
    elif analysis_type == "career":
        analysis["key_points"] = [
            "适合从事管理、咨询类工作",
            "具有很好的沟通协调能力",
            "青年期为事业发展的关键时期"
        ]
        analysis["suggestions"] = [
            "选择与个人特质匹配的行业",
            "注重团队合作和人际关系",
            "持续学习，提升专业能力"
        ]
    
    return analysis 