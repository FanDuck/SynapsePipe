import "server-only";

import { count, eq } from "drizzle-orm";

import { encryptSecret } from "@/lib/crypto";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";
import { assets, prompts, settings } from "./schema";
import type { NewAsset, NewPrompt } from "@/lib/types";

type Db = BetterSQLite3Database<typeof schema>;

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

function daysAgo(days: number, hours = 0) {
  return new Date(Date.now() - days * DAY - hours * HOUR);
}

const demoPrompts: NewPrompt[] = [
  {
    id: "prompt_neon_courier",
    title: "霓虹信使 · 雨夜东京",
    description: "一场关于记忆邮差的赛博朋克追逐，霓虹在积水里碎裂。",
    promptZh:
      "电影感中景跟拍，[主体]身穿半透明虹彩雨衣，穿行在[雨夜东京的霓虹巷道]，手中握着一枚发光的记忆胶囊。地面积水反射品红与青色招牌，细雨形成体积光，背景是层叠的汉字招牌与蒸汽。35mm 变形镜头，浅景深，柯达 Vision3 500T 色彩，轻微胶片颗粒，高动态范围，赛博朋克电影概念艺术。",
    promptEn:
      "Cinematic tracking medium shot of [subject] wearing a translucent iridescent raincoat, moving through [a neon-drenched Tokyo alley at night], holding a glowing memory capsule. Wet asphalt reflects magenta and cyan signage, volumetric light through rain, layered kanji signs and steam in the background. 35mm anamorphic lens, shallow depth of field, Kodak Vision3 500T palette, subtle film grain, high dynamic range, cyberpunk film concept art.",
    negativePrompt:
      "overexposed, flat lighting, plastic skin, extra fingers, watermark, text artifacts, low detail, blurry, deformed hands",
    style: "cyberpunk",
    camera: "tracking",
    model: "flux",
    aspectRatio: "21:9",
    stage: "ready",
    tags: ["赛博朋克", "雨夜", "电影感", "霓虹"],
    variables: ["主体", "雨夜东京的霓虹巷道"],
    shotParams: {
      focalLength: "35mm anamorphic",
      aperture: "T2.3",
      lighting: "霓虹实景光 + 雨雾体积光",
      composition: "偏心跟拍，前景积水反射",
      mood: "忧郁、潮湿、未来主义的孤独",
    },
    isFavorite: true,
    usageCount: 42,
    createdAt: daysAgo(9, 3),
    updatedAt: daysAgo(0, 2),
  },
  {
    id: "prompt_lunar_greenhouse",
    title: "月球温室 · 银色植物",
    description: "在静默的月球环形山里，一座玻璃穹顶培育着银色植物。",
    promptZh:
      "超广角航拍，位于月球环形山内部的巨大极简主义玻璃温室，穹顶内生长着半透明的银色植物，地球悬在黑色天幕上。冷色月光与温室内的暖色生长灯形成对比，负空间构图，NASA 复古未来主义，建筑摄影，超高细节，体积雾，柔和的镜头光晕。",
    promptEn:
      "Ultra-wide aerial photograph of a vast minimalist glass greenhouse inside a lunar crater, translucent silver plants growing beneath the dome, Earth suspended in the black sky. Cold moonlight contrasts with warm grow lights, generous negative space, NASA retro-futurism, architectural photography, hyper-detailed, volumetric fog, soft lens flare.",
    negativePrompt: "clutter, harsh shadows, oversaturated, cartoon, low resolution, warped structure",
    style: "3d",
    camera: "aerial",
    model: "midjourney",
    aspectRatio: "16:9",
    stage: "crafting",
    tags: ["未来建筑", "月球", "极简", "科幻"],
    variables: [],
    shotParams: {
      focalLength: "18mm ultra-wide",
      aperture: "f/8",
      lighting: "冷月光 + 暖色生长灯",
      composition: "中央对称穹顶，地球为视觉锚点",
      mood: "静谧、宏大、克制的希望",
    },
    isFavorite: true,
    usageCount: 28,
    createdAt: daysAgo(8, 1),
    updatedAt: daysAgo(1, 4),
  },
  {
    id: "prompt_dune_wanderer",
    title: "沙丘旅人 · 黄昏公路",
    description: "无尽沙丘上的一辆复古越野车，驶向被风吞噬的太阳。",
    promptZh:
      "21:9 宽银幕构图，一辆覆满沙尘的复古越野车沿着[沙漠公路]驶向巨大的橙色落日，车轮扬起细沙。远处沙丘的曲线被侧逆光勾勒，空气中有热浪与尘土，极简构图，大片留白，公路电影氛围，Anamorphic 镜头光晕，胶片质感，史诗尺度。",
    promptEn:
      "21:9 widescreen composition, a sand-covered vintage off-road vehicle driving along [a desert highway] toward an enormous orange sun, fine dust rising from the tires. Distant dune curves rim-lit by backlight, heat haze and airborne dust, minimalist composition with vast negative space, road-movie atmosphere, anamorphic lens flare, film texture, epic scale.",
    negativePrompt: "green vegetation, modern cars, busy composition, oversharpened, HDR halos",
    style: "cinematic",
    camera: "wide-angle",
    model: "midjourney",
    aspectRatio: "21:9",
    stage: "ready",
    tags: ["公路电影", "沙漠", "黄昏", "宽银幕"],
    variables: ["沙漠公路"],
    shotParams: {
      focalLength: "40mm anamorphic",
      aperture: "f/4",
      lighting: "侧逆光落日前 20 分钟",
      composition: "三分法，车置于右下，太阳巨大",
      mood: "自由、苍凉、史诗般的孤独",
    },
    isFavorite: false,
    usageCount: 37,
    createdAt: daysAgo(12, 5),
    updatedAt: daysAgo(2, 1),
  },
  {
    id: "prompt_mechanical_whale",
    title: "星云机械鲸",
    description: "由星云、青铜齿轮与旧钟表零件构成的巨鲸在深空游弋。",
    promptZh:
      "奇幻超现实场景，一头由[星云与青铜齿轮]构成的巨大机械鲸鱼在深空中缓慢游动，鲸身内部透出琥珀色光芒，旧钟表零件、天文仪器与透明玻璃共同构成它的骨骼。远处是一颗正在坍缩的紫色恒星，细微的星尘形成鲸鱼拖尾。体积光，超精细材质，博物馆级概念艺术，史诗构图。",
    promptEn:
      "Surreal fantasy scene, a colossal mechanical whale made of [nebulae and bronze gears] drifting slowly through deep space, amber light glowing from within, antique clockwork, astronomical instruments and translucent glass forming its skeleton. A collapsing violet star in the distance, fine stardust trailing behind the whale. Volumetric light, ultra-detailed materials, museum-grade concept art, epic composition.",
    negativePrompt: "fish scales, cartoon, low detail, cluttered composition, text, watermark",
    style: "fantasy",
    camera: "aerial",
    model: "flux",
    aspectRatio: "16:9",
    stage: "idea",
    tags: ["机械生物", "深空", "蒸汽朋克", "概念艺术"],
    variables: ["星云与青铜齿轮"],
    shotParams: {
      focalLength: "24mm",
      aperture: "f/2.8",
      lighting: "琥珀色内部发光 + 冷紫环境光",
      composition: "对角线游动，恒星为背景焦点",
      mood: "神秘、庄严、时间凝固",
    },
    isFavorite: false,
    usageCount: 19,
    createdAt: daysAgo(6, 2),
    updatedAt: daysAgo(2, 5),
  },
  {
    id: "prompt_liquid_obsidian",
    title: "液态黑曜石 · 香水广告",
    description: "黑曜石香水瓶悬浮在液态金属表面，折射出冷冽的品牌光。",
    promptZh:
      "高端产品摄影，[黑曜石香水瓶]悬浮在镜面液态金属表面，瓶身拥有锐利的几何切面与磨砂金属瓶盖。冷白色轮廓光勾勒边缘，深紫色环境光在液体表面形成柔和的波纹反射，水珠与微小的金色粒子悬浮在空气中。微距镜头，浅景深，商业广告级布光，超写实，8K 材质细节。",
    promptEn:
      "High-end product photography, a [black obsidian perfume bottle] floating above a mirror-like liquid metal surface, sharp geometric facets and a brushed metal cap. Cool white rim light traces the silhouette, deep violet ambient light creates soft ripples on the liquid, water droplets and tiny gold particles suspended in air. Macro lens, shallow depth of field, commercial advertising lighting, hyper-realistic, 8K material detail.",
    negativePrompt: "cheap plastic, messy reflections, visible studio, low contrast, text, logo artifacts",
    style: "3d",
    camera: "macro",
    model: "midjourney",
    aspectRatio: "4:3",
    stage: "ready",
    tags: ["产品摄影", "香水", "液态金属", "商业广告"],
    variables: ["黑曜石香水瓶"],
    shotParams: {
      focalLength: "100mm macro",
      aperture: "f/8",
      lighting: "冷白轮廓光 + 深紫环境光",
      composition: "中央悬浮，液体地平线分割画面",
      mood: "奢华、冷静、精准",
    },
    isFavorite: true,
    usageCount: 51,
    createdAt: daysAgo(15, 2),
    updatedAt: daysAgo(3, 2),
  },
  {
    id: "prompt_paper_forest",
    title: "纸艺森林 · 晨光",
    description: "层叠手工纸雕构成的森林，薄雾穿过纸的纤维。",
    promptZh:
      "手工纸雕艺术，层叠的米白色纸张剪裁成一片森林，从前景的草丛到远景的树冠形成七层景深。清晨的阳光从侧面穿过纸的纤维，薄雾在层与层之间流动，细小的纸屑像花粉一样漂浮。柔和阴影，温暖中性色，微距摄影，精湛的剪纸工艺，安静的诗意。",
    promptEn:
      "Handcrafted paper-cut art, layered cream-colored paper cut into a forest, seven layers of depth from foreground grass to distant canopy. Morning sunlight filters sideways through the paper fibers, thin mist drifting between layers, tiny paper flakes floating like pollen. Soft shadows, warm neutral palette, macro photography, exquisite papercraft, quiet poetry.",
    negativePrompt: "glossy, plastic, digital painting, harsh contrast, cluttered, torn edges",
    style: "illustration",
    camera: "close-up",
    model: "sdxl",
    aspectRatio: "4:3",
    stage: "crafting",
    tags: ["纸艺", "微距", "晨光", "手工艺"],
    variables: [],
    shotParams: {
      focalLength: "90mm macro",
      aperture: "f/5.6",
      lighting: "清晨侧逆光，柔和扩散",
      composition: "层叠景深，光束引导视线",
      mood: "宁静、治愈、手工的温度",
    },
    isFavorite: false,
    usageCount: 12,
    createdAt: daysAgo(4, 6),
    updatedAt: daysAgo(3, 6),
  },
  {
    id: "prompt_cyber_kyoto",
    title: "赛博京都 · 千本鸟居",
    description: "雨后的伏见稻荷，霓虹灯管缠绕着无尽鸟居。",
    promptZh:
      "动漫电影质感，雨后的伏见稻荷千本鸟居，无数朱红色鸟居向山间延伸，每根柱子上缠绕着细细的青色霓虹灯管，湿润的石阶反射微光。一位撑透明伞的少女站在画面中央，远处是发光的京都塔与低垂的云。低机位仰拍，广角透视，新海诚式光影，细腻的背景绘制，电影级色彩。",
    promptEn:
      "Anime film still of the endless Fushimi Inari torii gates after rain, vermilion pillars stretching into the mountain, wrapped with thin cyan neon tubes, wet stone steps reflecting the glow. A girl with a transparent umbrella stands at the center, a glowing Kyoto Tower and low clouds in the distance. Low-angle wide shot, Makoto Shinkai lighting, intricate background painting, cinematic color.",
    negativePrompt: "photorealistic, 3d render, flat colors, low detail, extra limbs, text",
    style: "anime",
    camera: "low-angle",
    model: "sdxl",
    aspectRatio: "9:16",
    stage: "drafting",
    tags: ["日本", "鸟居", "新海诚", "雨夜"],
    variables: [],
    shotParams: {
      focalLength: "24mm",
      aperture: "f/2",
      lighting: "霓虹 + 湿润反光 + 低云辉光",
      composition: "对称鸟居隧道，人物为中景锚点",
      mood: "乡愁、神秘、赛博与传统交叠",
    },
    isFavorite: true,
    usageCount: 22,
    createdAt: daysAgo(5, 1),
    updatedAt: daysAgo(4, 3),
  },
  {
    id: "prompt_analog_station",
    title: "66 号公路 · 最后一座加油站",
    description: "黄昏时分荒漠中的孤独加油站，像一段被遗忘的胶片。",
    promptZh:
      "35mm 胶片摄影，黄昏时分的 66 号公路旁，一家孤独的复古加油站在荒漠中亮起暖黄色灯箱。生锈的加油泵、褪色的可口可乐招牌、龟裂的水泥地面，远处是紫蓝色山脉与一大片空白天空。低机位广角，柯达 Portra 400 色彩，轻微漏光与颗粒，怀旧公路旅行，安静而忧伤。",
    promptEn:
      "35mm film photography, a lonely vintage gas station glowing with warm yellow light beside Route 66 at dusk, rusted pumps, faded soda sign, cracked concrete, distant violet-blue mountains and a vast empty sky. Low-angle wide shot, Kodak Portra 400 palette, subtle light leak and grain, nostalgic road trip, quiet and melancholic.",
    negativePrompt: "modern cars, people, HDR, digital sharpness, oversaturated, neon",
    style: "photography",
    camera: "low-angle",
    model: "midjourney",
    aspectRatio: "3:4",
    stage: "ready",
    tags: ["胶片", "公路旅行", "怀旧", "美国"],
    variables: [],
    shotParams: {
      focalLength: "28mm",
      aperture: "f/5.6",
      lighting: "日落后蓝调时刻 + 钨丝灯箱",
      composition: "低机位，招牌与山脉形成三角",
      mood: "怀旧、孤独、公路电影的余温",
    },
    isFavorite: false,
    usageCount: 33,
    createdAt: daysAgo(20, 4),
    updatedAt: daysAgo(5, 1),
  },
  {
    id: "prompt_static_echo",
    title: "静电回声 · 故障艺术海报",
    description: "黑白噪点与扫描线构成的人脸，在模拟电视信号中消散。",
    promptZh:
      "实验性故障艺术海报，一张由黑白模拟电视噪点、水平扫描线与色差构成的[人脸轮廓]，在画面右侧逐渐消散为像素与静电雪花。粗颗粒、高对比、单色为主并带少量青绿色通道偏移，极简排版留白于左侧。丝网印刷质感，瑞士国际主义版式，模拟信号美学，超精细噪点。",
    promptEn:
      "Experimental glitch-art poster, a [human face silhouette] built from black-and-white analog TV noise, horizontal scanlines and chromatic aberration, dissolving into pixels and static on the right side. Heavy grain, high contrast, mostly monochrome with subtle cyan-green channel shift, minimalist copy space on the left. Screen-print texture, Swiss International Style layout, analog signal aesthetics, ultra-fine noise.",
    negativePrompt: "colorful, smooth gradients, photorealistic, 3d, busy typography, watermark",
    style: "minimal",
    camera: "close-up",
    model: "flux",
    aspectRatio: "3:4",
    stage: "idea",
    tags: ["故障艺术", "海报", "单色", "实验"],
    variables: ["人脸轮廓"],
    shotParams: {
      focalLength: "50mm",
      aperture: "f/4",
      lighting: "高对比硬光 + CRT 屏幕自发光",
      composition: "人物右偏，左侧大面积排版留白",
      mood: "冷峻、失真、数字时代的幽灵",
    },
    isFavorite: false,
    usageCount: 8,
    createdAt: daysAgo(2, 2),
    updatedAt: daysAgo(6, 4),
  },
];

const demoAssets: NewAsset[] = [
  {
    id: "asset_neon_courier",
    title: "Neon Courier / 记忆邮差",
    type: "image",
    source: "url",
    url: "/demo/neon-courier.svg",
    promptId: "prompt_neon_courier",
    promptSnapshot:
      demoPrompts[0].promptZh as string,
    seed: "884120934",
    model: "flux",
    category: "character",
    tags: ["赛博朋克", "电影感", "雨夜"],
    params: { aspect: "21:9", steps: 32, guidance: 3.5, sampler: "Euler" },
    width: 1680,
    height: 720,
    isFavorite: true,
    createdAt: daysAgo(0, 2),
    updatedAt: daysAgo(0, 2),
  },
  {
    id: "asset_lunar_greenhouse",
    title: "Lunar Greenhouse / 月球温室",
    type: "image",
    source: "url",
    url: "/demo/lunar-greenhouse.svg",
    promptId: "prompt_lunar_greenhouse",
    promptSnapshot: demoPrompts[1].promptZh as string,
    seed: "20394811",
    model: "midjourney",
    category: "environment",
    tags: ["未来建筑", "月球", "极简"],
    params: { aspect: "16:9", stylize: 420, chaos: 12, version: "6.1" },
    width: 1600,
    height: 900,
    isFavorite: true,
    createdAt: daysAgo(1, 1),
    updatedAt: daysAgo(1, 1),
  },
  {
    id: "asset_dune_wanderer",
    title: "Dune Wanderer / 沙丘旅人",
    type: "image",
    source: "url",
    url: "/demo/dune-wanderer.svg",
    promptId: "prompt_dune_wanderer",
    promptSnapshot: demoPrompts[2].promptZh as string,
    seed: "66120935",
    model: "midjourney",
    category: "environment",
    tags: ["公路电影", "沙漠", "黄昏"],
    params: { aspect: "21:9", stylize: 680, version: "6.1" },
    width: 1680,
    height: 720,
    isFavorite: false,
    createdAt: daysAgo(2, 4),
    updatedAt: daysAgo(2, 4),
  },
  {
    id: "asset_mechanical_whale",
    title: "Mechanical Whale / 星云机械鲸",
    type: "image",
    source: "url",
    url: "/demo/mechanical-whale.svg",
    promptId: "prompt_mechanical_whale",
    promptSnapshot: demoPrompts[3].promptZh as string,
    seed: "77123058",
    model: "flux",
    category: "abstract",
    tags: ["机械生物", "深空", "概念艺术"],
    params: { aspect: "16:9", steps: 40, guidance: 4.2 },
    width: 1600,
    height: 900,
    isFavorite: false,
    createdAt: daysAgo(3, 2),
    updatedAt: daysAgo(3, 2),
  },
  {
    id: "asset_liquid_obsidian",
    title: "Liquid Obsidian / 液态黑曜石",
    type: "image",
    source: "url",
    url: "/demo/liquid-obsidian.svg",
    promptId: "prompt_liquid_obsidian",
    promptSnapshot: demoPrompts[4].promptZh as string,
    seed: "90218344",
    model: "midjourney",
    category: "product",
    tags: ["产品摄影", "香水", "液态金属"],
    params: { aspect: "4:3", stylize: 750, version: "6.1" },
    width: 1440,
    height: 1080,
    isFavorite: true,
    createdAt: daysAgo(4, 5),
    updatedAt: daysAgo(4, 5),
  },
  {
    id: "asset_paper_forest",
    title: "Paper Forest / 纸艺森林",
    type: "image",
    source: "url",
    url: "/demo/paper-forest.svg",
    promptId: "prompt_paper_forest",
    promptSnapshot: demoPrompts[5].promptZh as string,
    seed: "31415926",
    model: "sdxl",
    category: "environment",
    tags: ["纸艺", "晨光", "手工艺"],
    params: { aspect: "4:3", steps: 30, cfg: 6.5, sampler: "DPM++ 2M" },
    width: 1440,
    height: 1080,
    isFavorite: false,
    createdAt: daysAgo(5, 2),
    updatedAt: daysAgo(5, 2),
  },
  {
    id: "asset_cyber_kyoto",
    title: "Cyber Kyoto / 赛博京都",
    type: "image",
    source: "url",
    url: "/demo/cyber-kyoto.svg",
    promptId: "prompt_cyber_kyoto",
    promptSnapshot: demoPrompts[6].promptZh as string,
    seed: "55018372",
    model: "sdxl",
    category: "environment",
    tags: ["日本", "鸟居", "新海诚"],
    params: { aspect: "9:16", steps: 36, cfg: 7 },
    width: 900,
    height: 1600,
    isFavorite: true,
    createdAt: daysAgo(6, 1),
    updatedAt: daysAgo(6, 1),
  },
  {
    id: "asset_analog_station",
    title: "Analog Station / 最后一座加油站",
    type: "image",
    source: "url",
    url: "/demo/analog-station.svg",
    promptId: "prompt_analog_station",
    promptSnapshot: demoPrompts[7].promptZh as string,
    seed: "19770404",
    model: "midjourney",
    category: "environment",
    tags: ["胶片", "公路旅行", "怀旧"],
    params: { aspect: "3:4", stylize: 300, version: "6.1" },
    width: 1080,
    height: 1440,
    isFavorite: false,
    createdAt: daysAgo(7, 3),
    updatedAt: daysAgo(7, 3),
  },
];

export function seedDatabase(db: Db) {
  const existingSettings = db.select().from(settings).where(eq(settings.id, 1)).get();
  if (!existingSettings) {
    db.insert(settings)
      .values({
        id: 1,
        llmBaseUrl: process.env.SYNAPSE_LLM_BASE_URL?.trim() || "https://api.deepseek.com/v1",
        llmModel: process.env.SYNAPSE_LLM_MODEL?.trim() || "deepseek-chat",
        llmApiKeyCipher: encryptSecret(process.env.SYNAPSE_LLM_API_KEY?.trim() || ""),
        defaultNegativePrompt:
          "low quality, blurry, oversaturated, deformed, watermark, text artifacts",
        defaultLanguage: "bilingual",
      })
      .run();
  }

  if (process.env.SYNAPSE_DISABLE_DEMO_SEED === "1") return;

  const promptCount = db.select({ value: count() }).from(prompts).get()?.value ?? 0;
  if (promptCount === 0) {
    db.insert(prompts).values(demoPrompts).run();
  }

  const assetCount = db.select({ value: count() }).from(assets).get()?.value ?? 0;
  if (assetCount === 0) {
    db.insert(assets).values(demoAssets).run();
  }
}
