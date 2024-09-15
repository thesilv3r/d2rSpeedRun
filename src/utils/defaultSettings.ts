import { Settings } from "../@types/main.d";

const defaultSettings: Settings = {
  saveDir: '',
  lang: '',
  font: 'Roboto',
  columnGap: 10,
  selectedGemFilters: ['runes', 'topaz', 'amethyst', 'sapphire', 'ruby', 'emerald', 'diamond', 'skull'],
  runesGemsPosition: 'below',
  statsDisplayMode: 'Grid',
  textAlignment: 'left',
}

export default defaultSettings;