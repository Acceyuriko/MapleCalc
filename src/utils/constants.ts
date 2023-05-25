export const PROMOTION_TYPE = {
  ATT: 'att',
  STAT: 'stat',
  IED: 'ied',
  BOSS: 'boss',
  ATT_PER: 'att_per',
  STAT_PER: 'stat_per',
  CRI_DMG: 'critical_damage',
};

export const PROMOTION_TYPE_MAP = {
  [PROMOTION_TYPE.ATT]: '攻击力',
  [PROMOTION_TYPE.STAT]: '属性',
  [PROMOTION_TYPE.IED]: '无视防御',
  [PROMOTION_TYPE.BOSS]: 'BOSS伤害',
  [PROMOTION_TYPE.ATT_PER]: '攻击力百分比',
  [PROMOTION_TYPE.STAT_PER]: '属性百分比',
  [PROMOTION_TYPE.CRI_DMG]: '爆伤',
};
