import { useState, useEffect, ReactNode } from 'react';
import { useTimer } from "react-use-precision-timer";
import { io } from "socket.io-client";
import { FileReaderResponse, Settings } from '../@types/main.d';
import { Grid, createTheme } from '@mui/material';
import { ThemeProvider } from '@mui/system';
import { GlobalStyle } from '../styles/GlobalStyle';
import prettyMs from 'pretty-ms';
import { StatLabel, StatLine, StatValue } from './styles';
import { useTranslation } from 'react-i18next';
import defaultSettings from '../utils/defaultSettings';

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

  const itemCounts: {[itemId: string]: {count: number, name: string, category: string}} = {};
  data.items.forEach(item => {
    if (item.categories.includes("Rune") || 
        (item.categories.includes("Gem") && 
         settings.selectedGems.some(gemType => item.type_name.toLowerCase().includes(gemType)))) {
      const itemKey = item.type;
      if (!itemCounts[itemKey]) {
        itemCounts[itemKey] = {
          count: 1,
          name: item.type_name.replace(' Rune', '').replace(' Gem', ''),
          category: item.categories.includes("Rune") ? "Rune" : "Gem"
        }
      } else {
        itemCounts[itemKey].count++;
      }
    }
  })

  const itemsArr: ReactNode[] = [];
  
  Object.keys(itemCounts)
    .sort((a, b) => {
      // Sort by category (Runes first, then Gems) and then by name
      if (itemCounts[a].category !== itemCounts[b].category) {
        return itemCounts[a].category === "Rune" ? -1 : 1;
      }
      return itemCounts[a].name.localeCompare(itemCounts[b].name);
    })
    .forEach((itemKey: string, i: number) => {
      const item = itemCounts[itemKey];
      if (i > 0) {
        itemsArr.push(<span key={i + 'sep'}> </span>);
      }
      const itemColor = item.category === "Rune" ? "#FFA500" : "#00FFFF"; // Orange for Runes, Cyan for Gems
      if (item.count === 1) {
        itemsArr.push(<span key={itemKey} style={{color: itemColor}}>{item.name}</span>);
      }
      if (item.count > 1) {
        itemsArr.push(<span key={itemKey} style={{color: itemColor}}><small>{ item.count }<span style={{color: '#aaa'}}>x</span></small>{item.name}</span>);
      }
    });

  const gold = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(data.stats.gold)
  const lastUpdateFmt = prettyMs(lastUpdate * 1000, {compact: true});

  return <>
    <GlobalStyle font={settings.font} />
    <ThemeProvider theme={createTheme({palette: { mode: 'dark' }})}>
      <div id="stream">
        <div id="stats" style={{ width: `${containerWidth}%` }}>
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
          <div style={{ paddingLeft: 5, paddingTop: 3, textShadow: '0 0 2px black' }}>
            {itemsArr}
          </div>
          <div style={{ paddingLeft: 5, paddingTop: 5, color: '#777', fontSize: 14, textShadow: '0 0 2px black' }}>
            {lastUpdate > 5 && <>{t('Odczytane ')}{lastUpdateFmt} {t('temu')}</>}
          </div>
        </div>
      </div>
    </ThemeProvider>
  </>;
}