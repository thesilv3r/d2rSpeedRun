import { useState, useEffect, ReactNode, Fragment } from 'react';
import { useTimer } from "react-use-precision-timer";
import { io } from "socket.io-client";
import { FileReaderResponse, Settings } from '../@types/main.d';
import { Grid, Box, createTheme, ThemeProvider } from '@mui/material';
import { GlobalStyle } from '../styles/GlobalStyle';
import prettyMs from 'pretty-ms';
import { StatLabel, StatLine, StatValue } from './styles';
import { useTranslation } from 'react-i18next';
import defaultSettings from '../utils/defaultSettings';
import styled from 'styled-components';

const gemTypes = ['topaz', 'amethyst', 'sapphire', 'ruby', 'emerald', 'diamond', 'skull'];
const gemQualities = ['chipped', 'flawed', 'normal', 'flawless', 'perfect'];
type StatKey = 'Gold' | 'Fire' | 'Cold' | 'Ligh' | 'Pois' | 'Lvl' | 'Str' | 'Dex' | 'Vit' | 'Ene' | 'FHR' | 'FCR' | 'FRW';

const FullWidthBox = styled(Box)`
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  box-sizing: border-box;
  padding: 0 10px;
  font-family: ${props => props.theme.font}, sans-serif;
`;

export default function StreamApp() {
  const [data, setData] = useState<FileReaderResponse | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const timer = useTimer({
    delay: 1000,
    callback: () => { setLastUpdate(lastUpdate + 1);}
  });
  const { t, i18n } = useTranslation();

  const containerWidth = 100 - settings.columnGap;

  useEffect(() => {
    const socket = io();
    socket.on("updatedSettings", function (newSettings: Settings) {
      i18n.changeLanguage(newSettings.lang);
      setSettings(newSettings);
    });
    socket.on("openFolder", function (data: FileReaderResponse) {
      setData(data);
      setLastUpdate(0);
    });
    timer.start();
  }, []);

  if (data === null) {
    return null;
  }

  const formatGemName = (name: string): string => {
    const words = name.split(' ');
    if (words.length === 2) {
      const [quality, gemType] = words;
      return `${quality[0]}${quality[quality.length - 1]} ${gemType}`;
    }
    return name;
  };

  const formatKeyName = (name: string): string => {
    if (name.includes("Key of Destruction")) return "DKey";
    if (name.includes("Key of Terror")) return "TKey";
    if (name.includes("Key of Hate")) return "HKey";
    return name;
  };

  const getGemQuality = (name: string): string => {
    const words = name.split(' ');
    if (words.length === 2) {
      return words[0].toLowerCase();
    }
    return 'normal';
  };

  const itemCounts: {[itemId: string]: {count: number, name: string, category: string, quality?: string, gemType?: string}} = {};
  const qualityCounts: {[quality: string]: number} = {};

  data.items.forEach(item => {
    if (item.categories.includes("Rune") || item.categories.includes("Gem") || item.type_name.includes("Key of")) {
      const itemKey = item.type;
      const isGem = item.categories.includes("Gem");
      const isKey = item.type_name.includes("Key of");
      const gemType = isGem ? gemTypes.find(type => item.type_name.toLowerCase().includes(type)) : undefined;
      const gemQuality = isGem ? getGemQuality(item.type_name) : undefined;

      if (!itemCounts[itemKey]) {
        itemCounts[itemKey] = {
          count: 1,
          name: isKey ? formatKeyName(item.type_name) : isGem ? formatGemName(item.type_name.replace(' Gem', '')) : item.type_name.replace(' Rune', ''),
          category: isKey ? "Key" : isGem ? "Gem" : "Rune",
          quality: gemQuality,
          gemType: gemType
        }
      } else {
        itemCounts[itemKey].count++;
      }

      if (isGem && gemQuality) {
        qualityCounts[gemQuality] = (qualityCounts[gemQuality] || 0) + 1;
      }
    }
  });

  const itemsArr: ReactNode[] = [];
  
  // Filter and sort items
  const filteredItems = Object.entries(itemCounts)
    .filter(([_, item]) => {
      if (item.category === "Rune") return settings.selectedGemFilters.includes('runes');
      if (item.category === "Key") return settings.selectedGemFilters.includes('keys');
      if (item.gemType && settings.selectedGemFilters.includes(item.gemType)) return true;
      return false;
    })
    .sort(([_, a], [__, b]) => {
      if (a.category !== b.category) {
        if (a.category === "Rune") return -1;
        if (b.category === "Rune") return 1;
        if (a.category === "Key") return -1;
        if (b.category === "Key") return 1;
      }
      return a.name.localeCompare(b.name);
    });

  // Display filtered items
  filteredItems.forEach(([itemKey, item], i) => {
    if (i > 0) {
      itemsArr.push(<span key={i + 'sep'}> </span>);
    }
    const itemColor = item.category === "Rune" ? "#FFA500" : "#00FFFF";
    itemsArr.push(
      <span key={itemKey} style={{color: itemColor}}>
        {item.count > 1 && <small>{item.count}<span style={{color: '#aaa'}}>x</span></small>}
        {item.name}
      </span>
    );
  });

  // Display quality counts
  gemQualities.forEach(quality => {
    if (settings.selectedGemFilters.includes(quality) && qualityCounts[quality]) {
      if (itemsArr.length > 0) {
        itemsArr.push(<span key={quality + 'sep'}> </span>);
      }
      itemsArr.push(
        <span key={quality} style={{color: "#00FFFF"}}>
          {qualityCounts[quality]}<span style={{color: '#aaa'}}>x</span>{quality.charAt(0).toUpperCase() + quality.slice(1)}
        </span>
      );
    }
  });

  // Render rune list based on location preference
  const renderRunesAndGems = () => {
    if (settings.runesGemsPosition === 'off') return null;
    const isVertical = settings.runesGemsPosition === 'left' || settings.runesGemsPosition === 'right';

    return (
      <Box sx={{
        paddingLeft: 1,
        paddingRight: (settings.textAlignment === 'left' ? 2 : 0),
        paddingTop: 1,
        paddingBottom: 1,
        textShadow: '0 0 2px black',
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        flexWrap: 'wrap',
        fontSize: '16px', // Adjust this value to get the desired size
        textAlign: settings.textAlignment,
        justifyContent: settings.textAlignment === 'left' ? 'flex-start' : 'flex-end',
        fontVariant: 'small-caps',
        '& > *': {
          marginRight: isVertical ? 0 : (settings.textAlignment === 'left' ? '0.5em' : 0),
          marginLeft: isVertical ? 0 : (settings.textAlignment === 'right' ? '0.5em' : 0),
          lineHeight: isVertical ? '1.2em' : 'inherit',
        },
        '& > *:last-child': {
          marginRight: 0,
          marginLeft: 0,
        },
      }}>
        {itemsArr.map((item, index) => (
          <Fragment key={index}>
            {item}
          </Fragment>
        ))}
        {settings.statsDisplayMode === 'Horizontal' && (
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        )}
      </Box>
    );
  };

  const renderLastUpdate = () => (
    <Box sx={{ paddingLeft: 1, paddingTop: 1, color: '#777', fontSize: 14, textShadow: '0 0 2px black' }}>
      {lastUpdate > 5 && <>{t('Odczytane ')}{lastUpdateFmt} {t('temu')}</>}
    </Box>
  );

  // Render stats based on selected layout
  const statOrder: StatKey[] = ['Gold', 'Fire', 'Cold', 'Ligh', 'Pois', 'Lvl', 'Str', 'Dex', 'Vit', 'Ene', 'FHR', 'FCR', 'FRW'];
  const statData: Record<StatKey, { value: string | number, color: string }> = {
    Gold: { value: new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(data.stats.gold), color: '#ffbd6a' },
    Fire: { value: data.stats.fire, color: '#ff8888' },
    Cold: { value: data.stats.cold, color: '#8888ff' },
    Ligh: { value: data.stats.lightning, color: '#ffff88' },
    Pois: { value: data.stats.poison, color: '#88ff88' },
    Lvl: { value: data.stats.level, color: 'white' },
    Str: { value: data.stats.strength, color: 'white' },
    Dex: { value: data.stats.dexterity, color: 'white' },
    Vit: { value: data.stats.vitality, color: 'white' },
    Ene: { value: data.stats.energy, color: 'white' },
    FHR: { value: data.stats.fasterHitRate, color: 'white' },
    FCR: { value: data.stats.fasterCastRate, color: 'white' },
    FRW: { value: data.stats.fasterRunWalk, color: 'white' },
  };

  const renderStatLine = (stat: StatKey) => (
    <StatLine key={stat} style={{ textAlign: settings.textAlignment }}>
      <StatLabel style={{ color: statData[stat].color }}>
        {stat}:
      </StatLabel>
      <StatValue style={{ color: statData[stat].color }}>
        {statData[stat].value}
      </StatValue>
    </StatLine>
  );

  const renderGridStats = () => (
    <Grid container spacing={0}>
      <Grid item xs={4}>
        {(['Gold', 'Fire', 'Cold', 'Ligh', 'Pois'] as StatKey[]).map(renderStatLine)}
      </Grid>
      <Grid item xs={4}>
        {(['Lvl', 'Str', 'Dex', 'Vit', 'Ene'] as StatKey[]).map(renderStatLine)}
      </Grid>
      <Grid item xs={4}>
        {(['FHR', 'FCR', 'FRW'] as StatKey[]).map(renderStatLine)}
      </Grid>
    </Grid>
  );

  const renderVerticalStats = () => (
    <Box sx={{ textAlign: settings.textAlignment }}>
      {statOrder.map(renderStatLine)}
    </Box>
  );

  // some jank in here to make it render smallcaps
  const renderHorizontalStats = () => (
    <FullWidthBox sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      fontVariant: 'small-caps',
      justifyContent: settings.textAlignment === 'left' ? 'flex-start' : 'flex-end',
      '& > *': { 
        marginRight: '1em',
        marginBottom: '0.5em',
        whiteSpace: 'nowrap'
      } 
    }}>
      {statOrder.map(stat => (
        <span key={stat} style={{ color: statData[stat].color }}>
          {stat}: {statData[stat].value}
        </span>
      ))}
    </FullWidthBox>
  );

  const renderStats = () => {
    switch (settings.statsDisplayMode) {
      case 'Vertical':
        return renderVerticalStats();
      case 'Horizontal':
        return renderHorizontalStats();
      default:
        return renderGridStats();
    }
  };

  const gold = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(data.stats.gold)
  const lastUpdateFmt = prettyMs(lastUpdate * 1000, {compact: true});


  return (
    <ThemeProvider theme={{ ...createTheme({palette: { mode: 'dark' }}), font: settings.font }}>
      <GlobalStyle font={settings.font} />
      <div id="stream">
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          width: settings.statsDisplayMode === 'Horizontal' ? '100vw' : `${containerWidth}%`,
          overflowX: 'hidden',
          textAlign: settings.textAlignment,
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: settings.runesGemsPosition === 'left' || settings.runesGemsPosition === 'right' ? 'row' : 'column',
          }}>
            {settings.runesGemsPosition === 'above' && renderRunesAndGems()}
            {settings.runesGemsPosition === 'left' && renderRunesAndGems()}
            <Box sx={{ flexGrow: 1 }}>
              {renderStats()}
            </Box>
            {settings.runesGemsPosition === 'right' && renderRunesAndGems()}
            {settings.runesGemsPosition === 'below' && renderRunesAndGems()}
          </Box>
          {renderLastUpdate()}
        </Box>
      </div>
    </ThemeProvider>
  );
}