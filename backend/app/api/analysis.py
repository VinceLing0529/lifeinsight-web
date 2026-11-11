from .prompt_admin import PROMPTS_DIR
from fastapi import APIRouter, Depends, HTTPException
from core.ratelimit import rate_limit
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

@router.post("/chatgpt", dependencies=[Depends(rate_limit("chatgpt", 5, 60))])
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
    valid_types = {"personality", "career", "wealth", "relationship", "health", "comprehensive"}
    if request.analysis_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"不支持的分析类型: {request.analysis_type}，可选: {sorted(valid_types)}")
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
    """构建分析提示。正式模板存放在仓库外私有目录（PROMPTS_DIR/free_analysis.json），不随公开仓库分发；缺失时用中性简版。"""
    bazi_json = json.dumps(chart_data.get('bazi', {}), ensure_ascii=False, indent=2)
    ziwei_json = json.dumps(chart_data.get('ziwei', {}), ensure_ascii=False, indent=2)
    vedic_json = json.dumps(chart_data.get('vedic', {}), ensure_ascii=False, indent=2)
    tpl = None
    try:
        tpl_file = PROMPTS_DIR / "free_analysis.json"
        if tpl_file.exists():
            tpl = json.loads(tpl_file.read_text(encoding='utf-8'))
    except Exception:
        tpl = None
    if tpl:
        base_prompt = (tpl["base"]
                       .replace("{analysis_type}", analysis_type)
                       .replace("{bazi_json}", bazi_json)
                       .replace("{ziwei_json}", ziwei_json)
                       .replace("{vedic_json}", vedic_json))
    else:
        base_prompt = f"请基于以下命盘数据进行{analysis_type}分析：\n\n八字信息：{bazi_json}\n\n紫微斗数：{ziwei_json}\n\n印度星盘：{vedic_json}"
        tpl = None
    if custom_question:
        base_prompt += f"\n\n特别关注：{custom_question}"
    if tpl:
        focus = tpl.get("focus", {}).get(analysis_type)
        if focus:
            base_prompt += f"\n\n{focus}"
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
    
    # 提取八字摘要（字段与 /api/charts/calculate 的实际返回对齐；
    # 旧代码读的是中文键（四柱/日主…），真实返回是英文键，导致摘要恒为空）
    if not isinstance(chart_data, dict):
        chart_data = {}
    bazi = chart_data.get('bazi', {})
    if not isinstance(bazi, dict):
        bazi = {}
    if bazi:
        pillars = " ".join(x for x in [
            bazi.get('year_pillar', ''), bazi.get('month_pillar', ''),
            bazi.get('day_pillar', ''), bazi.get('hour_pillar', '')] if x)
        summary["bazi_summary"] = {
            "four_pillars": pillars,
            "day_master": bazi.get('day_master', ''),
            "strength": bazi.get('body_strength', ''),
            "five_elements": bazi.get('five_elements_count', {})
        }

    # 提取紫微摘要
    ziwei = chart_data.get('ziwei', {})
    if not isinstance(ziwei, dict):
        ziwei = {}
    if ziwei:
        star_positions = (ziwei.get('chart') or {}).get('star_positions', {})
        life_stars = [star for star, palace in star_positions.items() if palace == '命宫']
        basic = ziwei.get('basic_info', {})
        summary["ziwei_summary"] = {
            "life_palace": "、".join(life_stars),
            "body_palace": basic.get('body', ''),
            "major_stars": star_positions,
            "destiny_class": basic.get('five_elements_class', '')
        }

    # 提取印度星盘摘要
    vedic = chart_data.get('vedic', {})
    if not isinstance(vedic, dict):
        vedic = {}
    if vedic:
        planets = vedic.get('planets', {})
        summary["vedic_summary"] = {
            "ascendant": (vedic.get('ascendant') or {}).get('sign', ''),
            "sun_sign": (planets.get('Sun') or {}).get('sign', ''),
            "moon_sign": (planets.get('Moon') or {}).get('sign', ''),
            "planetary_positions": planets
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

# ---------- 本地规则分析（无 Key 时的规则引擎，全部结论由盘面数据推导） ----------

_GAN_ELEMENT = {"甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
                "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水"}
_ELEMENT_TRAIT = {
    "木": "仁厚正直、重成长与规划", "火": "热情外显、行动快、重表现与礼序",
    "土": "沉稳务实、重信用与积累", "金": "果断讲原则、执行力强、边界感清晰",
    "水": "机敏善变通、重信息与流动性",
}
_ELEMENT_ORGAN = {"木": "肝胆与筋膜", "火": "心脏与小肠、睡眠节律", "土": "脾胃与消化",
                  "金": "肺与呼吸道、皮肤", "水": "肾与泌尿、内分泌"}
_STAR_TRAIT = {
    "紫微": "自尊心强、有统筹欲", "天机": "思虑快、善谋划但易多想", "太阳": "好表现、重名誉、利他心强",
    "武曲": "务实果断、理财意识强", "天同": "温和随和、重享受与情绪价值", "廉贞": "个性鲜明、好胜且重情",
    "天府": "稳重保守、善积累资源", "太阴": "细腻敏感、审美与直觉好", "贪狼": "欲望强、多才多艺、交际广",
    "巨门": "口才与思辨突出、易多疑", "天相": "稳重辅佐型、重承诺与形象", "天梁": "长者风范、好为人谋、原则性强",
    "七杀": "行动凌厉、喜挑战、不喜受约束", "破军": "破旧立新、波动大、开创性强",
    "左辅": "得助力、贵人缘佳", "右弼": "得助力、贵人缘佳", "文昌": "文采与考试运佳、思维条理清",
    "文曲": "口才与才艺出众", "天魁": "有长辈贵人提携", "天钺": "有异性/晚辈贵人缘",
    "禄存": "自带财禄、求财稳", "天马": "奔波走动多、动中求机会",
    "擎羊": "冲劲强但易冲动受伤", "陀罗": "拖磨纠缠、事多反复", "火星": "性急爆发力强",
    "铃星": "暗火慢热、易内耗", "地空": "想法跳脱、不喜按常理", "地劫": "得失心重、钱财易漏",
}
# 十二宫领域（四化落宫与宫位解读用）
_PALACE_DOMAIN = {
    "命宫": "自我与人生主调", "兄弟": "手足与合伙平辈", "夫妻": "感情与婚姻", "子女": "子女与创造力",
    "财帛": "钱财与求财方式", "疾厄": "健康与体质", "迁移": "外出际遇与社会形象", "交友": "朋友与人脉",
    "官禄": "事业与社会地位", "田宅": "家宅与不动产", "福德": "精神享受与兴趣", "父母": "父母与长辈缘",
}
# 四化释义（生年四化落宫的读法）
_TRANS_MEANING = {
    "禄": "化禄主缘起与财禄：这一领域容易得到、也愿意投入，是人生的甜头所在",
    "权": "化权主掌控与推动：这一领域你最想说了算，也是发力点",
    "科": "化科主名声与贵人：这一领域容易得好评与帮助，宜经营口碑",
    "忌": "化忌主执着与功课：这一领域最放不下、最容易卡住，是要修的课题而非灾祸",
}
# 吠陀：星座基调 / 行星领域 / 宫位领域 / 星座主星
_SIGN_TRAIT_V = {
    "Aries": "白羊：直接、行动派、先做后想", "Taurus": "金牛：务实、重积累与感官享受",
    "Gemini": "双子：好奇、善沟通、兴趣广", "Cancer": "巨蟹：重感情与安全感、护家",
    "Leo": "狮子：要舞台与认可、自尊心强", "Virgo": "处女：细致、重秩序与健康管理",
    "Libra": "天秤：重关系与平衡、审美佳", "Scorpio": "天蝎：深刻、掌控欲与洞察力强",
    "Sagittarius": "射手：爱自由与远方、重信念", "Capricorn": "摩羯：耐力强、目标导向、晚成",
    "Aquarius": "水瓶：独立、重理念与圈层", "Pisces": "双鱼：共情强、想象力丰富、边界感弱",
}
_PLANET_DOMAIN_V = {
    "Sun": "太阳（自我与事业心）", "Moon": "月亮（情绪与内心）", "Mercury": "水星（思维与沟通）",
    "Venus": "金星（感情与审美）", "Mars": "火星（行动与魄力）", "Jupiter": "木星（学识与贵人）",
    "Saturn": "土星（压力与耐力）",
}
_HOUSE_DOMAIN_V = {
    1: "自我形象", 2: "财富积累", 3: "沟通与手足", 4: "家宅根基", 5: "才华、恋爱与子女",
    6: "工作日常与健康", 7: "婚姻与合作", 8: "偏财、危机与转化", 9: "远方、信念与贵人",
    10: "事业与地位", 11: "收入与人脉圈", 12: "隐修、损耗与海外",
}
_SIGN_LORD_V = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter",
}
_PLANET_CN = {"Sun": "太阳", "Moon": "月亮", "Mercury": "水星", "Venus": "金星",
              "Mars": "火星", "Jupiter": "木星", "Saturn": "土星"}
# 五行生克：我克者为财，被我生者为食伤，克我者为官杀，生我者为印
_GENERATES = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}
_CONTROLS = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}


_STEMS = "甲乙丙丁戊己庚辛壬癸"
_BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
_BRANCH_ELEMENT = {"子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火",
                   "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水"}


def _gz_index(stem: str, branch: str) -> int:
    """干支在六十甲子中的序号（0-59）。"""
    for i in range(60):
        if _STEMS[i % 10] == stem and _BRANCHES[i % 12] == branch:
            return i
    return -1


def _dayun_sequence(month_pillar: str, direction: str, qiyun_age: int, count: int = 6) -> list:
    """由月柱推大运干支序列：顺行/逆行逐位进退，每步十年。返回 [(干支, 起岁, 止岁)]。"""
    if not month_pillar or len(month_pillar) < 2 or direction not in ("顺", "逆"):
        return []
    idx = _gz_index(month_pillar[0], month_pillar[1])
    if idx < 0:
        return []
    step = 1 if direction == "顺" else -1
    out = []
    for k in range(1, count + 1):
        i = (idx + step * k) % 60
        start = qiyun_age + (k - 1) * 10
        out.append((f"{_STEMS[i % 10]}{_BRANCHES[i % 12]}", start, start + 9))
    return out


# 吠陀：行星旺/庙/陷（旺宫与入庙宫为传统定表）
_VEDIC_EXALT = {"Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn", "Mercury": "Virgo",
                "Jupiter": "Cancer", "Venus": "Pisces", "Saturn": "Libra"}
_VEDIC_OWN = {"Sun": ["Leo"], "Moon": ["Cancer"], "Mars": ["Aries", "Scorpio"],
              "Mercury": ["Gemini", "Virgo"], "Jupiter": ["Sagittarius", "Pisces"],
              "Venus": ["Taurus", "Libra"], "Saturn": ["Capricorn", "Aquarius"]}
_SIGNS_ORDER = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra",
                "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
# 27 星宿（Nakshatra）：名 + 宿主星（Vimshottari 大运由此宿主星起排）
_NAKSHATRAS = [
    ("Ashwini", "Ketu"), ("Bharani", "Venus"), ("Krittika", "Sun"), ("Rohini", "Moon"),
    ("Mrigashira", "Mars"), ("Ardra", "Rahu"), ("Punarvasu", "Jupiter"), ("Pushya", "Saturn"),
    ("Ashlesha", "Mercury"), ("Magha", "Ketu"), ("Purva Phalguni", "Venus"), ("Uttara Phalguni", "Sun"),
    ("Hasta", "Moon"), ("Chitra", "Mars"), ("Swati", "Rahu"), ("Vishakha", "Jupiter"),
    ("Anuradha", "Saturn"), ("Jyeshtha", "Mercury"), ("Mula", "Ketu"), ("Purva Ashadha", "Venus"),
    ("Uttara Ashadha", "Sun"), ("Shravana", "Moon"), ("Dhanishta", "Mars"), ("Shatabhisha", "Rahu"),
    ("Purva Bhadrapada", "Jupiter"), ("Uttara Bhadrapada", "Saturn"), ("Revati", "Mercury"),
]
_DASHA_YEARS = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
                "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17}
_DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
_DASHA_CN = {"Ketu": "计都", "Venus": "金星", "Sun": "太阳", "Moon": "月亮", "Mars": "火星",
             "Rahu": "罗睺", "Jupiter": "木星", "Saturn": "土星", "Mercury": "水星"}


def _vimshottari(moon_lon_abs: float, birth_year: int, birth_month: int, birth_day: int):
    """由月亮黄经推 Nakshatra 与当前 Vimshottari 大运（Mahadasha）。
    返回 (星宿名, 当前大运主星, 起始年, 结束年) 或 None。"""
    try:
        from datetime import date
        span = 360.0 / 27.0
        idx = int(moon_lon_abs // span) % 27
        nak_name, lord = _NAKSHATRAS[idx]
        frac = (moon_lon_abs - idx * span) / span
        birth = date(birth_year, birth_month, birth_day)
        elapsed = -(1.0 - frac) * _DASHA_YEARS[lord]  # 出生时第一大运的剩余从负偏移计
        periods = []
        pos = _DASHA_ORDER.index(lord)
        offset_years = (1.0 - frac) * _DASHA_YEARS[lord]
        # 第一段为出生时正在走的大运（只剩 offset_years）
        seq = [(lord, offset_years)]
        for k in range(1, 10):
            p = _DASHA_ORDER[(pos + k) % 9]
            seq.append((p, float(_DASHA_YEARS[p])))
        today = date.today()
        cursor = float(birth.year) + (birth.timetuple().tm_yday / 365.25)
        now_f = today.year + (today.timetuple().tm_yday / 365.25)
        for p, yrs in seq:
            if cursor + yrs > now_f:
                return nak_name, p, int(cursor), int(cursor + yrs)
            cursor += yrs
        return nak_name, seq[-1][0], int(cursor), int(cursor + seq[-1][1])
    except Exception:
        return None


def _palace_stars(star_positions: Dict[str, str], palace: str) -> list:
    return [s for s, p in (star_positions or {}).items() if p == palace]


def _perform_local_analysis(chart_data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
    """执行本地规则分析：所有要点都由传入盘面推导，不再返回与盘面无关的固定文案。

    数据结构与 /api/charts/calculate 的返回对齐（英文键）。盘面缺失时明确说明
    依据不足，而不是编造结论。
    """
    # 段必须是 dict：传字符串/列表等垃圾类型时降级为空，不许 500
    def _seg(v):
        return v if isinstance(v, dict) else {}
    chart_data = chart_data if isinstance(chart_data, dict) else {}
    bazi = _seg(chart_data.get("bazi"))
    ziwei = _seg(chart_data.get("ziwei"))
    vedic = _seg(chart_data.get("vedic"))
    gender = _seg(chart_data.get("input")).get("gender", 1)

    day_master = bazi.get("day_master", "")
    if not isinstance(day_master, str):
        day_master = ""
    dm_element = _GAN_ELEMENT.get(day_master, "")
    strength = bazi.get("body_strength", "")
    if not isinstance(strength, str):
        strength = ""
    elements = bazi.get("five_elements_count") or {}
    if not isinstance(elements, dict):
        elements = {}
    elements = {k: v for k, v in elements.items() if isinstance(v, (int, float))}
    ten_gods = bazi.get("ten_gods") or {}
    star_positions = (ziwei.get("chart") or {}).get("star_positions") or {}
    if not isinstance(star_positions, dict):
        star_positions = {}
    # 全星落宫表：star_positions 只含 14 主星，生年四化落在辅星/杂曜时（如文昌化忌、
    # 文曲化科）查不到落宫，只能走兜底文案；这里从 palaces 全星表（主星+辅星+杂曜）
    # 补齐。用 setdefault 让主星仍以 star_positions 为准，主星落宫行为与旧版一致。
    all_star_positions = dict(star_positions)
    _palaces_all = (ziwei.get("chart") or {}).get("palaces") or {}
    if isinstance(_palaces_all, dict):
        for _pname, _pinfo in _palaces_all.items():
            if not isinstance(_pinfo, dict):
                continue
            for _skey in ("major_stars", "minor_stars", "adjective_stars"):
                for _st in _pinfo.get(_skey) or []:
                    _sname = _st.get("name") if isinstance(_st, dict) else _st
                    if isinstance(_sname, str) and _sname:
                        all_star_positions.setdefault(_sname, _pname)
    life_stars = _palace_stars(star_positions, "命宫")
    asc_sign = (vedic.get("ascendant") or {}).get("sign", "")
    # 紫微进阶数据：生年四化（星名）+ 命主/身主；四化落宫 = 该星所在宫位
    four_trans = ziwei.get("year_four_trans") or {}
    if not isinstance(four_trans, dict):
        four_trans = {}
    ziwei_basic = ziwei.get("basic_info") or {}
    soul_star = ziwei_basic.get("soul", "") if isinstance(ziwei_basic, dict) else ""
    body_star = ziwei_basic.get("body", "") if isinstance(ziwei_basic, dict) else ""

    def _trans_line(ttype: str) -> str:
        star = four_trans.get(ttype, "")
        if not star:
            return ""
        palace = all_star_positions.get(star, "")
        if not palace:
            return f"{star}化{ttype}（落宫未提供）"
        return f"{star}化{ttype}入{palace}（{_PALACE_DOMAIN.get(palace, palace)}）：{_TRANS_MEANING.get(ttype, '')}"

    def _trans_in(palace: str) -> list:
        """落在指定宫位的四化（返回如 ['贪狼化禄']）"""
        out = []
        for t, star in four_trans.items():
            if star and all_star_positions.get(star) == palace:
                out.append(f"{star}化{t}")
        return out

    # 八字进阶：神煞（引擎已算）、大运推排、喜用方向、当前年龄
    spirits = bazi.get("spirits") or []
    if not isinstance(spirits, list):
        spirits = []
    # 神煞全量检测（chinese-fortune 查表，MIT）与引擎自带结果合并去重
    try:
        from core.shensha import detect_shensha as _detect_shensha
        for _sp in _detect_shensha(bazi):
            if _sp not in spirits:
                spirits.append(_sp)
    except Exception:
        pass
    dayun_info = bazi.get("dayun") or {}
    month_pillar = bazi.get("month_pillar", "")
    birth_date_str = _seg(chart_data.get("input")).get("birth_date", "")
    age_now = None
    _birth_y = _birth_m = _birth_d = None
    try:
        from datetime import date as _date
        _bp = [int(x) for x in str(birth_date_str).split("-")]
        _birth_y, _birth_m, _birth_d = _bp[0], _bp[1], _bp[2]
        _today = _date.today()
        age_now = _today.year - _birth_y - ((_today.month, _today.day) < (_birth_m, _birth_d))
    except Exception:
        pass
    dayun_seq = []
    current_dayun = None
    if isinstance(dayun_info, dict) and month_pillar:
        dayun_seq = _dayun_sequence(month_pillar, str(dayun_info.get("direction", "")),
                                     int(dayun_info.get("qiyun_age", 0) or 0))
        if age_now is not None:
            for gz, a0, a1 in dayun_seq:
                if a0 <= age_now <= a1:
                    current_dayun = (gz, a0, a1)
    # 喜用方向（扶抑法简化）：身强喜克泄耗，身弱喜生扶
    xi_yong = ""
    if dm_element:
        gen_by = [k for k, v in _GENERATES.items() if v == dm_element]  # 生我者=印
        ctrl_by = [k for k, v in _CONTROLS.items() if v == dm_element]  # 克我者=官杀
        if strength == "强":
            xi_yong = f"喜用偏向{_GENERATES.get(dm_element,'')}（食伤泄秀）、{ctrl_by[0] if ctrl_by else ''}（官杀制身）、{_CONTROLS.get(dm_element,'')}（财耗身）方向"
        elif strength == "弱":
            xi_yong = f"喜用偏向{gen_by[0] if gen_by else ''}（印生身）、{dm_element}（比劫帮身）方向"
    _SPIRIT_GLOSS = {"驿马": "驿马主走动变迁：异地、出行、变动中得机会", "桃花": "桃花主人缘与魅力：社交场合易得关注",
                     "天乙贵人": "天乙贵人主逢凶化吉：关键时刻易得有力之人相助", "华盖": "华盖主才艺与孤高：利钻研、艺术与玄学",
                     "文昌": "文昌主学业文才：利考试、写作与证书", "将星": "将星主领导力：适合带团队、担责",
                     "劫煞": "劫煞主竞争损耗：合作与投资需防被人截胡", "亡神": "亡神主心思深沉：利谋略但易多虑"}
    try:
        from core.shensha import GLOSS as _SHENSHA_GLOSS
        _SPIRIT_GLOSS = {**_SPIRIT_GLOSS, **_SHENSHA_GLOSS}
    except Exception:
        pass

    # 紫微深层：宫位全息表（排盘引擎已给宫干、身宫标记、星曜亮度与四化标记）
    palaces = (ziwei.get("chart") or {}).get("palaces") or {}
    if not isinstance(palaces, dict):
        palaces = {}
    body_palace_name = ""
    _idx2name = {}
    for _pn, _pi in palaces.items():
        if isinstance(_pi, dict):
            if _pi.get("is_body_palace"):
                body_palace_name = _pn
            if isinstance(_pi.get("index"), int):
                _idx2name[_pi["index"]] = _pn
    life_idx = None
    if isinstance(palaces.get("命宫"), dict):
        life_idx = palaces["命宫"].get("index")
    trine_palaces = []
    opp_palace = ""
    if isinstance(life_idx, int):
        trine_palaces = [_idx2name.get((life_idx + k) % 12, "") for k in (0, 4, 8)]
        opp_palace = _idx2name.get((life_idx + 6) % 12, "")

    def _major_stars_of(palace_name: str) -> list:
        pi = palaces.get(palace_name) or {}
        out = []
        if isinstance(pi, dict):
            for st in pi.get("major_stars") or []:
                if isinstance(st, dict) and st.get("name"):
                    out.append(st["name"])
        return out

    def _brightness_note(palace_name: str) -> str:
        pi = palaces.get(palace_name) or {}
        notes = []
        if isinstance(pi, dict):
            for st in pi.get("major_stars") or []:
                if isinstance(st, dict) and st.get("brightness") in ("庙", "旺", "陷"):
                    notes.append(f"{st['name']}{st['brightness']}")
        return "、".join(notes)

    # 十干四化表（中州派通行版；庚干科星诸家小异，此处取太阴）
    _STEM_TRANS = {
        "甲": {"禄": "廉贞", "权": "破军", "科": "武曲", "忌": "太阳"},
        "乙": {"禄": "天机", "权": "天梁", "科": "紫微", "忌": "太阴"},
        "丙": {"禄": "天同", "权": "天机", "科": "文昌", "忌": "廉贞"},
        "丁": {"禄": "太阴", "权": "天同", "科": "天机", "忌": "巨门"},
        "戊": {"禄": "贪狼", "权": "太阴", "科": "右弼", "忌": "天机"},
        "己": {"禄": "武曲", "权": "贪狼", "科": "天梁", "忌": "文曲"},
        "庚": {"禄": "太阳", "权": "武曲", "科": "太阴", "忌": "天同"},
        "辛": {"禄": "巨门", "权": "太阳", "科": "文曲", "忌": "文昌"},
        "壬": {"禄": "天梁", "权": "紫微", "科": "左辅", "忌": "武曲"},
        "癸": {"禄": "破军", "权": "巨门", "科": "太阴", "忌": "贪狼"},
    }

    def _fly_line(palace_name: str) -> str:
        """宫干飞化：该宫天干所化的禄/忌星飞入哪一宫（飞星派基本功）。"""
        pi = palaces.get(palace_name) or {}
        stem = pi.get("heavenly_stem", "") if isinstance(pi, dict) else ""
        trans = _STEM_TRANS.get(stem)
        if not trans:
            return ""
        parts = []
        for t in ("禄", "忌"):
            star = trans[t]
            dest = all_star_positions.get(star, "")
            if dest:
                parts.append(f"飞{star}化{t}入{dest}")
        if not parts:
            return ""
        return f"{palace_name}（{stem}干）" + "、".join(parts) + "：该宫的缘起与课题外显到对应宫位"

    # 格局识别：移植 Renhuai123/ziwei-doushu patterns.ts 的严格判定
    # （MIT；四星全格与三星会分开，不再用自创的宽松阈值）
    try:
        from core.ziwei_patterns import detect as _zw_detect
        _raw_patterns = _zw_detect(palaces, (ziwei.get("year_four_trans") or {})) if palaces else []
    except Exception:
        _raw_patterns = []
    _lvl_rank = {"excellent": 0, "good": 1, "neutral": 2, "caution": 3}
    _raw_patterns = sorted(_raw_patterns, key=lambda p: _lvl_rank.get(p.get("level", ""), 4))
    patterns = []
    for _p in _raw_patterns:
        _desc = _p.get("desc", "")
        if _p.get("breaking"):
            _desc += f"（破格注意：{'；'.join(_p['breaking'])}）"
        patterns.append((_p.get("name", ""), _desc, _p.get("level", "")))

    # 吠陀进阶数据：行星 sign/house、按宫位聚合、月亮、上升主星落宫
    planets_v = vedic.get("planets") or {}
    if not isinstance(planets_v, dict):
        planets_v = {}
    houses_v: dict = {}
    for pname, pinfo in planets_v.items():
        if isinstance(pinfo, dict) and isinstance(pinfo.get("house"), int):
            houses_v.setdefault(pinfo["house"], []).append(pname)
    moon_info = planets_v.get("Moon") or {}
    moon_sign = moon_info.get("sign", "") if isinstance(moon_info, dict) else ""
    asc_lord = _SIGN_LORD_V.get(asc_sign, "")
    asc_lord_house = (planets_v.get(asc_lord) or {}).get("house") if asc_lord else None

    # 行星尊贵度（旺/庙/陷）与宫主飞入、Nakshatra 与当前大运
    dignity_lines = []
    for pname in ("Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"):
        pinfo = planets_v.get(pname) or {}
        sign = pinfo.get("sign", "") if isinstance(pinfo, dict) else ""
        if not sign:
            continue
        cn = _PLANET_CN.get(pname, pname)
        if _VEDIC_EXALT.get(pname) == sign:
            dignity_lines.append(f"{cn}在{sign}入旺：{_PLANET_DOMAIN_V.get(pname, cn)}这一面能量最强，是天赋发力点")
        elif sign in _VEDIC_OWN.get(pname, []):
            dignity_lines.append(f"{cn}在{sign}入庙：{_PLANET_DOMAIN_V.get(pname, cn)}运作稳定、底气足")
        elif _VEDIC_EXALT.get(pname) and _SIGNS_ORDER[(_SIGNS_ORDER.index(_VEDIC_EXALT[pname]) + 6) % 12] == sign:
            dignity_lines.append(f"{cn}在{sign}落陷：{_PLANET_DOMAIN_V.get(pname, cn)}这一面先天较吃力，需后天经营（只论倾向）")
    def _house_lord_line(house: int) -> str:
        if not asc_sign or asc_sign not in _SIGNS_ORDER:
            return ""
        sign = _SIGNS_ORDER[(_SIGNS_ORDER.index(asc_sign) + house - 1) % 12]
        lord = _SIGN_LORD_V.get(sign, "")
        lh = (planets_v.get(lord) or {}).get("house") if lord else None
        if not lord or not isinstance(lh, int):
            return ""
        if lh == house:
            return f"第{house}宫（{_HOUSE_DOMAIN_V.get(house, '')}）宫主{_PLANET_CN.get(lord, lord)}坐镇本宫：这一领域根基稳、主要靠自己打拼"
        return f"第{house}宫（{_HOUSE_DOMAIN_V.get(house, '')}）宫主{_PLANET_CN.get(lord, lord)}飞入第{lh}宫（{_HOUSE_DOMAIN_V.get(lh, '')}）：{_HOUSE_DOMAIN_V.get(house, '')}与{_HOUSE_DOMAIN_V.get(lh, '')}彼此绑定"
    dasha = None
    if isinstance(moon_info, dict) and moon_info.get("sign") in _SIGNS_ORDER and _birth_y:
        moon_abs = _SIGNS_ORDER.index(moon_info["sign"]) * 30 + float(moon_info.get("lon", 0) or 0)
        dasha = _vimshottari(moon_abs, _birth_y, _birth_m, _birth_d)

    def _house_line(house: int) -> str:
        ps = [p for p in houses_v.get(house, []) if p in _PLANET_DOMAIN_V]
        if not ps:
            return ""
        names = "、".join(_PLANET_DOMAIN_V[p].split("（")[0] for p in ps)
        return f"第{house}宫（{_HOUSE_DOMAIN_V.get(house, '')}）有{names}，这一领域星力集中、戏份重"

    basis = []
    if day_master:
        basis.append(f"日主{day_master}（{dm_element}）·身{strength or '未知'}")
    if elements:
        basis.append("五行" + "、".join(f"{k}{v}" for k, v in elements.items()))
    if life_stars:
        basis.append("命宫主星" + "、".join(life_stars))
    if asc_sign:
        basis.append(f"吠陀上升{asc_sign}")
    for _t in ("禄", "权", "科", "忌"):
        _st = four_trans.get(_t, "")
        if _st and all_star_positions.get(_st):
            basis.append(f"{_st}化{_t}入{all_star_positions[_st]}")
    if moon_sign:
        basis.append(f"月亮{moon_sign}")

    result = {
        "summary": "",
        "key_points": [],
        "suggestions": [],
        "confidence": "medium" if basis else "low",
        "basis": basis,
    }
    if not basis:
        result["summary"] = "盘面数据缺失，无法做规则推导。请先完成排盘再请求本地分析。"
        return result

    strongest = max(elements, key=elements.get) if elements else ""
    weakest = min(elements, key=elements.get) if elements else ""
    god_names = list(ten_gods.values())
    star_line = ""
    if life_stars:
        traits = [_STAR_TRAIT[s] for s in life_stars if s in _STAR_TRAIT]
        if traits:
            star_line = f"命宫{'、'.join(life_stars)}：{'；'.join(traits)}"

    if analysis_type == "personality":
        result["summary"] = f"日主{day_master}属{dm_element}，身{strength}；性格底色由日主五行与命宫主星共同决定。"
        result["key_points"] = [
            f"日主{day_master}（{dm_element}）：{_ELEMENT_TRAIT.get(dm_element, '')}",
            (f"身{strength}：" + ("自我能量足、主见强，行事偏主动推进" if strength == "强" else "能量偏弱、更依赖环境与平台，适合借势而非硬扛") if strength else "身强弱未判读"),
            star_line or "命宫主星数据未提供",
            f"五行最旺为{strongest}，性格中该元素特质最外显；{weakest}最弱，是相对短板",
        ]
        result["suggestions"] = [
            f"发挥{strongest}的长处时注意过犹不及，重大决策前先补{weakest}维度的信息",
            "性格结论已标注依据（日主/命宫/五行），与你的实际感受对照取舍",
        ]
    elif analysis_type == "career":
        month_god = ten_gods.get("月干", "")
        career_stars = _palace_stars(star_positions, "官禄")
        result["summary"] = f"事业看月柱十神与官禄宫：月干{month_god or '未提供'}，官禄宫主星{'、'.join(career_stars) or '未提供'}。"
        result["key_points"] = [
            f"月干十神为{month_god}，是青年到中年事业形态的主导信号" if month_god else "月柱十神未提供",
            ("官杀（正官/七杀）在局，适合有规则、有晋升通道的体系内发展" if any(g in god_names for g in ["正官", "七杀"]) else "局中官杀不显，更适合以专业技能或经营型路线立足"),
            ("食伤（食神/伤官）在局，表达与产出能力是职业资本" if any(g in god_names for g in ["食神", "伤官"]) else "食伤不显，职业资本更偏向执行与资源整合"),
            (f"官禄宫坐{'、'.join(career_stars)}：" + "、".join(_STAR_TRAIT[s] for s in career_stars if s in _STAR_TRAIT)) if career_stars else "官禄宫主星未提供",
        ]
        result["suggestions"] = [
            f"行业五行可优先考虑与{dm_element}相生或同气的领域，避开长期与忌神方向硬碰",
            "以上为规则推导的方向性结论，具体行业还需结合你的技能与市场",
        ]
    elif analysis_type == "wealth":
        wealth_element = _CONTROLS.get(dm_element, "")
        has_wealth_god = any(g in god_names for g in ["正财", "偏财"])
        wealth_stars = _palace_stars(star_positions, "财帛")
        result["summary"] = f"日主{dm_element}克{wealth_element}为财；财星{'在局' if has_wealth_god else '不显'}，财帛宫主星{'、'.join(wealth_stars) or '未提供'}。"
        result["key_points"] = [
            ("十神中见财星，求财意识与机会感较强" if has_wealth_god else "十神中财星不显，财富更依赖事业与资产的长期积累，而非机会型收入"),
            (f"身{strength}：" + ("能担财，可主动经营与投资" if strength == "强" else "担财能力有限，大额杠杆与高波动投资需谨慎") if strength else ""),
            (f"财帛宫坐{'、'.join(wealth_stars)}：" + "、".join(_STAR_TRAIT[s] for s in wealth_stars if s in _STAR_TRAIT)) if wealth_stars else "财帛宫主星未提供",
        ]
        result["suggestions"] = [
            "先建立稳定现金流，再考虑增值型配置；比例与品种请结合现实财务状况",
            "本分析只依据命盘规则，不构成投资建议",
        ]
    elif analysis_type == "relationship":
        spouse_god = "财星（正财/偏财）" if gender == 1 else "官杀（正官/七杀）"
        day_branch = (bazi.get("day_pillar") or "")[1:2]
        spouse_stars = _palace_stars(star_positions, "夫妻")
        result["summary"] = f"感情看日支与配偶星：日支{day_branch or '未提供'}，夫妻宫主星{'、'.join(spouse_stars) or '未提供'}。"
        result["key_points"] = [
            f"日支（夫妻宫）为{day_branch}，是亲密关系的日常相处底色" if day_branch else "日支未提供",
            f"配偶星为{spouse_god}，其在局中的状态决定关系中的主动与投入方式",
            (f"夫妻宫坐{'、'.join(spouse_stars)}：" + "、".join(_STAR_TRAIT[s] for s in spouse_stars if s in _STAR_TRAIT)) if spouse_stars else "夫妻宫主星未提供",
        ]
        result["suggestions"] = [
            "关系质量更多取决于沟通与边界，命盘只提示倾向，不预言具体对象",
        ]
    elif analysis_type == "health":
        health_stars = _palace_stars(star_positions, "疾厄")
        result["summary"] = f"五行最弱为{weakest}，对应{_ELEMENT_ORGAN.get(weakest, '')}，是保养重点。"
        result["key_points"] = [
            f"五行分布：{'、'.join(f'{k}{v}' for k, v in elements.items())}；{weakest}最弱、{strongest}最旺",
            f"{weakest}对应{_ELEMENT_ORGAN.get(weakest, '')}，作息与饮食上优先照顾这一系统",
            (f"疾厄宫坐{'、'.join(health_stars)}，提示体质倾向而非具体疾病") if health_stars else "疾厄宫主星未提供",
        ]
        result["suggestions"] = [
            "保持规律作息与运动；出现症状请就医，本分析不替代医疗诊断",
        ]
    else:  # comprehensive 及其他类型：给三盘合参的规则摘要
        result["summary"] = "三盘合参（规则版）：八字定格局、紫微看宫位、吠陀看上升基调。"
        result["key_points"] = [
            f"八字：日主{day_master}（{dm_element}）身{strength}，五行最旺{strongest}、最弱{weakest}",
            star_line or "紫微命宫数据未提供",
            f"吠陀上升{asc_sign}，人生舞台与外在呈现带此星座基调" if asc_sign else "吠陀上升未提供",
            f"十神配置：{'、'.join(f'{k}{v}' for k, v in ten_gods.items())}" if ten_gods else "十神未提供",
        ]
        result["suggestions"] = [
            "性格、事业、财富、感情、健康五个维度，可在完整报告中逐项深入",
            "本结果为快速解读；更完整的推演请查看付费完整报告",
        ]

    # ---- 三盘补厚：紫微四化/宫位与吠陀行星落宫，按类型并入要点 ----
    extra = []
    if analysis_type == "personality":
        fude_stars = _palace_stars(star_positions, "福德")
        if fude_stars:
            extra.append(f"福德宫坐{'、'.join(fude_stars)}：精神世界与兴趣偏好由此看（{'；'.join(_STAR_TRAIT[x] for x in fude_stars if x in _STAR_TRAIT)}）")
        if moon_sign:
            extra.append(f"吠陀月亮在{moon_sign}：{_SIGN_TRAIT_V.get(moon_sign, '')}——情绪底色与安全感来源")
        if asc_lord and isinstance(asc_lord_house, int):
            extra.append(f"上升主星{_PLANET_CN.get(asc_lord, asc_lord)}落第{asc_lord_house}宫（{_HOUSE_DOMAIN_V.get(asc_lord_house, '')}）：人生重心自然投向这一领域")
    elif analysis_type == "career":
        t = _trans_in("官禄")
        if t:
            extra.append(f"官禄宫见{'、'.join(t)}：事业上有生年四化的直接加持/课题，落点即发力点")
        hl = _house_line(10)
        if hl:
            extra.append("吠陀" + hl)
    elif analysis_type == "wealth":
        lu = _trans_line("禄")
        if lu:
            extra.append("紫微" + lu)
        lucun_palace = all_star_positions.get("禄存", "")
        if lucun_palace:
            extra.append(f"禄存坐{lucun_palace}（{_PALACE_DOMAIN.get(lucun_palace, lucun_palace)}）：这一领域自带一份稳定财禄")
        hl = _house_line(2)
        if hl:
            extra.append("吠陀" + hl)
    elif analysis_type == "relationship":
        t = _trans_in("夫妻")
        if t:
            extra.append(f"夫妻宫见{'、'.join(t)}：" + ("化忌入夫妻最放不下感情，易在关系里较真、需要安全感的明确回应" if any("忌" in x for x in t) else "感情领域有四化落点，是人生的重点经营区"))
        venus = planets_v.get("Venus") or {}
        if isinstance(venus, dict) and venus.get("sign"):
            extra.append(f"吠陀金星在{venus['sign']}、第{venus.get('house', '?')}宫：审美与心动模式由此看，感情中看重{_HOUSE_DOMAIN_V.get(venus.get('house'), '相处质感') if isinstance(venus.get('house'), int) else '相处质感'}")
        hl = _house_line(7)
        if hl:
            extra.append("吠陀" + hl)
    elif analysis_type == "health":
        if moon_sign:
            extra.append(f"吠陀月亮在{moon_sign}：情绪与睡眠节律是健康的晴雨表，状态差时先稳住作息与情绪")
        hl = _house_line(6)
        if hl:
            extra.append("吠陀" + hl)
    else:  # comprehensive
        if soul_star or body_star:
            extra.append(f"紫微命主{soul_star or '未提供'}、身主{body_star or '未提供'}：先天主调与后天着力点")
        for ttype in ("禄", "忌"):
            tl = _trans_line(ttype)
            if tl:
                extra.append("四化：" + tl)
        if houses_v:
            busiest = max(houses_v, key=lambda h: len(houses_v[h]))
            if len(houses_v[busiest]) >= 2:
                extra.append("吠陀" + _house_line(busiest))
        if moon_sign:
            extra.append(f"吠陀月亮在{moon_sign}：{_SIGN_TRAIT_V.get(moon_sign, '')}")
    # ---- 第二层补厚：八字大运/喜用/神煞 + 吠陀尊贵/宫主/Dasha ----
    extra2 = []
    dayun_line = ""
    if current_dayun:
        gz, a0, a1 = current_dayun
        gz_el = _GAN_ELEMENT.get(gz[0], "")
        dayun_line = f"当前大运{gz}（{a0}–{a1} 岁）：运干支属{gz_el}，这十年的人生底色偏向{gz_el}的议题"
    dasha_line = ""
    if dasha:
        nak_name, dlord, y0, y1 = dasha
        dasha_line = f"吠陀当前大运为{_DASHA_CN.get(dlord, dlord)}运（{y0}–{y1} 年）：{_PLANET_DOMAIN_V.get(dlord, '这一主题')}是这段人生的主课题"
    if analysis_type == "personality":
        if dasha:
            extra2.append(f"出生星宿{dasha[0]}（{_DASHA_CN.get(_NAKSHATRAS[[n for n, _ in _NAKSHATRAS].index(dasha[0])][1], '')}主）：星宿定先天性情的底层纹理")
        extra2.extend([d for d in dignity_lines if "入旺" in d or "入庙" in d][:2])
    elif analysis_type == "career":
        if dayun_line:
            extra2.append(dayun_line + "；选赛道时把这十年的元素议题与自身喜用对齐，顺势比逆势省力")
        hl = _house_lord_line(10)
        if hl:
            extra2.append("吠陀" + hl)
    elif analysis_type == "wealth":
        if xi_yong:
            extra2.append("八字喜用方向：" + xi_yong + "——做选择时可作参考权重（非投资建议）")
        if dayun_line:
            extra2.append(dayun_line)
        if dasha_line:
            extra2.append(dasha_line)
    elif analysis_type == "relationship":
        hl = _house_lord_line(7)
        if hl:
            extra2.append("吠陀" + hl)
        if dayun_line:
            extra2.append(dayun_line)
    elif analysis_type == "health":
        extra2.extend([d for d in dignity_lines if "落陷" in d][:2])
        if dayun_line:
            extra2.append(dayun_line + "；大运切换前后是体质波动期，留意作息")
    else:  # comprehensive
        if spirits:
            extra2.append("神煞：" + "；".join(_SPIRIT_GLOSS.get(sp, sp) for sp in spirits[:3]))
        if dayun_line:
            extra2.append(dayun_line)
        if dasha_line:
            extra2.append(dasha_line)
        extra2.extend(dignity_lines[:2])
    result["key_points"].extend([e for e in extra2 if e])
    extra3 = []
    body_line = ""
    if body_palace_name:
        bs = _major_stars_of(body_palace_name) or _palace_stars(star_positions, body_palace_name)
        body_line = f"身宫在{body_palace_name}（{_PALACE_DOMAIN.get(body_palace_name, body_palace_name)}）" + (f"，坐{'、'.join(bs)}" if bs else "") + "：中年后的人生重心与自我认同系于此"
    trine_line = ""
    if trine_palaces:
        tstars = []
        for p in trine_palaces[1:]:
            tstars.extend(_major_stars_of(p) or _palace_stars(star_positions, p))
        if tstars:
            trine_line = f"命宫三方（财帛/官禄）拱照主星：{'、'.join(dict.fromkeys(tstars))}——钱与事业两条线与命宫互相牵动"
    if analysis_type == "personality":
        if body_line:
            extra3.append(body_line)
        bn = _brightness_note("命宫")
        if bn:
            extra3.append(f"命宫主星亮度：{bn}（庙旺=力量足、表达直接；陷=力量内敛、需后天催发）")
        if trine_line:
            extra3.append(trine_line)
    elif analysis_type == "career":
        fl = _fly_line("官禄")
        if fl:
            extra3.append("飞化：" + fl)
    elif analysis_type == "wealth":
        fl = _fly_line("财帛")
        if fl:
            extra3.append("飞化：" + fl)
    elif analysis_type == "relationship":
        fl = _fly_line("夫妻")
        if fl:
            extra3.append("飞化：" + fl)
        if body_line and body_palace_name == "夫妻":
            extra3.append(body_line + "（你的盘身宫正落夫妻，感情状态对整体状态影响尤深）")
    elif analysis_type == "health":
        bn = _brightness_note("疾厄")
        if bn:
            extra3.append(f"疾厄宫主星亮度：{bn}")
    else:  # comprehensive
        _shown = [p for p in patterns if p[2] != "caution"][:2]
        _caution = [p for p in patterns if p[2] == "caution"]
        if _caution and len(_shown) < 3:
            _shown.append(_caution[0])
        for pname_, pdesc, _lvl in _shown:
            extra3.append(f"格局【{pname_}】{pdesc}")
        if body_line:
            extra3.append(body_line)
        fl = _fly_line("命宫")
        if fl:
            extra3.append("飞化：" + fl)
        if trine_line:
            extra3.append(trine_line)
    result["key_points"].extend([e for e in extra3 if e])
    if patterns:
        basis.append("格局：" + "、".join(p[0] for p in patterns[:3]))
    if body_palace_name:
        basis.append(f"身宫{body_palace_name}")
    if current_dayun:
        basis.append(f"当前大运{current_dayun[0]}")
    if dasha:
        basis.append(f"星宿{dasha[0]}·{_DASHA_CN.get(dasha[1], dasha[1])}运{dasha[2]}-{dasha[3]}")

    result["key_points"].extend([e for e in extra if e])

    result["key_points"] = [p for p in result["key_points"] if p]
    return result
