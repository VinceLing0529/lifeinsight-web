# 🛡️ 混合安全解决方案 - 最佳实践

## 核心思路
结合"超级Prompt"和"分步调用"的优点：
- 每次调用都包含完整用户数据（解决上下文混乱）
- 分步调用确保格式控制和质量（避免一次性风险）

## 方案设计

### 1. 安全的分步调用架构

```python
async def call_ai_api_safe_with_data(prompt: str, user_data: Dict, order_id: str) -> Dict:
    """
    安全的AI调用：每次都携带完整用户数据，但分步进行
    """
    
    # 构造包含完整数据的prompt
    full_prompt = f"""
用户命盘完整信息：
出生信息：{user_data.get('input', {})}
八字信息：{user_data.get('bazi', {})}
紫微斗数：{user_data.get('ziwei', {})}
印度星盘：{user_data.get('vedic', {})}

基于以上用户的真实命盘数据，{prompt}

请严格按照要求的JSON格式返回，不要添加任何额外说明。
"""
    
    print(f"安全API调用 (订单: {order_id})")
    
    # 调用真实AI API
    # response = await gemini_api_call(full_prompt, session_id=order_id)
    
    # 当前模拟
    return await simulate_ai_response_with_validation(prompt, user_data)
```

### 2. 强化的格式控制

```python
def create_strict_dimension_prompt(dimension: str, user_data: Dict) -> str:
    """为每个维度创建严格控制格式的prompt"""
    
    format_instructions = {
        "talents": {
            "description": "分析用户的天赋优势特征",
            "format": """
必须严格返回以下JSON格式，不要有任何其他内容：
{
    "overview": "详细分析内容，200-400字",
    "stageSummary": ["阶段1", "阶段2", "阶段3", "阶段4"],
    "recommendations": [
        "具体建议1，20-50字",
        "具体建议2，20-50字", 
        "具体建议3，20-50字",
        "具体建议4，20-50字"
    ]
}"""
        },
        "motivation": {
            "description": "分析用户的内驱力特征",
            "format": """
必须严格返回以下JSON格式，不要有任何其他内容：
{
    "overview": "详细分析内容，200-400字",
    "stageSummary": ["阶段1", "阶段2", "阶段3", "阶段4"],
    "recommendations": [
        "具体建议1，20-50字",
        "具体建议2，20-50字",
        "具体建议3，20-50字", 
        "具体建议4，20-50字"
    ]
}"""
        },
        # ... 其他维度类似
    }
    
    instruction = format_instructions.get(dimension, {})
    
    return f"""
你是一位精通命理学的专家。{instruction.get('description', '')}

{instruction.get('format', '')}

重要提醒：
1. 必须基于提供的真实命盘数据分析
2. 只返回JSON，不要任何额外文字
3. 确保JSON格式完全正确
4. overview字数控制在200-400字
5. 每个建议控制在20-50字
"""

```

### 3. 多层验证机制

```python
async def generate_dimension_analysis_safe(dimension: str, user_data: Dict, order_id: str) -> Dict:
    """安全的维度分析生成，带多层验证"""
    
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            # 创建严格控制的prompt
            prompt = create_strict_dimension_prompt(dimension, user_data)
            
            # 安全的API调用（包含完整用户数据）
            ai_response = await call_ai_api_safe_with_data(prompt, user_data, order_id)
            
            # 第一层验证：JSON格式检查
            try:
                parsed_data = json.loads(ai_response)
            except json.JSONDecodeError as e:
                print(f"JSON解析失败 (尝试 {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise Exception(f"AI响应格式错误，重试{max_retries}次后仍失败")
                continue
            
            # 第二层验证：结构检查
            validation_result = validate_dimension_structure(dimension, parsed_data)
            if not validation_result["valid"]:
                print(f"结构验证失败 (尝试 {attempt + 1}): {validation_result['errors']}")
                if attempt == max_retries - 1:
                    raise Exception(f"AI响应结构错误: {validation_result['errors']}")
                continue
            
            # 第三层验证：内容质量检查
            quality_result = validate_content_quality(parsed_data)
            if not quality_result["valid"]:
                print(f"质量验证失败 (尝试 {attempt + 1}): {quality_result['warnings']}")
                # 质量问题不阻断，但记录警告
            
            return parsed_data
            
        except Exception as e:
            print(f"维度分析失败 (尝试 {attempt + 1}): {e}")
            if attempt == max_retries - 1:
                raise
    
    raise Exception(f"维度分析最终失败，已重试{max_retries}次")

def validate_dimension_structure(dimension: str, data: dict) -> dict:
    """验证维度分析的数据结构"""
    
    required_fields = ["overview", "stageSummary", "recommendations"]
    errors = []
    
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段: {field}")
        elif field == "overview" and not isinstance(data[field], str):
            errors.append(f"{field}必须是字符串")
        elif field in ["stageSummary", "recommendations"] and not isinstance(data[field], list):
            errors.append(f"{field}必须是数组")
        elif field == "stageSummary" and len(data[field]) != 4:
            errors.append(f"{field}必须包含4个阶段")
        elif field == "recommendations" and len(data[field]) != 4:
            errors.append(f"{field}必须包含4条建议")
    
    # 检查文本长度
    if "overview" in data:
        overview_length = len(data["overview"])
        if overview_length < 100:
            errors.append(f"overview内容过短({overview_length}字)，建议至少200字")
        elif overview_length > 600:
            errors.append(f"overview内容过长({overview_length}字)，建议不超过400字")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors
    }

def validate_content_quality(data: dict) -> dict:
    """验证内容质量"""
    
    warnings = []
    
    # 检查是否有模板化表述
    template_phrases = ["您是一个", "建议您", "您可以", "您需要"]
    overview = data.get("overview", "")
    
    template_count = sum(1 for phrase in template_phrases if phrase in overview)
    if template_count > 2:
        warnings.append("内容可能过于模板化")
    
    # 检查建议的具体性
    recommendations = data.get("recommendations", [])
    vague_words = ["可以", "建议", "应该", "尝试"]
    
    vague_count = 0
    for rec in recommendations:
        if any(word in rec for word in vague_words):
            vague_count += 1
    
    if vague_count > 2:
        warnings.append("建议内容可能过于空泛")
    
    return {
        "valid": True,  # 质量问题不阻断
        "warnings": warnings
    }
```

### 4. 完整的批量生成流程

```python
@router.post("/ai/analysis/safe-batch-generate")
async def safe_batch_generate_analysis(request: BatchAnalysisRequest):
    """安全的批量分析生成"""
    try:
        # 检查并加载用户数据
        user_analysis = load_analysis_result(request.order_id)
        if not user_analysis or 'user_data' not in user_analysis:
            raise HTTPException(status_code=400, detail="用户命盘数据不存在")
        
        user_data = user_analysis['user_data']
        results = {}
        errors = []
        
        # 分步生成各维度分析
        dimensions = ["talents", "motivation", "blindspots", "growth"]
        
        for dimension in dimensions:
            try:
                print(f"正在生成{dimension}分析...")
                result = await generate_dimension_analysis_safe(dimension, user_data, request.order_id)
                results[dimension] = result
                
                # 每个维度完成后短暂延迟，避免API限流
                await asyncio.sleep(0.5)
                
            except Exception as e:
                error_msg = f"{dimension}分析失败: {str(e)}"
                errors.append(error_msg)
                print(error_msg)
                
                # 如果某个维度失败，使用备用响应
                results[dimension] = create_fallback_response(dimension)
        
        # 生成综合分析
        try:
            print("正在生成综合分析...")
            comprehensive_prompt = create_comprehensive_summary_prompt(results)
            comprehensive_response = await call_ai_api_safe_with_data(
                comprehensive_prompt, user_data, request.order_id
            )
            
            comprehensive_data = json.loads(comprehensive_response)
            results["comprehensive"] = comprehensive_data
            
        except Exception as e:
            error_msg = f"综合分析失败: {str(e)}"
            errors.append(error_msg)
            results["comprehensive"] = {"summary": "综合分析生成失败，请重试"}
        
        # 保存结果
        complete_analysis = {
            "dimensions": results,
            "user_data": user_data,
            "generated_at": datetime.now().isoformat(),
            "method": "safe_batch",
            "errors": errors
        }
        save_analysis_result(request.order_id, complete_analysis)
        
        return {
            "success": True,
            "order_id": request.order_id,
            "data": results,
            "errors": errors,
            "message": "分析生成完成" + (f"，有{len(errors)}个警告" if errors else "")
        }
        
    except Exception as e:
        print(f"批量分析失败: {e}")
        raise HTTPException(status_code=500, detail=f"分析生成失败: {str(e)}")

def create_fallback_response(dimension: str) -> dict:
    """创建备用响应"""
    fallback_responses = {
        "talents": {
            "overview": "抱歉，天赋分析暂时无法生成，请重试或联系客服。",
            "stageSummary": ["天赋觉察", "优势识别", "潜能开发", "才能整合"],
            "recommendations": ["请重试分析", "联系客服", "稍后再试", "检查网络"]
        },
        # ... 其他维度类似
    }
    return fallback_responses.get(dimension, {})
```

## 方案优势

### ✅ **安全性**（解决您的并发担心）
- 每次调用都包含完整用户数据
- 绝对不会有用户数据混乱
- order_id完全隔离

### ✅ **格式控制**（解决您的格式担心）
- 每个维度单独调用，格式要求明确
- 多层验证机制确保质量
- 失败重试和备用方案

### ✅ **质量保证**
- 分步处理，每步都可控
- 实时验证和纠错
- 部分失败不影响整体

### ✅ **用户体验**
- 比6次独立调用更快（减少网络延迟）
- 比1次超级调用更可靠（降低失败风险）
- 有进度反馈和错误提示

## 最终推荐

这个**混合安全方案**是最佳选择：
1. **解决了上下文混乱问题**（每次都发送完整数据）
2. **保持了格式控制能力**（分步调用+严格验证）
3. **兼顾了性能和稳定性**（4次调用，每次都安全）

比纯超级Prompt更安全，比原始方案更高效！🎯 