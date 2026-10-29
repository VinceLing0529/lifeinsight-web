#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试动态prompt生成功能
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.api.ai_analysis_old import create_dynamic_prompt, DIMENSIONS_CONFIG

def test_dynamic_prompts():
    """测试动态prompt生成"""
    
    # 示例用户数据
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
            }
        },
        "ziwei": {
            "basic_info": {
                "lunar_date": "1995年五月十八日",
                "chinese_date": "乙亥年壬午月丁巳日",
                "soul": "天机",
                "body": "天同",
                "five_elements_class": "水二局"
            }
        },
        "vedic": {
            "chart_type": "出生图",
            "ayanamsa": {
                "type": "拉希曼",
                "value": 23.85
            },
            "ascendant": {
                "sign": "双子",
                "lon": 85.5
            }
        },
        "timezone_info": {
            "timezone": "Asia/Shanghai",
            "utc_offset": "+08:00"
        }
    }
    
    print("=== 测试动态Prompt生成 ===\n")
    
    # 测试四个维度的动态prompt生成
    for dimension_id, dimension_config in DIMENSIONS_CONFIG.items():
        print(f"--- {dimension_config['title']} ---")
        try:
            dynamic_prompt = create_dynamic_prompt(sample_user_data, dimension_id)
            print(f"✅ 成功生成动态prompt")
            print(f"Prompt长度: {len(dynamic_prompt)} 字符")
            print(f"包含用户数据: {'是' if '用户基本信息' in dynamic_prompt else '否'}")
            print(f"包含八字信息: {'是' if '八字命理信息' in dynamic_prompt else '否'}")
            print(f"包含紫微信息: {'是' if '紫微斗数信息' in dynamic_prompt else '否'}")
            print(f"包含印度星盘: {'是' if '印度星盘信息' in dynamic_prompt else '否'}")
            
            if dimension_id == 'fortune_prediction':
                print(f"包含预测时间: {'是' if '预测时间信息' in dynamic_prompt else '否'}")
                print(f"包含动态月份: {'是' if '{prediction_months[' in dynamic_prompt else '否'}")
            
            print(f"Prompt预览: {dynamic_prompt[:200]}...")
            print()
            
        except Exception as e:
            print(f"❌ 生成失败: {e}")
            print()
    
    print("=== 测试完成 ===")

if __name__ == "__main__":
    test_dynamic_prompts() 