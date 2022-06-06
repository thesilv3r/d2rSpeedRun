import { contextBridge, ipcRenderer } from 'electron'
import { Settings } from '../src/@types/main.d'

export const api = {
  readFilesUponStart: () => {
    ipcRenderer.send('readFilesUponStart')
  },
  openFolder: () => {
    ipcRenderer.send('openFolderRequest')
  },
  openUrl: (url: string) => {
    ipcRenderer.send('openUrl', url)
  },
  copyToClipboard: (text: string) => {
    ipcRenderer.send('copyToClipboard', text);
  },
  getSettings: (): Settings => {
    return ipcRenderer.sendSync('getSettings');
  },
  getSetting: <K extends keyof Settings>(key: K): Settings[K] => {
    return ipcRenderer.sendSync('getSetting', key);
  },
  saveSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => {
    ipcRenderer.send('saveSetting', key, value);
  },
  loadManualItems: () => {
    ipcRenderer.send('loadManualItems');
  },
  saveManualItem: (itemName: string, isFound: boolean) => {
    ipcRenderer.send('saveManualItem', itemName, isFound);
  },
  getAllDropRates: () => {
    ipcRenderer.send('getAllDropRates');
  },
  getStreamPort: (): number => {
    return ipcRenderer.sendSync('getStreamPort');
  },
  on: (channel: string, callback: Function) => {
    ipcRenderer.removeAllListeners(channel);
    ipcRenderer.on(channel, (_, data) => callback(data))
  }
}

contextBridge.exposeInMainWorld('Main', api)
