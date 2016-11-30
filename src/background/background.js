const utils = require('./utils');
const Yandex = require('./yandex');
const storage = require('./storage');
const downloader = require('./downloader');
const fisher = {
    utils,
    yandex: new Yandex(),
    storage,
    downloader
};

window.fisher = fisher;

chrome.browserAction.setBadgeBackgroundColor({
    color: [100, 100, 100, 255]
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { // изменение URL
    fisher.utils.updateTabIcon(tab);
});

chrome.tabs.onActivated.addListener((activeInfo) => { // выбор другой вкладки
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        fisher.utils.updateTabIcon(tab);
    });
});

chrome.downloads.onChanged.addListener((delta) => {
    const entity = downloader.getEntityByBrowserDownloadId(delta.id);
    if (!entity) { // загрузка не от нашего расширения
        return;
    }

    if (!delta.state) { // состояние не изменилось (начало загрузки)
        if (PLATFORM_CHROMIUM) {
            chrome.downloads.setShelfEnabled(true);
        }
        return;
    }
    const state = delta.state.current; // in_progress -> interrupted || complete
    if (state === 'complete') {
        entity.status = downloader.STATUS.FINISHED;
        fisher.utils.updateBadge();
    } else if (state === 'interrupted') {
        entity.loadedBytes = 0;
        entity.status = downloader.STATUS.INTERRUPTED;
        console.error(delta, entity);
    }
    window.URL.revokeObjectURL(entity.browserDownloadUrl);
    chrome.downloads.erase({
        id: delta.id
    });
    downloader.activeThreadCount--;
    downloader.download();
});
