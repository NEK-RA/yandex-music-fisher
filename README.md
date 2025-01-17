# Yandex Music Fisher [![Travis][build-badge]][build]

[build-badge]: https://img.shields.io/travis/egoroof/yandex-music-fisher.svg?style=flat-square
[build]: https://travis-ci.org/egoroof/yandex-music-fisher

Расширение браузера для скачивания музыки с сервисов [Яндекс.Музыка](https://music.yandex.ru/)
и [Яндекс.Радио](https://radio.yandex.ru/).

Скачивает треки, плейлисты, альбомы (с обложкой) и дискографии. Устанавливает ID3 тег.
Прерванные загрузки можно возобновлять.

[Список изменений](https://github.com/egoroof/yandex-music-fisher/releases)

### Установка

- [Интернет-магазин Chrome](https://chrome.google.com/webstore/detail/yandex-music-fisher/gkdpmbjlfgjbnleinnojgpgoljaokbni)
- [Дополнения к Opera](https://addons.opera.com/ru/extensions/details/yandex-music-fisher/)
- [Дополнения Firefox](https://addons.mozilla.org/ru/firefox/addon/yandex-music-fisher/)

### Как пользоваться

[Демонстрация](https://raw.githubusercontent.com/egoroof/yandex-music-fisher/master/readme_img/usage.gif)

Откройте страницу на [Яндекс.Музыка](https://music.yandex.ru/) с нужным ![blue](readme_img/blue.png) треком,
![yellow](readme_img/yellow.png) альбомом или ![green](readme_img/green.png) плейлистом - иконка изменит цвет в зависимости
от открытой страницы. Нажав на неё откроется всплывающее окно с информацией о загрузке и кнопкой для начала скачивания.

На [Яндекс.Радио](https://radio.yandex.ru/) выберите жанр для прослушивания и качайте играющие треки.

### Пути сохранения

- Загрузки сохраняются в папку, которая указана в настройке браузера "__Расположение загружаемых файлов__".
- Для __дискографии__ создаётся отдельная папка с именем исполнителя, в которую сохраняются альбомы.
- Для __альбома__ / __плейлиста__ создаётся отдельная папка с именем исполнителя и названием альбома / плейлиста.
- Если __альбом__ состоит из нескольких дисков, то создаются соответствующие папки.

### Ограничения

Поскольку сервис Яндекс.Музыка позволяет слушать музыку только пользователям из России, Украины, Беларуси и
Казахстана, то и скачивать музыку с помощью этого расширения можно только из этих стран.

Если расширение показывает ошибку, возможно скачивание блокируется Яндексом.
Перейдите на главную страницу Яндекс.Музыки - если увидите капчу, введите текст с картинки.
Затем возобновляйте скачивание через расширение.

### Условия использования

Используя Расширение Yandex Music Fisher, вы считаетесь принявшим
[Условия использования сервиса Яндекс.Музыка](https://yandex.ru/legal/music_termsofuse/) и
[Условия использования сервиса Яндекс.Радио](https://yandex.ru/legal/radio_termsofuse/).
Если не согласны с Условиями, вы не вправе использовать сервис Яндекс.Музыка / Яндекс.Радио.
Разработчики Расширения не несут ответственность за нарушения Условий, поэтому используйте Расширение на свой страх и риск.

### Сборка расширения

Для сборки нужен [Node.js](https://nodejs.org/en/) 6+.

```
npm install
npm run build
```

Загружать браузером распакованное расширение после сборки из папки `dist`.

После каждого нового билда нужно обновлять расширение на странице с расширениями браузера,
чтобы перезагрузить фоновую страницу и подхватить её изменения.
