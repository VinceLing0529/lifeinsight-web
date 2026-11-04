# -*- coding: utf-8 -*-
"""
紫微格局识别（移植自 Renhuai123/ziwei-doushu 的 lib/ziwei/patterns.ts，MIT。

许可与出处：原项目 MIT 许可；格局判定逻辑（必须/加分/破格三层条件、
庙旺陷、三方四正与夹宫）按其 v2 严格化版本移植，判定口径从严；
本模块的中文说明为 lifeinsight 自行撰写的简版，不复制原文案。
古籍出处：《紫微斗数全书》《紫微斗数全集》《骨髓赋》及倪海厦《天纪》立场
（不用宫干自化/来因宫等飞星派工具做格局判定）。
"""
from typing import Any, Dict, List, Optional

_BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
SHA_NAMES = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"]
SHA_HARD = ["擎羊", "陀罗", "火星", "铃星"]
SHA_KONG = ["地空", "地劫"]


class _Palace:
    __slots__ = ("name", "branch", "major", "stars", "bright", "dim", "mutagen")

    def __init__(self, name, branch, major, stars, bright, dim, mutagen):
        self.name = name
        self.branch = branch
        self.major = major          # 主星名列表
        self.stars = stars          # 全部星名集合（主+辅+杂）
        self.bright = bright        # 星名 -> 是否庙旺
        self.dim = dim              # 星名 -> 是否落陷
        self.mutagen = mutagen      # 星名 -> 生年四化（禄/权/科/忌）


class _Chart:
    def __init__(self, palaces: Dict[str, Any], year_four_trans: Dict[str, Any]):
        self.palaces: List[_Palace] = []
        self.by_name: Dict[str, _Palace] = {}
        self.by_branch: Dict[int, _Palace] = {}
        mutagen_global: Dict[str, str] = {}
        if isinstance(year_four_trans, dict):
            for trans, info in year_four_trans.items():
                if isinstance(info, dict) and info.get("star"):
                    mutagen_global[info["star"]] = trans
        body_branch = None
        for name, raw in (palaces or {}).items():
            if not isinstance(raw, dict):
                continue
            branch_ch = raw.get("earthly_branch", "")
            # 空字符串是任何字符串的子串，必须先排除，否则 "" 会误命中子 (index 0)
            branch = _BRANCHES.index(branch_ch) if branch_ch and branch_ch in _BRANCHES else -1
            major, bright, dim, mutagen = [], {}, {}, {}
            for st in raw.get("major_stars") or []:
                if isinstance(st, dict) and st.get("name"):
                    major.append(st["name"])
                    b = st.get("brightness", "")
                    bright[st["name"]] = b in ("庙", "旺")
                    dim[st["name"]] = b == "陷"
                    if st.get("mutagen"):
                        mutagen[st["name"]] = st["mutagen"]
            stars = set(major)
            for key in ("minor_stars", "adjective_stars"):
                for nm in raw.get(key) or []:
                    if isinstance(nm, str):
                        stars.add(nm)
                    elif isinstance(nm, dict) and nm.get("name"):
                        stars.add(nm["name"])
            for star, trans in mutagen_global.items():
                if star in stars and star not in mutagen:
                    mutagen[star] = trans
            p = _Palace(name, branch, major, stars, bright, dim, mutagen)
            self.palaces.append(p)
            self.by_name[name] = p
            if branch >= 0:
                self.by_branch[branch] = p
            if raw.get("is_body_palace"):
                body_branch = branch
        ming = self.by_name.get("命宫")
        self.ming: Optional[_Palace] = ming
        self.ming_branch = ming.branch if ming else -1
        self.shen_branch = body_branch if body_branch is not None else -1

    # ---- helpers（对应原 TS 辅助函数）----
    def star_palace(self, star: str) -> Optional[_Palace]:
        for p in self.palaces:
            if star in p.stars:
                return p
        return None

    def sanfang(self) -> List[_Palace]:
        m = self.ming_branch
        return [self.by_branch[b] for b in ((m) % 12, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12)
                if b in self.by_branch]

    def sanfang_star_set(self) -> set:
        out = set()
        for p in self.sanfang():
            out |= p.stars
        return out

    def in_sanfang(self, branch: int) -> bool:
        m = self.ming_branch
        return branch in (m % 12, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12)

    def sanfang_sha(self, lst=SHA_HARD) -> int:
        return sum(1 for p in self.sanfang() for s in p.stars if s in lst)

    def jia(self, branch: int):
        return self.by_branch.get((branch + 11) % 12), self.by_branch.get((branch + 1) % 12)

    def dui(self, branch: int) -> Optional[_Palace]:
        return self.by_branch.get((branch + 6) % 12)


def _has(p: Optional[_Palace], star: str) -> bool:
    return bool(p) and star in p.stars


def _sha_in(p: Optional[_Palace], lst=SHA_NAMES) -> bool:
    return bool(p) and any(s in p.stars for s in lst)


def _sha_count(p: Optional[_Palace], lst=SHA_HARD) -> int:
    return sum(1 for s in (p.stars if p else []) if s in lst)


def _sihua(p: Optional[_Palace], star: str):
    return p.mutagen.get(star) if p else None


def detect(palaces: Dict[str, Any], year_four_trans: Dict[str, Any]) -> List[Dict[str, Any]]:
    """返回 [{name, level, desc, breaking}]，判定口径与原 patterns.ts 一致。"""
    c = _Chart(palaces, year_four_trans)
    out: List[Dict[str, Any]] = []
    if not c.ming or c.ming_branch < 0:
        return out
    ming = c.ming
    sf = c.sanfang_star_set()

    def add(name, level, desc, breaking=None):
        out.append({"name": name, "level": level, "desc": desc, "breaking": breaking or []})

    # 君臣庆会
    if _has(ming, "紫微") and "左辅" in sf and "右弼" in sf:
        br = []
        if c.sanfang_sha(SHA_KONG) >= 2: br.append("空劫双会（紫微忌空劫）")
        add("君臣庆会", "good" if br else "excellent",
            "紫微坐命、辅弼同会：得人辅佐成事的格局，平台与团队是放大器", br)
    # 紫府同宫
    zw, tf = c.star_palace("紫微"), c.star_palace("天府")
    if zw and tf and zw.branch == tf.branch:
        br = []
        if _sha_in(zw, SHA_KONG): br.append("紫府宫坐空劫")
        if _sha_count(zw) >= 2: br.append("紫府宫双煞同坐")
        in_m = zw.branch == c.ming_branch
        add("紫府同宫", "excellent" if in_m and not br else "good",
            "紫微天府同宫：帝相并临，资源与地位兼得" + ("" if in_m else "（不在命宫，会照减力）"), br)
    # 府相朝垣
    tf, tx = c.star_palace("天府"), c.star_palace("天相")
    if tf and tx and c.in_sanfang(tf.branch) and c.in_sanfang(tx.branch) \
            and tf.branch != tx.branch and not (tf.branch == c.ming_branch == tx.branch):
        br = []
        if _sha_in(ming, SHA_HARD): br.append("命宫坐煞")
        if c.sanfang_sha() >= 3: br.append("三方煞重")
        add("府相朝垣", "good" if br else "excellent",
            "天府天相分守三方四正：资源调度与协调是强项，贵人运佳", br)
    # 阳梁昌禄
    if all(s in sf for s in ("太阳", "天梁", "文昌", "禄存")):
        sun = c.star_palace("太阳")
        br = []
        if sun and sun.dim.get("太阳"): br.append("太阳落陷（阳梁失辉）")
        if c.sanfang_sha() >= 2: br.append("三方煞重")
        add("阳梁昌禄", "good" if br else "excellent",
            "太阳、天梁、文昌、禄存齐会三方：清贵显达，利学术、文教、专业认证与考运", br)
    # 火贪 / 铃贪
    tan = c.star_palace("贪狼")
    if tan:
        for sha_name in ("火星", "铃星"):
            sp = c.star_palace(sha_name)
            if not sp: continue
            rel = (tan.branch - sp.branch) % 12
            if rel not in (0, 4, 8, 6): continue
            if not c.in_sanfang(tan.branch): continue
            br = []
            if _sha_in(tan, ["擎羊", "陀罗"]): br.append("贪狼宫又见羊陀")
            if _sha_in(tan, SHA_KONG): br.append("贪狼遇空劫（财来财去）")
            add(f"{sha_name[0]}贪格", "good" if br else "excellent",
                f"贪狼{'同宫' if rel == 0 else '会照'}{sha_name}：突发机遇与横财型格局，来得快去得也快，宜见好就收", br)
    # 武贪格
    wu, tan2 = c.star_palace("武曲"), c.star_palace("贪狼")
    if wu and tan2 and (wu.branch == tan2.branch or (wu.branch + 6) % 12 == tan2.branch) \
            and (c.in_sanfang(wu.branch) or c.in_sanfang(tan2.branch)):
        br = []
        if _sha_in(wu, ["擎羊", "陀罗"]): br.append("武贪宫见羊陀")
        if _sha_in(wu, SHA_KONG): br.append("武贪宫遇空劫")
        add("武贪格", "good" if br else "excellent",
            "武曲贪狼会命：财星与欲望星交辉，三十岁后厚积薄发，财源多由人脉与经营而来", br)
    # 杀破狼
    if all(s in sf for s in ("七杀", "破军", "贪狼")):
        br = []
        if c.sanfang_sha() >= 3: br.append("煞星过重（动而无成）")
        if _sha_in(ming, SHA_KONG): br.append("命坐空劫（动得辛苦）")
        add("杀破狼", "caution" if br else "good",
            "七杀、破军、贪狼齐会三方四正：人生主题是开创与变动，动荡中见格局，忌守成", br)
    # 机月同梁（四星全格）
    if all(s in sf for s in ("天机", "太阴", "天同", "天梁")):
        br = []
        if c.sanfang_sha() >= 3: br.append("煞星过多（机月同梁忌煞）")
        if _sha_in(ming, SHA_HARD): br.append("命宫坐煞")
        add("机月同梁", "good" if br else "excellent",
            "天机、太阴、天同、天梁四星齐会三方四正：适合专业、文职、顾问型路线，稳中求进", br)
    # 廉贞天相
    lz, tx2 = c.star_palace("廉贞"), c.star_palace("天相")
    if lz and tx2 and lz.branch == tx2.branch:
        br = []
        if _sha_in(lz, ["擎羊"]): br.append("廉相宫坐擎羊")
        if _sihua(lz, "廉贞") == "忌": br.append("廉贞化忌")
        in_m = lz.branch == c.ming_branch
        add("廉贞天相格", "caution" if br else ("good" if in_m else "neutral"),
            "廉贞天相同宫：秉公处事、重规则与名誉，宜公职、行政、法务、企划", br)
    # 武曲七杀
    wu2, qs = c.star_palace("武曲"), c.star_palace("七杀")
    if wu2 and qs and wu2.branch == qs.branch:
        br = []
        if _sihua(wu2, "武曲") == "忌": br.append("武曲化忌（财劫之兆）")
        if _sha_in(wu2, SHA_HARD): br.append("武杀宫煞重")
        in_m = wu2.branch == c.ming_branch
        add("武曲七杀", "caution" if br else ("excellent" if in_m else "good"),
            "武曲七杀同宫：将星配财星，果决刚毅、理财力强，一生靠奋斗积财", br)
    # 天同天梁
    tong, liang = c.star_palace("天同"), c.star_palace("天梁")
    if tong and liang and tong.branch == liang.branch:
        br = ["煞星同坐"] if _sha_in(tong, SHA_HARD) else []
        add("天同天梁格", "neutral" if br else "good",
            "天同天梁同宫：宽厚和善、乐于助人，宜医疗、教育、公益；偏温和保守", br)
    # 日月同宫（丑/未）
    sun, moon = c.star_palace("太阳"), c.star_palace("太阴")
    if sun and moon and sun.branch == moon.branch and sun.branch in (1, 7):
        br = ["日月宫煞星同坐"] if _sha_in(sun, SHA_HARD) else []
        in_m = sun.branch == c.ming_branch
        add("日月同宫", "good" if br else ("excellent" if in_m else "good"),
            f"太阳太阴同入{_BRANCHES[sun.branch]}宫：阴阳平衡，异性缘与名声运佳", br)
    # 日月夹命
    prev, nxt = c.jia(c.ming_branch)
    if prev and nxt:
        ok = (_has(prev, "太阳") and _has(nxt, "太阴")) or (_has(prev, "太阴") and _has(nxt, "太阳"))
        if ok:
            sp = prev if _has(prev, "太阳") else nxt
            mp = prev if _has(prev, "太阴") else nxt
            br = []
            if sp.dim.get("太阳") or mp.dim.get("太阴"): br.append("日月落陷（夹命无光）")
            add("日月夹命", "good" if br else "excellent",
                "太阳太阴分居命宫两侧夹照：一生贵人相助，事业得照拂（日月不落陷方为真夹）", br)
    # 巨日同宫（寅/申）
    ju, sun2 = c.star_palace("巨门"), c.star_palace("太阳")
    if ju and sun2 and ju.branch == sun2.branch and ju.branch in (2, 8):
        br = []
        if _sihua(ju, "巨门") == "忌": br.append("巨门化忌（口舌官非）")
        if ju.branch == 8: br.append("申宫太阳偏西，巨门暗曜更显")
        in_m = ju.branch == c.ming_branch
        add("巨日同宫", "caution" if br else ("excellent" if in_m and ju.branch == 2 else "good"),
            "巨门太阳同宫：太阳化解巨门之暗，以口才、传媒、专业立业（寅宫为佳）", br)
    # 石中隐玉
    if _has(ming, "巨门") and ming.branch in (0, 6):
        br = []
        if _sihua(ming, "巨门") == "忌": br.append("巨门化忌（玉藏深泥）")
        if _sha_in(ming, SHA_HARD): br.append("命坐煞星")
        add("石中隐玉", "caution" if br else "excellent",
            "巨门坐命子午：外表平凡、内蕴才学，早年默默、中年方显，宜专业与研究", br)
    # 明珠出海
    if ming.branch == 7 and not ming.major:
        dui = c.dui(ming.branch)
        if dui and _has(dui, "太阳") and _has(dui, "太阴"):
            br = ["煞星会照（珠光黯淡）"] if c.sanfang_sha() >= 2 else []
            add("明珠出海", "good" if br else "excellent",
                "命未空宫、对宫日月同辉拱照：出生平凡、后天出头，宜远赴他乡发展", br)
    # 紫微入命（独坐）
    if _has(ming, "紫微") and not _has(ming, "天府"):
        br = []
        if "左辅" not in sf and "右弼" not in sf: br.append("无辅弼（孤君无臣）")
        if _sha_in(ming, SHA_KONG): br.append("紫微遇空劫（古书最忌）")
        bonus = ("左辅" in sf and "右弼" in sf) or ("文昌" in sf and "文曲" in sf)
        add("紫微入命", "caution" if br else ("excellent" if bonus else "good"),
            "紫微独坐命宫：自尊与领导欲强；最忌无辅弼拱照而成孤君", br)
    # 夹命类（辅弼/昌曲/魁钺/火铃/空劫）
    prev, nxt = c.jia(c.ming_branch)
    if prev and nxt:
        def _jia(a, b):
            return (_has(prev, a) and _has(nxt, b)) or (_has(prev, b) and _has(nxt, a))
        if _jia("左辅", "右弼"):
            add("辅弼夹命", "excellent", "左辅右弼夹命：贵人相助、福厚之象，宜组织与管理型舞台")
        if _jia("文昌", "文曲"):
            add("昌曲夹命", "excellent", "文昌文曲夹命：聪明俊秀、利考运，宜文教、学术、写作")
        if _jia("天魁", "天钺"):
            add("魁钺夹命", "good", "天魁天钺夹命：关键时刻常有贵人提携")
        if _jia("火星", "铃星"):
            add("火铃夹命", "caution", "火星铃星夹命：性急易冲动，重大决策宜冷静期后再定")
        if _jia("地空", "地劫"):
            add("空劫夹命", "caution", "地空地劫夹命：财来财去、思想脱俗，宜技艺与研究型事业")
    # 双禄朝垣
    sf_p = c.sanfang()
    if any(p.mutagen.get(s) == "禄" for p in sf_p for s in p.stars) and any(_has(p, "禄存") for p in sf_p):
        br = ["命坐空劫（双禄遇空，财来财去）"] if _sha_in(ming, SHA_KONG) else []
        add("双禄朝垣", "excellent", "化禄与禄存同会三方四正：财源涌动、衣食丰足", br)
    # 三奇加会
    trans_in_sf = set()
    for p in sf_p:
        trans_in_sf |= set(p.mutagen.values())
    if {"禄", "权", "科"}.issubset(trans_in_sf):
        add("三奇加会", "excellent", "化禄、化权、化科三吉化齐会三方四正：功名、财富、贵人三全")
    # 化禄入命
    for sname in ming.major:
        if ming.mutagen.get(sname) == "禄":
            add(f"{sname}化禄入命", "good", f"{sname}化禄坐命：生财顺利、人缘与机缘俱佳")
            break
    # 化忌入命/迁
    for p in (ming, c.dui(c.ming_branch)):
        if not p: continue
        for sname in p.major:
            if p.mutagen.get(sname) == "忌":
                where = "命" if p is ming else "迁"
                add(f"{sname}化忌入{where}", "caution",
                    f"{sname}化忌坐{'命宫' if where == '命' else '迁移宫'}：这一领域最放不下、是功课所在"
                    + ("，自身固执与心理关口需留意" if where == "命" else "，外出与人际易有波折，宜守不宜动"))
                break
    # 羊陀夹忌
    ji_in_ming = any(ming.mutagen.get(s) == "忌" for s in ming.stars)
    if ji_in_ming and prev and nxt:
        if (_has(prev, "擎羊") and _has(nxt, "陀罗")) or (_has(prev, "陀罗") and _has(nxt, "擎羊")):
            add("羊陀夹忌", "caution", "化忌坐命又被羊陀夹：劳碌坎坷之象，凡事谨慎、以稳为先")
    # 三方恶格组合
    if all(s in sf for s in ("廉贞", "七杀", "擎羊")):
        add("廉杀羊", "caution", "廉贞、七杀、擎羊会照三方：大限流年触发时，驾驶、人际与医疗决策格外留神")
    if all(s in sf for s in ("巨门", "火星", "擎羊")):
        add("巨火羊", "caution", "巨门、火星、擎羊会照：直言易触发冲突，情绪上头时先管表达")
    if all(s in sf for s in ("铃星", "文昌", "陀罗", "武曲")):
        add("铃昌陀武", "caution", "铃星、文昌、陀罗、武曲齐会：重大决策与情绪波动期格外理性处理")
    # 马头带箭
    if ming.branch == 6 and _has(ming, "擎羊"):
        bonus = ("七杀" in sf or "破军" in sf or "天魁" in sf or "天钺" in sf)
        add("马头带箭", "good" if bonus else "caution",
            "擎羊午宫坐命：果决与执行力是招牌，配合吉星方能成威")
    # 基础格局
    lucun = c.star_palace("禄存")
    if lucun and lucun.branch in (c.ming_branch, c.shen_branch) and c.shen_branch >= 0:
        in_m = lucun.branch == c.ming_branch
        add("禄存守命" if in_m else "禄存守身", "good",
            "禄存坐命：一生衣食无忧、善积累" if in_m else "禄存入身宫：中年后财源稳定，配偶或事业方向带来稳定财禄")
    tianma = c.star_palace("天马")
    if tianma and tianma.branch in (c.ming_branch, (c.ming_branch + 6) % 12):
        in_m = tianma.branch == c.ming_branch
        add("天马入命" if in_m else "天马在迁", "neutral",
            "天马坐命：一生奔波、动中得财，宜商旅与跨界" if in_m else "天马在迁移：外出有利、异乡发展得财")
    cai = c.by_name.get("财帛")
    if cai:
        for sname in cai.major:
            if cai.mutagen.get(sname) == "禄":
                add("化禄入财", "good", f"{sname}化禄入财帛：财源畅通，这颗星代表的能力是你赚钱的主轴")
                break
    guan = c.by_name.get("官禄")
    if guan:
        for sname in guan.major:
            if guan.mutagen.get(sname) == "权":
                add("化权入官", "good", f"{sname}化权入官禄：事业有掌控力，能担独当一面的位置")
                break
    for p, where in ((ming, "命"), (c.by_branch.get(c.shen_branch), "身")):
        if not p: continue
        done = False
        for sname in p.major:
            if p.mutagen.get(sname) == "科":
                add(f"化科入{where}", "good", f"{sname}化科入{where}宫：名声、文书、学术运加身，宜以名取利的方向")
                done = True
                break
        if done: break
    # 机月同梁三星会（3 星部分格，与四星真格互斥）
    jy = [s for s in ("天机", "太阴", "天同", "天梁") if s in sf]
    if len(jy) == 3:
        missing = [s for s in ("天机", "太阴", "天同", "天梁") if s not in sf]
        add("机月同梁三星会", "neutral",
            f"三方四正会齐{'、'.join(jy)}，缺{'、'.join(missing)}未会——机月同梁的半格，力量减一档：文质带谋，宜靠积累与稳定的行业")
    if "文昌" in sf and "文曲" in sf:
        in_m = _has(ming, "文昌") and _has(ming, "文曲")
        add("昌曲坐命" if in_m else "昌曲同会", "good",
            "文昌文曲同入命宫：文采与表达是天赋" if in_m else "文昌文曲同会三方：才华与表达俱佳，利以表达立业的行业")
    if "左辅" in sf and "右弼" in sf:
        add("辅弼同会", "good", "左辅右弼同会三方：一生贵人不绝，善用人际网络者得势")
    if "天魁" in sf and "天钺" in sf:
        add("魁钺同会", "good", "天魁天钺同会三方：天乙贵人加持，关键时刻有人提携")
    ke = any(p.mutagen.get(s) == "科" for p in sf_p for s in p.major)
    quan = any(p.mutagen.get(s) == "权" for p in sf_p for s in p.major)
    if ke and quan:
        add("科权双会", "good", "化科与化权同会三方：名权双美，宜走专业权威路线")
    return out
