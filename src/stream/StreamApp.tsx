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

const gemTypes = ['topaz', 'amethyst', 'sapphire', 'ruby', 'emerald', 'diamond', 'skull'];
const gemQualities = ['chipped', 'flawed', 'normal', 'flawless', 'perfect'];

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
    if (item.categories.includes("Rune") || item.categories.includes("Gem")) {
      const itemKey = item.type;
      const isGem = item.categories.includes("Gem");
      const gemType = isGem ? gemTypes.find(type => item.type_name.toLowerCase().includes(type)) : undefined;
      const gemQuality = isGem ? getGemQuality(item.type_name) : undefined;

      if (!itemCounts[itemKey]) {
        itemCounts[itemKey] = {
          count: 1,
          name: isGem ? formatGemName(item.type_name.replace(' Gem', '')) : item.type_name.replace(' Rune', ''),
          category: isGem ? "Gem" : "Rune",
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
      if (item.category === "Rune") return true;
      if (item.gemType && settings.selectedGemFilters.includes(item.gemType)) return true;
      return false;
    })
    .sort(([_, a], [__, b]) => {
      if (a.category !== b.category) {
        return a.category === "Rune" ? -1 : 1;
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

  const renderRunesAndGems = () => {
    const isVertical = settings.runesGemsPosition === 'left' || settings.runesGemsPosition === 'right';

    return (
      <Box sx={{
        paddingLeft: 1,
        paddingTop: 1,
        paddingBottom: 1,
        textShadow: '0 0 2px black',
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        flexWrap: 'wrap',
        '& > *': {
          marginRight: isVertical ? '2em' : '0.5em',
          lineHeight: isVertical ? '1.2em' : 'inherit',
        },
        '& > *:last-child': {
          marginRight: 0,
        },
      }}>
        {itemsArr.map((item, index) => (
          <Fragment key={index}>
            {item}
          </Fragment>
        ))}
      </Box>
    );
  };


  const renderLastUpdate = () => (
    <Box sx={{ paddingLeft: 1, paddingTop: 1, color: '#777', fontSize: 14, textShadow: '0 0 2px black' }}>
      {lastUpdate > 5 && <>{t('Odczytane ')}{lastUpdateFmt} {t('temu')}</>}
    </Box>
  );

  const gold = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(data.stats.gold)
  const lastUpdateFmt = prettyMs(lastUpdate * 1000, {compact: true});

  return <>
    <GlobalStyle font={settings.font} />
    <ThemeProvider theme={createTheme({palette: { mode: 'dark' }})}>
      <div id="stream">
        <Box sx={{
          display: 'flex',
          flexDirection: settings.runesGemsPosition === 'left' || settings.runesGemsPosition === 'right' ? 'row' : 'column',
          width: `${containerWidth}%`,
        }}>
          {settings.runesGemsPosition === 'above' && renderRunesAndGems()}
          {settings.runesGemsPosition === 'left' && renderRunesAndGems()}
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={0}> {/* Set spacing to 0 */}
              <Grid item xs={4}>
                <StatLine>
                  <StatLabel style={{  color: '#ffbd6a' }}>
                    Gold:
                  </StatLabel>
                  <StatValue style={{ color: '#ffbd6a' }}>
                    {gold}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel style={{ color: '#ff8888' }}>
                    Fire:
                  </StatLabel>
                  <StatValue style={{ color: '#ff8888' }}>
                    {data.stats.fire}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel style={{ color: '#8888ff' }}>
                    Cold:
                  </StatLabel>
                  <StatValue style={{ color: '#8888ff' }}>
                    {data.stats.cold}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel style={{ color: '#ffff88' }}>
                    Ligh:
                  </StatLabel>
                  <StatValue style={{ color: '#ffff88' }}>
                    {data.stats.lightning}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel style={{ color: '#88ff88' }}>
                    Pois:
                  </StatLabel>
                  <StatValue style={{ color: '#88ff88' }}>
                    {data.stats.poison}
                  </StatValue>
                </StatLine>
              </Grid>
              <Grid item xs={4}>
                <StatLine>
                  <StatLabel>
                    Lvl:
                  </StatLabel>
                  <StatValue>
                    {data.stats.level}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel>
                    Str:
                  </StatLabel>
                  <StatValue>
                    {data.stats.strength}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel>
                    Dex:
                  </StatLabel>
                  <StatValue>
                    {data.stats.dexterity}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel>
                    Vit:
                  </StatLabel>
                  <StatValue>
                    {data.stats.vitality}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel>
                    Ene:
                  </StatLabel>
                  <StatValue>
                    {data.stats.energy}
                  </StatValue>
                </StatLine>
              </Grid>
              <Grid item xs={4} alignItems={'end'} >
                <StatLine>
                  <StatLabel>
                    FHR:
                  </StatLabel>
                  <StatValue>
                    {data.stats.fasterHitRate}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel>
                    FCR:
                  </StatLabel>
                  <StatValue>
                    {data.stats.fasterCastRate}
                  </StatValue>
                </StatLine>
                <StatLine>
                  <StatLabel>
                    FRW:
                  </StatLabel>
                  <StatValue>
                    {data.stats.fasterRunWalk}
                  </StatValue>
                </StatLine>
              </Grid>
            </Grid>
          </Box>
          {settings.runesGemsPosition === 'right' && renderRunesAndGems()}
          {settings.runesGemsPosition === 'below' && renderRunesAndGems()}
          {renderLastUpdate()}
        </Box>
      </div>
    </ThemeProvider>
  </>;
}