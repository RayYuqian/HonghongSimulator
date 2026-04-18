import { type Character } from '../data/characters';
import { maleMaleScenarios, maleFemaleScenarios, femaleFemaleScenarios, femaleMaleScenarios } from '../data/scenarios';

// Message types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  reply: string;      // The actual response text
  moodChange: number; // Positive for better mood, negative for worse mood (-20 to +20)
}

// Ensure the API key exists
const getApiKey = () => {
  // Can be replaced with localStorage fetch if needed
  return import.meta.env.OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('VITE_OPENROUTER_API_KEY') || '';
};

export const generateAIResponse = async (
  userGender: '男' | '女',
  character: Character,
  scenario: string,
  history: ChatMessage[],
  currentMood: number
): Promise<LLMResponse> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('未配置 API Key');
  }

  // Build the system prompt
  const systemPrompt = `你是一款名为“哄哄模拟器”的高级沟通练习游戏中的 AI 角色。

你的身份设定：
- 名字：${character.name}
- 性别：${character.gender}
- 性格：${character.personality}（极其深入代入：傲娇要嘴硬心软、理性要讲究逻辑、粘人要缺乏安全感、暴躁要直接易怒、戏精要阴阳怪气）。
- 角色说明：${character.description}

【核心指令：视角锁定，你是兴师问罪的一方】
1. **主客体定义**：
   - **你（AI）**：${character.name}，那个处于愤怒、怀疑或受伤状态的人。
   - **玩家（用户）**：那个犯了错（抽到了以下把柄）的人。
2. **身份关联**：当前对局玩家性别为【${userGender}性】。请根据异性/同性组合微调你的回复风格。
3. **回复要求**：
   - 简短（10-40字之间），不要用标点符号，年轻人聊天一般用空格代替标点符号。
   - **抓准核心矛盾**：必须准确识别并在第一句话里直接攻击玩家在这个场景里**最恶劣的那个错误行为**。比如“吐槽裙子像窗帘”重点是“你说像窗帘”，而不是“裙子昂贵”。
   - **逻辑严密**：必须仔细阅读玩家的辩解，针对其找的借口（如加班、别人玩的号等）进行犀利、符合常理的反驳。
   - **拒绝胡言乱语**：不要说出逻辑不通、前言不搭后语的话。如果玩家扯出第三方（如“我弟弟”），请顺着逻辑进行质问（如：“少拿你弟当借口！”），绝对不要产生角色认知错乱。
   - 要模拟真实人类的聊天方式，拒绝AI味。

当前冲突背景（这是玩家犯的错，由你抓包发难）：${scenario}
当前你对用户的心情值：${currentMood}/100。`;

  // Parse history into a readable dialogue string
  const dialogue = history.length > 0
    ? history.map(msg => `${msg.role === 'user' ? '【玩家】' : `【${character.name}】`}：${msg.content}`).join('\n')
    : '（这是你们今晚的第一次开口，你需要马上发难）';

  const finalSystemPrompt = `${systemPrompt}

【历史对话记录】
${dialogue}

请基于上述历史对话，以及当前你 ${currentMood}/100 的心情，决定你的下一步回复内容。
输出格式要求（必须是严格的JSON）：
{
  "reply": "文字回复内容（保持当前人设和语气的连贯性）",
  "moodChange": 数字（最低-20，最高+20）
}
绝对不要输出任何其他字段或 Markdown 标记，只要纯粹的 JSON 字符串！`;

  const requestMessages = [
    { role: 'system', content: finalSystemPrompt },
    { role: 'user', content: '现在轮到你回复了，请直接输出纯 JSON 对象，不要带任何多余的话。' }
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://honghong-simulator.com', // Optional but recommended
        'X-Title': 'Honghong Simulator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3.2',
        messages: requestMessages,
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const detailedMsg = errData?.error?.message || errData?.error?.metadata?.raw || '';
      throw new Error(`API Error: ${response.status} ${detailedMsg}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Attempt to parse JSON strictly
    try {
      const parsed = JSON.parse(content);
      return {
        reply: parsed.reply || '哼...我不懂你在说什么。',
        moodChange: typeof parsed.moodChange === 'number' ? parsed.moodChange : 0
      };
    } catch (e) {
      // Fallback in case the LLM returned extra text
      console.error("Failed to parse JSON", content);
      return {
        reply: "（系统异常）" + content,
        moodChange: 0
      };
    }
  } catch (error) {
    console.error("LLM API Fetch Error:", error);
    throw error;
  }
};

export interface EQReport {
  score: number;
  summary: string;
  highlights: string[];
  improvements: string[];
}

export const generateEQReport = async (
  userGender: '男' | '女',
  character: Character,
  scenario: string,
  history: ChatMessage[],
  finalMood: number
): Promise<EQReport> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('未配置 API Key');

  // Format the chat history into a readable dialogue for the LLM inspector
  const dialogue = history
    .filter(msg => msg.role !== 'system')
    .map(msg => `${msg.role === 'user' ? '玩家' : character.name}: ${msg.content}`)
    .join('\n');

  const systemPrompt = `你是一位高情商且毒舌的“沟通学专家与情感导师”。你的任务是查看一段玩家（${userGender}性）与【${character.name}】（性别：${character.gender}，性格：${character.personality}）在【${scenario}】场景下的对话履历，并给玩家的情商表现进行复盘打分。

用户的最终哄人结果（心情值，满分100）：${finalMood}

历史对话内容如下：
${dialogue}

请基于整体对话过程，严格以 JSON 格式输出如下字段的内容：
{
  "score": 整数，用户的情商得分（0-100），如果是直男发言就给低分，高情商拉扯给高分。
  "summary": "一段约50字的毒舌但犀利的总体评价",
  "highlights": ["高情商发言点拨/好的方面1", "好的方面2（如果没有就不填）"],
  "improvements": ["踩雷的发言/可以改进的方面1", "建议2"]
}
绝对不要输出其他任何 Markdown 标记！`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://honghong-simulator.com',
        'X-Title': 'Honghong Simulator'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Report API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      score: parsed.score || 0,
      summary: parsed.summary || "分析失败，无法给出评价。",
      highlights: parsed.highlights || [],
      improvements: parsed.improvements || []
    };
  } catch (error) {
    console.error("EQ Report Error:", error);
    return {
      score: 50,
      summary: "由于网络波动，导师被气到离线了。无法生成详细报告。",
      highlights: [],
      improvements: ["检查网络连接或 API_KEY 配置"]
    };
  }
};
export const generateRandomScenario = async (character: Character, userGender: '男' | '女'): Promise<string> => {
  let scenarios: string[];
  if (userGender === '男' && character.gender === '男') scenarios = maleMaleScenarios;
  else if (userGender === '男' && character.gender === '女') scenarios = maleFemaleScenarios;
  else if (userGender === '女' && character.gender === '女') scenarios = femaleFemaleScenarios;
  else scenarios = femaleMaleScenarios;

  const randomIndex = Math.floor(Math.random() * scenarios.length);
  return scenarios[randomIndex];
};
