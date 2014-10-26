chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        utils.addIconToTab(tab);
    }
});

chrome.pageAction.onClicked.addListener(function (tab) {
    chrome.pageAction.hide(tab.id);
    var page = utils.getUrlInfo(tab.url);
    if (page.isPlaylist) {
        yandex.getPlaylist(page.username, page.playlistId, downloader.downloadPlaylist, function (error) {
            console.error(error);
            log.addMessage(error);
            utils.addIconToTab(tab);
        });
    } else if (page.isTrack) {
        yandex.getTrack(page.trackId, downloader.downloadTrack, function (error) {
            console.error(error);
            log.addMessage(error);
            utils.addIconToTab(tab);
        });
    } else if (page.isAlbum) {
        yandex.getAlbum(page.albumId, downloader.downloadAlbum, function (error) {
            console.error(error);
            log.addMessage(error);
            utils.addIconToTab(tab);
        });
    }
});

chrome.downloads.onChanged.addListener(function (delta) {
    chrome.downloads.search({
        id: delta.id
    }, function (downloads) {
        if (!downloads.length) {
            // загрузка пропала из памяти, например из-за chrome.downloads.erase
            return;
        }
        var name = downloads[0].byExtensionName;
        if (name && name === 'Yandex Music Fisher') {
            downloader.onChange(delta);
        }
    });
});

chrome.runtime.onInstalled.addListener(function (details) {
    // todo: перейти с localStorage на chrome.storage
    if (!localStorage.getItem('downloadThreadCount')) {
        localStorage.setItem('downloadThreadCount', 4);
    }
    if (!localStorage.getItem('albumCoverSize')) {
        localStorage.setItem('albumCoverSize', '460x460');
    }
    if (!localStorage.getItem('trackNameMask')) {
        localStorage.setItem('trackNameMask', '#ИСПОЛНИТЕЛИ# - #НАЗВАНИЕ#');
    }
    chrome.tabs.query({
        url: '*://music.yandex.ru/*'
    }, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            utils.addIconToTab(tabs[i]);
        }
    });
});

chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
    if (buttonIndex) { // возобновление закачек
        var notificationData = downloader.notifications[notificationId];
        var tracks = notificationData.interruptedTracks;
        downloader.notifications[notificationId].interruptedTracks = [];
        for (var i = 0; i < tracks.length; i++) {
            downloader.add(tracks[i].type, tracks[i].cargo, tracks[i].options);
        }

        var type = notificationId.split('#')[0];
        switch (type) {
            case 'track':
                chrome.notifications.update(notificationId, {
                    title: 'Загрузка...',
                    buttons: [{
                            title: 'Отменить загрузку',
                            iconUrl: 'img/cancel.png'
                        }]
                }, function (wasUpdated) {
                });
                break;
            case 'album':
            case 'playlist':
                chrome.notifications.update(notificationId, {
                    title: 'Загрузка (' + notificationData.trackCount + ' из ' + notificationData.totalTrackCount + ')...',
                    buttons: [{
                            title: 'Отменить загрузку',
                            iconUrl: 'img/cancel.png'
                        }]
                }, function (wasUpdated) {
                });
                break;
        }
    } else { // отмена загрузки
        var newQueue = [];
        for (var i = 0; i < downloader.queue.length; i++) {
            var entity = downloader.queue[i];
            if (entity.options.notificationId === notificationId) {
                downloader.notifications[notificationId].interruptedTracks.push(entity);
            } else {
                newQueue.push(entity);
            }
        }
        downloader.queue = newQueue;
        downloader.downloads.forEach(function (entity, downloadId) {
            if (entity.options.notificationId === notificationId) {
                downloader.notifications[notificationId].interruptedTracks.push(entity);
                downloader.activeThreadCount--;
                chrome.downloads.erase({
                    id: downloadId
                });
                delete(downloader.downloads[downloadId]);
                downloader.download();
            }
        });
        chrome.notifications.update(notificationId, {
            title: 'Загрузка отменена',
            buttons: [{
                    title: 'Отменить загрузку',
                    iconUrl: 'img/cancel.png'
                }, {
                    title: 'Повторить загрузку',
                    iconUrl: 'img/resume.png'
                }]
        }, function (wasUpdated) {
        });
    }
});
