import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const BirthInfoForm = ({ onCalculated, onError, onLoadingChange }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timezoneInfo, setTimezoneInfo] = useState(null);
    const [showDaylightSaving, setShowDaylightSaving] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors }
    } = useForm({
        defaultValues: {
            birth_date: '',
            birth_time: '',
            longitude: '',
            latitude: '',
            gender: 1,
            location_name: '',
            daylight_saving: false
        }
    });

    const longitude = watch('longitude');
    const latitude = watch('latitude');

    // 自动获取时区信息
    const handleCoordinatesChange = async () => {
        if (longitude && latitude && !isNaN(longitude) && !isNaN(latitude)) {
            try {
                const timezone = await apiService.getTimezone(parseFloat(longitude), parseFloat(latitude));
                setTimezoneInfo(timezone);
                toast.success(`检测到时区: ${timezone.timezone} (UTC${timezone.utc_offset >= 0 ? '+' : ''}${timezone.utc_offset})`);
            } catch (error) {
                console.warn('时区检测失败:', error.message);
                setTimezoneInfo(null);
            }
        }
    };

    // 提交表单
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        onLoadingChange(true);

        try {
            // 验证经纬度
            const lng = parseFloat(data.longitude);
            const lat = parseFloat(data.latitude);

            if (isNaN(lng) || lng < -180 || lng > 180) {
                throw new Error('经度必须在 -180 到 180 之间');
            }

            if (isNaN(lat) || lat < -90 || lat > 90) {
                throw new Error('纬度必须在 -90 到 90 之间');
            }

            // 构建请求数据
            const birthInfo = {
                birth_date: data.birth_date,
                birth_time: data.birth_time,
                longitude: lng,
                latitude: lat,
                gender: parseInt(data.gender),
                location_name: data.location_name || `经度${lng}, 纬度${lat}`,
                daylight_saving: data.daylight_saving || false
            };

            // 调用API计算命盘
            const result = await apiService.calculateCharts(birthInfo);

            toast.success('命盘计算成功！');
            onCalculated(result);

        } catch (error) {
            console.error('计算失败:', error);
            toast.error(error.message);
            onError(error.message);
        } finally {
            setIsSubmitting(false);
            onLoadingChange(false);
        }
    };

    // 使用示例数据
    const useExampleData = () => {
        setValue('birth_date', '2000-01-01');
        setValue('birth_time', '00:00');
        setValue('longitude', '116.4');
        setValue('latitude', '39.9');
        setValue('gender', 1);
        setValue('location_name', '北京');
        toast.success('已填入示例数据');
    };

    // 常用城市坐标
    const popularCities = [
        { name: '北京', longitude: 116.4, latitude: 39.9 },
        { name: '上海', longitude: 121.5, latitude: 31.2 },
        { name: '广州', longitude: 113.3, latitude: 23.1 },
        { name: '深圳', longitude: 114.1, latitude: 22.5 },
        { name: '杭州', longitude: 120.2, latitude: 30.3 },
        { name: '成都', longitude: 104.1, latitude: 30.7 },
    ];

    // 省份和城市数据
    const cityData = {
        '北京市': {
            '北京市': { longitude: 116.4074, latitude: 39.9042 }
        },
        '上海市': {
            '上海市': { longitude: 121.4737, latitude: 31.2304 }
        },
        '天津市': {
            '天津市': { longitude: 117.1901, latitude: 39.1084 }
        },
        '重庆市': {
            '重庆市': { longitude: 106.5048, latitude: 29.5343 }
        },
        '河北省': {
            '石家庄市': { longitude: 114.5149, latitude: 38.0428 },
            '唐山市': { longitude: 118.1758, latitude: 39.6304 },
            '秦皇岛市': { longitude: 119.6010, latitude: 39.9398 },
            '邯郸市': { longitude: 114.4775, latitude: 36.6251 },
            '邢台市': { longitude: 114.5086, latitude: 37.0682 },
            '保定市': { longitude: 115.4648, latitude: 38.8971 },
            '张家口市': { longitude: 114.8794, latitude: 40.8119 },
            '承德市': { longitude: 117.9249, latitude: 40.9925 },
            '沧州市': { longitude: 116.8286, latitude: 38.2104 },
            '廊坊市': { longitude: 116.7039, latitude: 39.5209 },
            '衡水市': { longitude: 115.6656, latitude: 37.7161 }
        },
        '山西省': {
            '太原市': { longitude: 112.5489, latitude: 37.8706 },
            '大同市': { longitude: 113.3007, latitude: 40.0769 },
            '阳泉市': { longitude: 113.5830, latitude: 37.8695 },
            '长治市': { longitude: 113.1143, latitude: 36.1915 },
            '晋城市': { longitude: 112.8513, latitude: 35.4901 },
            '朔州市': { longitude: 112.4333, latitude: 39.3313 },
            '晋中市': { longitude: 112.7525, latitude: 37.6965 },
            '运城市': { longitude: 111.0059, latitude: 35.0228 },
            '忻州市': { longitude: 112.7341, latitude: 38.4178 },
            '临汾市': { longitude: 111.5179, latitude: 36.0881 },
            '吕梁市': { longitude: 111.1347, latitude: 37.5177 }
        },
        '内蒙古自治区': {
            '呼和浩特市': { longitude: 111.7519, latitude: 40.8414 },
            '包头市': { longitude: 109.8403, latitude: 40.6574 },
            '乌海市': { longitude: 106.8254, latitude: 39.6738 },
            '赤峰市': { longitude: 118.8869, latitude: 42.2574 },
            '通辽市': { longitude: 122.2630, latitude: 43.6174 },
            '鄂尔多斯市': { longitude: 109.7811, latitude: 39.6086 },
            '呼伦贝尔市': { longitude: 119.7658, latitude: 49.2113 },
            '巴彦淖尔市': { longitude: 107.3874, latitude: 40.7574 },
            '乌兰察布市': { longitude: 113.1328, latitude: 41.0341 }
        },
        '辽宁省': {
            '沈阳市': { longitude: 123.4315, latitude: 41.8057 },
            '大连市': { longitude: 121.6147, latitude: 38.9140 },
            '鞍山市': { longitude: 122.9951, latitude: 41.1106 },
            '抚顺市': { longitude: 123.9576, latitude: 41.8654 },
            '本溪市': { longitude: 123.7708, latitude: 41.2944 },
            '丹东市': { longitude: 124.3540, latitude: 40.1290 },
            '锦州市': { longitude: 121.1353, latitude: 41.1292 },
            '营口市': { longitude: 122.2351, latitude: 40.6672 },
            '阜新市': { longitude: 121.6708, latitude: 42.0118 },
            '辽阳市': { longitude: 123.2372, latitude: 41.2733 },
            '盘锦市': { longitude: 122.0707, latitude: 41.1245 },
            '铁岭市': { longitude: 123.8445, latitude: 42.2907 },
            '朝阳市': { longitude: 120.4516, latitude: 41.5718 },
            '葫芦岛市': { longitude: 120.8560, latitude: 40.7430 }
        },
        '吉林省': {
            '长春市': { longitude: 125.3245, latitude: 43.8868 },
            '吉林市': { longitude: 126.5502, latitude: 43.8436 },
            '四平市': { longitude: 124.3707, latitude: 43.1703 },
            '辽源市': { longitude: 125.1455, latitude: 42.9027 },
            '通化市': { longitude: 125.9365, latitude: 41.7212 },
            '白山市': { longitude: 126.4278, latitude: 41.9425 },
            '松原市': { longitude: 124.8254, latitude: 45.1411 },
            '白城市': { longitude: 122.8397, latitude: 45.6196 },
            '延边朝鲜族自治州': { longitude: 129.5135, latitude: 42.9048 }
        },
        '黑龙江省': {
            '哈尔滨市': { longitude: 126.6420, latitude: 45.7563 },
            '齐齐哈尔市': { longitude: 123.9576, latitude: 47.3421 },
            '鸡西市': { longitude: 130.9759, latitude: 45.3000 },
            '鹤岗市': { longitude: 130.2772, latitude: 47.3320 },
            '双鸭山市': { longitude: 131.1590, latitude: 46.6434 },
            '大庆市': { longitude: 125.1031, latitude: 46.5907 },
            '伊春市': { longitude: 128.8414, latitude: 47.7248 },
            '佳木斯市': { longitude: 130.3184, latitude: 46.8096 },
            '七台河市': { longitude: 131.0156, latitude: 45.7712 },
            '牡丹江市': { longitude: 129.6333, latitude: 44.5830 },
            '黑河市': { longitude: 127.4990, latitude: 50.2495 },
            '绥化市': { longitude: 126.9933, latitude: 46.6374 },
            '大兴安岭地区': { longitude: 124.1146, latitude: 50.4254 }
        },
        '江苏省': {
            '南京市': { longitude: 118.7969, latitude: 32.0603 },
            '无锡市': { longitude: 120.3019, latitude: 31.5747 },
            '徐州市': { longitude: 117.1849, latitude: 34.2618 },
            '常州市': { longitude: 119.9464, latitude: 31.7720 },
            '苏州市': { longitude: 120.6194, latitude: 31.2990 },
            '南通市': { longitude: 120.8647, latitude: 32.0162 },
            '连云港市': { longitude: 119.1788, latitude: 34.5996 },
            '淮安市': { longitude: 119.0153, latitude: 33.5975 },
            '盐城市': { longitude: 120.1398, latitude: 33.3776 },
            '扬州市': { longitude: 119.4214, latitude: 32.3932 },
            '镇江市': { longitude: 119.4520, latitude: 32.2044 },
            '泰州市': { longitude: 119.9153, latitude: 32.4847 },
            '宿迁市': { longitude: 118.3750, latitude: 33.9630 }
        },
        '浙江省': {
            '杭州市': { longitude: 120.1551, latitude: 30.2741 },
            '宁波市': { longitude: 121.5440, latitude: 29.8683 },
            '温州市': { longitude: 120.6994, latitude: 28.0006 },
            '嘉兴市': { longitude: 120.7554, latitude: 30.7625 },
            '湖州市': { longitude: 120.0867, latitude: 30.8936 },
            '绍兴市': { longitude: 120.5820, latitude: 30.0291 },
            '金华市': { longitude: 119.6492, latitude: 29.0895 },
            '衢州市': { longitude: 118.8728, latitude: 28.9417 },
            '舟山市': { longitude: 122.1069, latitude: 30.0160 },
            '台州市': { longitude: 121.4287, latitude: 28.6568 },
            '丽水市': { longitude: 119.9219, latitude: 28.4517 }
        },
        '安徽省': {
            '合肥市': { longitude: 117.2272, latitude: 31.8206 },
            '芜湖市': { longitude: 118.3760, latitude: 31.3262 },
            '蚌埠市': { longitude: 117.3638, latitude: 32.9166 },
            '淮南市': { longitude: 117.0187, latitude: 32.6264 },
            '马鞍山市': { longitude: 118.5077, latitude: 31.6890 },
            '淮北市': { longitude: 116.7947, latitude: 33.9717 },
            '铜陵市': { longitude: 117.8165, latitude: 30.9299 },
            '安庆市': { longitude: 117.0530, latitude: 30.5255 },
            '黄山市': { longitude: 118.3175, latitude: 29.7094 },
            '滁州市': { longitude: 118.3162, latitude: 32.3173 },
            '阜阳市': { longitude: 115.8197, latitude: 32.9001 },
            '宿州市': { longitude: 116.9844, latitude: 33.6341 },
            '六安市': { longitude: 116.5078, latitude: 31.7529 },
            '亳州市': { longitude: 115.7825, latitude: 33.8712 },
            '池州市': { longitude: 117.4893, latitude: 30.6600 },
            '宣城市': { longitude: 118.7581, latitude: 30.9456 }
        },
        '福建省': {
            '福州市': { longitude: 119.3063, latitude: 26.0745 },
            '厦门市': { longitude: 118.1104, latitude: 24.4798 },
            '莆田市': { longitude: 119.0078, latitude: 25.4313 },
            '三明市': { longitude: 117.6356, latitude: 26.2654 },
            '泉州市': { longitude: 118.5745, latitude: 24.8740 },
            '漳州市': { longitude: 117.6619, latitude: 24.5109 },
            '南平市': { longitude: 118.1783, latitude: 26.6358 },
            '龙岩市': { longitude: 117.0297, latitude: 25.0917 },
            '宁德市': { longitude: 119.5270, latitude: 26.6592 }
        },
        '江西省': {
            '南昌市': { longitude: 115.8922, latitude: 28.6765 },
            '景德镇市': { longitude: 117.2144, latitude: 29.2926 },
            '萍乡市': { longitude: 113.8520, latitude: 27.6229 },
            '九江市': { longitude: 115.9929, latitude: 29.7055 },
            '新余市': { longitude: 114.9301, latitude: 27.8175 },
            '鹰潭市': { longitude: 117.0337, latitude: 28.2385 },
            '赣州市': { longitude: 114.9404, latitude: 25.8312 },
            '吉安市': { longitude: 114.9867, latitude: 27.1117 },
            '宜春市': { longitude: 114.3916, latitude: 27.8043 },
            '抚州市': { longitude: 116.3584, latitude: 27.9838 },
            '上饶市': { longitude: 117.9711, latitude: 28.4444 }
        },
        '山东省': {
            '济南市': { longitude: 117.0009, latitude: 36.6758 },
            '青岛市': { longitude: 120.3826, latitude: 36.0671 },
            '淄博市': { longitude: 118.0475, latitude: 36.8133 },
            '枣庄市': { longitude: 117.5578, latitude: 34.8564 },
            '东营市': { longitude: 118.6748, latitude: 37.4613 },
            '烟台市': { longitude: 121.3914, latitude: 37.5393 },
            '潍坊市': { longitude: 119.1070, latitude: 36.7093 },
            '济宁市': { longitude: 116.5873, latitude: 35.4154 },
            '泰安市': { longitude: 117.1290, latitude: 36.1943 },
            '威海市': { longitude: 122.1206, latitude: 37.5104 },
            '日照市': { longitude: 119.4611, latitude: 35.4284 },
            '临沂市': { longitude: 118.3563, latitude: 35.1045 },
            '德州市': { longitude: 116.3073, latitude: 37.4608 },
            '聊城市': { longitude: 115.9808, latitude: 36.4560 },
            '滨州市': { longitude: 118.0187, latitude: 37.3835 },
            '菏泽市': { longitude: 115.4697, latitude: 35.2465 }
        },
        '河南省': {
            '郑州市': { longitude: 113.6254, latitude: 34.7466 },
            '开封市': { longitude: 114.3414, latitude: 34.7971 },
            '洛阳市': { longitude: 112.4540, latitude: 34.6197 },
            '平顶山市': { longitude: 113.3073, latitude: 33.7453 },
            '安阳市': { longitude: 114.3527, latitude: 36.1034 },
            '鹤壁市': { longitude: 114.2959, latitude: 35.7488 },
            '新乡市': { longitude: 113.9267, latitude: 35.3029 },
            '焦作市': { longitude: 113.2418, latitude: 35.2158 },
            '濮阳市': { longitude: 115.0294, latitude: 35.7618 },
            '许昌市': { longitude: 113.8260, latitude: 34.0359 },
            '漯河市': { longitude: 114.0460, latitude: 33.5758 },
            '三门峡市': { longitude: 111.1941, latitude: 34.7773 },
            '南阳市': { longitude: 112.5407, latitude: 32.9909 },
            '商丘市': { longitude: 115.6506, latitude: 34.4139 },
            '信阳市': { longitude: 114.0755, latitude: 32.1470 },
            '周口市': { longitude: 114.6497, latitude: 33.6204 },
            '驻马店市': { longitude: 114.0249, latitude: 32.9800 }
        },
        '湖北省': {
            '武汉市': { longitude: 114.2985, latitude: 30.5844 },
            '黄石市': { longitude: 115.0773, latitude: 30.2200 },
            '十堰市': { longitude: 110.7874, latitude: 32.6469 },
            '宜昌市': { longitude: 111.3004, latitude: 30.7024 },
            '襄阳市': { longitude: 112.1441, latitude: 32.0420 },
            '鄂州市': { longitude: 114.8908, latitude: 30.3968 },
            '荆门市': { longitude: 112.2042, latitude: 31.0354 },
            '孝感市': { longitude: 113.9260, latitude: 30.9265 },
            '荆州市': { longitude: 112.2384, latitude: 30.3267 },
            '黄冈市': { longitude: 114.8794, latitude: 30.4477 },
            '咸宁市': { longitude: 114.3225, latitude: 29.8326 },
            '随州市': { longitude: 113.3731, latitude: 31.7175 },
            '恩施土家族苗族自治州': { longitude: 109.4886, latitude: 30.2830 }
        },
        '湖南省': {
            '长沙市': { longitude: 112.9388, latitude: 28.2282 },
            '株洲市': { longitude: 113.1518, latitude: 27.8274 },
            '湘潭市': { longitude: 112.9441, latitude: 27.8294 },
            '衡阳市': { longitude: 112.5719, latitude: 26.8993 },
            '邵阳市': { longitude: 111.4691, latitude: 27.2378 },
            '岳阳市': { longitude: 113.1288, latitude: 29.3705 },
            '常德市': { longitude: 111.6982, latitude: 29.0406 },
            '张家界市': { longitude: 110.4790, latitude: 29.1274 },
            '益阳市': { longitude: 112.3550, latitude: 28.5701 },
            '郴州市': { longitude: 113.0322, latitude: 25.7704 },
            '永州市': { longitude: 111.6087, latitude: 26.4205 },
            '怀化市': { longitude: 109.9783, latitude: 27.5501 },
            '娄底市': { longitude: 112.0082, latitude: 27.7281 },
            '湘西土家族苗族自治州': { longitude: 109.7390, latitude: 28.3115 }
        },
        '广东省': {
            '广州市': { longitude: 113.2644, latitude: 23.1291 },
            '韶关市': { longitude: 113.5917, latitude: 24.8016 },
            '深圳市': { longitude: 114.0579, latitude: 22.5431 },
            '珠海市': { longitude: 113.5767, latitude: 22.2707 },
            '汕头市': { longitude: 116.7081, latitude: 23.3543 },
            '佛山市': { longitude: 113.1220, latitude: 23.0288 },
            '江门市': { longitude: 113.0946, latitude: 22.5901 },
            '湛江市': { longitude: 110.3594, latitude: 21.2707 },
            '茂名市': { longitude: 110.9255, latitude: 21.6682 },
            '肇庆市': { longitude: 112.4721, latitude: 23.0515 },
            '惠州市': { longitude: 114.4126, latitude: 23.0793 },
            '梅州市': { longitude: 116.1179, latitude: 24.2993 },
            '汕尾市': { longitude: 115.3645, latitude: 22.7745 },
            '河源市': { longitude: 114.6974, latitude: 23.7460 },
            '阳江市': { longitude: 111.9755, latitude: 21.8592 },
            '清远市': { longitude: 113.0513, latitude: 23.6818 },
            '东莞市': { longitude: 113.7518, latitude: 23.0205 },
            '中山市': { longitude: 113.3823, latitude: 22.5154 },
            '潮州市': { longitude: 116.6302, latitude: 23.6618 },
            '揭阳市': { longitude: 116.3729, latitude: 23.5479 },
            '云浮市': { longitude: 112.0446, latitude: 22.9299 }
        },
        '广西壮族自治区': {
            '南宁市': { longitude: 108.3669, latitude: 22.8176 },
            '柳州市': { longitude: 109.4281, latitude: 24.3146 },
            '桂林市': { longitude: 110.2993, latitude: 25.2342 },
            '梧州市': { longitude: 111.2792, latitude: 23.4748 },
            '北海市': { longitude: 109.1193, latitude: 21.4733 },
            '防城港市': { longitude: 108.3548, latitude: 21.6146 },
            '钦州市': { longitude: 108.6544, latitude: 21.9570 },
            '贵港市': { longitude: 109.6026, latitude: 23.0936 },
            '玉林市': { longitude: 110.1545, latitude: 22.6314 },
            '百色市': { longitude: 106.6160, latitude: 23.8977 },
            '贺州市': { longitude: 111.5669, latitude: 24.4141 },
            '河池市': { longitude: 108.0856, latitude: 24.6960 },
            '来宾市': { longitude: 109.2290, latitude: 23.7338 },
            '崇左市': { longitude: 107.3640, latitude: 22.4041 }
        },
        '海南省': {
            '海口市': { longitude: 110.3312, latitude: 20.0311 },
            '三亚市': { longitude: 109.5082, latitude: 18.2479 },
            '三沙市': { longitude: 112.3486, latitude: 16.8310 },
            '儋州市': { longitude: 109.5767, latitude: 19.5175 }
        },
        '四川省': {
            '成都市': { longitude: 104.0657, latitude: 30.6595 },
            '自贡市': { longitude: 104.7734, latitude: 29.3528 },
            '攀枝花市': { longitude: 101.7183, latitude: 26.5805 },
            '泸州市': { longitude: 105.4433, latitude: 28.8718 },
            '德阳市': { longitude: 104.3985, latitude: 31.1270 },
            '绵阳市': { longitude: 104.6790, latitude: 31.4677 },
            '广元市': { longitude: 105.8430, latitude: 32.4336 },
            '遂宁市': { longitude: 105.5718, latitude: 30.5133 },
            '内江市': { longitude: 105.0661, latitude: 29.5877 },
            '乐山市': { longitude: 103.7614, latitude: 29.5524 },
            '南充市': { longitude: 106.0830, latitude: 30.7953 },
            '眉山市': { longitude: 103.8318, latitude: 30.0756 },
            '宜宾市': { longitude: 104.6308, latitude: 28.7602 },
            '广安市': { longitude: 106.6333, latitude: 30.4564 },
            '达州市': { longitude: 107.5023, latitude: 31.2090 },
            '雅安市': { longitude: 103.0014, latitude: 29.9877 },
            '巴中市': { longitude: 106.7537, latitude: 31.8691 },
            '资阳市': { longitude: 104.6419, latitude: 30.1286 },
            '阿坝藏族羌族自治州': { longitude: 102.2211, latitude: 31.8998 },
            '甘孜藏族自治州': { longitude: 101.9638, latitude: 30.0507 },
            '凉山彝族自治州': { longitude: 102.2587, latitude: 27.8868 }
        },
        '贵州省': {
            '贵阳市': { longitude: 106.7135, latitude: 26.5783 },
            '六盘水市': { longitude: 104.8469, latitude: 26.5918 },
            '遵义市': { longitude: 106.9374, latitude: 27.7056 },
            '安顺市': { longitude: 105.9478, latitude: 26.2455 },
            '毕节市': { longitude: 105.2899, latitude: 27.3017 },
            '铜仁市': { longitude: 109.1896, latitude: 27.7183 },
            '黔西南布依族苗族自治州': { longitude: 104.9065, latitude: 25.0881 },
            '黔东南苗族侗族自治州': { longitude: 107.9774, latitude: 26.5835 },
            '黔南布依族苗族自治州': { longitude: 107.5170, latitude: 26.2582 }
        },
        '云南省': {
            '昆明市': { longitude: 102.8329, latitude: 24.8801 },
            '曲靖市': { longitude: 103.7976, latitude: 25.5016 },
            '玉溪市': { longitude: 102.5437, latitude: 24.3505 },
            '保山市': { longitude: 99.1670, latitude: 25.1118 },
            '昭通市': { longitude: 103.7171, latitude: 27.3364 },
            '丽江市': { longitude: 100.2330, latitude: 26.8721 },
            '普洱市': { longitude: 100.9666, latitude: 22.7773 },
            '临沧市': { longitude: 100.0865, latitude: 23.8878 },
            '楚雄彝族自治州': { longitude: 101.5457, latitude: 25.0419 },
            '红河哈尼族彝族自治州': { longitude: 103.3744, latitude: 23.3668 },
            '文山壮族苗族自治州': { longitude: 104.2447, latitude: 23.3695 },
            '西双版纳傣族自治州': { longitude: 100.7973, latitude: 22.0017 },
            '大理白族自治州': { longitude: 100.2670, latitude: 25.6066 },
            '德宏傣族景颇族自治州': { longitude: 98.5784, latitude: 24.4367 },
            '怒江傈僳族自治州': { longitude: 98.8543, latitude: 25.8509 },
            '迪庆藏族自治州': { longitude: 99.7065, latitude: 27.8269 }
        },
        '西藏自治区': {
            '拉萨市': { longitude: 91.1409, latitude: 29.6456 },
            '日喀则市': { longitude: 88.8851, latitude: 29.2690 },
            '昌都市': { longitude: 97.1785, latitude: 31.1369 },
            '林芝市': { longitude: 94.3624, latitude: 29.6544 },
            '山南市': { longitude: 91.7665, latitude: 29.2368 },
            '那曲市': { longitude: 92.0602, latitude: 31.4760 },
            '阿里地区': { longitude: 80.1055, latitude: 32.5032 }
        },
        '陕西省': {
            '西安市': { longitude: 108.9398, latitude: 34.3412 },
            '铜川市': { longitude: 108.9794, latitude: 34.8969 },
            '宝鸡市': { longitude: 107.1826, latitude: 34.3640 },
            '咸阳市': { longitude: 108.7093, latitude: 34.3336 },
            '渭南市': { longitude: 109.5022, latitude: 34.4994 },
            '延安市': { longitude: 109.4897, latitude: 36.5853 },
            '汉中市': { longitude: 107.0230, latitude: 33.0777 },
            '榆林市': { longitude: 109.7341, latitude: 38.2900 },
            '安康市': { longitude: 109.0294, latitude: 32.6903 },
            '商洛市': { longitude: 109.9397, latitude: 33.8739 }
        },
        '甘肃省': {
            '兰州市': { longitude: 103.8236, latitude: 36.0581 },
            '嘉峪关市': { longitude: 98.2773, latitude: 39.7865 },
            '金昌市': { longitude: 102.1879, latitude: 38.5142 },
            '白银市': { longitude: 104.1735, latitude: 36.5457 },
            '天水市': { longitude: 105.7249, latitude: 34.5785 },
            '武威市': { longitude: 102.6348, latitude: 37.9289 },
            '张掖市': { longitude: 100.4510, latitude: 38.9248 },
            '平凉市': { longitude: 106.6846, latitude: 35.5428 },
            '酒泉市': { longitude: 98.5109, latitude: 39.7324 },
            '庆阳市': { longitude: 107.6434, latitude: 35.7097 },
            '定西市': { longitude: 104.6264, latitude: 35.5797 },
            '陇南市': { longitude: 104.9194, latitude: 33.3886 },
            '临夏回族自治州': { longitude: 103.2122, latitude: 35.5994 },
            '甘南藏族自治州': { longitude: 102.9110, latitude: 34.9864 }
        },
        '青海省': {
            '西宁市': { longitude: 101.7782, latitude: 36.6171 },
            '海东市': { longitude: 102.1030, latitude: 36.5029 },
            '海北藏族自治州': { longitude: 100.9010, latitude: 36.9540 },
            '黄南藏族自治州': { longitude: 102.0076, latitude: 35.5177 },
            '海南藏族自治州': { longitude: 100.6196, latitude: 36.2804 },
            '果洛藏族自治州': { longitude: 100.2423, latitude: 34.4736 },
            '玉树藏族自治州': { longitude: 97.0086, latitude: 33.0041 },
            '海西蒙古族藏族自治州': { longitude: 97.3708, latitude: 37.3747 }
        },
        '宁夏回族自治区': {
            '银川市': { longitude: 106.2309, latitude: 38.4872 },
            '石嘴山市': { longitude: 106.3831, latitude: 39.0333 },
            '吴忠市': { longitude: 106.1987, latitude: 37.9862 },
            '固原市': { longitude: 106.2853, latitude: 36.0046 },
            '中卫市': { longitude: 105.1896, latitude: 37.5149 }
        },
        '新疆维吾尔自治区': {
            '乌鲁木齐市': { longitude: 87.6177, latitude: 43.7928 },
            '克拉玛依市': { longitude: 84.8739, latitude: 45.5950 },
            '吐鲁番市': { longitude: 89.1841, latitude: 42.9476 },
            '哈密市': { longitude: 93.5132, latitude: 42.8335 },
            '昌吉回族自治州': { longitude: 87.3040, latitude: 44.0074 },
            '博尔塔拉蒙古自治州': { longitude: 82.0748, latitude: 44.9058 },
            '巴音郭楞蒙古自治州': { longitude: 86.1504, latitude: 41.7686 },
            '阿克苏地区': { longitude: 80.2651, latitude: 41.1717 },
            '克孜勒苏柯尔克孜自治州': { longitude: 76.1728, latitude: 39.7134 },
            '喀什地区': { longitude: 75.9899, latitude: 39.4679 },
            '和田地区': { longitude: 79.9253, latitude: 37.1106 },
            '伊犁哈萨克自治州': { longitude: 81.3179, latitude: 43.9219 },
            '塔城地区': { longitude: 82.9857, latitude: 46.7463 },
            '阿勒泰地区': { longitude: 88.1396, latitude: 47.8484 }
        },
        '香港特别行政区': {
            '香港': { longitude: 114.1694, latitude: 22.3193 }
        },
        '澳门特别行政区': {
            '澳门': { longitude: 113.5491, latitude: 22.1987 }
        },
        '台湾省': {
            '台北市': { longitude: 121.5654, latitude: 25.0330 },
            '高雄市': { longitude: 120.3014, latitude: 22.6273 },
            '台中市': { longitude: 120.6736, latitude: 24.1477 },
            '台南市': { longitude: 120.2513, latitude: 22.9999 },
            '新北市': { longitude: 121.4627, latitude: 25.0124 },
            '桃园市': { longitude: 121.3009, latitude: 24.9937 }
        }
    };

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [showLocationSelector, setShowLocationSelector] = useState(false);

    const selectCity = (city) => {
        setValue('longitude', city.longitude.toFixed(1));
        setValue('latitude', city.latitude.toFixed(1));
        setValue('location_name', city.name);
        setValue('daylight_saving', false);
        setShowDaylightSaving(false);
        handleCoordinatesChange();
        toast.success(`已选择 ${city.name}`);
        setShowLocationSelector(false);
    };

    const handleProvinceChange = (province) => {
        setSelectedProvince(province);
        setSelectedCity('');
        setValue('location_name', '');
        setValue('longitude', '');
        setValue('latitude', '');
    };

    const handleCityChange = (cityName) => {
        setSelectedCity(cityName);
        const cityData_selected = cityData[selectedProvince][cityName];
        setValue('longitude', cityData_selected.longitude.toFixed(1));
        setValue('latitude', cityData_selected.latitude.toFixed(1));
        setValue('location_name', cityName);
        setValue('daylight_saving', false);
        setShowDaylightSaving(false);
        handleCoordinatesChange();
        toast.success(`已选择 ${cityName}`);
        setShowLocationSelector(false);
    };

    const showOtherLocationSelector = () => {
        setShowLocationSelector(true);
    };

    const handleOtherLocationSelect = () => {
        setValue('location_name', '其他地点');
        setValue('longitude', '');
        setValue('latitude', '');
        setValue('daylight_saving', false);
        setShowLocationSelector(false);
        setShowDaylightSaving(true);
    };

    return (
        <div className="w-full bg-slate-700/40 border-slate-600/40 backdrop-blur-sm shadow-2xl shadow-slate-900/20 mystical-card rounded-lg">
            <div className="text-center border-b border-slate-600/30 p-4">
                <h2 className="text-xl text-slate-100 flex items-center justify-center mb-1">
                    <div className="w-5 h-5 mr-2 text-slate-300">👤</div>
                    出生信息录入
                </h2>
                <p className="text-slate-400 text-sm">请准确填写出生信息，以获得精确的命盘分析</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 lg:p-6 space-y-3 lg:space-y-4">
                {/* 第一行：出生日期、时间、性别 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 出生日期 */}
                    <div className="space-y-2">
                        <label className="text-slate-200 flex items-center text-sm">
                            <div className="w-4 h-4 mr-2 text-slate-400">📅</div>
                            出生日期
                        </label>
                        <input
                            type="date"
                            {...register('birth_date', {
                                required: '请选择出生日期',
                                validate: (value) => {
                                    const date = new Date(value);
                                    const now = new Date();
                                    if (date > now) return '出生日期不能晚于今天';
                                    if (date < new Date('1900-01-01')) return '出生日期不能早于1900年';
                                    return true;
                                }
                            })}
                            className="w-full bg-slate-600/30 border border-slate-500/50 text-slate-100 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:shadow-lg focus:shadow-slate-400/10 transition-all rounded-lg px-3 py-2 text-sm hover:bg-slate-600/40 hover:border-slate-400/60"
                            style={{
                                colorScheme: 'dark'
                            }}
                        />
                        {errors.birth_date && (
                            <p className="text-xs text-red-400">{errors.birth_date.message}</p>
                        )}
                    </div>

                    {/* 出生时间 */}
                    <div className="space-y-2">
                        <label className="text-slate-200 flex items-center text-sm">
                            <div className="w-4 h-4 mr-2 text-slate-400">🕐</div>
                            出生时间
                        </label>
                        <input
                            type="time"
                            {...register('birth_time', { required: '请选择出生时间' })}
                            className="w-full bg-slate-600/30 border border-slate-500/50 text-slate-100 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:shadow-lg focus:shadow-slate-400/10 transition-all rounded-lg px-3 py-2 text-sm hover:bg-slate-600/40 hover:border-slate-400/60"
                            style={{
                                colorScheme: 'dark'
                            }}
                        />
                        {errors.birth_time && (
                            <p className="text-xs text-red-400">{errors.birth_time.message}</p>
                        )}
                    </div>

                    {/* 性别 */}
                    <div className="space-y-2">
                        <label className="text-slate-200 flex items-center text-sm">
                            <div className="w-4 h-4 mr-2 text-slate-400">👤</div>
                            性别
                        </label>
                        <div className="flex space-x-4 pt-1">
                            <label className="flex items-center space-x-2 cursor-pointer group relative">
                                <input
                                    type="radio"
                                    value="1"
                                    {...register('gender', { required: '请选择性别' })}
                                    className="absolute opacity-0 peer"
                                    id="male"
                                />
                                <div className="w-5 h-5 border-2 border-slate-400 rounded-full bg-slate-600/30 group-hover:border-slate-300 transition-all flex items-center justify-center peer-checked:border-amber-400 peer-checked:bg-amber-400/20">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-slate-200 text-sm group-hover:text-slate-100 transition-colors select-none peer-checked:text-amber-200">👨 男</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer group relative">
                                <input
                                    type="radio"
                                    value="0"
                                    {...register('gender', { required: '请选择性别' })}
                                    className="absolute opacity-0 peer"
                                    id="female"
                                />
                                <div className="w-5 h-5 border-2 border-slate-400 rounded-full bg-slate-600/30 group-hover:border-slate-300 transition-all flex items-center justify-center peer-checked:border-amber-400 peer-checked:bg-amber-400/20">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-slate-200 text-sm group-hover:text-slate-100 transition-colors select-none peer-checked:text-amber-200">👩 女</span>
                            </label>
                        </div>
                        {errors.gender && (
                            <p className="text-xs text-red-400">{errors.gender.message}</p>
                        )}
                    </div>
                </div>

                {/* 第二行：出生地点、经纬度 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 出生地点 */}
                    <div className="space-y-2">
                        <label className="text-slate-200 flex items-center text-sm">
                            <div className="w-4 h-4 mr-2 text-slate-400">📍</div>
                            出生地点
                        </label>
                        <input
                            type="text"
                            placeholder="请选择城市"
                            {...register('location_name', { required: '请选择出生地点' })}
                            className="w-full bg-slate-600/30 border border-slate-500/50 text-slate-100 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:shadow-lg focus:shadow-slate-400/10 transition-all rounded-lg px-3 py-2 text-sm hover:bg-slate-600/40 hover:border-slate-400/60"
                            readOnly
                        />
                        {errors.location_name && (
                            <p className="text-xs text-red-400">{errors.location_name.message}</p>
                        )}
                    </div>

                    {/* 经度 */}
                    <div className="space-y-2">
                        <label className="text-slate-200 text-sm">经度</label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="如：116.4（北京）"
                            {...register('longitude', {
                                required: '请输入经度',
                                min: { value: -180, message: '经度范围：-180 到 180' },
                                max: { value: 180, message: '经度范围：-180 到 180' }
                            })}
                            onChange={handleCoordinatesChange}
                            className="w-full bg-slate-600/30 border border-slate-500/50 text-slate-100 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:shadow-lg focus:shadow-slate-400/10 transition-all rounded-lg px-3 py-2 text-sm hover:bg-slate-600/40 hover:border-slate-400/60"
                            readOnly={getValues('location_name') !== '其他地点'}
                        />
                        {errors.longitude && (
                            <p className="text-xs text-red-400">{errors.longitude.message}</p>
                        )}
                    </div>

                    {/* 纬度 */}
                    <div className="space-y-2">
                        <label className="text-slate-200 text-sm">纬度</label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="如：39.9（北京）"
                            {...register('latitude', {
                                required: '请输入纬度',
                                min: { value: -90, message: '纬度范围：-90 到 90' },
                                max: { value: 90, message: '纬度范围：-90 到 90' }
                            })}
                            onChange={handleCoordinatesChange}
                            className="w-full bg-slate-600/30 border border-slate-500/50 text-slate-100 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:shadow-lg focus:shadow-slate-400/10 transition-all rounded-lg px-3 py-2 text-sm hover:bg-slate-600/40 hover:border-slate-400/60"
                            readOnly={getValues('location_name') !== '其他地点'}
                        />
                        {errors.latitude && (
                            <p className="text-xs text-red-400">{errors.latitude.message}</p>
                        )}
                    </div>
                </div>

                {/* 常用城市快速选择 */}
                <div className="space-y-2">
                    <label className="text-slate-300 text-sm">常用城市快速选择</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {popularCities.map((city) => (
                            <button
                                key={city.name}
                                type="button"
                                onClick={() => selectCity(city)}
                                className="bg-slate-600/20 border-slate-500/50 text-slate-300 hover:bg-slate-500/30 hover:border-slate-400 hover:text-slate-100 hover:shadow-lg hover:shadow-slate-400/10 transition-all duration-300 rounded-lg px-2 py-1 text-xs"
                            >
                                {city.name}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={showOtherLocationSelector}
                            className="bg-amber-600/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 hover:text-amber-100 hover:shadow-lg hover:shadow-amber-400/10 transition-all duration-300 rounded-lg px-2 py-1 text-xs"
                        >
                            其他地点
                        </button>
                    </div>
                </div>

                {/* 省份城市选择器 */}
                {showLocationSelector && (
                    <div className="space-y-3 p-4 bg-slate-600/20 rounded-lg border border-slate-500/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="text-slate-200 text-sm font-medium">选择省份和城市</h3>
                            <button
                                type="button"
                                onClick={() => setShowLocationSelector(false)}
                                className="text-slate-400 hover:text-slate-200 text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 省份选择 */}
                        <div className="space-y-2">
                            <label className="text-slate-300 text-xs">选择省份</label>
                            <select
                                value={selectedProvince}
                                onChange={(e) => handleProvinceChange(e.target.value)}
                                className="w-full bg-slate-600/30 border border-slate-500/50 text-slate-100 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all rounded-lg px-3 py-2 text-sm hover:bg-slate-600/40 hover:border-slate-400/60"
                                style={{
                                    colorScheme: 'dark'
                                }}
                            >
                                <option value="" className="bg-slate-700 text-slate-300">请选择省份</option>
                                {Object.keys(cityData).map((province) => (
                                    <option key={province} value={province} className="bg-slate-700 text-slate-100">{province}</option>
                                ))}
                            </select>
                        </div>

                        {/* 城市选择 */}
                        {selectedProvince && (
                            <div className="space-y-2">
                                <label className="text-slate-300 text-xs">选择城市</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    className="w-full bg-slate-600/30 border border-slate-500/50 text-slate-100 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all rounded-lg px-3 py-2 text-sm hover:bg-slate-600/40 hover:border-slate-400/60"
                                    style={{
                                        colorScheme: 'dark'
                                    }}
                                >
                                    <option value="" className="bg-slate-700 text-slate-300">请选择城市</option>
                                    {Object.keys(cityData[selectedProvince]).map((city) => (
                                        <option key={city} value={city} className="bg-slate-700 text-slate-100">{city}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 其他地点按钮 */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleOtherLocationSelect}
                                className="w-full bg-amber-600/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 hover:text-amber-100 px-3 py-2 rounded-lg text-sm transition-all"
                            >
                                其他地点（需手动输入经纬度）
                            </button>
                        </div>
                    </div>
                )}

                {/* 时区信息显示 */}
                {timezoneInfo && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 backdrop-blur-sm">
                        <p className="text-xs text-blue-200">
                            <strong>检测到时区：</strong>{timezoneInfo.timezone}
                            (UTC{timezoneInfo.utc_offset >= 0 ? '+' : ''}{timezoneInfo.utc_offset})
                            {timezoneInfo.estimated && ' (估算)'}
                        </p>
                    </div>
                )}

                {/* 夏令时选择 - 仅在选择其他地点时显示 */}
                {showDaylightSaving && (
                    <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 backdrop-blur-sm">
                        <div className="space-y-2">
                            <label className="text-orange-200 flex items-center text-sm">
                                <div className="w-4 h-4 mr-2 text-orange-400">☀️</div>
                                夏令时设置
                            </label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('daylight_saving')}
                                        className="w-4 h-4 text-orange-500 bg-slate-600/30 border-slate-500/50 rounded focus:ring-orange-500/20 focus:ring-2"
                                    />
                                    <span className="text-orange-200 text-sm group-hover:text-orange-100 transition-colors">
                                        当前使用夏令时（夏季时间）
                                    </span>
                                </label>
                            </div>
                            <p className="text-xs text-orange-300/70">
                                💡 夏令时通常在3-11月期间使用，会将时间提前1小时。如果不确定，建议保持不选中。
                            </p>
                        </div>
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="flex space-x-3 pt-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-medium py-2.5 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all duration-300 relative overflow-hidden group rounded-lg text-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="flex items-center justify-center relative z-10">
                            <div className="w-4 h-4 mr-2">⭐</div>
                            <span>{isSubmitting ? '计算中...' : '开始分析'}</span>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={useExampleData}
                        disabled={isSubmitting}
                        className="bg-slate-600/20 border-slate-500/50 text-slate-300 hover:bg-slate-500/30 hover:border-slate-400 hover:text-slate-100 hover:shadow-lg hover:shadow-slate-400/10 transition-all duration-300 rounded-lg px-4 py-2.5 text-sm"
                    >
                        示例数据
                    </button>
                </div>
            </form>

            {/* 帮助信息 - 紧凑版 */}
            <div className="mx-4 lg:mx-6 mb-3 lg:mb-4 p-2 lg:p-3 bg-slate-600/20 rounded-lg border border-slate-500/30">
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                    <div>
                        <p>• 出生时间越准确，分析结果越精确</p>
                        <p>• 支持全球任意地点的命盘计算</p>
                    </div>
                    <div>
                        <p>• 可通过地图应用查询经纬度坐标</p>
                        <p>• 系统会根据经纬度自动计算时区</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BirthInfoForm; 