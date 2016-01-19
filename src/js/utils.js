/* global chrome, storage, ga, downloader */

(() => {
    'use strict';
    'use strong';

    const utils = {};

    utils.ajax = (url, type, onProgress) => new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = type;
        xhr.onload = () => {
            if (xhr.status === 200) {
                if (xhr.response) {
                    resolve(xhr.response);
                } else {
                    reject({
                        message: 'Пустой ответ',
                        details: url
                    });
                }
            } else {
                reject({
                    message: `${xhr.statusText} (${xhr.status})`,
                    details: url
                });
            }
        };
        xhr.onerror = () => reject({
            message: 'Ошибка при запросе',
            details: url
        });

        if (onProgress) {
            xhr.onprogress = onProgress;
        }
        xhr.send();
    });

    utils.delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    utils.bytesToStr = bytes => {
        const KiB = 1024;
        const MiB = 1024 * KiB;
        const GiB = 1024 * MiB;
        if (bytes < GiB) {
            return (bytes / MiB).toFixed(2) + ' МиБ';
        } else {
            return (bytes / GiB).toFixed(2) + ' ГиБ';
        }
    };

    utils.addExtraZeros = (val, max) => {
        const valLength = val.toString().length;
        const maxLength = max.toString().length;
        const diff = maxLength - valLength;
        let zeros = '';
        for (let i = 0; i < diff; i++) {
            zeros += '0';
        }
        return zeros + val.toString();
    };

    utils.durationToStr = duration => {
        let seconds = Math.floor(duration / 1000);
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        const hours = Math.floor(minutes / 60);
        minutes -= hours * 60;
        return `${hours}:${utils.addExtraZeros(minutes, 10)}:${utils.addExtraZeros(seconds, 10)}`;
    };

    utils.clearPath = (path, isDir) => {
        const unsafeChars = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        path = path.replace(/^\./, '_'); // первый символ - точка (https://music.yandex.ru/album/2289231/track/20208868)
        path = path.replace(/"/g, "''"); // двойные кавычки в одинарные
        path = path.replace(/\t/g, ' '); // табы в пробелы (https://music.yandex.ru/album/718010/track/6570232)
        path = path.replace(unsafeChars, '');
        path = path.replace(/[\\/:*?<>|~]/g, '_'); // запрещённые символы в винде
        if (isDir) {
            path = path.replace(/(\.| )$/, '_'); // точка или пробел в конце
            // пример папки с точкой в конце https://music.yandex.ru/album/1288439/
            // пример папки с пробелом в конце https://music.yandex.ru/album/62046/
        }
        return path;
    };

    utils.logError = error => {
        console.log(error);
        if (error.message !== 'Пустой ответ' && error.message !== 'Ошибка трека: no-rights' && 'details' in error) {
            ga('send', 'event', 'error', error.message, error.details);
        }
    };

    utils.parseArtists = allArtists => {
        const VA = 'Various Artists'; // пример https://music.yandex.ru/album/718010/track/6570232
        const UA = 'Unknown Artist'; // пример https://music.yandex.ru/album/533785/track/4790215
        let artists = [];
        const composers = [];
        allArtists.forEach(artist => {
            if (artist.composer) { // пример https://music.yandex.ru/album/717747/track/6672611
                composers.push(artist.name);
            } else if (artist.various) {
                artists.push(VA);
            } else {
                artists.push(artist.name);
            }
        });
        if (!artists.length) {
            if (composers.length) {
                artists = composers;
            } else {
                artists.push(UA);
            }
        }
        return {
            artists: artists,
            composers: composers
        };
    };

    utils.getUrlInfo = url => {
        const info = {
            isMusic: false,
            isRadio: false,
            isPlaylist: false,
            isTrack: false,
            isAlbum: false,
            isArtist: false,
            isLabel: false
        };
        const urlData = new URL(url);
        const parts = urlData.pathname.split('/');
        const musicMatch = urlData.hostname.match(/^music\.yandex\.(ru|by|kz|ua)$/);
        if (musicMatch) {
            info.isMusic = true;
            storage.current.domain = musicMatch[1];
        }
        const radioMatch = urlData.hostname.match(/^radio\.yandex\.(ru|by|kz|ua)$/);
        if (radioMatch) {
            info.isRadio = true;
            storage.current.domain = radioMatch[1];
        }
        if (info.isMusic) {
            info.isPlaylist = (parts.length === 5 && parts[1] === 'users' && parts[3] === 'playlists');
            info.isTrack = (parts.length === 5 && parts[1] === 'album' && parts[3] === 'track');
            info.isAlbum = (parts.length === 3 && parts[1] === 'album');
            info.isArtist = (parts.length > 2 && parts[1] === 'artist');
            info.isLabel = (parts.length > 2 && parts[1] === 'label');
            if (info.isPlaylist) {
                info.username = parts[2];
                info.playlistId = parts[4];
            } else if (info.isTrack) {
                info.trackId = parts[4];
            } else if (info.isAlbum) {
                info.albumId = parts[2];
            } else if (info.isArtist) {
                info.artistId = parts[2];
            } else if (info.isLabel) {
                info.labelId = parts[2];
            }
        }
        return info;
    };

    utils.updateTabIcon = tab => {
        const page = utils.getUrlInfo(tab.url);
        let iconPath = 'img/black.png';
        if (page.isPlaylist) {
            iconPath = 'img/green.png';
        } else if (page.isAlbum) {
            iconPath = 'img/yellow.png';
        } else if (page.isArtist || page.isLabel) {
            iconPath = 'img/pink.png';
        } else if (page.isMusic || page.isRadio) {
            iconPath = 'img/blue.png';
        }
        chrome.browserAction.setIcon({
            tabId: tab.id,
            path: iconPath
        });
    };

    utils.getActiveTab = () => new Promise((resolve, reject) => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            if (tabs.length) {
                resolve(tabs[0]);
            } else {
                reject(new Error('No active tab'));
            }
        });
    });

    utils.getDownload = downloadId => new Promise(resolve => {
        chrome.downloads.search({
            id: downloadId
        }, downloads => {
            if (downloads.length && downloads[0].byExtensionName === chrome.runtime.getManifest().name) {
                resolve(downloads[0]);
            }
        });
    });

    utils.updateBadge = () => {
        const count = downloader.getDownloadCount();
        let countStr = '';
        if (count) {
            countStr = count.toString();
        }
        chrome.browserAction.setBadgeText({
            text: countStr
        });
    };

    utils.checkUpdate = () => new Promise(resolve => {
        const releaseInfoUrl = 'https://api.github.com/repos/egoroof/yandex-music-fisher/releases/latest';
        utils.ajax(releaseInfoUrl, 'json', null).then(releaseInfo => {
            const latestVersion = releaseInfo.tag_name.replace('v', '').split('.');
            const currentVersion = chrome.runtime.getManifest().version.split('.');

            const isMajorUpdate = (
                latestVersion[0] > currentVersion[0]
            );
            const isMinorUpdate = (
                latestVersion[1] > currentVersion[1] &&
                latestVersion[0] === currentVersion[0]
            );
            const isPatchUpdate = (
                latestVersion[2] > currentVersion[2] &&
                latestVersion[1] === currentVersion[1] &&
                latestVersion[0] === currentVersion[0]
            );

            if (isMajorUpdate || isMinorUpdate || isPatchUpdate) {
                resolve({
                    version: latestVersion.join('.'),
                    distUrl: releaseInfo.assets[0].browser_download_url
                });
            }
        }).catch(utils.logError);
    });

    window.utils = utils;

})();
