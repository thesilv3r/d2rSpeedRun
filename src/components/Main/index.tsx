import { Container, FolderButton } from './styles'
import { Typography, Button, FormControlLabel, Switch, TextField, Select, MenuItem, Checkbox, ListItemText, SelectChangeEvent, Grid, Box} from '@mui/material';
import { UiState } from '../../App';
import { MouseEventHandler, useState } from 'react';
import { Settings } from '../../@types/main';
import { toast } from 'material-react-toastify';
import { Language } from './language';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const gemTypes = ['topaz', 'amethyst', 'sapphire', 'ruby', 'emerald', 'diamond', 'skull'];
const gemQualities = ['chipped', 'flawed', 'normal', 'flawless', 'perfect'];
const gemFilters = ['runes', 'keys', ...gemTypes, ...gemQualities];

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

type MainProps = {
  uiState: UiState,
  settings: Settings,
  localPort: number,
  onFileClick: MouseEventHandler<HTMLButtonElement>,
}

export function Main({ uiState, settings, localPort, onFileClick }: MainProps) {
  const { t } = useTranslation();
  const [font, setFont] = useState(settings.font);
  const [columnGap, setColumnGap] = useState(settings.columnGap);
  const [selectedGemFilters, setSelectedGemFilters] = useState<string[]>(settings.selectedGemFilters);

  const handleGemFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedGemFilters(value);
    window.Main.saveSetting('selectedGemFilters', value);
  };

  const handleFontChange = (event: SelectChangeEvent<string>) => {
    const newFont = event.target.value;
    setFont(newFont);
    window.Main.saveSetting('font', newFont);
  };

  const handleColumnGapChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newGap = parseInt(event.target.value);
    setColumnGap(newGap);
    window.Main.saveSetting('columnGap', newGap);
  };
  
  const [runesGemsPosition, setRunesGemsPosition] = useState(settings.runesGemsPosition);

  const handleRunesGemsPositionChange = (event: SelectChangeEvent<string>) => {
    const newPosition = event.target.value as 'above' | 'below' | 'left' | 'right' | 'off';
    setRunesGemsPosition(newPosition);
    window.Main.saveSetting('runesGemsPosition', newPosition);
  };

  const [statsDisplayMode, setStatsDisplayMode] = useState(settings.statsDisplayMode);

  const handleStatsDisplayModeChange = (event: SelectChangeEvent<string>) => {
    const newMode = event.target.value as 'Grid' | 'Vertical' | 'Horizontal';
    setStatsDisplayMode(newMode);
    window.Main.saveSetting('statsDisplayMode', newMode);
  };

  const [textAlignment, setTextAlignment] = useState(settings.textAlignment);

  const handleTextAlignmentChange = (event: SelectChangeEvent<'left' | 'right'>) => {
    const newAlignment = event.target.value as 'left' | 'right';
    setTextAlignment(newAlignment);
    window.Main.saveSetting('textAlignment', newAlignment);
  };

  return (
    <Container className="animate__animated animate__fadeIn">
      <div style={{ position: 'absolute', right: 10, top: 0 }}>
        <Language />
      </div>
      <h1>{t('Speedrun tool')}</h1>
      <FolderButton>
        { uiState !== UiState.Loading
          ? <>
            <Button
              variant="contained"
              onClick={onFileClick}
              disableFocusRipple={uiState !== UiState.Ready}
              disableRipple={uiState !== UiState.Ready}
            >
              { uiState === UiState.Ready && t('Wybierz folder z sejvami') }
              { uiState === UiState.FileDialog && t('Oczekiwanie na wybranie folderu...') }
              { uiState === UiState.Reading && t('Odczytywanie plików...') }
              { uiState === UiState.List && t('Zmień folder') }
            </Button>
          </>
          : <Typography variant="body2">
            {t('Ładowanie...')}
          </Typography>
        }
      </FolderButton>
      { uiState === UiState.List && <div style={{ paddingTop: 20 }}>
          <div style={{ marginBottom: 10 }}>
            {t('Śledzony folder:')}<br />
            <code>{ settings.saveDir }</code>
          </div>
          <div style={{ marginBottom: 10 }}>
            {t('OBS link')}: <a onClick={() => {
              window.Main.copyToClipboard('http://localhost:'+localPort);
              toast.success(t("Skopiowano link do schowka."), {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
              });
            }}>http://localhost:{localPort} <ContentCopyIcon fontSize='small' /></a>
          </div>
          <div style={{ marginTop: 20 }}>
            <Typography variant="h6" gutterBottom>Settings</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Font</Typography>
                  <Select
                    value={font}
                    onChange={handleFontChange}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="Exocet">Exocet</MenuItem>
                    <MenuItem value="Roboto">Roboto</MenuItem>
                    <MenuItem value="Arial">Arial</MenuItem>
                    <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  </Select>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Column spacing</Typography>
                  <TextField
                    type="number"
                    value={columnGap}
                    onChange={handleColumnGapChange}
                    inputProps={{ min: 0, max: 80 }}
                    fullWidth
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Item filters</Typography>
                  <Select
                    multiple
                    value={selectedGemFilters}
                    onChange={handleGemFilterChange}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                    fullWidth
                    size="small"
                  >
                    {gemFilters.map((filter) => (
                      <MenuItem key={filter} value={filter}>
                        <Checkbox checked={selectedGemFilters.indexOf(filter) > -1} />
                        <ListItemText primary={filter.charAt(0).toUpperCase() + filter.slice(1)} />
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Item placement</Typography>
                  <Select
                    value={runesGemsPosition}
                    onChange={handleRunesGemsPositionChange}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="above">Above</MenuItem>
                    <MenuItem value="below">Below</MenuItem>
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                    <MenuItem value="off">Off</MenuItem>
                  </Select>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Stats layout</Typography>
                  <Select
                    value={statsDisplayMode}
                    onChange={handleStatsDisplayModeChange}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="Grid">Grid</MenuItem>
                    <MenuItem value="Vertical">Vertical</MenuItem>
                    <MenuItem value="Horizontal">Horizontal</MenuItem>
                  </Select>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Alignment</Typography>
                  <Select
                    value={textAlignment}
                    onChange={handleTextAlignmentChange}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                  </Select>
                </Box>
              </Grid>
            </Grid>
          </div>
          <p>
            {t("Statistics are updated each time the game saves the game, which is:")}
            <ul>
              <li>{t("(about) each 5 minutes")}</li>
              <li>{t("each time an item is identified")}</li>
              <li>{t("when you quit&save the game")}</li>
            </ul>
            {t("Note: statistics from charms are counted in, regardless of their level requirement, to simplify the algorithm")}
          </p>
          <div>
            <iframe style={{ width: '80vw', margin: 'auto', height: 200, border: "1px solid #333" }} src="http://localhost:3666" />
          </div>
        </div>
      }
    </Container>
  )
};
