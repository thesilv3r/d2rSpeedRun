import { Container, FolderButton } from './styles'
import { Typography, Button, FormControlLabel, Switch, TextField, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { UiState } from '../../App';
import { MouseEventHandler, useState } from 'react';
import { Settings } from '../../@types/main';
import { toast } from 'material-react-toastify';
import { Language } from './language';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const gemTypes = ['topaz', 'amethyst', 'sapphire', 'ruby', 'emerald', 'diamond', 'skull'];
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
  const [selectedGems, setSelectedGems] = useState<string[]>(settings.selectedGems);

  const handleGemChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedGems(value);
    window.Main.saveSetting('selectedGems', value);
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
            <Typography variant="h6">Settings</Typography>
            <Select
              value={font}
              onChange={handleFontChange}
              label="Font"
              style={{ marginRight: 10 }}
            >
              <MenuItem value="Exocet">Exocet</MenuItem>
              <MenuItem value="Roboto">Roboto</MenuItem>
              <MenuItem value="Arial">Arial</MenuItem>
              <MenuItem value="Times New Roman">Times New Roman</MenuItem>
            </Select>
            <TextField
              type="number"
              label="Column Gap"
              value={columnGap}
              onChange={handleColumnGapChange}
              inputProps={{ min: 0, max: 80 }}
              style={{ marginTop: 10, width: 100 ,marginRight: 10 }}
            />
            <Select
              multiple
              value={selectedGems}
              onChange={handleGemChange}
              label="Included Gems"
              renderValue={(selected) => (selected as string[]).map(capitalizeFirstLetter).join(', ')}
              style={{ marginTop: 10, width: 200 }}
            >
              {gemTypes.map((gem) => (
                <MenuItem key={gem} value={gem}>
                  <Checkbox checked={selectedGems.indexOf(gem) > -1} />
                  <ListItemText primary={capitalizeFirstLetter(gem)} />
                </MenuItem>
              ))}
            </Select>
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
