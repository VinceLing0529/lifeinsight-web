# 🚀 超级Prompt解决方案 - 一次性生成所有分析

## 核心思路
不再依赖多次AI调用和上下文记忆，而是用一个超级Prompt一次性生成所有维度的分析。

## 实现方案

### 1. 创建超级Prompt模板

```python
def create_comprehensive_analysis_prompt(user_data: Dict[str, Any]) -> str:
    """创建一次性生成所有分析的超级Prompt"""
    
    # 提取用户数据
    input_data = user_data.get('input', {})
    bazi_data = user_data.get('bazi', {})
    ziwei_data = user_data.get('ziwei', {})
    vedic_data = user_data.get('vedic', {})
    
    prompt = f"""
你是一位精通中国传统命理学和印度占星学的资深分析师。请基于用户的完整命盘信息，进行深度的四维分析。

== 用户命盘数据 ==
出生信息：
- 姓名：{input_data.get('name', '')}
- 性别：{input_data.get('gender', '')}
- 出生日期：{input_data.get('date', '')}
- 出生时间：{input_data.get('time', '')}
- 出生地点：{input_data.get('location', '')}

八字信息：
{json.dumps(bazi_data, ensure_ascii=False, indent=2)}

紫微斗数：
{json.dumps(ziwei_data, ensure_ascii=False, indent=2)}

印度星盘：
{json.dumps(vedic_data, ensure_ascii=False, indent=2)}

== 分析要求 ==
请基于以上三种命理系统的完整数据，进行综合分析，并以以下JSON格式一次性返回所有分析结果：

{{
    "talents": {{
        "overview": "详细分析用户的天赋优势，包括但不限于：思维特质、学习能力、创造力、沟通表达、领导潜质、专业技能倾向等。要结合八字的十神分析、紫微的主星特质、印度星盘的行星力量进行综合判断。字数300-500字。",
        "stageSummary": ["天赋觉察", "优势识别", "潜能开发", "才能整合"],
        "recommendations": [
            "基于天赋特质的具体发展建议1",
            "基于天赋特质的具体发展建议2", 
            "基于天赋特质的具体发展建议3",
            "基于天赋特质的具体发展建议4"
        ]
    }},
    "motivation": {{
        "overview": "深度分析用户的内驱力特征，包括：核心价值观、成就动机、人生追求、内在渴望、行动模式、坚持力等。要结合八字的格局高低、紫微的命宫特质、印度星盘的人生目标。字数300-500字。",
        "stageSummary": ["动机探索", "驱力激发", "目标明确", "持续动力"],
        "recommendations": [
            "基于内驱力的具体激发建议1",
            "基于内驱力的具体激发建议2",
            "基于内驱力的具体激发建议3", 
            "基于内驱力的具体激发建议4"
        ]
    }},
    "blindspots": {{
        "overview": "客观分析用户容易忽视的盲区和潜在风险，包括：性格局限、思维盲点、行为陷阱、关系短板、健康隐患、发展障碍等。要基于八字的忌神影响、紫微的煞星作用、印度星盘的挑战相位。字数300-500字。",
        "stageSummary": ["盲区识别", "风险评估", "改进策略", "防范提升"],
        "recommendations": [
            "基于盲区的具体改善建议1",
            "基于盲区的具体改善建议2",
            "基于盲区的具体改善建议3",
            "基于盲区的具体改善建议4"
        ]
    }},
    "growth": {{
        "overview": "综合制定用户的成长发展路径，包括：发展方向、成长重点、能力提升、人生规划、实现策略、时机把握等。要整合三种命理系统的指导建议，提供可操作的成长方案。字数300-500字。",
        "stageSummary": ["成长规划", "能力提升", "实践应用", "全面发展"],
        "recommendations": [
            "基于成长路径的具体行动建议1",
            "基于成长路径的具体行动建议2",
            "基于成长路径的具体行动建议3",
            "基于成长路径的具体行动建议4"
        ]
    }},
    "comprehensive": {{
        "summary": "整合以上四个维度的分析，形成一个完整的个人发展蓝图。要体现天赋如何发挥、内驱力如何激发、盲区如何规避、成长如何实现的整体逻辑。重点突出用户的核心特质、发展潜力和实现路径。字数400-600字。"
    }}
}}

== 分析标准 ==
1. 必须基于提供的真实命盘数据进行分析
2. 三种命理系统要综合考虑，不能偏重某一种
3. 分析要深度、准确、个性化，避免模板化表述
4. 建议要具体可操作，避免空泛的建议
5. 确保JSON格式正确，可以直接解析
6. 每个维度的分析要相互关联但各有侧重

请开始分析：
"""
    
    return prompt

```

### 2. 简化API调用流程

```python
@router.post("/ai/analysis/complete-generate")
async def complete_generate_analysis(request: CompleteAnalysisRequest):
    """一次性生成完整分析报告"""
    try:
        # 创建超级prompt
        mega_prompt = create_comprehensive_analysis_prompt(request.user_data)
        
        # 一次性调用AI API
        ai_response = await call_ai_api_single(mega_prompt, request.order_id)
        
        # 解析JSON响应
        try:
            analysis_data = json.loads(ai_response)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"AI响应格式错误: {str(e)}")
        
        # 验证响应结构
        required_keys = ['talents', 'motivation', 'blindspots', 'growth', 'comprehensive']
        for key in required_keys:
            if key not in analysis_data:
                raise HTTPException(status_code=500, detail=f"缺少必要的分析维度: {key}")
        
        # 保存完整分析结果
        complete_analysis = {
            "dimensions": analysis_data,
            "user_data": request.user_data,
            "generated_at": datetime.now().isoformat(),
            "method": "single_prompt"
        }
        save_analysis_result(request.order_id, complete_analysis)
        
        return {
            "success": True,
            "order_id": request.order_id,
            "data": analysis_data,
            "message": "完整分析生成成功"
        }
        
    except Exception as e:
        print(f"完整分析生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"分析生成失败: {str(e)}")

class CompleteAnalysisRequest(BaseModel):
    user_data: Dict[str, Any]
    order_id: str

async def call_ai_api_single(prompt: str, order_id: str) -> str:
    """单次AI API调用"""
    print(f"执行完整分析 (订单: {order_id})...")
    
    # 这里集成真实的AI API
    # response = await gemini_api_call(prompt)
    # return response
    
    # 暂时返回模拟数据
    return await simulate_complete_analysis()

async def simulate_complete_analysis() -> str:
    """模拟完整分析响应"""
    await asyncio.sleep(3)  # 模拟较长的处理时间
    
    return json.dumps({
        "talents": {
            "overview": "基于您的八字、紫微斗数和印度星盘的综合分析，您在天赋优势方面展现出独特的特质...",
            "stageSummary": ["天赋觉察", "优势识别", "潜能开发", "才能整合"],
            "recommendations": [
                "通过多元化尝试和深度反思，系统性地识别自己的核心天赋领域",
                "通过实际项目验证和强化已识别的优势能力",
                "制定具体的天赋发展计划，日常运用和培养",
                "整合各项天赋为核心竞争力，形成个人品牌"
            ]
        },
        "motivation": {
            "overview": "您的内驱力分析显示出强烈的成就导向和自我实现需求...",
            "stageSummary": ["动机探索", "驱力激发", "目标明确", "持续动力"],
            "recommendations": [
                "深度探索个人价值观，明确内在驱动力来源",
                "设定挑战性目标，强化内在驱动力",
                "将动机转化为具体目标，确保价值观一致",
                "建立可持续激励机制，维持长期行动力"
            ]
        },
        "blindspots": {
            "overview": "命盘分析显示您在某些领域存在需要关注的盲区...",
            "stageSummary": ["盲区识别", "风险评估", "改进策略", "防范提升"],
            "recommendations": [
                "通过360度反馈客观识别个人盲区",
                "系统评估盲区风险，制定应对预案",
                "针对盲区制定改进计划，提升相关能力",
                "建立监控机制，避免盲区问题重复"
            ]
        },
        "growth": {
            "overview": "您的成长引导分析显示出巨大的发展潜力...",
            "stageSummary": ["成长规划", "能力提升", "实践应用", "全面发展"],
            "recommendations": [
                "制定系统的个人发展规划，明确成长目标",
                "重点提升领导力、沟通力等核心软技能",
                "将知识技能应用到实际项目中验证优化",
                "追求全面均衡发展，协调提升各方面能力"
            ]
        },
        "comprehensive": {
            "summary": "综合四个维度的分析，您是一个具有强烈成就动机和优秀分析能力的个体。天赋优势突出，内驱力强劲，但需要关注情感表达和工作生活平衡的盲区。建议在发挥理性分析优势的同时，加强情感智慧的培养，通过系统性的成长规划实现全面发展。"
        }
    }, ensure_ascii=False)
```

### 3. 前端调用简化

```javascript
// 前端只需要一次API调用
const generateCompleteAnalysis = async (userData, orderId) => {
    try {
        const response = await fetch('/ai/analysis/complete-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_data: userData,
                order_id: orderId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 一次性获得所有分析结果
            return result.data;
        }
    } catch (error) {
        console.error('分析生成失败:', error);
    }
};
```

## 优势总结

### 🔒 安全性
- ✅ 完全消除上下文混乱风险
- ✅ 每次调用都包含完整用户数据
- ✅ 绝对的用户隔离

### ⚡ 性能
- ✅ 从6次API调用减少到1次
- ✅ 减少80%以上的网络延迟
- ✅ 降低API成本

### 🎯 质量
- ✅ 所有分析基于同一套数据
- ✅ 维度间逻辑更加一致
- ✅ 综合分析更加连贯

### 🛠️ 维护
- ✅ 代码逻辑更简单
- ✅ 调试更容易
- ✅ 错误处理更集中

## 注意事项

1. **Prompt长度**: 超级prompt会比较长，确保AI API支持
2. **Token消耗**: 单次消耗token较多，但总体更经济
3. **错误处理**: 需要robust的JSON解析和验证
4. **备用方案**: 如果单次调用失败，可以fallback到分步调用

这个方案是目前最优的解决方案！🎯 