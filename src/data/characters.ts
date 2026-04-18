// Personality traits
export type Personality = '傲娇' | '理性' | '粘人' | '暴躁' | '戏精';

export interface Character {
  id: string;
  name: string;
  gender: '男' | '女';
  personality: Personality;
  avatar: string;
  description: string;
}

// Ensure the names match the downloaded ones
import tsundereAvatar from '../assets/avatar_cn_female_tsundere_1776493609320.png';
import logicalAvatar from '../assets/avatar_cn_male_logical_1776493626012.png';
import clingyFemaleAvatar from '../assets/avatar_cn_female_clingy_1776493643876.png';
import clingyMaleAvatar from '../assets/avatar_cn_male_clingy_1776493691167.png';
import fieryAvatar from '../assets/avatar_foreign_male_fiery_1776493659838.png';
import snarkyAvatar from '../assets/avatar_foreign_female_snarky_1776493675720.png';

export const CHARACTERS: Character[] = [
  {
    id: 'char_1',
    name: '林微微',
    gender: '女',
    personality: '傲娇',
    avatar: tsundereAvatar,
    description: '傲娇初恋，嘴硬心软。'
  },
  {
    id: 'char_2',
    name: '沈默',
    gender: '男',
    personality: '理性',
    avatar: logicalAvatar,
    description: '理性学长，最讨厌无逻辑的敷衍。'
  },
  {
    id: 'char_3',
    name: '苏小软',
    gender: '女',
    personality: '粘人',
    avatar: clingyFemaleAvatar,
    description: '极度敏感，总觉得你不爱她了。'
  },
  {
    id: 'char_4',
    name: '陈星宇',
    gender: '男',
    personality: '粘人',
    avatar: clingyMaleAvatar,
    description: '粘人小狗，需要你无限的耐心。'
  },
  {
    id: 'char_5',
    name: 'Arthur',
    gender: '男',
    personality: '暴躁',
    avatar: fieryAvatar,
    description: '暴躁留学生，一点就着。'
  },
  {
    id: 'char_6',
    name: 'Chloe',
    gender: '女',
    personality: '戏精',
    avatar: snarkyAvatar,
    description: '混血戏精，最擅长阴阳怪气。'
  }
];

export const SCENARIOS = [
  "打游戏没回消息",
  "忘记了纪念日",
  "偷偷买了昂贵的手办不敢说",
  "昨天晚上说晚安后被发现在打排位",
  "给其他异性的朋友圈点赞被发现"
];
